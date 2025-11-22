
import React, { useState } from 'react';
import { useGame } from '../hooks/useGameLogic';
import ReportUserModal from './ReportUserModal';
import { LogoutIcon, ReportIcon, MoonIcon } from './icons';

const SettingsRow: React.FC<{ icon: React.ReactNode; label: string; control: React.ReactNode; }> = ({ icon, label, control }) => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-4">
      <span className="text-text-secondary">{icon}</span>
      <p className="text-text-primary">{label}</p>
    </div>
    <div>{control}</div>
  </div>
);

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useGame();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 ${isDark ? 'bg-accent-cyan' : 'bg-gray-400'}`}
    >
      <span
        className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
};

const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { changePassword } = useGame();
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    
    const handleSubmit = () => {
        if (newPass.length < 4) return alert("Password must be at least 4 characters.");
        if (newPass !== confirmPass) return alert("Passwords do not match.");
        changePassword(newPass);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div className="bg-glass border border-border-color rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-text-primary">Change Password</h3>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New Password" className="w-full bg-main-bg/50 p-3 rounded-lg text-text-primary border border-border-color" />
                <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm Password" className="w-full bg-main-bg/50 p-3 rounded-lg text-text-primary border border-border-color" />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-border-color py-2 rounded-lg text-text-primary">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 bg-accent-cyan py-2 rounded-lg text-white font-bold">Save</button>
                </div>
            </div>
        </div>
    );
}


const SettingsScreen: React.FC = () => {
  const { user, setActiveScreen, logout } = useGame();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="p-2 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>
        <div className="bg-glass border border-border-color rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary text-center">Join SQ BOOM</h2>
           <p className="text-text-secondary text-sm text-center pb-2">Create an account to start earning and unlock all features.</p>
          <button
            onClick={() => setActiveScreen('register')}
            className="w-full btn-primary"
          >
            Login / Register
          </button>
        </div>
        <div className="bg-glass border border-border-color rounded-2xl mt-4 divide-y divide-border-color">
            <SettingsRow
              icon={<MoonIcon className="w-6 h-6" />}
              label="Dark Mode"
              control={<ThemeToggle />}
            />
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">Settings</h1>

      <div className="bg-glass border border-border-color rounded-2xl p-6 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center border border-border-color overflow-hidden bg-secondary-bg">
            {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
                <span className="text-2xl font-bold text-accent-gold">{user.name.charAt(0).toUpperCase()}</span>
            )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">{user.name}</h2>
          <p className="text-sm text-text-secondary">{user.role === 'USER' ? `Level ${user.level}` : user.role}</p>
          {user.age && <p className="text-xs text-text-secondary">Age: {user.age}</p>}
        </div>
      </div>

      {(user.role === 'ADMIN' || user.role === 'SUPPORT' || user.role === 'RECEIVER') && (
        <div className="bg-glass border border-border-color rounded-2xl p-6 space-y-4 text-left mb-4">
            <h2 className="text-lg font-semibold text-text-primary text-center">Agency Access</h2>
            <p className="text-text-secondary text-sm text-center">You have {user.role.toLowerCase()} privileges.</p>
            <button
            onClick={() => setActiveScreen('agency')}
            className="w-full btn-primary"
            >
            Enter Agency Panel
            </button>
        </div>
      )}

      <div className="bg-glass border border-border-color rounded-2xl divide-y divide-border-color">
        <SettingsRow
          icon={<MoonIcon className="w-6 h-6" />}
          label="Dark Mode"
          control={<ThemeToggle />}
        />
        
        <button onClick={() => setIsPasswordModalOpen(true)} className="w-full text-left">
             <SettingsRow
                icon={<span className="w-6 h-6 text-center font-bold text-text-secondary">🔑</span>}
                label="Change Password"
                control={<span className="text-text-secondary text-sm">&rarr;</span>}
            />
        </button>

        {user.role === 'USER' && (
            <button onClick={() => setIsReportModalOpen(true)} className="w-full text-left">
            <SettingsRow
                icon={<ReportIcon className="w-6 h-6" />}
                label="Report a User"
                control={<span className="text-text-secondary text-sm">&rarr;</span>}
            />
            </button>
        )}

        <button onClick={logout} className="w-full text-left">
          <SettingsRow
            icon={<LogoutIcon className="w-6 h-6 text-red-400" />}
            label="Logout"
            control={<span className="text-text-secondary text-sm">&rarr;</span>}
          />
        </button>
      </div>
      
      {isReportModalOpen && <ReportUserModal onClose={() => setIsReportModalOpen(false)} />}
      {isPasswordModalOpen && <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />}
    </div>
  );
};

export default SettingsScreen;
