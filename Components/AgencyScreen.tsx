
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGame } from '../hooks/useGameLogic';
import { User, PlatformSettings, ChatMessage, ChatMessageContent, AdContent } from '../types';
import { GoogleGenAI } from '@google/genai';
import { OFFICIAL_CHANNEL_ID } from '../constants';

const PanelCard: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => (
    <div className="bg-glass border border-border-color rounded-2xl p-4 space-y-3 shadow-lg">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {children}
    </div>
);

const Publisher: React.FC = () => {
    const { sendMessage } = useGame();
    const [activeTab, setActiveTab] = useState('text');
    const [text, setText] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponReward, setCouponReward] = useState('100');
    const [couponExpiry, setCouponExpiry] = useState('24'); // in hours
    const [pollQuestion, setPollQuestion] = useState('');

    const handlePublish = () => {
        // Fix: Changed message type to be more specific and ensure it's always initialized.
        let message: ChatMessageContent;

        switch(activeTab) {
            case 'text':
                if (!text.trim() && !imageUrl.trim()) return alert("Please enter text or an image URL.");
                message = { type: 'TEXT', text, imageUrl: imageUrl || undefined };
                break;
            case 'coupon':
                if (!couponCode.trim() || !couponReward.trim() || !couponExpiry.trim()) return alert("Please fill all coupon fields.");
                message = {
                    type: 'COUPON',
                    text: `A new coupon is available! Claim it before it expires.`,
                    couponData: {
                        code: couponCode.toUpperCase(),
                        reward: parseInt(couponReward, 10),
                        expiresAt: Date.now() + parseInt(couponExpiry, 10) * 3600 * 1000,
                    }
                };
                break;
            case 'poll':
                if (!pollQuestion.trim()) return alert("Please enter a poll question.");
                message = {
                    type: 'POLL',
                    pollData: {
                        question: pollQuestion,
                        votes: 0
                    }
                };
                break;
            default:
                return;
        }

        sendMessage(OFFICIAL_CHANNEL_ID, message);
        // Reset fields
        setText(''); setImageUrl(''); setCouponCode(''); setPollQuestion('');
        alert("Content published to the Official Channel!");
    };
    
    return (
        <PanelCard title="Official Channel Publisher">
            <div className="flex border-b border-border-color">
                <button onClick={() => setActiveTab('text')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'text' ? 'text-accent-gold border-b-2 border-accent-gold' : 'text-text-secondary'}`}>Announcement</button>
                <button onClick={() => setActiveTab('coupon')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'coupon' ? 'text-accent-gold border-b-2 border-accent-gold' : 'text-text-secondary'}`}>Coupon</button>
                <button onClick={() => setActiveTab('poll')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'poll' ? 'text-accent-gold border-b-2 border-accent-gold' : 'text-text-secondary'}`}>Poll</button>
            </div>
            <div className="p-2 space-y-3">
                {activeTab === 'text' && (
                    <>
                        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Announcement text..." className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary" rows={3}/>
                        <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL (optional)" className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary"/>
                    </>
                )}
                {activeTab === 'coupon' && (
                    <>
                        <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Coupon Code (e.g., SQ2024)" className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary"/>
                        <input type="number" value={couponReward} onChange={e => setCouponReward(e.target.value)} placeholder="Reward Amount" className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary"/>
                        <input type="number" value={couponExpiry} onChange={e => setCouponExpiry(e.target.value)} placeholder="Expires in (hours)" className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary"/>
                    </>
                )}
                {activeTab === 'poll' && (
                     <input type="text" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Poll Question" className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary"/>
                )}
                 <button onClick={handlePublish} className="w-full btn-primary !py-2">Publish to Channel</button>
            </div>
        </PanelCard>
    );
}

const AdContentPublisher: React.FC = () => {
    const { platformSettings, updatePlatformSettings } = useGame();
    const [adType, setAdType] = useState<'image' | 'video' | 'poll'>(platformSettings.adContent?.type || 'image');
    
    const [text, setText] = useState(platformSettings.adContent?.text || '');
    const [link, setLink] = useState(platformSettings.adContent?.type === 'image' ? platformSettings.adContent.link || '' : '');
    const [question, setQuestion] = useState(platformSettings.adContent?.type === 'poll' ? platformSettings.adContent.question : '');
    
    const [mediaPreview, setMediaPreview] = useState<string | null>(
        platformSettings.adContent?.type === 'image' || platformSettings.adContent?.type === 'video' ? platformSettings.adContent.mediaUrl : null
    );
    const [mediaUrl, setMediaUrl] = useState<string>('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setText(''); setLink(''); setQuestion(''); setMediaPreview(null); setMediaUrl('');
    }, [adType]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Please select a file smaller than 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setMediaPreview(result);
            setMediaUrl(result);
        };
        reader.readAsDataURL(file);
    };

    const handlePublishAd = () => {
        let newAdContent: AdContent | null = null;
        const adId = `ad_${Date.now()}`;

        switch(adType) {
            case 'image':
            case 'video':
                if (!mediaUrl.trim() || !text.trim()) return alert('Media file and Ad Text are required.');
                newAdContent = {
                    id: adId, type: adType, mediaUrl, text,
                    ...(adType === 'image' && { link: link || undefined })
                };
                break;
            case 'poll':
                if (!question.trim()) return alert('Poll question is required.');
                newAdContent = {
                    id: adId, type: 'poll', question, text: text || "Participate in our poll and earn a bonus!", votes: 0,
                };
                break;
        }
        
        updatePlatformSettings({ platform: { ...platformSettings, adContent: newAdContent } });
        alert('Ad content has been updated!');
    };

    return (
        <PanelCard title="Ad Content Publisher">
            <div className="flex border-b border-border-color">
                <button onClick={() => setAdType('image')} className={`px-4 py-2 text-sm font-semibold ${adType === 'image' ? 'text-accent-gold border-b-2 border-accent-gold' : 'text-text-secondary'}`}>Image Ad</button>
                <button onClick={() => setAdType('video')} className={`px-4 py-2 text-sm font-semibold ${adType === 'video' ? 'text-accent-gold border-b-2 border-accent-gold' : 'text-text-secondary'}`}>Video Ad</button>
                <button onClick={() => setAdType('poll')} className={`px-4 py-2 text-sm font-semibold ${adType === 'poll' ? 'text-accent-gold border-b-2 border-accent-gold' : 'text-text-secondary'}`}>Poll Ad</button>
            </div>
            
            <div className="p-2 space-y-3">
            {(adType === 'image' || adType === 'video') && (
                <>
                    <input type="file" ref={fileInputRef} hidden accept={adType === 'image' ? "image/*" : "video/mp4,video/quicktime,video/webm"} onChange={handleFileChange} />
                    {mediaPreview ? (
                        <div className="rounded-lg overflow-hidden border border-border-color">
                            {adType === 'image' ? <img src={mediaPreview} alt="Ad preview" /> : <video src={mediaPreview} controls muted />}
                        </div>
                    ) : (
                        <div className="h-32 bg-main-bg/50 border-2 border-dashed border-border-color rounded-lg flex items-center justify-center">
                            <p className="text-text-secondary text-sm">Media Preview</p>
                        </div>
                    )}
                    <button onClick={() => fileInputRef.current?.click()} className="w-full bg-border-color text-text-primary py-2 rounded-lg hover:bg-border-color/70 transition-colors">
                        {mediaPreview ? 'Change Media' : `Upload ${adType === 'image' ? 'Image' : 'Video'}`}
                    </button>
                     <p className="text-xs text-text-secondary text-center">Max file size: 5MB</p>
                </>
            )}

            {adType === 'poll' && (
                <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Poll Question" className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary"/>
            )}
            
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder={adType === 'poll' ? 'Optional text...' : "Ad text (description)"} className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary" rows={2}/>
            
            {adType === 'image' && (
                <input type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="Click-through link (optional)" className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary"/>
            )}

            <button onClick={handlePublishAd} className="w-full btn-primary !py-2">Publish Ad</button>
            </div>
        </PanelCard>
    );
}


const AgencyScreen: React.FC = () => {
  const { user, allUsers, setActiveScreen, platformSettings, updatePlatformSettings, toggleUserBan } = useGame();
  
  const [currentPlatformSettings, setCurrentPlatformSettings] = useState<PlatformSettings>(platformSettings);
  
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  
  const [simulatedUsers, setSimulatedUsers] = useState<User[]>(allUsers.filter(u => u.role === 'USER'));

  useEffect(() => {
    setCurrentPlatformSettings(platformSettings);
  }, [platformSettings]);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPPORT')) {
    return (
        <div className="max-w-md mx-auto text-center p-4">
            <h1 className="text-xl font-bold text-red-500">Access Denied</h1>
            <p className="text-text-secondary mt-2">You do not have permission to view this page.</p>
            <button onClick={() => setActiveScreen('game')} className="mt-4 text-accent-cyan hover:underline">Go to Game</button>
        </div>
    );
  }

  const handleGenerateContent = async () => {
    if (!prompt.trim()) { setAiError('Please enter a prompt.'); return; }
    setIsGenerating(true); setAiError(''); setGeneratedContent('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      setGeneratedContent(response.text?.trim() || '');
    } catch (error) {
      console.error('Gemini AI error:', error);
      setAiError('Failed to generate content. Please check the API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSettingsUpdate = () => {
    updatePlatformSettings({ platform: { ...platformSettings, etbRate: currentPlatformSettings.etbRate} });
    alert('Settings have been updated!');
  };

  const panelTitle = user.role === 'ADMIN' ? 'Admin Panel' : 'Support Panel';
  const displayUsers = allUsers.filter(u => u.role === 'USER');

  return (
    <div className="max-w-md mx-auto space-y-5 pb-10">
      <div className="flex items-center justify-between">
        <button onClick={() => setActiveScreen('settings')} className="text-accent-cyan hover:text-text-primary text-sm">&larr; Back to Settings</button>
        <h1 className="text-xl font-bold text-center text-text-primary">{panelTitle}</h1>
        <div className="w-32 text-right"></div>
      </div>
      
      {user.role === 'ADMIN' && (
        <>
          <PanelCard title="Platform Controls">
            <div className="space-y-2">
                <label className="text-sm text-text-secondary" htmlFor="coinPrice">Daily Coin Price (SQ per ETB)</label>
                <input id="coinPrice" type="number" value={currentPlatformSettings.etbRate} onChange={e => setCurrentPlatformSettings(p => ({ ...p, etbRate: Number(e.target.value) }))} className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" />
            </div>
            <button onClick={handleSettingsUpdate} className="w-full btn-primary !py-2">Update Rate</button>
          </PanelCard>
          
          <Publisher />
          <AdContentPublisher />

          <PanelCard title="AI Content Generator">
            <p className="text-sm text-text-secondary">Generate text for ads, tasks, or messages using Gemini AI.</p>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none" placeholder="e.g., Create an exciting ad for a 500 coin weekend bonus" rows={3} disabled={isGenerating}/>
            <button onClick={handleGenerateContent} disabled={isGenerating} className="w-full btn-primary !py-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </button>
            {aiError && <p className="text-red-400 text-sm mt-2">{aiError}</p>}
            {generatedContent && (
                <div className="bg-main-bg p-3 rounded-lg mt-2 space-y-2 border border-border-color">
                    <div>
                        <h3 className="text-text-secondary text-xs mb-1">Generated Content:</h3>
                        <p className="text-text-primary whitespace-pre-wrap text-sm">{generatedContent}</p>
                    </div>
                </div>
            )}
          </PanelCard>
        </>
      )}

      {user.role === 'SUPPORT' && (
        <PanelCard title="Approve Requests">
            <div className="text-center p-4 bg-secondary-bg rounded-lg">
                <p className="text-text-secondary text-sm">No pending requests for agency or inquiry approvals.</p>
            </div>
        </PanelCard>
      )}

      <PanelCard title="User Accounts">
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {displayUsers.map(u => (
            <div key={u.id} className="bg-secondary-bg p-3 rounded-lg border border-border-color">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-bold text-text-primary">{u.name} <span className={`text-xs font-mono ${u.isBanned ? 'text-red-400' : 'text-green-400'}`}>{u.isBanned ? 'BANNED' : 'ACTIVE'}</span></p>
                  <p className="text-xs text-text-secondary">{u.id}</p>
                </div>
                <p className="font-bold text-accent-gold">{(u.coins + u.adCoins).toLocaleString(undefined, {maximumFractionDigits: 0})} C</p>
              </div>
              <div className="flex gap-2 mt-2">
                 <button onClick={() => alert(`Viewing ledger for ${u.id}:\n` + u.transactions.map(t => `${t.type}: ${t.amount}`).join('\n') || 'No transactions.')} className="flex-1 text-xs bg-border-color text-text-primary py-1 rounded-md hover:bg-border-color/70">Ledger</button>
                 {user.role === 'ADMIN' && (
                    <button onClick={() => toggleUserBan(u.id)} className={`flex-1 text-xs text-white py-1 rounded-md transition-colors ${u.isBanned ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}>{u.isBanned ? 'Unban' : 'Ban'}</button>
                 )}
              </div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
};

export default AgencyScreen;
