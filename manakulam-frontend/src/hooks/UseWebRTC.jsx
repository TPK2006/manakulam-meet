import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

const API_URL = 'http://localhost:5000';

export const useWebRTC = (roomId, user) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: { stream, userName } }
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    
    const socketRef = useRef(null);
    const peersRef = useRef({}); // { socketId: RTCPeerConnection }
    const localStreamRef = useRef(null); // Always holds the current local stream (cam or screen)
    const cameraStreamRef = useRef(null); // Holds the original camera stream
    const [mySocketId, setMySocketId] = useState(null);

    // 1. Get local media (camera)
    const startLocalStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            localStreamRef.current = stream;
            cameraStreamRef.current = stream; // Save reference to camera
            return stream; // Return stream so the next step can proceed
        } catch (err) {
            console.error("Error accessing media devices:", err);
            alert("Could not access camera/microphone.");
            return null;
        }
    }, []);

    // 2. Connect to Socket.IO *after* media is ready
    useEffect(() => {
        if (!user) return;

        // This effect ensures we only connect *after* the camera is on
        startLocalStream().then(stream => {
            if (!stream) return; // Don't connect if user denied camera

            const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
socketRef.current = io(SOCKET_URL);
            setMySocketId(socketRef.current.id);

            // --- ALL SOCKET LOGIC NOW LIVES INSIDE HERE ---

            // A. Join Room
            socketRef.current.on('connect', () => {
                console.log('Connected to signaling server with ID:', socketRef.current.id);
                setMySocketId(socketRef.current.id);
                socketRef.current.emit('join-room', {
                    roomId,
                    userId: user._id,
                    userName: user.name
                });
            });

            // B. Get List of Existing Users (when *we* join)
            socketRef.current.on('all-users', (usersInRoom) => {
                console.log("All users in room:", usersInRoom);
                usersInRoom.forEach(peer => {
                    const pc = createPeerConnection(peer.socketId, peer.userName);
                    
                    pc.createOffer()
                      .then(offer => pc.setLocalDescription(offer))
                      .then(() => {
                          socketRef.current.emit('offer', {
                              target: peer.socketId,
                              sender: socketRef.current.id,
                              sdp: pc.localDescription,
                              userName: user.name
                          });
                      });
                });
            });

            // C. New User Joins (when *someone else* joins)
            socketRef.current.on('user-connected', (peer) => {
                console.log(`${peer.userName} connected`);
                // This user will send us an offer, we just prep for it.
                // The 'offer' handler will create the PC.
            });

            // D. Handle Incoming Offer
            socketRef.current.on('offer', async (payload) => {
                console.log(`Received offer from ${payload.userName} (${payload.sender})`);
                const pc = createPeerConnection(payload.sender, payload.userName);
                await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                
                socketRef.current.emit('answer', {
                    target: payload.sender,
                    sender: socketRef.current.id,
                    sdp: pc.localDescription,
                    userName: user.name
                });
            });

            // E. Handle Incoming Answer
            socketRef.current.on('answer', (payload) => {
                console.log(`Received answer from ${payload.userName}`);
                const pc = peersRef.current[payload.sender];
                if (pc) {
                    pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                }
            });

            // F. Handle ICE Candidate
            socketRef.current.on('ice-candidate', (payload) => {
                const pc = peersRef.current[payload.sender];
                if (pc) {
                    pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                }
            });

            // G. Handle User Disconnect
            socketRef.current.on('user-disconnected', (socketId) => {
                console.log(`User ${socketId} disconnected`);
                if (peersRef.current[socketId]) {
                    peersRef.current[socketId].close();
                    delete peersRef.current[socketId];
                }
                setRemoteStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[socketId];
                    return newStreams;
                });
            });
        });

        // Cleanup
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (cameraStreamRef.current) {
                cameraStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            Object.values(peersRef.current).forEach(pc => pc.close());
        };
    }, [user, roomId, startLocalStream]);


    // 3. Create Peer Connection (Helper Function)
    const createPeerConnection = (targetSocketId, targetUserName) => {
        if (peersRef.current[targetSocketId]) {
            return peersRef.current[targetSocketId]; // Already exists
        }
        
        const pc = new RTCPeerConnection(STUN_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('ice-candidate', {
                    target: targetSocketId,
                    sender: socketRef.current.id,
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            console.log(`Received remote track from ${targetUserName}`);
            setRemoteStreams(prev => ({
                ...prev,
                [targetSocketId]: { stream: event.streams[0], userName: targetUserName }
            }));
        };

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        peersRef.current[targetSocketId] = pc;
        return pc;
    };


    // 4. Media Controls
    const toggleAudio = (isEnabled) => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => track.enabled = isEnabled);
        }
    };

    const toggleVideo = (isEnabled) => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => track.enabled = isEnabled);
        }
    };

    // 5. Screen Sharing Logic
    const replaceTrack = (newTrack) => {
        for (const peerConnection of Object.values(peersRef.current)) {
            const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(newTrack);
            }
        }
    };

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: { echoCancellation: true } });
            const screenTrack = stream.getVideoTracks()[0];
            
            replaceTrack(screenTrack);
            
            // Also update the local view
            setLocalStream(stream);
            localStreamRef.current = stream;
            setIsScreenSharing(true);

            // Listen for when user clicks "Stop sharing"
            screenTrack.onended = () => {
                stopScreenShare();
            };
        } catch (err) {
            console.error("Screen share failed:", err);
        }
    };

    const stopScreenShare = () => {
        const cameraTrack = cameraStreamRef.current.getVideoTracks()[0];
        replaceTrack(cameraTrack);

        // Revert local view to camera
        setLocalStream(cameraStreamRef.current);
        localStreamRef.current = cameraStreamRef.current;
        setIsScreenSharing(false);
    };

    return { 
        localStream, 
        remoteStreams, 
        isScreenSharing,
        toggleAudio, 
        toggleVideo,
        startScreenShare,
        stopScreenShare
    };
};