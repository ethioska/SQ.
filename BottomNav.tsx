import React from 'react';
import type { Screen } from '../types';
import { GameIcon, WalletIcon, LeaderboardIcon, ChatIcon, SettingsIcon } from './icons';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center w-full pt-3 pb-2 transition-colors duration-200 group ${
      isActive ? 'text-accent-cyan' : 'text-text-secondary hover:text-text-primary'
    }`}
  >
    {isActive && <span className="absolute top-0 w-8 h-1 bg-accent-cyan rounded-full" style={{boxShadow: 'var(--glow-cyan)'}}></span>}
    {icon}
    <span className={`text-xs mt-1 font-medium ${isActive ? 'text-accent-cyan' : 'text-text-secondary group-hover:text-text-primary'}`}>{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const navItems = [
    { id: 'game', label: 'Game', icon: <GameIcon className="w-6 h-6" /> },
    { id: 'wallet', label: 'Wallet', icon: <WalletIcon className="w-6 h-6" /> },
    { id: 'leaderboard', label: 'Ranks', icon: <LeaderboardIcon className="w-6 h-6" /> },
    { id: 'chat', label: 'Chat', icon: <ChatIcon className="w-6 h-6" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-glass border-t border-border-color shadow-lg z-20">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map(item => (
          <NavItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeScreen === item.id}
            onClick={() => setActiveScreen(item.id as Screen)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;