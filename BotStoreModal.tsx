import React from 'react';
import { useGame } from '../hooks/useGameLogic';
import { BOT_TIERS } from '../constants';

interface BotStoreModalProps {
  onClose: () => void;
}

const BotStoreModal: React.FC<BotStoreModalProps> = ({ onClose }) => {
    const { user, selectBot } = useGame();
    if (!user) return null;
    
    const currentBot = user.activeBotTier ? BOT_TIERS.find(b => b.tier === user.activeBotTier) : null;

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
                    <h2 className="text-xl font-bold text-text-primary">Free Auto-Clicker Bots</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl">&times;</button>
                </div>
                
                <div className="p-4 text-center border-b border-border-color">
                    <p className="text-text-secondary text-xs">YOUR LEVEL</p>
                    <p className="text-text-primary font-bold text-lg">LEVEL {user.level}</p>
                </div>

                <div className="overflow-y-auto p-4 space-y-3">
                    <p className="text-sm text-text-secondary text-center pb-2">Select or upgrade your free bot to automate taps. Higher levels unlock better bots.</p>
                    {BOT_TIERS.map(bot => {
                        const isCurrentBot = user.activeBotTier === bot.tier;
                        const isLowerTier = user.activeBotTier && user.activeBotTier > bot.tier;
                        const isUpgrade = !isCurrentBot && !isLowerTier && !!currentBot;
                        
                        const meetsLevel = user.level >= bot.levelRequirement;
                        const canSelect = meetsLevel && !isCurrentBot && !isLowerTier;
                        
                        let buttonText = isUpgrade ? 'Upgrade' : 'Select';
                        if (isCurrentBot) buttonText = 'Active';
                        else if (isLowerTier) buttonText = 'Unlocked';
                        else if (!meetsLevel) buttonText = `LVL ${bot.levelRequirement} Req.`;

                        return (
                            <div key={bot.tier} className={`bg-main-bg/50 p-4 rounded-lg border flex justify-between items-center ${isCurrentBot ? 'border-accent-cyan' : 'border-border-color'}`}>
                                <div>
                                    <p className="font-bold text-text-primary">{bot.name} (Tier {bot.tier})</p>
                                    <p className="text-xs text-accent-cyan">+{bot.tapsPerHour.toLocaleString()} Taps/Hour</p>
                                    {bot.levelRequirement > 1 && <p className={`text-xs ${meetsLevel ? 'text-green-400' : 'text-red-400'}`}>Requires Level {bot.levelRequirement}</p>}
                                </div>
                                <button 
                                    onClick={async () => {
                                        const confirmationText = `Are you sure you want to ${isUpgrade ? 'upgrade to' : 'select'} the ${bot.name}?`;
                                        if (confirm(confirmationText)) {
                                            if (!user.id) {
                                                alert("Error: User session not found. Please try again.");
                                                return;
                                            }
                                            try {
                                                await selectBot(user.id, bot.tier);
                                                alert(`Successfully selected the ${bot.name}! Start it from the game screen.`);
                                                onClose();
                                            } catch (error: any) {
                                                alert(`Selection failed: ${error.message}`);
                                            }
                                        }
                                    }}
                                    disabled={!canSelect}
                                    className="bg-accent-gold text-black font-bold py-2 px-5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all min-w-[120px] text-center hover:enabled:shadow-lg hover:enabled:shadow-amber-500/20"
                                >
                                    {buttonText}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BotStoreModal;