
import React, { useState } from 'react';
import { useGame } from '../hooks/useGameLogic';
import { VERIFIED_AGENCIES } from '../constants';

const OTP_CODE = '123456'; // Simulated OTP for registration

const GoogleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const RegisterScreen: React.FC = () => {
  const { registerUser, loginUser, setActiveScreen, allUsers, switchUser } = useGame();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [view, setView] = useState<'form' | 'otp' | 'google-phone'>('form');
  
  // Register state
  const [regDetails, setRegDetails] = useState({ fullName: '', nickname: '', phone: '', email: '', password: '', confirmPassword: '', referralId: '', age: '', photoUrl: '' });
  const [otp, setOtp] = useState('');
  
  // Login state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [error, setError] = useState('');

  // --- LOGIN LOGIC ---
  const handleLoginSubmit = () => {
      setError('');
      if (!loginId.trim() || !loginPassword.trim()) {
          setError('Please enter ID/Email and Password.');
          return;
      }
      setIsLoading(true);
      setTimeout(() => {
          const result = loginUser(loginId, loginPassword);
          if (!result.success) {
              setError(result.message || 'Login failed.');
              setIsLoading(false);
          } else {
              // success redirect handles inside loginUser via activeScreen
          }
      }, 800);
  };

  // --- REGISTER LOGIC ---
  const handleRegisterSubmit = () => {
    setError('');
    if (!regDetails.nickname.trim() || !regDetails.phone.trim() || !regDetails.email.trim() || !regDetails.password.trim()) {
        setError('All marked fields are required.');
        return;
    }
    
    if (regDetails.password !== regDetails.confirmPassword) {
        setError('Passwords do not match.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regDetails.email)) {
        setError('Please enter a valid email address.');
        return;
    }
    
    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
        alert(`An OTP has been sent to your email. (For testing, use: ${OTP_CODE})`);
        setIsLoading(false);
        setView('otp');
    }, 1000);
  };

  const handleVerifyOtp = () => {
    setError('');
    if (otp.trim() !== OTP_CODE) {
        setError('Invalid OTP. Please try again.');
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
        const existingUser = allUsers.find(u => u.email.toLowerCase() === regDetails.email.toLowerCase());
        if (existingUser) {
            setError('Account with this email already exists. Please login.');
            setIsLoading(false);
        } else {
            registerUser({
                fullName: regDetails.nickname, 
                email: regDetails.email,
                phone: regDetails.phone,
                password: regDetails.password,
                referralId: regDetails.referralId,
                photoUrl: regDetails.photoUrl,
                age: regDetails.age ? parseInt(regDetails.age) : undefined
            });
            // registerUser sets activeScreen to game
        }
    }, 1000);
  };

  // --- GOOGLE LOGIC ---
  const handleGoogleLoginStep1 = () => {
      if (!googleEmail.trim() || !googleEmail.includes('@')) {
          alert("Please enter a valid email.");
          return;
      }
      
      // Agencies cannot use Google Login via the public UI logic implicitly if they have strict password roles
      const isAgencyEmail = VERIFIED_AGENCIES.some(a => a.email.toLowerCase() === googleEmail.toLowerCase());
      
      if (isAgencyEmail) {
          // For Agencies, we could either block or prompt for password.
          // Based on "Agency only login with password", we should redirect to Manual Login.
          alert("Agency accounts must login with password.");
          setShowGoogleModal(false);
          setMode('login');
          return;
      }

      setIsLoading(true);
      setShowGoogleModal(false);
      
      setTimeout(() => {
          const normalizedEmail = googleEmail.trim().toLowerCase();
          const existingUser = allUsers.find(u => u.email.toLowerCase() === normalizedEmail);
          
          if (existingUser) {
             // Login existing user via Google (bypass password)
             loginUser(existingUser.id); // Password optional for user role if previously reg with google
          } else {
             // New User via Google - Simulate retrieving profile
             const simulatedName = normalizedEmail.split('@')[0];
             const simulatedPhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${simulatedName}`;
             const simulatedAge = Math.floor(Math.random() * (40 - 18 + 1)) + 18;

             setRegDetails(prev => ({
                 ...prev,
                 email: normalizedEmail,
                 fullName: simulatedName, // Full name from Google
                 nickname: simulatedName,
                 photoUrl: simulatedPhoto,
                 age: simulatedAge.toString(),
                 password: '', // Google users initially have no password
             }));
             
             // Move to phone number entry
             setIsLoading(false);
             setView('google-phone');
          }
      }, 1500);
  };

  const handleGoogleFinish = () => {
      if (!regDetails.phone.trim()) {
          setError("Phone number is required to complete registration.");
          return;
      }
      
      setIsLoading(true);
      setTimeout(() => {
         registerUser({
             fullName: regDetails.fullName,
             email: regDetails.email,
             phone: regDetails.phone,
             referralId: regDetails.referralId,
             photoUrl: regDetails.photoUrl,
             age: regDetails.age ? parseInt(regDetails.age) : undefined,
             // No password set for pure Google users yet
         });
         setIsLoading(false);
      }, 1000);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div className="bg-main-bg text-text-primary font-sans min-h-screen flex flex-col antialiased p-4">
        <div className="max-w-md mx-auto w-full flex flex-col flex-grow justify-center space-y-6">
            
            {/* Header / Logo Area */}
            <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-accent-gold" style={{ textShadow: 'var(--glow-gold)' }}>SQ BOOM</h1>
                <p className="text-text-secondary">Tap. Earn. Connect.</p>
            </div>

            {view === 'form' && (
                <>
                    {/* Tabs */}
                    <div className="flex border-b border-border-color mb-4">
                        <button 
                            onClick={() => { setMode('login'); setError(''); }} 
                            className={`flex-1 py-3 font-bold transition-colors ${mode === 'login' ? 'text-accent-cyan border-b-2 border-accent-cyan' : 'text-text-secondary'}`}
                        >
                            LOGIN
                        </button>
                        <button 
                            onClick={() => { setMode('register'); setError(''); }} 
                            className={`flex-1 py-3 font-bold transition-colors ${mode === 'register' ? 'text-accent-cyan border-b-2 border-accent-cyan' : 'text-text-secondary'}`}
                        >
                            REGISTER
                        </button>
                    </div>

                    {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg text-sm text-center mb-4 border border-red-500/20">{error}</p>}

                    {mode === 'login' && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <input 
                                    type="text" 
                                    value={loginId} 
                                    onChange={(e) => setLoginId(e.target.value)} 
                                    className="w-full bg-glass border border-border-color rounded-xl p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" 
                                    placeholder="Email or User ID" 
                                />
                            </div>
                            <div>
                                <input 
                                    type="password" 
                                    value={loginPassword} 
                                    onChange={(e) => setLoginPassword(e.target.value)} 
                                    className="w-full bg-glass border border-border-color rounded-xl p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" 
                                    placeholder="Password" 
                                />
                            </div>
                            
                            <button onClick={handleLoginSubmit} disabled={isLoading} className="w-full btn-primary py-4 text-lg">
                                {isLoading ? 'Logging in...' : 'LOGIN'}
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-color"></div></div>
                                <div className="relative flex justify-center"><span className="bg-main-bg px-4 text-sm text-text-secondary">or</span></div>
                            </div>

                            <button 
                                onClick={() => setShowGoogleModal(true)}
                                className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                <GoogleIcon className="w-6 h-6" />
                                Continue with Google
                            </button>
                            <p className="text-center text-xs text-text-secondary mt-2">Agencies must use ID & Password.</p>
                        </div>
                    )}

                    {mode === 'register' && (
                        <div className="space-y-3 animate-fade-in">
                            <button 
                                onClick={() => setShowGoogleModal(true)}
                                className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors shadow-lg mb-4"
                            >
                                <GoogleIcon className="w-6 h-6" />
                                Register with Google
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-color"></div></div>
                                <div className="relative flex justify-center"><span className="bg-main-bg px-4 text-sm text-text-secondary">or Manual Sign Up</span></div>
                            </div>

                            <input type="text" name="nickname" value={regDetails.nickname} onChange={handleChange} className="w-full bg-glass border border-border-color rounded-lg p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="Nickname *" />
                            <input type="email" name="email" value={regDetails.email} onChange={handleChange} className="w-full bg-glass border border-border-color rounded-lg p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="Email Address *" />
                            <input type="text" name="phone" value={regDetails.phone} onChange={handleChange} className="w-full bg-glass border border-border-color rounded-lg p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="Phone Number *" />
                            
                            <div className="flex gap-2">
                                <input type="password" name="password" value={regDetails.password} onChange={handleChange} className="w-1/2 bg-glass border border-border-color rounded-lg p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="Password *" />
                                <input type="password" name="confirmPassword" value={regDetails.confirmPassword} onChange={handleChange} className="w-1/2 bg-glass border border-border-color rounded-lg p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="Confirm *" />
                            </div>

                            <div className="flex gap-2">
                                <input type="number" name="age" value={regDetails.age} onChange={handleChange} className="w-1/3 bg-glass border border-border-color rounded-lg p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="Age" />
                                <input type="text" name="photoUrl" value={regDetails.photoUrl} onChange={handleChange} className="w-2/3 bg-glass border border-border-color rounded-lg p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="Photo URL (Optional)" />
                            </div>
                            <input type="text" name="referralId" value={regDetails.referralId} onChange={handleChange} className="w-full bg-glass border border-border-color rounded-lg p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="Referral ID (Optional)" />

                            <button onClick={handleRegisterSubmit} disabled={isLoading} className="w-full btn-primary py-4 text-lg mt-2">
                                {isLoading ? 'Processing...' : 'CREATE ACCOUNT'}
                            </button>
                        </div>
                    )}
                </>
            )}

            {view === 'otp' && (
                <div className="animate-fade-in">
                    <h1 className="text-2xl font-bold text-accent-cyan text-center mb-4">VERIFY EMAIL</h1>
                    {error && <p className="text-red-400 bg-red-500/10 p-2 rounded-md text-sm text-center mb-4">{error}</p>}
                    <div className="space-y-4">
                        <p className="text-text-secondary text-center text-sm">Enter the 6-digit code sent to <span className="text-accent-cyan">{regDetails.email}</span></p>
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-glass border border-border-color rounded-lg p-4 text-text-primary text-center text-2xl tracking-widest placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="000000" maxLength={6} />
                    </div>
                    <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full btn-primary mt-6 py-3">{isLoading ? 'VERIFYING...' : 'VERIFY & LOGIN'}</button>
                    <button onClick={() => setView('form')} className="w-full text-text-secondary text-sm mt-4">Back</button>
                </div>
            )}

            {view === 'google-phone' && (
                <div className="animate-fade-in">
                    <div className="text-center space-y-2 mb-6">
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-accent-cyan">
                            <img src={regDetails.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-xl font-bold text-text-primary">Welcome, {regDetails.nickname}!</h2>
                        <p className="text-text-secondary text-sm">We retrieved your profile from Google.</p>
                    </div>

                    <div className="bg-glass p-4 rounded-lg border border-border-color space-y-2 mb-4">
                        <p className="text-xs text-text-secondary uppercase">Profile Summary</p>
                        <div className="flex justify-between text-sm"><span className="text-text-secondary">Email:</span> <span className="text-text-primary">{regDetails.email}</span></div>
                         <div className="flex justify-between text-sm"><span className="text-text-secondary">Age:</span> <span className="text-text-primary">{regDetails.age}</span></div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-accent-cyan font-bold mb-1 block">Final Step: Add Phone Number</label>
                            <input type="text" name="phone" value={regDetails.phone} onChange={handleChange} className="w-full bg-glass border border-border-color rounded-lg p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="ENTER PHONE NUMBER" />
                            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                        </div>
                        <input type="text" name="referralId" value={regDetails.referralId} onChange={handleChange} className="w-full bg-glass border border-border-color rounded-lg p-4 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="REFERRAL ID (OPTIONAL)" />

                        <button onClick={handleGoogleFinish} disabled={isLoading} className="w-full btn-primary py-3">{isLoading ? 'Creating...' : 'COMPLETE REGISTRATION'}</button>
                    </div>
                </div>
            )}
        </div>

        {/* Google Account Simulation Modal */}
        {showGoogleModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
                <div className="bg-white w-full max-w-sm rounded-xl p-6 space-y-6 shadow-2xl">
                    <div className="text-center">
                         <GoogleIcon className="w-10 h-10 mx-auto mb-2" />
                         <h3 className="text-gray-800 text-xl font-bold">Sign in with Google</h3>
                         <p className="text-gray-500 text-sm">to continue to SQ BOOM</p>
                    </div>

                    <div className="space-y-2">
                        <input 
                            type="email" 
                            value={googleEmail}
                            onChange={(e) => setGoogleEmail(e.target.value)}
                            placeholder="Email or phone"
                            className="w-full border border-gray-300 rounded px-3 py-3 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            autoFocus
                        />
                        <p className="text-xs text-gray-400">Simulate any Gmail address here.</p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setShowGoogleModal(false)}
                            className="text-blue-600 font-bold text-sm px-4 py-2 rounded hover:bg-blue-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleGoogleLoginStep1}
                            className="bg-blue-600 text-white font-bold text-sm px-6 py-2 rounded hover:bg-blue-700 shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default RegisterScreen;
