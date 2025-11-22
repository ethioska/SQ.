import React from 'react';
import GameScreen from './components/GameScreen';
import WalletScreen from './components/WalletScreen';
import ChatScreen from './components/ChatScreen';
import TransferScreen from './components/TransferScreen';
import SettingsScreen from './components/SettingsScreen';
import RegisterScreen from './components/RegisterScreen';
import AgencyScreen from './components/AgencyScreen';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import { GameProvider, useGame } from './hooks/useGameLogic';
import { PRIMARY_AGENCY_ID, VERIFIED_AGENCIES } from './constants';
import { WarningIcon } from './components/icons';
import LeaderboardScreen from './components/LeaderboardScreen';

const AppContent: React.FC = () => {
  const { user, activeScreen, setActiveScreen, flyingCoins, getCoinPerTap, activeChat } = useGame();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'wallet':
        return <WalletScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'leaderboard':
        return <LeaderboardScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'agency':
        return <AgencyScreen />;
      case 'register':
        return <RegisterScreen />;
      case 'transfer':
        return <TransferScreen />;
      case 'game':
      default:
        return <GameScreen />;
    }
  };

  return (
    <>
      <div className="font-sans h-screen flex flex-col justify-between antialiased bg-main-bg text-text-primary overflow-hidden relative selection:bg-accent-cyan selection:text-white">
        <Header />
        <main className="flex-grow p-4 pb-32 overflow-y-auto scrollbar-hide animate-fade-in">
          {renderScreen()}
        </main>
        {!activeChat && <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />}
      </div>
      
      {user && <div className="pointer-events-none fixed inset-0 z-50">
        {flyingCoins.map(coin => (
          <div
            key={coin.id}
            style={{ position: 'absolute', left: `${coin.x}px`, top: `${coin.y}px` }}
            className="text-lg font-black animate-fly-up"
          >
            +{getCoinPerTap().toLocaleString()}
          </div>
        ))}
      </div>}
      <style>{`
        :root {
          --main-bg: #0A0E13;
          --secondary-bg: #121820;
          --glass-bg: rgba(18, 24, 32, 0.7);
          --border-color: rgba(255, 255, 255, 0.08);
          --text-primary: #E6EDF3;
          --text-secondary: #7D8590;
          --accent-gold: #FFD700;
          --accent-cyan: #00BFFF;
          --accent-magenta: #FF00FF;
          --glow-cyan: 0 0 20px rgba(0, 191, 255, 0.4);
          --glow-gold: 0 0 20px rgba(255, 215, 0, 0.4);
          --glow-magenta: 0 0 20px rgba(255, 0, 255, 0.4);
        }
        html.light {
          --main-bg: #F0F2F5;
          --secondary-bg: #FFFFFF;
          --glass-bg: rgba(255, 255, 255, 0.75);
          --border-color: #DCDFE4;
          --text-primary: #1C1E21;
          --text-secondary: #606770;
          --accent-gold: #F59E0B;
          --accent-cyan: #0088D1;
          --accent-magenta: #D81B60;
          --glow-cyan: 0 0 15px rgba(0, 136, 209, 0.3);
          --glow-gold: 0 0 15px rgba(245, 158, 11, 0.3);
          --glow-magenta: 0 0 15px rgba(216, 27, 96, 0.3);
        }
        
        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--text-secondary);
        }

        .bg-glass {
            background-color: var(--glass-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        
        .btn-primary {
            background-image: linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta));
            color: white;
            font-weight: 800;
            border-radius: 0.75rem;
            padding: 0.75rem 1.5rem;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(0, 191, 255, 0.2);
            position: relative;
            overflow: hidden;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 191, 255, 0.4);
        }
        .btn-primary:active {
            transform: translateY(0px);
        }

        .animate-fly-up {
          color: var(--accent-gold);
          text-shadow: var(--glow-gold);
          pointer-events: none;
        }
        
        .animate-slide-up {
            animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 4s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};


const App: React.FC = () => {
  const isAgencyConfigured = VERIFIED_AGENCIES.some(agency => agency.id === PRIMARY_AGENCY_ID);

  if (!isAgencyConfigured) {
    return (
      <div className="bg-main-bg text-text-primary font-sans h-screen flex flex-col justify-center items-center antialiased p-4 text-center">
        <WarningIcon className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-400">Application Integrity Error</h1>
        <p className="text-text-secondary mt-2 max-w-sm">
          This version of the application is not authorized or has been tampered with. Please download the official version.
        </p>
      </div>
    );
  }

  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;