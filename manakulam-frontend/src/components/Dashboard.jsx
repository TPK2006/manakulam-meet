import React, { useState } from 'react';

// --- AVATAR ICONS (Netflix-style) ---
// This ensures the dashboard can display the icon you selected
const Avatars = {
  avatar1: () => <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="18" fill="#FFC700"></rect><path d="M18 17C20.7614 17 23 14.7614 23 12C23 9.23858 20.7614 7 18 7C15.2386 7 13 9.23858 13 12C13 14.7614 15.2386 17 18 17Z" fill="#121212"></path><path d="M26 29C26 24.5817 22.4183 21 18 21C13.5817 21 10 24.5817 10 29H26Z" fill="#121212"></path></svg>,
  avatar2: () => <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="18" fill="#FF5722"></rect><path d="M18 17C20.7614 17 23 14.7614 23 12C23 9.23858 20.7614 7 18 7C15.2386 7 13 9.23858 13 12C13 14.7614 15.2386 17 18 17Z" fill="#FFFFFF"></path><path d="M26 29C26 24.5817 22.4183 21 18 21C13.5817 21 10 24.5817 10 29H26Z" fill="#FFFFFF"></path></svg>,
  avatar3: () => <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="18" fill="#4CAF50"></rect><path d="M18 17C20.7614 17 23 14.7614 23 12C23 9.23858 20.7614 7 18 7C15.2386 7 13 9.23858 13 12C13 14.7614 15.2386 17 18 17Z" fill="#FFFFFF"></path><path d="M26 29C26 24.5817 22.4183 21 18 21C13.5817 21 10 24.5817 10 29H26Z" fill="#FFFFFF"></path></svg>,
  avatar4: () => <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="18" fill="#2196F3"></rect><path d="M18 17C20.7614 17 23 14.7614 23 12C23 9.23858 20.7614 7 18 7C15.2386 7 13 9.23858 13 12C13 14.7614 15.2386 17 18 17Z" fill="#FFFFFF"></path><path d="M26 29C26 24.5817 22.4183 21 18 21C13.5817 21 10 24.5817 10 29H26Z" fill="#FFFFFF"></path></svg>,
  avatar5: () => <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="18" fill="#9C27B0"></rect><path d="M18 17C20.7614 17 23 14.7614 23 12C23 9.23858 20.7614 7 18 7C15.2386 7 13 9.23858 13 12C13 14.7614 15.2386 17 18 17Z" fill="#FFFFFF"></path><path d="M26 29C26 24.5817 22.4183 21 18 21C13.5817 21 10 24.5817 10 29H26Z" fill="#FFFFFF"></path></svg>,
};

// Helper component to render the correct avatar
const GetAvatar = ({ avatarKey }) => {
  const AvatarComponent = Avatars[avatarKey];
  return AvatarComponent ? <AvatarComponent /> : <Avatars.avatar1 />; // Default to avatar1 if not found
};

// --- Other Icons ---
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
const KeyboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M8 12h.001"/><path d="M12 12h.001"/><path d="M16 12h.001"/><path d="M7 16h10"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;

