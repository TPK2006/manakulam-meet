import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Room from './components/Room';
import './App.css';

function App() {
  const [user, setUser] = useState(null); // User object { _id, name, email, token }
  const [view, setView] = useState('login');
  const [roomId, setRoomId] = useState(null);

  // Check if user is already logged in on page load
  useEffect(() => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        setView('dashboard');
      }
    } catch (e) {
      console.error("Failed to parse user info from localStorage", e);
      localStorage.removeItem('userInfo');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    setView('login');
  };

  const handleJoinRoom = (id) => {
    setRoomId(id);
    setView('room');
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setView('dashboard');
  };

  // Simple Router
  const renderView = () => {
    if (view === 'login') {
      return <Login onLogin={handleLogin} />;
    }
    if (view === 'dashboard' && user) {
      return <Dashboard user={user} onJoinRoom={handleJoinRoom} onLogout={handleLogout} />;
    }
    if (view === 'room' && user) {
      return <Room user={user} roomId={roomId} onLeave={handleLeaveRoom} />;
    }
    // Default to login if state is inconsistent
    return <Login onLogin={handleLogin} />;
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      {renderView()}
    </div>
  );
}

export default App;