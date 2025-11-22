import React from 'react';
import type { Agency } from '../types';
import { SQLogoSmall, VerifiedBadgeIcon } from './icons';

interface AgencyProfileModalProps {
  agency: Agency;
  onClose: () => void;
  onStartChat: () => void;
}

const AgencyProfileModal: React.FC<AgencyProfileModalProps> = ({ agency, onClose, onStartChat }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4 animate-fade-in backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-secondary-bg to-main-bg border border-accent-cyan/30 rounded-3xl w-full max-w-sm relative overflow-hidden shadow-[0_0_60px_rgba(0,191,255,0.15)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Branded Watermark */}
        <div className="absolute -right-10 -bottom-10 opacity-[0.06] pointer-events-none">
            <SQLogoSmall className="w-72 h-72 transform -rotate-12" />
        </div>
        
        {/* Header Banner */}
        <div className="h-24 bg-gradient-to-r from-accent-cyan to-accent-magenta opacity-20 absolute top-0 w-full"></div>

        <div className="p-6 relative z-10 pt-10">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
                <div className="w-28 h-28 bg-main-bg rounded-full flex items-center justify-center font-bold text-5xl text-accent-gold border-4 border-accent-cyan mb-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                    {agency.photoUrl ? (
                        <img src={agency.photoUrl} alt={agency.name} className="w-full h-full object-cover" />
                    ) : (
                        agency.name.charAt(0)
                    )}
                </div>
                <div className="absolute bottom-4 -right-2 bg-white rounded-full p-0.5 shadow-md">
                     <VerifiedBadgeIcon className="w-8 h-8 drop-shadow-sm text-accent-cyan" />
                </div>
            </div>

            <h2 className="text-2xl font-black text-text-primary tracking-tight leading-tight mb-1">{agency.name}</h2>
            <div className="inline-block px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30">
                <p className="text-[10px] font-bold text-accent-cyan tracking-widest uppercase">OFFICIALLY VERIFIED</p>
            </div>
            
            <div className="w-full text-left bg-black/30 border border-border-color p-5 rounded-2xl mt-6 space-y-4 backdrop-blur-sm shadow-inner">
                <div>
                    <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold mb-1">Agency ID</p>
                    <div className="flex justify-between items-center">
                        <p className="font-mono text-white text-lg font-bold select-all tracking-tight">{agency.id}</p>
                        <span className="text-[10px] bg-border-color px-2 py-0.5 rounded text-text-secondary">Official</span>
                    </div>
                </div>
                <div className="h-px bg-border-color/50"></div>
                <div>
                    <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold mb-1">Contact Email</p>
                    <p className="text-text-primary text-sm font-medium">{agency.email}</p>
                </div>
                {agency.phone && (
                  <div>
                    <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold mb-1">Verified Phone</p>
                    <p className="text-text-primary text-sm font-medium">{agency.phone}</p>
                  </div>
                )}
                <div className="pt-3 border-t border-border-color/50">
                    <p className="text-[10px] text-green-400 flex items-center gap-1.5 font-bold uppercase">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Operational & Online
                    </p>
                </div>
            </div>

            <div className="flex gap-3 w-full mt-8">
                 <button 
                    onClick={onClose} 
                    className="flex-1 bg-transparent border border-border-color text-text-primary font-bold py-3.5 rounded-xl transition-colors hover:bg-white/5 text-sm"
                 >
                    Close
                </button>
                <button 
                    onClick={onStartChat} 
                    className="flex-[1.5] btn-primary shadow-[0_5px_20px_rgba(0,191,255,0.3)] text-sm"
                >
                    Start Chat
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyProfileModal;