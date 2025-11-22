
import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGameLogic';
import { TransferCoinsIcon, CopyIcon, ShieldCheckIcon } from './icons';
import TransactionHistoryModal from './TransactionHistoryModal';
import LiquidityGraph from './LiquidityGraph';
import PlatformStatsChart from './PlatformStatsChart';
import VerifyTransactionModal from './VerifyTransactionModal';

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-glass border border-border-color rounded-2xl p-4 shadow-lg ${className}`}>
      {children}
    </div>
);

const DataRow: React.FC<{ label: string; value?: string | number; children?: React.ReactNode }> = ({ label, value, children }) => (
  <div className="flex justify-between items-center py-3">
    <p className="text-text-secondary text-sm">{label}</p>
    {children || <p className="text-text-primary font-semibold">{value}</p>}
  </div>
);

const ExchangeRateDisplay: React.FC = () => {
    const { platformSettings } = useGame();
    const [usdToEtb, setUsdToEtb] = useState(152.44);
    const sqToEtb = platformSettings.etbRate;

    useEffect(() => {
        const interval = setInterval(() => {
            setUsdToEtb(prevRate => {
                const change = (Math.random() - 0.5) * 0.2;
                return parseFloat((prevRate + change).toFixed(2));
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const usdToSq = usdToEtb * sqToEtb;

    return (
        <Card className="text-center">
            <h3 className="text-text-primary font-bold mb-2 text-md">Live Exchange Rate</h3>
            <div className="font-mono text-lg space-x-2 flex justify-center items-center flex-wrap">
                <span className="text-text-primary">1 USD</span>
                <span className="text-text-secondary">=</span>
                <span className="text-accent-cyan">{usdToEtb.toFixed(2)} ETB</span>
                <span className="text-text-secondary">=</span>
                <span className="text-accent-gold">{usdToSq.toLocaleString(undefined, {maximumFractionDigits: 0})} SQ</span>
            </div>
            <p className="text-xs text-text-secondary mt-2 animate-pulse">Rates update in real-time</p>
        </Card>
    );
};


const WalletScreen: React.FC = () => {
  const { user, setActiveScreen, platformSettings } = useGame();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const USD_TO_ETB_RATE = 152.44;

  const handleCopyId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto space-y-5">
        <ExchangeRateDisplay />

        <Card className="text-center">
          <p className="text-text-secondary text-sm">TOTAL COINS</p>
          <h2 className="text-4xl font-extrabold text-text-primary my-1">0</h2>
          <p className="text-text-secondary text-xs">EST. 0.00 ETB / EST. $0.00 USD</p>
        </Card>

        <Card>
          <h3 className="text-text-primary font-bold mb-2 text-center">LIQUIDITY CHART</h3>
          <LiquidityGraph />
        </Card>
        
        <Card>
            <h3 className="text-text-primary font-bold mb-2 text-center">PLATFORM GROWTH</h3>
            <PlatformStatsChart />
        </Card>

        <Card>
          <h3 className="text-text-primary font-bold mb-2">FULL PROFILE</h3>
          <div className="divide-y divide-border-color">
            <DataRow label="USER ID" value="N/A" />
            <DataRow label="NAME" value="Guest" />
            <DataRow label="PHONE NUMBER" value="N/A" />
            <DataRow label="LEVEL" value="-" />
          </div>
        </Card>
        
        <button onClick={() => setActiveScreen('settings')} className="btn-primary w-full py-4">
          REGISTER TO TRANSFER
        </button>
      </div>
    );
  }

  const totalBalance = user.coins + user.adCoins;
  const etbValue = (totalBalance / platformSettings.etbRate).toFixed(2);
  const usdValue = (parseFloat(etbValue) / USD_TO_ETB_RATE).toFixed(2);

  return (
    <>
      <div className="max-w-md mx-auto space-y-5">
        <ExchangeRateDisplay />
        <Card className="text-center">
          <p className="text-text-secondary text-sm">TOTAL COINS</p>
          <h2 className="text-5xl font-extrabold text-text-primary my-1" style={{textShadow: 'var(--glow-gold)'}}>{totalBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}</h2>
          <p className="text-text-secondary text-xs">EST. {etbValue} ETB / EST. ${usdValue} USD</p>
        </Card>

        <Card>
          <h3 className="text-text-primary font-bold mb-2 text-center">USER COIN SUPPLY</h3>
          <LiquidityGraph />
        </Card>
        
        <Card>
            <h3 className="text-text-primary font-bold mb-2 text-center">PLATFORM GROWTH</h3>
            <PlatformStatsChart />
        </Card>

        <Card>
          <h3 className="text-text-primary font-bold mb-2">FULL PROFILE</h3>
           {user.photoUrl && (
              <div className="flex justify-center pb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-accent-gold">
                      <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
              </div>
           )}
          <div className="divide-y divide-border-color">
            <DataRow label="USER ID" value={user.id} />
            <DataRow label="NAME" value={user.name} />
            {user.nickname && <DataRow label="NICKNAME" value={user.nickname} />}
            <DataRow label="PHONE NUMBER" value={user.phone} />
            {user.age && <DataRow label="AGE" value={user.age} />}
            <DataRow label="LEVEL" value={user.level} />
            <DataRow label="TAPS TODAY" value={user.tapsToday.toLocaleString()} />
            <DataRow label="INVITES" value={user.invites} />
            <DataRow label="ARCHIVE AD BALANCE" value={`${user.adCoins.toLocaleString()} COINS`} />
            <DataRow label="REFERRED BY" value={user.referralId || 'N/A'} />
             <DataRow label="YOUR REFERRAL ID">
              <div className="flex items-center gap-2">
                <p className="text-text-primary font-semibold font-mono">{user.id}</p>
                <button onClick={handleCopyId} className="text-text-secondary hover:text-text-primary p-1 rounded-md transition-colors" aria-label="Copy referral ID">
                  {copiedId ? <span className="text-xs text-accent-cyan">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                </button>
              </div>
            </DataRow>
          </div>
        </Card>
        
        <button onClick={() => setActiveScreen('transfer')} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
          <TransferCoinsIcon className="w-6 h-6"/>
          TRANSFER COINS
        </button>

        <div className="flex justify-center items-center gap-6">
          <button onClick={() => setIsHistoryModalOpen(true)} className="text-text-secondary hover:text-text-primary text-sm underline transition-colors">
              Transfer History
          </button>
           <button onClick={() => setIsVerifyModalOpen(true)} className="text-text-secondary hover:text-text-primary text-sm underline transition-colors flex items-center gap-1">
              <ShieldCheckIcon className="w-4 h-4" />
              Verify Transaction
          </button>
        </div>
      </div>
      {isHistoryModalOpen && user && (
        <TransactionHistoryModal
          transactions={user.transactions}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
       {isVerifyModalOpen && (
        <VerifyTransactionModal
          onClose={() => setIsVerifyModalOpen(false)}
        />
      )}
    </>
  );
};

export default WalletScreen;
