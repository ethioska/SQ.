
import React, { useMemo } from 'react';
import { useGame } from '../hooks/useGameLogic';
import { User } from '../types';

const StarIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={color}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const LeaderboardRow: React.FC<{ user: User; rank: number; isCurrentUser: boolean }> = ({ user, rank, isCurrentUser }) => {
  const rankColor = useMemo(() => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-text-secondary';
  }, [rank]);

  const totalCoins = user.coins + user.adCoins;

  return (
    <div className={`flex items-center p-3 rounded-lg transition-colors ${isCurrentUser ? 'bg-accent-cyan/20 border border-accent-cyan' : 'bg-main-bg/50'}`}>
      <div className="w-10 flex-shrink-0 text-center">
        {rank <= 3 ? (
          <StarIcon color={rank === 1 ? '#FBBF24' : rank === 2 ? '#9CA3AF' : '#D97706'} />
        ) : (
          <span className={`font-bold text-lg ${rankColor}`}>{rank}</span>
        )}
      </div>
      <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-secondary-bg border border-border-color ml-2">
         {user.photoUrl ? (
             <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
         ) : (
             <span className="font-bold text-accent-gold">{user.name.charAt(0).toUpperCase()}</span>
         )}
      </div>
      <div className="ml-4 flex-grow overflow-hidden">
        <p className="font-bold text-text-primary truncate">{user.name}</p>
        <p className="text-xs text-text-secondary">ID: {user.id}</p>
      </div>
      <div className="ml-4 text-right">
        <p className="font-bold text-accent-gold text-lg">{totalCoins.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        <p className="text-xs text-text-secondary">COINS</p>
      </div>
    </div>
  );
};

const MyRankCard: React.FC<{ rankData: { user: User; rank: number } | null }> = ({ rankData }) => {
  if (!rankData) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-10">
        <div className="bg-glass border border-accent-cyan rounded-2xl shadow-lg p-1" style={{boxShadow: 'var(--glow-cyan)'}}>
             <LeaderboardRow user={rankData.user} rank={rankData.rank} isCurrentUser={true} />
        </div>
    </div>
  )
}

const LeaderboardScreen: React.FC = () => {
  const { user, allUsers } = useGame();

  const leaderboard = useMemo(() => {
    return allUsers
      .filter(u => u.role === 'USER')
      .sort((a, b) => (b.coins + b.adCoins) - (a.coins + a.adCoins))
      .slice(0, 100); // Limit to top 100
  }, [allUsers]);

  const myRankData = useMemo(() => {
    if (!user) return null;
    const rank = leaderboard.findIndex(u => u.id === user.id);
    if (rank === -1) return null;
    return { user, rank: rank + 1 };
  }, [leaderboard, user]);

  return (
    <div className="max-w-md mx-auto space-y-5 pb-20">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-accent-cyan" style={{textShadow: 'var(--glow-cyan)'}}>Global Ranks</h1>
        <p className="text-text-secondary text-sm">Top 100 players by total coins</p>
      </div>

      <div className="space-y-2">
        {leaderboard.map((player, index) => (
          <LeaderboardRow 
            key={player.id} 
            user={player} 
            rank={index + 1} 
            isCurrentUser={player.id === user?.id}
          />
        ))}
      </div>
      {user && <MyRankCard rankData={myRankData} />}
    </div>
  );
};

export default LeaderboardScreen;
