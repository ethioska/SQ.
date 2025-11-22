import React, { useState } from 'react';
import { Transaction } from '../types';
import { useGame } from '../hooks/useGameLogic';
import { CopyIcon, ShieldCheckIcon, SQLogoSmall } from './icons';

interface TransactionCertificateModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const CertificateRow: React.FC<{ label: string; value: string; isMono?: boolean; }> = ({ label, value, isMono }) => (
    <div className="relative z-10">
        <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-0.5">{label}</p>
        <p className={`text-text-primary text-base ${isMono ? 'font-mono tracking-tight' : 'font-bold'}`}>{value}</p>
    </div>
);


const TransactionCertificateModal: React.FC<TransactionCertificateModalProps> = ({ transaction, onClose }) => {
    const { allUsers } = useGame();
    const [copied, setCopied] = useState(false);

    const sender = allUsers.find(u => u.id === transaction.senderId);
    const receiver = allUsers.find(u => u.id === transaction.receiverId);

    const handleCopy = () => {
        navigator.clipboard.writeText(transaction.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4 animate-fade-in backdrop-blur-xl"
            onClick={onClose}
        >
            <div 
                className="bg-gradient-to-b from-secondary-bg to-main-bg border border-accent-cyan/30 rounded-3xl w-full max-w-sm shadow-[0_0_60px_rgba(0,191,255,0.15)] relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Premium Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
                    <SQLogoSmall className="w-80 h-80 transform rotate-12" />
                </div>
                
                {/* Top Decorative Bar */}
                <div className="h-2 w-full bg-gradient-to-r from-accent-cyan via-white to-accent-magenta"></div>

                <div className="p-8 text-center border-b border-border-color relative z-10">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-full border border-green-500/30">
                             <ShieldCheckIcon className="w-8 h-8 text-green-400 drop-shadow-lg" />
                        </div>
                    </div>
                    <h2 className="text-xl font-black text-text-primary tracking-widest uppercase">Transaction<br/>Verified</h2>
                    <p className="text-text-secondary text-xs mt-1 font-mono">BLOCKCHAIN CONFIRMED</p>
                </div>
                
                <div className="p-8 space-y-6 relative z-10">
                    <div className="bg-main-bg/60 p-5 rounded-2xl border border-accent-gold/20 text-center shadow-inner">
                         <p className="text-xs text-accent-gold font-bold uppercase tracking-widest mb-1">Total Amount</p>
                         <p className="text-4xl font-black text-white drop-shadow-md">{transaction.amount.toLocaleString()} <span className="text-lg text-accent-gold">SQ</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-glass p-4 rounded-2xl border border-border-color">
                        <CertificateRow label="From" value={`${sender?.name || 'Unknown'}`} />
                        <CertificateRow label="Sender ID" value={transaction.senderId || 'N/A'} isMono />
                        <div className="col-span-2 h-px bg-border-color/50"></div>
                        <CertificateRow label="To" value={`${receiver?.name || 'Unknown'}`} />
                        <CertificateRow label="Receiver ID" value={transaction.receiverId || 'N/A'} isMono />
                    </div>
                    
                    <div className="flex justify-between items-center px-2">
                        <CertificateRow label="Date" value={new Date(transaction.timestamp).toLocaleDateString()} />
                        <div className="text-right">
                            <CertificateRow label="Time" value={new Date(transaction.timestamp).toLocaleTimeString()} />
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-1">Transaction Hash</p>
                        <button onClick={handleCopy} className="w-full flex items-center justify-between bg-black/40 p-3 rounded-xl border border-dashed border-border-color hover:bg-black/60 transition-colors group">
                            <p className="text-text-primary font-mono text-[10px] break-all mr-2 opacity-70 group-hover:opacity-100 transition-opacity text-left leading-relaxed">{transaction.id}</p>
                            {copied ? <span className="text-xs text-accent-cyan font-bold shrink-0">COPIED</span> : <CopyIcon className="w-4 h-4 text-text-secondary shrink-0" />}
                        </button>
                    </div>
                </div>
                
                <div className="p-6 border-t border-border-color relative z-10 bg-secondary-bg/50">
                    <button 
                        onClick={onClose} 
                        className="w-full bg-white text-black font-bold py-4 rounded-xl shadow-lg hover:bg-gray-200 transition-colors active:scale-95 tracking-wide text-sm"
                    >
                        CLOSE RECEIPT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionCertificateModal;