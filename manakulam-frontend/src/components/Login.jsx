import React, { useState } from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';

// --- AVATAR ICONS ---
// We define our set of professional, Netflix-style avatars here
const Avatars = {
  avatar1: () => <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="18" fill="#FFC700"></rect><path d="M18 17C20.7614 17 23 14.7614 23 12C23 9.23858 20.7614 7 18 7C15.2386 7 13 9.23858 13 12C13 14.7614 15.2386 17 18 17Z" fill="#333333"></path><path d="M26 29C26 24.5817 22.4183 21 18 21C13.5817 21 10 24.5817 10 29H26Z" fill="#333333"></path></svg>,
  avatar2: () => <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="18" fill="#F44336"></rect><path d="M18 17C20.7614 17 23 14.7614 23 12C23 9.23858 20.7614 7 18 7C15.2386 7 13 9.23858 13 12C13 14.7614 15.2386 17 18 17Z" fill="#FFFFFF"></path><path d="M26 29C26 24.5817 22.4183 21 18 21C13.5817 21 10 24.5817 10 29H26Z" fill="#FFFFFF"></path></svg>,
  avatar3: () => <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="18" fill="#4CAF50"></rect><path d="M18 17C20.7614 17 23 14.7614 23 12C23 9.23858 20.7614 7 18 7C15.2386 7 13 9.23858 13 12C13 14.7614 15.2386 17 18 17Z" fill="#FFFFFF"></path><path d="M26 29C26 24.5817 22.4183 21 18 21C13.5817 21 10 24.5817 10 29H26Z" fill="#FFFFFF"></path></svg>,
  avatar4: () => <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="18" fill="#2196F3"></rect><path d="M18 17C20.7614 17 23 14.7614 23 12C23 9.23858 20.7614 7 18 7C15.2386 7 13 9.23858 13 12C13 14.7614 15.2386 17 18 17Z" fill="#FFFFFF"></path><path d="M26 29C26 24.5817 22.4183 21 18 21C13.5817 21 10 24.5817 10 29H26Z" fill="#FFFFFF"></path></svg>,
  avatar5: () => <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" rx="18" fill="#9C27B0"></rect><path d="M18 17C20.7614 17 23 14.7614 23 12C23 9.23858 20.7614 7 18 7C15.2386 7 13 9.23858 13 12C13 14.7614 15.2386 17 18 17Z" fill="#FFFFFF"></path><path d="M26 29C26 24.5817 22.4183 21 18 21C13.5817 21 10 24.5817 10 29H26Z" fill="#FFFFFF"></path></svg>,
};
const avatarIds = Object.keys(Avatars); // ['avatar1', 'avatar2', ...]

// --- UI COMPONENTS (Spinner, GoogleIcon, Input) ---
// (These are the same as before, no changes needed)
const Spinner = () => <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const GoogleIcon = () => <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>;
const Input = (props) => <input {...props} className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#3A3A3A] focus:bg-[#202020] transition-all rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none" />;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1'); // Default avatar
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // --- GOOGLE LOGIN HANDLER (no change) ---
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); setError('');
      try {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const { data } = await axios.post(`${API_URL}/google`, {
          email: userInfo.data.email,
          name: userInfo.data.name,
          googleId: userInfo.data.sub,
          avatar: userInfo.data.picture // Google provides a URL
        });
        onLogin(data);
      } catch (err) { setError('Google sign-in failed. Please try again.'); } 
      finally { setLoading(false); }
    },
    onError: () => setError('Google sign-in was closed or failed.'),
  });

  // --- EMAIL/PASS HANDLER (UPDATED) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isRegistering && !acceptedTerms) {
        setError("Please accept the Terms of Service.");
        setLoading(false); return;
    }
    if (formData.password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false); return;
    }

    try {
      if (isRegistering) {
        // --- SIGN UP ---
        const payload = { ...formData, avatar: selectedAvatar }; // Add selected avatar
        const { data } = await axios.post(`${API_URL}/register`, payload);
        onLogin(data); // Auto-login on success
      } else {
        // --- SIGN IN ---
        const { data } = await axios.post(`${API_URL}/login`, formData);
        onLogin(data); // Login
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsRegistering(prev => !prev);
    setError(''); 
    setFormData({ name: '', email: '', password: '' }); 
    setAcceptedTerms(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080808]">
      <div className="relative w-full max-w-[420px] mx-auto">
        {/* Background Layered Effect */}
        <div className="absolute inset-0 bg-white/5 rounded-[2rem] transform scale-[0.97] -z-10 blur-sm"></div>
        <div className="absolute inset-0 bg-white/5 rounded-[2rem] transform scale-[0.99] -z-20 blur-sm"></div>

        <div className="w-full bg-[#121212] border border-[#2A2A2A] rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-10">
            {/* Your Logo - Make sure you have this image in /public/manakulam-logo.png */}
            <img src="/manakulam-logo.png" alt="MANAKULAM" className="h-10 mx-auto" />
          </div>

          <AnimatePresence mode='wait'>
            <motion.div
              key={isRegistering ? 'register' : 'login'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-medium text-gray-100 text-center mb-3">
                {isRegistering ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-gray-400 text-sm text-center mb-8">
                {isRegistering 
                    ? "The future of secure communication."
                    : "Experience secure, high-quality video conferencing."}
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-red-800/20 border border-red-700 rounded-lg text-red-300 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <>
                    <label className="text-xs text-gray-400 font-medium">Choose your avatar</label>
                    <div className="flex justify-between items-center space-x-2">
                      {avatarIds.map(avatarId => {
                        const Icon = Avatars[avatarId];
                        return (
                          <button
                            type="button"
                            key={avatarId}
                            onClick={() => setSelectedAvatar(avatarId)}
                            className={`w-14 h-14 p-1 rounded-full transition-all ${selectedAvatar === avatarId ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#121212]' : 'opacity-50 hover:opacity-100'}`}
                          >
                            <Icon />
                          </button>
                        );
                      })}
                    </div>
                    <Input
                      name="name" type="text" placeholder="Full Name" required
                      value={formData.name} onChange={handleFormChange} disabled={loading}
                    />
                  </>
                )}
                <Input
                  name="email" type="email" placeholder="Email address" required
                  value={formData.email} onChange={handleFormChange} disabled={loading}
                />
                <Input
                  name="password" type="password" placeholder="Password (min. 6 characters)" required
                  value={formData.password} onChange={handleFormChange} disabled={loading}
                />

                {isRegistering && (
                  <div className="flex items-center pt-2">
                    <input
                      id="terms" type="checkbox"
                      className="h-4 w-4 text-blue-600 bg-[#2A2A2A] border-gray-600 rounded focus:ring-blue-500"
                      checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} disabled={loading}
                    />
                    <label htmlFor="terms" className="ml-2 block text-xs text-gray-400">
                      I agree to the <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>.
                    </label>
                  </div>
                )}

                {/* --- BUTTONS MATCHING YOUR DESIGN --- */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#2A2A2A] hover:border-[#3A3A3A] disabled:opacity-50 text-gray-300 font-medium rounded-xl py-3.5 mt-6 transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  {loading && <Spinner />}
                  <span>{isRegistering ? 'Sign Up' : 'Sign In'}</span>
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
            <div className="relative flex justify-center"><span className="px-4 bg-[#121212] text-xs text-gray-500 uppercase">Or</span></div>
          </div>

          {/* --- GOOGLE BUTTON MATCHING YOUR DESIGN --- */}
          <button
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#2A2A2A] hover:border-[#3A3A3A] disabled:opacity-50 text-gray-300 font-medium rounded-xl py-3.5 transition-all flex items-center justify-center space-x-3 active:scale-95"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <div className="mt-8 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;