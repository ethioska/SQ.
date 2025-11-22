import React, { useMemo } from 'react';
import { useGame } from '../hooks/useGameLogic';
import { PlatformHistoryEntry } from '../types';

const NUM_DATA_POINTS = 50;

const LineChart: React.FC<{
    data: number[];
    color: string;
}> = ({ data, color }) => {
    const path = useMemo(() => {
        if (data.length < 2) return "";
        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);
        const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

        return data
            .map((d, i) => {
                const x = (i / (NUM_DATA_POINTS - 1)) * 100;
                const y = 100 - ((d - minVal) / range) * 90 - 5; // Use 90% of height and add padding
                return `${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(' ');
    }, [data]);

    return (
         <polyline
            fill="none"
            stroke={color}
            strokeWidth="0.7"
            points={path}
        />
    );
};


const PlatformStatsChart: React.FC = () => {
    const { platformHistory } = useGame();

    const chartData = useMemo(() => {
        const paddedHistory = platformHistory.length >= NUM_DATA_POINTS
            ? platformHistory.slice(-NUM_DATA_POINTS)
            : Array(NUM_DATA_POINTS - platformHistory.length).fill(platformHistory[0] || { totalUsers: 0, bannedUsers: 0 }).concat(platformHistory);

        return {
            totalUsers: paddedHistory.map((entry: PlatformHistoryEntry) => entry.totalUsers),
            bannedUsers: paddedHistory.map((entry: PlatformHistoryEntry) => entry.bannedUsers),
        };
    }, [platformHistory]);
    
    const lastTotal = chartData.totalUsers[chartData.totalUsers.length - 1];
    const lastBanned = chartData.bannedUsers[chartData.bannedUsers.length - 1];

    return (
        <div className="w-full h-48 relative">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <LineChart data={chartData.totalUsers} color="var(--accent-cyan)" />
                <LineChart data={chartData.bannedUsers} color="var(--accent-magenta)" />
            </svg>
            <div className="absolute bottom-0 left-0 p-1 text-xs flex gap-4">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent-cyan"></div>
                    <span className="text-text-secondary">Joined</span>
                </div>
                 <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent-magenta"></div>
                    <span className="text-text-secondary">Left</span>
                </div>
            </div>
            <div className="absolute top-0 right-0 p-1 text-right text-xs">
                 <p style={{color: 'var(--accent-cyan)'}}>
                    <span className="font-bold text-lg">{lastTotal?.toLocaleString()}</span> Total Users
                </p>
                <p style={{color: 'var(--accent-magenta)'}}>
                    <span className="font-bold text-lg">{lastBanned?.toLocaleString()}</span> Banned Users
                </p>
            </div>
        </div>
    );
};

export default PlatformStatsChart;