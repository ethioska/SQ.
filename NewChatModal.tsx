import React, { useState } from 'react';
import { useGame } from '../hooks/useGameLogic';

interface NewChatModalProps {
  onClose: () => void;
  onStartChat: (userId: string) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onStartChat }) => {
  const { user, allUsers } = useGame();
  const [recipientId, setRecipientId] = useState('');
  const [error, setError] = useState('');

  const handleInitiateChat = () => {
    setError('');
    const trimmedId = recipientId.trim();

    if (!trimmedId) {
      setError('Please enter a User ID.');
      return;
    }
    
    if (trimmedId === user?.id) {
        setError('You cannot start a chat with yourself.');
        return;
    }

    const recipientExists = allUsers.some(u => u.id === trimmedId);
    if (!recipientExists) {
      setError('User ID not found. Please check the ID and try again.');
      return;
    }

    onStartChat(trimmedId);
    onClose();
  };

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
          <h2 className="text-xl font-bold text-text-primary">Start a New Chat</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="recipient-id" className="text-sm text-text-secondary block mb-2">Recipient's User ID</label>
            <input
              id="recipient-id"
              type="text"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none"
              placeholder="Enter User or Agency ID"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
                onClick={onClose}
                className="w-full bg-border-color text-text-primary font-bold py-3 rounded-lg transition-colors hover:bg-border-color/70"
            >
                Cancel
            </button>
            <button
              onClick={handleInitiateChat}
              className="w-full btn-primary"
            >
              Start Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;