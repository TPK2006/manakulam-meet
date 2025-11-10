import React, { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '../hooks/UseWebRTC';
import Controls from './Controls';

const VideoTile = ({ stream, isLocal = false, name, isMuted = false, isVideoOff = false }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative bg-[#202124] rounded-xl overflow-hidden border border-white/5 flex items-center justify-center group aspect-video">
            {(isVideoOff || !stream) ? (
                 <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-medium text-white">
                     {name ? name[0].toUpperCase() : '?'}
                 </div>
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className={`w-full h-full object-cover ${isLocal && stream?.getVideoTracks()[0]?.getSettings().displaySurface !== 'monitor' ? 'transform scale-x-[-1]' : ''}`}
                />
            )}
            <div className="absolute bottom-3 left-3 text-white font-medium text-sm bg-black/40 px-3 py-1.5 rounded-md backdrop-blur-md flex items-center space-x-2">
                <span>{isLocal ? "You" : name}</span>
                {isMuted && !isLocal && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><line x1="1" x2="23" y1="1" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/><path d="M12 2a3 3 0 0 0-3 3v2"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                )}
            </div>
        </div>
    );
};

const Room = ({ user, roomId, onLeave }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const { 
        localStream, 
        remoteStreams, 
        isScreenSharing,
        toggleAudio, 
        toggleVideo,
        startScreenShare,
        stopScreenShare
    } = useWebRTC(roomId, user);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 1000 * 60);
        return () => clearInterval(timer);
    }, []);

    const handleToggleMute = () => {
        setIsMuted(!isMuted);
        toggleAudio(!isMuted);
    };

    const handleToggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        toggleVideo(!isVideoOff);
    };

    const participantCount = 1 + Object.keys(remoteStreams).length;
    const gridClassName = participantCount === 1 ? 'max-w-4xl' : 
                          participantCount === 2 ? 'max-w-6xl grid-cols-1 md:grid-cols-2' : 
                          'max-w-[1400px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return (
        <div className="h-screen flex flex-col bg-[#202124] overflow-hidden">
            <main className="flex-1 p-4 flex items-center justify-center">
                <div className={`w-full grid gap-4 ${gridClassName} auto-rows-fr transition-all duration-300`}>
                    <VideoTile 
                        stream={localStream} // This will now correctly show camera OR screen
                        isLocal={true} 
                        name={user.name} 
                        isMuted={isMuted}
                        isVideoOff={isVideoOff && !isScreenSharing} // Video is only "off" if you're not sharing screen
                    />
                    {Object.entries(remoteStreams).map(([socketId, data]) => (
                        <VideoTile 
                            key={socketId} 
                            stream={data.stream} 
                            name={data.userName}
                        />
                    ))}
                </div>
            </main>

            <footer className="h-20 bg-[#202124] flex items-center justify-between px-6 border-t border-white/5">
                <div className="flex items-center space-x-4 flex-1 text-white/90">
                    <span className="font-medium tracking-wider text-sm">{time}</span>
                    <div className="h-4 w-px bg-white/20"></div>
                    <span className="font-medium text-sm">{roomId}</span>
                </div>

                <Controls 
                    isMuted={isMuted}
                    toggleMute={handleToggleMute}
                    isVideoOff={isVideoOff}
                    toggleVideo={handleToggleVideo}
                    isScreenSharing={isScreenSharing}
                    startScreenShare={startScreenShare}
                    stopScreenShare={stopScreenShare}
                    onLeave={onLeave}
                />

                <div className="flex-1 flex justify-end">
                     {/* Placeholder for participant list / chat buttons */}
                </div>
            </footer>
        </div>
    );
};

export default Room;