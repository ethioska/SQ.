import React from 'react';
import { Transaction } from '../types';

interface TransactionHistoryModalProps {
  transactions: Transaction[];
  onClose: () => void;
}

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const isCredit = transaction.type === 'RECEIVED' || transaction.type === 'COUPON' || transaction.type === 'AD_BONUS';
  const amountColor = isCredit ? 'text-green-400' : 'text-red-400';
  const sign = isCredit ? '+' : '-';

  return (
    <div className="flex justify-between items-center py-3 border-b border-border-color/50">
      <div>
        <p className="font-semibold text-text-primary capitalize">{transaction.description}</p>
        <p className="text-xs text-text-secondary">{new Date(transaction.timestamp).toLocaleString()}</p>
      </div>
      <p className={`font-bold text-lg ${amountColor}`}>{sign}{transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
    </div>
  );
};


const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ transactions, onClose }) => {
  // Sort transactions by date, newest first
  const sortedTransactions = [...(transactions || [])].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-glass border border-border-color rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">Transaction History</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl">&times;</button>
        </div>
        
        <div className="overflow-y-auto p-4">
          {sortedTransactions.length > 0 ? (
            <div className="space-y-2">
              {sortedTransactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-10">No transactions yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;
