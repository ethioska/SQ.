import React, { useState } from 'react';
import { Transaction } from '../types';
import { useGame } from '../hooks/useGameLogic';
import { ShieldCheckIcon } from './icons';

const VerifiedRow: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="py-2">
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-text-primary font-semibold">{value || 'N/A'}</p>
    </div>
);


const VerifyTransactionModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { verifyTransaction, allUsers } = useGame();
    const [txId, setTxId] = useState('');
    const [verifiedTx, setVerifiedTx] = useState<Transaction | null | undefined>(undefined);

    const handleVerify = () => {
        const result = verifyTransaction(txId);
        setVerifiedTx(result);
    };

    const sender = verifiedTx ? allUsers.find(u => u.id === verifiedTx.senderId) : null;
    const receiver = verifiedTx ? allUsers.find(u => u.id === verifiedTx.receiverId) : null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-glass border border-border-color rounded-2xl w-full max-w-md shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary">Verify Transaction</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl">&times;</button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="tx-id" className="text-sm text-text-secondary block mb-2">Enter Transaction Code</label>
                        <div className="flex gap-2">
                            <input
                              id="tx-id"
                              type="text"
                              value={txId}
                              onChange={(e) => {
                                setTxId(e.target.value);
                                setVerifiedTx(undefined);
                              }}
                              className="flex-grow w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none font-mono"
                              placeholder="txn_..."
                            />
                            <button onClick={handleVerify} className="bg-accent-cyan text-white font-bold px-6 rounded-lg transition-colors hover:bg-accent-cyan/80">Verify</button>
                        </div>
                    </div>

                    {verifiedTx === null && (
                        <div className="text-center py-4 bg-red-900/50 border border-red-500/50 rounded-lg">
                            <p className="font-semibold text-red-400">Transaction Not Found</p>
                            <p className="text-xs text-text-secondary">The code is invalid or does not exist.</p>
                        </div>
                    )}

                    {verifiedTx && (
                         <div className="animate-fade-in text-center py-4 bg-green-900/50 border border-green-500/50 rounded-lg">
                            <div className="flex justify-center items-center gap-2">
                                <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                                <h3 className="text-lg font-bold text-green-400">Transaction Verified</h3>
                            </div>
                            <div className="text-left p-4 mt-2 divide-y divide-green-500/20">
                                <VerifiedRow label="AMOUNT" value={`${verifiedTx.amount.toLocaleString()} SQ`} />
                                <VerifiedRow label="SENDER" value={`${sender?.name} (ID: ${sender?.id})`} />
                                <VerifiedRow label="RECEIVER" value={`${receiver?.name} (ID: ${receiver?.id})`} />
                                <VerifiedRow label="DATE" value={new Date(verifiedTx.timestamp).toLocaleString()} />
                            </div>
                        </div>
                    )}
                </div>
                 <div className="p-4 border-t border-border-color">
                    <button 
                        onClick={onClose} 
                        className="w-full bg-border-color text-text-primary font-bold py-3 rounded-lg transition-colors hover:bg-border-color/70"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyTransactionModal;
