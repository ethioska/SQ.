
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
        <p className="text-xs text-text-secondary uppercase tracking-wider">{label}</p>
        <p className={`text-text-primary text-lg ${isMono ? 'font-mono' : 'font-semibold'}`}>{value}</p>
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
            className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4 animate-fade-in backdrop-blur-md"
            onClick={onClose}
        >
            <div 
                className="bg-glass border border-accent-cyan/30 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(0,191,255,0.1)] relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none z-0">
                    <SQLogoSmall className="w-64 h-64" />
                </div>

                <div className="p-6 text-center border-b border-border-color relative z-10">
                    <div className="flex justify-center items-center gap-2">
                         <ShieldCheckIcon className="w-10 h-10 text-green-400 drop-shadow-lg" />
                        <h2 className="text-2xl font-bold text-green-400 tracking-wide">TRANSFER VERIFIED</h2>
                    </div>
                   <p className="text-text-secondary text-sm mt-2">Official SQ BOOM Transaction Receipt</p>
                </div>
                
                <div className="p-6 space-y-6 relative z-10">
                    <div className="bg-main-bg/40 p-4 rounded-xl border border-border-color text-center">
                         <p className="text-xs text-text-secondary uppercase mb-1">Transferred Amount</p>
                         <p className="text-4xl font-black text-accent-gold drop-shadow-md">{transaction.amount.toLocaleString()} SQ</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <CertificateRow label="Sender" value={`${sender?.name || 'Unknown'}`} />
                        <CertificateRow label="Sender ID" value={transaction.senderId || 'N/A'} isMono />
                        <CertificateRow label="Receiver" value={`${receiver?.name || 'Unknown'}`} />
                        <CertificateRow label="Receiver ID" value={transaction.receiverId || 'N/A'} isMono />
                    </div>
                    
                    <CertificateRow label="Date & Time" value={new Date(transaction.timestamp).toLocaleString()} />
                    
                    <div>
                        <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Transaction Hash</p>
                        <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-dashed border-border-color">
                            <p className="text-text-primary font-mono text-xs select-all break-all mr-2">{transaction.id}</p>
                            <button onClick={handleCopy} className="text-text-secondary hover:text-text-primary transition-colors shrink-0">
                                {copied ? <span className="text-xs text-accent-cyan font-bold">COPIED</span> : <CopyIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-border-color relative z-10 bg-glass">
                    <button 
                        onClick={onClose} 
                        className="w-full btn-primary shadow-lg"
                    >
                        CLOSE CERTIFICATE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionCertificateModal;
