import React, { useState, useMemo } from 'react';
import { useGame } from '../hooks/useGameLogic';
import TransactionCertificateModal from './TransactionCertificateModal';
import { Transaction } from '../types';

const TransferScreen: React.FC = () => {
  const { user, handleTransfer, setActiveScreen, platformSettings } = useGame();
  const [destinationId, setDestinationId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  
  if (!user) {
    return (
      <div className="max-w-md mx-auto space-y-5 text-center">
        <h2 className="text-2xl font-bold text-accent-cyan">TRANSFER COINS</h2>
        <div className="bg-glass border border-border-color rounded-2xl p-8 space-y-4">
            <p className="text-text-primary">You need an account to transfer coins.</p>
            <button
                onClick={() => setActiveScreen('settings')}
                className="btn-primary"
            >
              Go to Register
            </button>
        </div>
      </div>
    );
  }

  const totalBalance = useMemo(() => user.coins + user.adCoins, [user.coins, user.adCoins]);
  const amountInEtb = useMemo(() => {
    const numAmount = parseFloat(amount);
    return isNaN(numAmount) ? '0.00' : (numAmount / platformSettings.etbRate).toFixed(2);
  }, [amount, platformSettings.etbRate]);


  const handleConfirmTransfer = async () => {
    setError('');
    const transferAmount = parseInt(amount, 10);
    
    if (!destinationId.trim()) {
        setError('Please enter a valid Destination ID.');
        return;
    }
    if (isNaN(transferAmount) || transferAmount <= 0) {
        setError('Please enter a valid coin amount.');
        return;
    }
    if (transferAmount > totalBalance) {
        setError('Insufficient balance.');
        return;
    }
    
    setIsLoading(true);
    try {
      const transaction = await handleTransfer(destinationId, transferAmount);
      setCompletedTransaction(transaction);
      setDestinationId('');
      setAmount('');
    } catch (e: any) {
      setError(e.message || 'Transfer failed. Please check the ID and balance.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="max-w-md mx-auto space-y-5">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-accent-cyan" style={{ textShadow: 'var(--glow-cyan)' }}>TRANSFER COINS</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-glass border border-border-color rounded-xl p-4 focus-within:ring-2 focus-within:ring-accent-cyan transition-all">
              <label className="text-text-secondary text-xs" htmlFor="destinationId">DESTINATION ID (User or Agency)</label>
              <input
                id="destinationId"
                type="text"
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full bg-transparent text-text-primary text-xl font-semibold pt-1 pb-2 focus:outline-none"
                placeholder="Enter ID"
              />
          </div>

          <div className="bg-glass border border-border-color rounded-xl p-4 focus-within:ring-2 focus-within:ring-accent-cyan transition-all">
              <label className="text-text-secondary text-xs" htmlFor="coinAmount">COIN AMOUNT</label>
              <div className="flex items-baseline">
                  <input
                    id="coinAmount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent text-text-primary text-xl font-semibold pt-1 pb-2 focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-text-secondary text-sm ml-2">≈ {amountInEtb} ETB</span>
              </div>
          </div>
        </div>
        
        <div className="h-5 text-center">
          {error && <p className="text-red-400 text-sm animate-fade-in">{error}</p>}
        </div>
        
        <div className="bg-glass border border-border-color rounded-xl p-3 text-center">
          <p className="text-text-secondary text-xs">AVAILABLE BALANCE</p>
          <p className="text-text-primary font-bold text-lg">{totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} COINS</p>
        </div>
        
        <button
          onClick={handleConfirmTransfer}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-amber-500 to-accent-gold text-black font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/20 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'CONFIRM TRANSFER'}
        </button>

        <p className="text-xs text-text-secondary text-center px-4">
          Manual cash-out process applys after transfer.
        </p>
      </div>
      {completedTransaction && (
        <TransactionCertificateModal 
            transaction={completedTransaction}
            onClose={() => setCompletedTransaction(null)}
        />
      )}
    </>
  );
};

export default TransferScreen;