const Dashboard = ({ user, onJoinRoom, onLogout }) => {
    const [meetingCode, setMeetingCode] = useState('');
    const createMeeting = () => onJoinRoom(Math.random().toString(36).substring(2, 7));

    // --- FIX ---
    // Safely get user properties to prevent "undefined" error
    const userName = user?.name || 'User';
    const userAvatar = user?.avatar || 'avatar1'; // Default to avatar1

    return (
        <div className="min-h-screen flex flex-col bg-[#080808]">
            <header className="px-8 py-5 flex justify-between items-center">
                {/* Your Logo - Make sure 'manakulam-logo.png' is in the /public folder */}
                <img src="/manakulam-logo.png" alt="MANAKULAM" className="h-8" />
                
                <div className="flex items-center space-x-6">
                    
                    {/* --- FIX: Now shows NAME instead of EMAIL --- */}
                    <span className="text-gray-300 text-sm font-medium hidden sm:block">{userName}</span>
                    
                    {/* --- FIX: Renders Netflix-style avatar --- */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2A2A2A]">
                      {userAvatar.includes('http') ? (
                        // Google Login: Use the URL
                        <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                      ) : (
                        // Manual Login: Use the selected SVG
                        <GetAvatar avatarKey={userAvatar} />
                      )}
                    </div>

                    <button 
                        onClick={onLogout} title="Sign out"
                        className="p-2.5 rounded-full hover:bg-[#1A1A1A] text-gray-400 hover:text-white transition-colors"
                    >
                        <LogoutIcon />
                    </button>
                </div>
            </header>

            {/* Main Content (Unchanged) */}
            <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
               <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
                    <div className="space-y-12 max-w-2xl">
                        <div className="space-y-6">
                            <h1 className="text-5xl sm:text-6xl font-medium text-white leading-[1.15] tracking-tight">
                                Premium video meetings.
                                <span className="block text-blue-500 mt-3">Now free for everyone.</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                                We re-engineered the service we built for secure business meetings, Manakulam Meet, to make it free and available for all.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-center max-w-xl">
                            <button
                                onClick={createMeeting}
                                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-medium rounded-xl flex items-center justify-center space-x-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
                            >
                                <VideoIcon />
                                <span>New meeting</span>
                            </button>
                            <div className="flex items-center space-x-3 relative group flex-1 w-full">
                                <div className="absolute left-4 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                    <KeyboardIcon />
                                </div>
                                <input
                                    type="text" placeholder="Enter a code or link"
                                    value={meetingCode} onChange={(e) => setMeetingCode(e.target.value)}
                                    className="w-full pl-12 pr-24 py-4 bg-[#1A1A1A] border border-[#333] focus:border-blue-500 rounded-xl outline-none text-white transition-all placeholder-gray-500"
                                />
                                {meetingCode && (
                                    <button 
                                        onClick={() => onJoinRoom(meetingCode)} 
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 font-medium px-4 py-2 hover:bg-blue-500/10 rounded-lg transition-all"
                                    >
                                        Join
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="pt-8 border-t border-white/5">
                            <p className="text-gray-500 text-[15px]">
                                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors no-underline hover:underline">Learn more</a> about Manakulam Meet
                            </p>
                        </div>
                    </div>
                    <div className="hidden lg:flex justify-center items-center">
                         <div className="relative w-full max-w-lg aspect-square p-8">
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 rounded-full blur-3xl"></div>
                             <div className="relative w-full h-full">
                                 <div className="absolute inset-0 bg-[#1A1A1A] rounded-3xl border border-white/5 transform rotate-6 opacity-40 scale-95"></div>
                                 <div className="absolute inset-0 bg-[#1A1A1A] rounded-3xl border border-white/5 transform rotate-3 opacity-70 scale-[0.975]"></div>
                                 <div className="relative bg-[#131313] border border-[#2A2A2A] rounded-3xl p-6 shadow-2xl h-full flex flex-col overflow-hidden">
                                     <div className="flex justify-between mb-8 opacity-40"><div className="w-32 h-4 bg-white/10 rounded-full"></div><div className="flex space-x-2"><div className="w-3 h-3 bg-red-500/20 rounded-full"></div><div className="w-3 h-3 bg-yellow-500/20 rounded-full"></div><div className="w-3 h-3 bg-green-500/20 rounded-full"></div></div></div>
                                     <div className="grid grid-cols-2 gap-4 flex-1 opacity-30"><div className="bg-white/5 rounded-2xl animate-pulse"></div><div className="bg-white/5 rounded-2xl animate-pulse delay-75"></div><div className="bg-white/5 rounded-2xl animate-pulse delay-150"></div><div className="bg-white/5 rounded-2xl animate-pulse delay-200"></div></div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;