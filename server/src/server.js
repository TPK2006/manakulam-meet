import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';

// --- 1. SETUP & DB CONNECTION ---
const app = express();
const server = http.createServer(app);
const PORT = process.env.CLIENT_URL|| 5000;

console.log("Attempting to connect to MongoDB...");
connectDB().then(() => console.log("✅ MongoDB connection verified established"));

// --- THIS IS THE FIX ---
// We are making the API (Express) CORS as open as the WebSocket CORS.
// This will fix the "Connection to server failed" on sign up.
app.use(cors());
// --- END OF FIX ---

app.use(express.json());

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};



// --- 2. AUTH ROUTES (WITH LOGGING) ---

app.post('/api/auth/register', async (req, res) => {
  console.log("📝 Register attempt:", req.body.email);
  // ... (rest of your register code)
  const { name, email, password, avatar } = req.body; 
  if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Please provide name, email, and a password (min. 6 chars)' });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("❌ Register failed: User exists");
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password, avatar }); 
    if (user) {
      console.log("✅ User created successfully:", user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        avatar: user.avatar
      });
    }
  } catch (error) {
    console.error("💥 Register Error:", error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log("🔑 Login attempt:", req.body.email);
  // ... (rest of your login code)
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      console.log("✅ Login success for:", email);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        avatar: user.avatar
      });
    } else {
      console.log("❌ Login failed: Invalid credentials");
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("💥 Login Error:", error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  console.log("🔑 Google Login attempt:", req.body.email);
  // ... (rest of your google code)
  const { email, name, googleId, avatar } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
       user = await User.create({ name, email, googleId, avatar, password: Date.now().toString() + Math.random() });
       console.log("✅ Created new Google user:", email);
    } else {
       user.avatar = avatar; 
       await user.save();
       console.log("✅ Existing Google user logged in:", email);
    }
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        avatar: user.avatar
    });
  } catch (error) {
    console.error("💥 Google Auth Error:", error.message);
    res.status(500).json({ message: 'Google auth failed' });
  }
});

// --- 3. SOCKET.IO SIGNALING ---
const io = socketIo(server, {
  cors: { origin: '*' }
});


const rooms = {};

io.on('connection', (socket) => {
  console.log(`Socket Connected: ${socket.id}`);
  // ... (rest of your socket.io code)
  socket.on('join-room', ({ roomId, userId, userName }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ socketId: socket.id, userId, userName });
    console.log(`[${roomId}] ${userName} joined`);
    socket.to(roomId).emit('user-connected', { userId, userName, socketId: socket.id });
    const usersInRoom = rooms[roomId].filter(user => user.socketId !== socket.id);
    socket.emit('all-users', usersInRoom);
  });
  socket.on('offer', (payload) => io.to(payload.target).emit('offer', payload));
  socket.on('answer', (payload) => io.to(payload.target).emit('answer', payload));
  socket.on('ice-candidate', (payload) => io.to(payload.target).emit('ice-candidate', payload));
  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room !== socket.id && rooms[room]) {
        const disconnectedUser = rooms[room].find(user => user.socketId === socket.id);
        rooms[room] = rooms[room].filter(user => user.socketId !== socket.id);
        console.log(`[${room}] ${disconnectedUser?.userName || socket.id} left`);
        socket.to(room).emit('user-disconnected', socket.id);
        if (rooms[room].length === 0) {
          console.log(`[${room}] Room is now empty. Deleting.`);
          delete rooms[room];
        }
      }
    }
  });
});

// --- 4. START SERVER ---
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));