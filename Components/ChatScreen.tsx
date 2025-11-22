import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '../hooks/useGameLogic';
import { OFFICIAL_CHANNEL_ID } from '../constants';
import type { Agency, ChatMessage, User as UserType, CouponMessage, PollMessage } from '../types';
import NewChatModal from './NewChatModal';
import { NewChatIcon, PaperclipIcon, CloseIcon, HandRaisedIcon, CopyIcon, PhoneIcon, VideoCameraIcon } from './icons';

const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatRelativeTime = (timestamp: number) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffSeconds = Math.round((now.getTime() - messageDate.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return messageDate.toLocaleDateString();
};

const TypingIndicator: React.FC = () => (
    <div className="flex justify-start">
        <div className="max-w-xs md:max-w-md rounded-2xl px-4 py-3 bg-glass border border-border-color text-text-primary rounded-bl-none animate-fade-in">
            <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></span>
            </div>
        </div>
    </div>
);

const MessageCard: React.FC<{ message: ChatMessage; currentUserId: string }> = ({ message, currentUserId }) => {
    switch (message.type) {
        case 'COUPON': return <CouponCard message={message} />;
        case 'POLL': return <PollCard message={message} />;
        case 'TEXT':
        default: return <TextBubble message={message} currentUserId={currentUserId} />;
    }
};

const TextBubble: React.FC<{ message: ChatMessage; currentUserId: string }> = ({ message, currentUserId }) => {
    const isUser = message.senderId === currentUserId;
    const hasText = message.text && message.text.trim().length > 0;

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-xs md:max-w-md rounded-2xl animate-fade-in shadow-md ${isUser ? 'bg-gradient-to-br from-accent-cyan to-accent-cyan/80 text-white rounded-br-none' : 'bg-glass border border-border-color text-text-primary rounded-bl-none'} ${!hasText ? 'p-1' : 'px-4 py-2'}`}>
                {message.imageUrl && <img src={message.imageUrl} alt="attached" className={`rounded-xl ${hasText ? 'mb-2' : ''}`} />}
                {hasText && <p className="text-sm break-words">{message.text}</p>}
            </div>
            <p className="text-[10px] text-text-secondary/50 mt-1 px-1">{formatTimestamp(message.timestamp)}</p>
        </div>
    );
};

const Countdown: React.FC<{ expiry: number }> = ({ expiry }) => {
    const [timeLeft, setTimeLeft] = useState(expiry - Date.now());
    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(expiry - Date.now()), 1000);
        return () => clearInterval(timer);
    }, [expiry]);

    if (timeLeft <= 0) return <span className="text-red-400 font-bold">EXPIRED</span>;
    
    const d = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const h = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const m = Math.floor((timeLeft / 1000 / 60) % 60);
    const s = Math.floor((timeLeft / 1000) % 60);

    return <span>{d > 0 && `${d}d `}{h > 0 && `${h}h `}{m > 0 && `${m}m `}{s}s</span>;
};


const CouponCard: React.FC<{ message: CouponMessage }> = ({ message }) => {
    const { user, redeemChannelCoupon } = useGame();
    const [copied, setCopied] = useState(false);
    const isExpired = Date.now() > message.couponData.expiresAt;
    const isClaimed = user?.claimedCoupons.includes(message.id);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.couponData.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <div className="flex justify-center my-3">
            <div className="w-full max-w-sm bg-gradient-to-br from-secondary-bg to-main-bg border border-accent-gold/30 rounded-2xl p-5 space-y-4 animate-fade-in shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent-gold"></div>
                <p className="text-xs text-accent-gold font-bold uppercase tracking-widest text-center">Official Drop</p>
                
                <p className="text-text-primary text-center font-medium">{message.text}</p>
                
                <div className="bg-main-bg/50 p-4 rounded-xl border-dashed border-2 border-accent-gold/50 text-center relative">
                    <p className="text-xs text-accent-gold font-bold uppercase mb-1">Coupon Code</p>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <p className="text-3xl font-black text-text-primary tracking-widest">{message.couponData.code}</p>
                         <button onClick={handleCopy} className="p-1 hover:bg-white/10 rounded transition-colors">
                            {copied ? <span className="text-xs text-accent-cyan font-bold">COPIED</span> : <CopyIcon className="w-5 h-5 text-text-secondary" />}
                        </button>
                    </div>
                    <p className="text-sm text-text-secondary">Reward: <span className="text-accent-gold font-bold">{message.couponData.reward.toLocaleString()} Coins</span></p>
                </div>
                
                <div className="text-center text-xs font-mono text-text-secondary">
                    Expires in: <span className="text-accent-cyan font-bold"><Countdown expiry={message.couponData.expiresAt} /></span>
                </div>
                
                <button 
                    onClick={() => redeemChannelCoupon(message.id)} 
                    disabled={isClaimed || isExpired}
                    className="w-full btn-primary !py-3 text-lg disabled:bg-none disabled:bg-secondary-bg disabled:border disabled:border-border-color disabled:text-text-secondary disabled:cursor-not-allowed shadow-lg"
                >
                    {isClaimed ? 'ALREADY CLAIMED' : isExpired ? 'EXPIRED' : 'CLAIM REWARD'}
                </button>
            </div>
        </div>
    );
};

const PollCard: React.FC<{ message: PollMessage }> = ({ message }) => {
    const { user, handleVote } = useGame();
    const hasVoted = user?.votedPolls.includes(message.id);

    return (
        <div className="flex justify-center my-2">
            <div className="w-full max-w-sm bg-glass border border-accent-cyan/30 rounded-2xl p-5 space-y-4 animate-fade-in shadow-lg backdrop-blur-md">
                <p className="text-xs text-accent-cyan font-bold uppercase tracking-widest text-center">Community Poll</p>
                <p className="text-text-primary font-bold text-xl text-center leading-tight">{message.pollData.question}</p>
                <div className="flex justify-between items-center bg-main-bg/40 p-4 rounded-xl border border-border-color">
                    <span className="text-text-secondary font-mono font-bold">{message.pollData.votes.toLocaleString()} Votes</span>
                    <button 
                        onClick={() => handleVote(message.id)}
                        disabled={hasVoted}
                        className="flex items-center gap-2 bg-accent-cyan text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(0,191,255,0.4)]"
                    >
                        <HandRaisedIcon className="w-5 h-5"/>
                        {hasVoted ? 'Voted' : 'Vote'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CallOverlay: React.FC<{ 
    user: UserType | Agency; 
    type: 'audio' | 'video'; 
    onEnd: () => void; 
}> = ({ user, type, onEnd }) => {
    const [status, setStatus] = useState('Connecting...');
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const connectTimer = setTimeout(() => setStatus('Live'), 2500);
        
        const durationTimer = setInterval(() => {
            if (status === 'Live') setDuration(d => d + 1);
        }, 1000);

        return () => {
            clearTimeout(connectTimer);
            clearInterval(durationTimer);
        };
    }, [status]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="fixed inset-0 z-[60] bg-gradient-to-b from-main-bg to-black flex flex-col items-center justify-between py-12 animate-fade-in">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan rounded-full blur-[150px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-magenta rounded-full blur-[150px] opacity-20 animate-pulse"></div>
            </div>
            
            <div className="z-10 text-center space-y-6 w-full max-w-md px-4 mt-10">
                <div className="relative mx-auto w-40 h-40">
                     <div className={`absolute inset-0 border-2 ${status === 'Live' ? 'border-green-500 animate-ping' : 'border-accent-cyan/30'} rounded-full`}></div>
                     <div className="w-full h-full rounded-full border-4 border-accent-cyan overflow-hidden shadow-[0_0_50px_rgba(0,191,255,0.4)] bg-secondary-bg flex items-center justify-center">
                        {user.photoUrl ? (
                            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                             <div className="text-5xl font-bold text-accent-gold">{user.name.charAt(0)}</div>
                        )}
                    </div>
                    {status === 'Live' && <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-black animate-pulse"></div>}
                </div>
                
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{user.name}</h2>
                    <p className={`font-medium mt-2 text-lg tracking-widest ${status === 'Live' ? 'text-green-400' : 'text-text-secondary animate-pulse'}`}>
                        {status === 'Live' ? formatTime(duration) : status}
                    </p>
                    {type === 'video' && status === 'Live' && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-white uppercase">LIVE VIDEO</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="z-10 w-full max-w-xs px-6 mb-8">
                <button 
                    onClick={onEnd} 
                    className="w-full bg-red-600 text-white font-bold py-5 rounded-full shadow-[0_10px_30px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-transform active:scale-95 flex items-center justify-center gap-3"
                >
                    <PhoneIcon className="w-8 h-8 rotate-135" />
                    <span className="text-xl">End Call</span>
                </button>
            </div>
        </div>
    );
};


const ChatInterface: React.FC<{
  currentUser: UserType;
  otherParty: UserType | Agency;
  onBack: () => void;
}> = ({ currentUser, otherParty, onBack }) => {
    const { chatMessages, sendMessage, typingIndicator, processCallPayment } = useGame();
    const [message, setMessage] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    
    const [activeCall, setActiveCall] = useState<'audio' | 'video' | null>(null);

    const isOfficialChannel = otherParty.id === OFFICIAL_CHANNEL_ID;
    const canSendMessage = !isOfficialChannel || currentUser.role === 'ADMIN';

    const conversationMessages = useMemo(() => {
        const filterFn = isOfficialChannel
            ? (msg: ChatMessage) => msg.receiverId === OFFICIAL_CHANNEL_ID
            : (msg: ChatMessage) =>
                (msg.senderId === currentUser.id && msg.receiverId === otherParty.id) ||
                (msg.senderId === otherParty.id && msg.receiverId === currentUser.id);
        
        return chatMessages.filter(filterFn).sort((a, b) => a.timestamp - b.timestamp);
    }, [chatMessages, currentUser.id, otherParty.id, isOfficialChannel]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationMessages, typingIndicator]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
        if(e.target) e.target.value = '';
    };

    const handleSend = () => {
        if (message.trim() || imageUrl) {
            sendMessage(otherParty.id, { type: 'TEXT', text: message.trim(), imageUrl: imageUrl || undefined });
            setMessage('');
            setImageUrl(null);
        }
    };

    const handleCallStart = async (type: 'audio' | 'video') => {
        const confirmMsg = `Start ${type === 'audio' ? 'Voice Call' : 'Live Stream Call'} with ${otherParty.name}? \n\n⚠️ Service Fee: 55 Coins \n(Paid to Agency: SQ BOOM MS)`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await processCallPayment(otherParty.id);
            setActiveCall(type);
        } catch (e: any) {
            alert(e.message || "Failed to start call. Insufficient funds.");
        }
    };

    return (
        <>
            {activeCall && <CallOverlay user={otherParty} type={activeCall} onEnd={() => setActiveCall(null)} />}
            
            <div className="flex flex-col h-full w-full bg-main-bg absolute inset-0 z-40">
                <header className="flex items-center justify-between p-3 border-b border-border-color bg-glass backdrop-blur-xl sticky top-0 z-10">
                    <div className="flex items-center">
                        <button onClick={onBack} className="text-accent-cyan mr-3 p-2 rounded-full hover:bg-white/5 text-2xl font-bold">&larr;</button>
                        <div className="w-10 h-10 bg-secondary-bg rounded-full flex items-center justify-center font-bold text-accent-gold border border-border-color overflow-hidden">
                            {otherParty.photoUrl ? <img src={otherParty.photoUrl} className="w-full h-full object-cover"/> : otherParty.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                            <h3 className="font-bold text-text-primary text-sm">{otherParty.name}</h3>
                            <p className="text-[10px] text-green-400 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                            </p>
                        </div>
                    </div>
                    
                    {!isOfficialChannel && (
                        <div className="flex gap-3">
                             <button onClick={() => handleCallStart('audio')} className="p-2.5 bg-secondary-bg rounded-full text-text-primary hover:text-accent-cyan transition-colors border border-border-color active:scale-95">
                                <PhoneIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleCallStart('video')} className="p-2.5 bg-secondary-bg rounded-full text-text-primary hover:text-accent-magenta transition-colors border border-border-color active:scale-95">
                                <VideoCameraIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </header>

                <main className="flex-grow p-4 space-y-4 overflow-y-auto bg-gradient-to-b from-main-bg to-secondary-bg/30">
                    {conversationMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-2">
                             <div className="w-16 h-16 bg-secondary-bg rounded-full flex items-center justify-center text-2xl border border-border-color">👋</div>
                            <p className="text-text-secondary text-sm font-medium">
                                {isOfficialChannel ? 'Welcome to the Official Channel.' : `Say hello to ${otherParty.name}!`}
                            </p>
                        </div>
                    ) : (
                        conversationMessages.map(msg => <MessageCard key={msg.id} message={msg} currentUserId={currentUser.id} />)
                    )}
                    {typingIndicator[otherParty.id] && <TypingIndicator />}
                    <div ref={chatEndRef} />
                </main>
                {canSendMessage && (
                    <footer className="border-t border-border-color bg-glass backdrop-blur-xl pb-safe">
                        {imageUrl && (
                            <div className="px-4 pt-2 relative animate-slide-up">
                                <img src={imageUrl} alt="preview" className="h-20 w-20 object-cover rounded-lg border border-border-color" />
                                <button onClick={() => setImageUrl(null)} className="absolute top-0 left-20 -ml-2 -mt-2 bg-red-500 text-white rounded-full p-1 shadow-md"><CloseIcon className="w-3 h-3" /></button>
                            </div>
                        )}
                        <div className="p-3 flex gap-3 items-end">
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />
                            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-text-secondary hover:text-accent-cyan transition-colors"><PaperclipIcon className="w-6 h-6"/></button>
                            <div className="flex-grow bg-secondary-bg/80 border border-border-color rounded-2xl p-2 px-4 focus-within:ring-1 focus-within:ring-accent-cyan focus-within:border-accent-cyan transition-all">
                                 <textarea 
                                    rows={1}
                                    placeholder="Message..." 
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)} 
                                    className="w-full bg-transparent text-text-primary text-sm placeholder:text-text-secondary focus:outline-none resize-none max-h-24 py-1"
                                 />
                            </div>
                            <button onClick={handleSend} disabled={!message.trim() && !imageUrl} className="bg-accent-cyan text-white rounded-full p-3 hover:bg-accent-cyan/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        </>
    );
};

const OfficialChannelRow: React.FC<{ onClick: () => void, lastMessage?: ChatMessage }> = ({ onClick, lastMessage }) => (
    <button onClick={onClick} className="w-full bg-gradient-to-r from-secondary-bg to-main-bg p-4 rounded-2xl flex items-center hover:shadow-[0_0_20px_rgba(255,215,0,0.1)] transition-all text-left border border-accent-gold/30 group mb-4">
        <div className="w-12 h-12 bg-accent-gold/10 rounded-full flex items-center justify-center font-black text-accent-gold text-lg border border-accent-gold/30 group-hover:scale-110 transition-transform">SQ</div>
        <div className="ml-4 flex-grow overflow-hidden">
            <div className="flex justify-between items-baseline">
                <p className="font-bold text-text-primary truncate flex items-center gap-1">
                    SQ Official Channel 
                    <span className="w-2 h-2 bg-accent-gold rounded-full animate-pulse"></span>
                </p>
                {lastMessage && <p className="text-[10px] text-text-secondary/70 flex-shrink-0 ml-2 font-mono">{formatRelativeTime(lastMessage.timestamp)}</p>}
            </div>
            <p className="text-xs text-text-secondary truncate mt-0.5">
                {lastMessage ? (lastMessage.type === 'COUPON' ? '🎫 New Coupon Available!' : lastMessage.type === 'POLL' ? `📊 Poll: ${lastMessage.pollData.question}` : lastMessage.text) : 'Tap to view announcements.'}
            </p>
        </div>
    </button>
);


const ChatScreen: React.FC = () => {
    const { user, allUsers, chatMessages, setActiveScreen, activeChat, setActiveChat } = useGame();
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    if (!user) {
        return (
          <div className="max-w-md mx-auto space-y-5 text-center p-6">
            <h2 className="text-2xl font-bold text-accent-cyan mb-2">Chat & Support</h2>
            <div className="bg-glass border border-border-color rounded-2xl p-8 space-y-4 backdrop-blur-md">
                <p className="text-text-primary font-medium">Join the community to chat, trade, and get support.</p>
                <button onClick={() => setActiveScreen('settings')} className="btn-primary w-full">Register Now</button>
            </div>
          </div>
        );
    }
    
    const officialChannelAgent: Agency = { id: OFFICIAL_CHANNEL_ID, name: 'SQ Official Channel', email: '', role: 'ADMIN' };

    const conversations = useMemo(() => {
        if (!user) return [];
        const conversationsMap: Map<string, { otherParty: UserType | Agency; lastMessage: ChatMessage }> = new Map();

        chatMessages.forEach(msg => {
            if (msg.receiverId === OFFICIAL_CHANNEL_ID) return;
            let otherPartyId: string | null = null;
            if (msg.senderId === user.id) otherPartyId = msg.receiverId;
            else if (msg.receiverId === user.id) otherPartyId = msg.senderId;

            if (otherPartyId) {
                const otherPartyDetails = allUsers.find(u => u.id === otherPartyId);
                if (!otherPartyDetails) return;
                const existing = conversationsMap.get(otherPartyId);
                if (!existing || msg.timestamp > existing.lastMessage.timestamp) {
                    conversationsMap.set(otherPartyId, { otherParty: otherPartyDetails, lastMessage: msg });
                }
            }
        });

        return Array.from(conversationsMap.values()).sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
    }, [chatMessages, user, allUsers]);
    
    const lastOfficialMessage = useMemo(() => 
        chatMessages.filter(m => m.receiverId === OFFICIAL_CHANNEL_ID).sort((a,b) => b.timestamp - a.timestamp)[0]
    , [chatMessages]);

    const handleStartChat = (userId: string) => {
        const targetUser = allUsers.find(u => u.id === userId);
        if(targetUser) setActiveChat(targetUser);
    };

    return (
        <>
            <div className="max-w-md mx-auto space-y-4 pb-20">
                 <div className="flex justify-between items-center mb-2 px-2">
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-text-secondary">Messages</h1>
                    <button onClick={() => setIsNewChatModalOpen(true)} className="w-10 h-10 flex items-center justify-center bg-secondary-bg rounded-full border border-border-color text-accent-cyan hover:bg-accent-cyan hover:text-white transition-all shadow-lg active:scale-95">
                        <NewChatIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-2">
                    <OfficialChannelRow onClick={() => setActiveChat(officialChannelAgent)} lastMessage={lastOfficialMessage} />
                    
                    <div className="px-2 pb-2 text-xs font-bold text-text-secondary uppercase tracking-widest">Direct Messages</div>

                    {conversations.map(({ otherParty, lastMessage }) => (
                        <button key={otherParty.id} onClick={() => setActiveChat(otherParty)} className="w-full bg-glass p-3 rounded-xl flex items-center hover:bg-white/5 transition-colors text-left border border-transparent hover:border-border-color group">
                            <div className="w-12 h-12 bg-secondary-bg rounded-full flex items-center justify-center font-bold text-text-primary border border-border-color overflow-hidden group-hover:border-accent-cyan/50 transition-colors">
                                {otherParty.photoUrl ? <img src={otherParty.photoUrl} className="w-full h-full object-cover" /> : otherParty.name.charAt(0)}
                            </div>
                            <div className="ml-3 flex-grow overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <p className="font-bold text-text-primary truncate">{otherParty.name}</p>
                                    <p className="text-[10px] text-text-secondary/70 flex-shrink-0 ml-2">{formatRelativeTime(lastMessage.timestamp)}</p>
                                </div>
                                <p className="text-xs text-text-secondary truncate mt-0.5 opacity-80">
                                    {lastMessage.senderId === user.id && <span className="text-accent-cyan">You: </span>}
                                    {lastMessage.imageUrl ? '[Image Attachment]' : lastMessage.text}
                                </p>
                            </div>
                        </button>
                    ))}

                    {conversations.length === 0 && (
                        <div className="text-center py-10 opacity-60">
                            <div className="w-16 h-16 mx-auto mb-3 bg-secondary-bg rounded-full flex items-center justify-center">💬</div>
                            <p className="text-text-secondary text-sm">No private messages yet.</p>
                            <button onClick={() => setIsNewChatModalOpen(true)} className="text-accent-cyan text-xs font-bold mt-2 hover:underline">START A NEW CHAT</button>
                        </div>
                    )}
                </div>
            </div>

            {isNewChatModalOpen && <NewChatModal onClose={() => setIsNewChatModalOpen(false)} onStartChat={handleStartChat}/>}
            {activeChat && <div className="fixed inset-0 z-50 animate-fade-in"><ChatInterface currentUser={user} otherParty={activeChat} onBack={() => setActiveChat(null)} /></div>}
        </>
    );
};

export default ChatScreen;
