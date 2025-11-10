import React from 'react';

// Icons
const Mic = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
const MicOff = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" x2="23" y1="1" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/><path d="M12 2a3 3 0 0 0-3 3v2"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>;
const Video = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
const VideoOff = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20"/><path d="m22 8-6 4 6 4V8Z"/><path d="M15 15.55v-1.55l6 4V8l-6 4V9a2 2 0 0 0-2-2h-1"/><path d="M2 8a2 2 0 0 0 2-2v10a2 2 0 0 0 2 2h10a2.006 2.006 0 0 0 1.66-1.18"/></svg>;
const PhoneOff = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" x2="1" y1="1" y2="23"/></svg>;
const ScreenShare = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7"/><path d="M19 15l-3 3 3 3"/><path d="m16 18h5"/></svg>;
const ScreenShareOff = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7"/><path d="m22 22-5-5"/><path d="m17 22 5-5"/><path d="m17 17 5 5"/></svg>;


const Controls = ({ 
    isMuted, 
    toggleMute, 
    isVideoOff, 
    toggleVideo, 
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    onLeave 
}) => {
    
    const baseButton = "p-4 rounded-full transition-all duration-200 text-white";
    const inactiveButton = "bg-[#3C4043] hover:bg-[#45494d]";
    const redButton = "bg-red-600 hover:bg-red-700";
    const blueButton = "bg-blue-600 hover:bg-blue-700";
    
    return (
        <div className="flex items-center justify-center space-x-4">
            <button
                onClick={toggleMute}
                className={`${baseButton} ${isMuted ? redButton : inactiveButton}`}
                title={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? <MicOff /> : <Mic />}
            </button>
            <button
                onClick={toggleVideo}
                className={`${baseButton} ${isVideoOff ? redButton : inactiveButton}`}
                title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
                {isVideoOff ? <VideoOff /> : <Video />}
            </button>
            
            {/* Screen Share Button */}
            <button
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                className={`${baseButton} ${isScreenSharing ? blueButton : inactiveButton}`}
                title={isScreenSharing ? "Stop sharing" : "Share screen"}
            >
                {isScreenSharing ? <ScreenShareOff /> : <ScreenShare />}
            </button>
            
            <button
                onClick={onLeave}
                className={`${baseButton} ${redButton} px-8 ml-4`}
                title="Leave call"
            >
                <PhoneOff />
            </button>
        </div>
    );
};

export default Controls;