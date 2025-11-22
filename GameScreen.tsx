import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../hooks/useGameLogic';
import { SQLogoSmall, AdBonusIcon, GiftIcon, ExternalLinkIcon, HandRaisedIcon } from './icons';
import { DAILY_TAP_LIMIT, DAILY_REWARD_AMOUNT, AD_BONUS_COINS, BOT_TIERS, BOT_SESSION_HOURS } from '../constants';
import BotStoreModal from './BotStoreModal';

const InfoCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`w-full bg-glass border border-border-color rounded-2xl p-4 shadow-lg backdrop-blur-md ${className}`}>
        {children}
    </div>
);

const formatCooldown = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const CountdownTimer: React.FC<{ durationMs: number }> = ({ durationMs }) => {
    const [remaining, setRemaining] = useState(durationMs);

    useEffect(() => {
        setRemaining(durationMs);
        const interval = setInterval(() => {
            setRemaining(prev => Math.max(0, prev - 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [durationMs]);

    return <span>{formatCooldown(Math.round(remaining / 1000))}</span>;
};

// --- GUEST / MEMO COMPONENTS ---

const GuestDashboard: React.FC<{ onRegister: () => void }> = ({ onRegister }) => {
    const { platformSettings } = useGame();
    const [activeUsers, setActiveUsers] = useState(1240);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-full space-y-6 max-w-md mx-auto pb-20 relative">
            {/* System Memo Header */}
            <div className="w-full text-center space-y-4 relative z-10">
                <div className="inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-br from-secondary-bg to-main-bg border-2 border-accent-cyan/30 shadow-[0_0_40px_rgba(0,191,255,0.2)] mb-2 animate-pulse-glow">
                     <SQLogoSmall className="w-28 h-28 drop-shadow-lg" />
                </div>
                <div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-white to-accent-magenta tracking-tight drop-shadow-sm">SQ BOOM</h1>
                    <p className="text-text-secondary font-medium tracking-widest text-sm mt-1">DECENTRALIZED AD NETWORK</p>
                </div>
                <div className="inline-block px-4 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 backdrop-blur-sm">
                    <p className="text-accent-cyan font-bold tracking-widest text-xs flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse"></span>
                        SYSTEM ONLINE: GUEST MODE
                    </p>
                </div>
            </div>

            {/* Info / Memo Card */}
            <InfoCard className="space-y-4 border-accent-gold/20 bg-glass/90 relative z-10 shadow-2xl">
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                    <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">Exchange Rate</span>
                    <span className="text-accent-gold font-mono font-bold text-lg">1 USD ≈ {platformSettings.etbRate.toFixed(2)} SQ</span>
                </div>
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                     <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">Active Miners</span>
                     <span className="text-green-400 font-mono font-bold flex items-center gap-2 text-lg">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        {activeUsers.toLocaleString()}
                     </span>
                </div>
                <div className="bg-gradient-to-r from-main-bg/60 to-secondary-bg/60 p-4 rounded-xl border border-dashed border-border-color/50">
                    <p className="text-xs text-accent-cyan mb-2 font-bold uppercase tracking-wide">PLATFORM MEMO</p>
                    <p className="text-sm text-text-primary leading-relaxed opacity-90">
                        Welcome to the SQ BOOM Network. Mining operations are currently <strong>ACTIVE</strong>. 
                        Guest access is limited to system monitoring. Register to start mining, transfer assets, and unlock Agency features.
                    </p>
                </div>
            </InfoCard>

            {/* Register Call to Action */}
            <button 
                onClick={onRegister} 
                className="w-full bg-gradient-to-r from-accent-cyan to-accent-magenta text-white font-black text-xl py-5 rounded-2xl shadow-[0_10px_30px_rgba(0,191,255,0.3)] hover:scale-[1.02] transition-all active:scale-95 animate-pulse-glow relative z-10 overflow-hidden group"
            >
                <span className="relative z-10">START MINING NOW</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </button>

            <div className="grid grid-cols-2 w-full gap-3 relative z-10">
                 <div className="bg-glass p-4 rounded-xl border border-border-color text-center hover:border-accent-cyan/50 transition-colors">
                    <p className="text-2xl font-bold text-text-primary">Free</p>
                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Registration</p>
                 </div>
                 <div className="bg-glass p-4 rounded-xl border border-border-color text-center hover:border-accent-magenta/50 transition-colors">
                    <p className="text-2xl font-bold text-text-primary">24/7</p>
                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Uptime</p>
                 </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent-cyan rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-magenta rounded-full blur-[120px] mix-blend-screen"></div>
            </div>
        </div>
    );
};


const BotControlCard: React.FC<{ onStoreOpen: () => void }> = ({ onStoreOpen }) => {
    const { user, startBotSession, claimBotEarnings } = useGame();

    const botStatus = useMemo(() => {
        if (!user || !user.activeBotTier) return { status: 'NO_BOT' as const };

        const activeBot = BOT_TIERS.find(b => b.tier === user.activeBotTier);
        const accumulatedCoins = user.botAccumulatedCoins;

        if (!user.botSessionStartedAt) {
            if (accumulatedCoins > 0) {
                return { status: 'CLAIM_READY' as const, accumulatedCoins, activeBot };
            }
            return { status: 'IDLE' as const, activeBot };
        }
        
        const elapsedMs = Date.now() - user.botSessionStartedAt;
        const totalDurationMs = BOT_SESSION_HOURS * 60 * 60 * 1000;
        
        if (elapsedMs >= totalDurationMs) {
            return { status: 'CLAIM_READY' as const, accumulatedCoins, activeBot };
        }

        return {
            status: 'RUNNING' as const,
            accumulatedCoins,
            remainingTime: totalDurationMs - elapsedMs,
            activeBot
        };
    }, [user]);

    const renderContent = () => {
        switch (botStatus.status) {
            case 'NO_BOT':
                return (
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <p className="text-text-primary font-bold text-lg">AUTO-CLICKER BOT</p>
                            <p className="text-text-secondary text-xs">Select your free bot to earn automatically.</p>
                        </div>
                        <button onClick={onStoreOpen} className="bg-accent-gold text-black font-bold py-2 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/20 active:scale-95">
                            SELECT
                        </button>
                    </div>
                );
            case 'IDLE':
                return (
                     <div className="flex items-center justify-between w-full">
                        <div>
                            <p className="text-text-primary font-bold text-lg">{botStatus.activeBot?.name}</p>
                            <p className="text-text-secondary text-xs">Your bot is ready for a new session.</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={onStoreOpen} className="bg-secondary-bg text-text-primary font-bold py-2 px-4 rounded-xl border border-border-color text-xs">UPGRADE</button>
                            <button onClick={startBotSession} className="bg-accent-gold text-black font-bold py-2 px-6 rounded-xl shadow-lg shadow-amber-500/10">START</button>
                        </div>
                    </div>
                );
            case 'RUNNING':
                return (
                    <div className="w-full">
                        <div className="flex justify-between items-center mb-3">
                             <p className="text-text-primary font-bold flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                {botStatus.activeBot?.name}
                             </p>
                             <button onClick={onStoreOpen} className="bg-secondary-bg text-text-primary font-bold py-1 px-3 text-xs rounded-lg border border-border-color">UPGRADE</button>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-text-secondary text-xs mb-1">Time Remaining</p>
                                <p className="text-accent-cyan font-mono font-bold"><CountdownTimer durationMs={botStatus.remainingTime} /></p>
                            </div>
                            <div className="text-right">
                                <p className="text-text-secondary text-xs mb-1">Accumulated</p>
                                <p className="text-accent-gold font-bold text-xl">{botStatus.accumulatedCoins.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'CLAIM_READY':
                 return (
                     <div className="flex items-center justify-between w-full">
                        <div>
                            <p className="text-text-primary font-bold text-lg">Session Complete!</p>
                            <p className="text-accent-gold text-sm font-bold">+{botStatus.accumulatedCoins.toLocaleString(undefined, { maximumFractionDigits: 0 })} Coins</p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={onStoreOpen} className="bg-secondary-bg text-text-primary font-bold py-2 px-4 rounded-xl border border-border-color text-xs">UPGRADE</button>
                            <button onClick={claimBotEarnings} className="bg-accent-cyan text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-cyan-500/20 animate-pulse">CLAIM</button>
                        </div>
                    </div>
                );
        }
    };
    
    return <InfoCard>{renderContent()}</InfoCard>;
};

const DailyRewardCard: React.FC = () => {
    const { user, dailyRewardCooldown, claimDailyReward } = useGame();
    if (user?.role !== 'USER') return null;

    const isReadyToClaim = dailyRewardCooldown <= 0;

    return (
        <InfoCard>
            <div className="flex items-center justify-between">
                <div className='flex items-center gap-4'>
                    <div className={`p-3 rounded-xl ${isReadyToClaim ? 'bg-accent-gold/20 text-accent-gold' : 'bg-secondary-bg text-text-secondary'}`}>
                        <GiftIcon className="w-8 h-8"/>
                    </div>
                    <div>
                        <p className="text-text-primary font-bold">DAILY REWARD</p>
                        <p className="text-text-secondary text-xs">{isReadyToClaim ? `${DAILY_REWARD_AMOUNT.toLocaleString()} COINS` : `Next in: ${formatCooldown(dailyRewardCooldown)}`}</p>
                    </div>
                </div>
                <button
                  onClick={claimDailyReward}
                  disabled={!isReadyToClaim}
                  className={`font-bold py-3 px-6 rounded-xl transition-all active:scale-95 ${isReadyToClaim ? 'bg-accent-gold text-black shadow-lg shadow-amber-500/20 hover:scale-105' : 'bg-secondary-bg text-text-secondary cursor-not-allowed'}`}
                >
                  {isReadyToClaim ? 'CLAIM' : 'WAIT'}
                </button>
            </div>
        </InfoCard>
    );
}

const AdBonusCard: React.FC = () => {
    const { user, adBonusCooldown, claimAdBonus, platformSettings, handleAdVote } = useGame();
    const [isActionCompleted, setIsActionCompleted] = useState(false);
    
    if (user?.role !== 'USER') return null;
    
    const ad = platformSettings.adContent;

    useEffect(() => {
        if (!ad || !user) return setIsActionCompleted(false);
        
        let alreadyCompleted = false;
        if (ad.type === 'image' && !ad.link) alreadyCompleted = true;
        else if (ad.type === 'poll' && user.votedAdPolls.includes(ad.id)) alreadyCompleted = true;
        setIsActionCompleted(alreadyCompleted);

    }, [ad, user]);

    if (!ad) return null;

    const isReadyToClaim = adBonusCooldown <= 0;
    const hasVotedThisPoll = ad.type === 'poll' && user.votedAdPolls.includes(ad.id);
    const canClaim = isReadyToClaim && isActionCompleted;
    
    const getPrompt = () => {
        if (!isReadyToClaim) return `Next bonus in: ${formatCooldown(adBonusCooldown)}`;
        if (!isActionCompleted) {
            if (ad.type === 'video') return "Watch video to claim";
            if (ad.type === 'image' && ad.link) return "Visit link to claim";
            if (ad.type === 'poll') return "Vote to claim";
        }
        return `${AD_BONUS_COINS} COINS`;
    }

    const onVote = () => {
        if (ad.type === 'poll') {
            handleAdVote(ad.id);
            setIsActionCompleted(true);
        }
    }

    return (
        <InfoCard className="overflow-hidden !p-0">
             <div className="relative group">
                {ad.type === 'image' && <img src={ad.mediaUrl} alt={ad.text} className="w-full h-48 object-cover" />}
                {ad.type === 'video' && <video src={ad.mediaUrl} controls playsInline onEnded={() => setIsActionCompleted(true)} className="w-full h-48 object-cover" />}
                
                {ad.type === 'poll' && (
                     <div className="p-6 bg-gradient-to-br from-secondary-bg to-main-bg border-b border-border-color">
                        <p className="text-text-primary font-bold text-lg mb-4">{ad.question}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-text-secondary text-sm font-mono bg-black/20 px-2 py-1 rounded">{ad.votes.toLocaleString()} Votes</span>
                            <button onClick={onVote} disabled={hasVotedThisPoll} className="flex items-center gap-2 bg-accent-cyan text-white font-bold px-5 py-2 rounded-lg disabled:opacity-50 transition-all active:scale-95 hover:shadow-lg hover:shadow-cyan-500/20">
                                <HandRaisedIcon className="w-5 h-5"/>
                                {hasVotedThisPoll ? 'Voted' : 'Vote'}
                            </button>
                        </div>
                    </div>
                )}
                
                {(ad.type === 'image' || ad.type === 'video') && (
                     <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 pt-10">
                        <p className="text-white font-medium line-clamp-2 text-sm">{ad.text}</p>
                        {ad.type === 'image' && ad.link && (
                            <a href={ad.link} target="_blank" rel="noopener noreferrer" onClick={() => setIsActionCompleted(true)} className="inline-flex items-center gap-1 text-xs text-accent-cyan hover:underline mt-1 font-bold uppercase tracking-wide">
                                Visit Link <ExternalLinkIcon className="w-3 h-3"/>
                            </a>
                        )}
                     </div>
                )}
            </div>

             <div className="p-4 flex items-center justify-between bg-glass">
                <div className='flex items-center gap-3'>
                    <div className="p-2 bg-accent-cyan/20 text-accent-cyan rounded-lg">
                        <AdBonusIcon className="w-6 h-6"/>
                    </div>
                    <div>
                        <p className="text-text-primary font-bold text-sm">AD BONUS</p>
                        <p className="text-text-secondary text-xs">{getPrompt()}</p>
                    </div>
                </div>
                <button onClick={claimAdBonus} disabled={!canClaim} className={`font-bold py-2 px-5 rounded-xl transition-all active:scale-95 ${canClaim ? 'bg-accent-cyan text-white shadow-lg shadow-cyan-500/20 hover:scale-105' : 'bg-secondary-bg text-text-secondary cursor-not-allowed opacity-70'}`}>
                  {isReadyToClaim ? 'CLAIM' : 'WAIT'}
                </button>
            </div>
        </InfoCard>
    );
};

const GameScreen: React.FC = () => {
  const { user, levelData, handleTap, getFormattedProgress, addFlyingCoin, isProcessingTap, setActiveScreen } = useGame();
  const [isBotStoreOpen, setIsBotStoreOpen] = useState(false);

  if (!user) {
    return <GuestDashboard onRegister={() => setActiveScreen('register')} />;
  }

  if (!levelData) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-accent-cyan animate-pulse font-bold text-lg">INITIALIZING MINING DATA...</p>
      </div>
    );
  }

  const onTapped = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isProcessingTap || user.tapsToday >= DAILY_TAP_LIMIT) return;
    handleTap();
    addFlyingCoin(e.clientX, e.clientY);
  };

  const { progress, text: progressTexts, levelText } = getFormattedProgress();

  return (
    <>
      <div className="flex flex-col items-center h-full space-y-5 max-w-md mx-auto pb-10">
        {/* Top Stats */}
        <div className="w-full grid grid-cols-3 gap-3">
            <div className="bg-glass p-3 rounded-xl border border-border-color text-center backdrop-blur-sm">
                 <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">Earn Rate</p>
                 <p className="text-text-primary font-bold">+{levelData.ctap.toLocaleString()}</p>
            </div>
            <div className="bg-glass p-3 rounded-xl border border-border-color text-center backdrop-blur-sm col-span-2 flex flex-col justify-center">
                 <div className="flex justify-between items-end mb-1">
                     <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">Daily Limit</p>
                     <p className="text-text-primary font-bold text-xs">{user.tapsToday.toLocaleString()} / {DAILY_TAP_LIMIT.toLocaleString()}</p>
                 </div>
                 <div className="w-full bg-secondary-bg h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent-gold h-full rounded-full" style={{ width: `${(user.tapsToday / DAILY_TAP_LIMIT) * 100}%` }}></div>
                 </div>
            </div>
        </div>

        {/* Main Tap Button */}
        <div 
            onClick={onTapped} 
            className={`relative w-full max-w-[300px] aspect-square flex items-center justify-center cursor-pointer select-none transition-all active:scale-[0.96] duration-100 ${isProcessingTap || user.tapsToday >= DAILY_TAP_LIMIT ? 'opacity-70 grayscale-[0.5]' : ''}`}
        >
            {/* Outer Glow Rings */}
            <div className="absolute inset-0 bg-accent-cyan/20 rounded-full blur-3xl animate-pulse-glow"></div>
            <div className="absolute inset-4 border border-accent-cyan/30 rounded-full animate-spin-slow"></div>
            
            {/* The Button */}
            <div className="relative w-[80%] h-[80%] rounded-full bg-gradient-to-b from-secondary-bg to-main-bg border-4 border-secondary-bg shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center group overflow-hidden z-10">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Inner bevel/shadow */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_10px_rgba(255,255,255,0.05),inset_0_-10px_20px_rgba(0,0,0,0.5)] pointer-events-none"></div>
                
                <SQLogoSmall className="w-32 h-32 drop-shadow-[0_0_20px_rgba(0,191,255,0.3)] transform transition-transform group-active:scale-95" />
                
                <p className={`text-xs font-bold uppercase tracking-widest mt-2 ${user.tapsToday >= DAILY_TAP_LIMIT ? 'text-red-400' : 'text-text-secondary'}`}>
                    {user.tapsToday >= DAILY_TAP_LIMIT ? 'LIMIT REACHED' : 'TAP TO MINE'}
                </p>
            </div>
        </div>
        
        {/* Progress Card */}
        <InfoCard>
          <div className="flex justify-between items-center mb-3">
              <p className="text-text-primary font-bold text-lg tracking-tight">{levelText}</p>
              <p className="text-accent-cyan font-bold font-mono">{progress.toFixed(0)}%</p>
          </div>
          <div className="w-full bg-secondary-bg rounded-full h-3 overflow-hidden shadow-inner">
            <div 
                className="bg-gradient-to-r from-accent-cyan to-accent-magenta h-full rounded-full shadow-[0_0_10px_rgba(0,191,255,0.5)] relative" 
                style={{ width: `${progress}%`, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
                <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {progressTexts.map((text, index) => (
                <span key={index} className="text-[10px] text-text-secondary bg-secondary-bg px-2 py-1 rounded border border-border-color">{text}</span>
            ))}
          </div>
        </InfoCard>
        
        <BotControlCard onStoreOpen={() => setIsBotStoreOpen(true)} />
        <DailyRewardCard />
        <AdBonusCard />
      </div>
      {isBotStoreOpen && <BotStoreModal onClose={() => setIsBotStoreOpen(false)} />}
    </>
  );
};

export default GameScreen;