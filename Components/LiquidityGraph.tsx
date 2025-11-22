import React, { useMemo } from 'react';
import { useGame } from '../hooks/useGameLogic';

const NUM_DATA_POINTS = 50;

const LiquidityGraph: React.FC = () => {
  const { sqLiquidityHistory } = useGame();

  const data = useMemo(() => {
    if (sqLiquidityHistory.length >= NUM_DATA_POINTS) {
      return sqLiquidityHistory.slice(-NUM_DATA_POINTS);
    }
    const firstValue = sqLiquidityHistory[0] || 1000000; // Start with a more realistic base
    return Array(NUM_DATA_POINTS - sqLiquidityHistory.length).fill(firstValue).concat(sqLiquidityHistory);
  }, [sqLiquidityHistory]);

  const { path, min, max, strokeColor, lastValue } = useMemo(() => {
    if (data.length === 0) {
        return { path: '', min: 0, max: 0, strokeColor: 'var(--text-secondary)', lastValue: 0 };
    }
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const path = data
      .map((d, i) => {
        const x = (i / (NUM_DATA_POINTS - 1)) * 100;
        const y = 100 - ((d - minVal) / range) * 100;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');

    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    let strokeColor = 'var(--accent-cyan)';
    if (lastValue > firstValue * 1.0005) strokeColor = '#22c55e';
    if (lastValue < firstValue * 0.9995) strokeColor = '#ef4444';


    return { path, min: minVal, max: maxVal, strokeColor, lastValue };
  }, [data]);

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 2 });
  }

  return (
    <div className="w-full h-48 relative">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradient-sq" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <polyline
          fill="url(#gradient-sq)"
          stroke={strokeColor}
          strokeWidth="0.5"
          points={path}
        />
      </svg>
      <div className="absolute top-0 left-0 text-xs p-1">
        <p className="text-text-secondary">HIGH: {formatNumber(max)}</p>
        <p className="text-text-secondary">LOW: {formatNumber(min)}</p>
      </div>
       <div className="absolute top-0 right-0 p-1 text-right">
         <p className="font-bold text-lg" style={{color: strokeColor}}>{formatNumber(lastValue)}</p>
         <p className="text-xs text-text-secondary">USER COIN SUPPLY</p>
      </div>
    </div>
  );
};

export default LiquidityGraph;
