import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { User, Level, GameContextType, Screen, Role, PlatformSettings, Transaction, ChatMessage, ChatMessageContent, Agency, CouponMessage, PollMessage, AdContent, PollAdContent, PlatformHistoryEntry, LevelRequirement } from '../types';
import { LevelRequirementType } from '../types';
import { LEVELS, DAILY_TAP_LIMIT, AD_BONUS_COINS, AD_BONUS_COOLDOWN_HOURS, PRIMARY_AGENCY_ID, VERIFIED_AGENCIES, MOCK_USERS, DAILY_REWARD_AMOUNT, DAILY_REWARD_COOLDOWN_HOURS, OFFICIAL_CHANNEL_ID, BOT_TIERS, BOT_SESSION_HOURS, REFERRAL_REWARD } from '../constants';

const GameContext = createContext<GameContextType | undefined>(undefined);

const LS_KEYS = {
    USERS: 'sqboom_users_v3',
    CHAT: 'sqboom_chat',
    PLATFORM_SETTINGS: 'sqboom_platform_settings',
    THEME: 'sqboom_theme',
    LAST_USER_ID: 'sqboom_lastUserId',
};

const safeJSONParse = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error: any) {
        console.error(`Failed to parse ${key} from localStorage`, error);
        return defaultValue;
    }
};


export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => safeJSONParse(LS_KEYS.USERS, MOCK_USERS));
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => safeJSONParse(LS_KEYS.PLATFORM_SETTINGS, { etbRate: 100, adContent: null }));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => safeJSONParse(LS_KEYS.CHAT, []));
  
  const [theme, rawSetTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem(LS_KEYS.THEME);
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  const [lastUserId, setLastUserId] = useState<string | null>(() => localStorage.getItem(LS_KEYS.LAST_USER_ID));
  const [activeScreen, setActiveScreen] = useState<Screen>('game');
  const [isProcessingTap, setIsProcessingTap] = useState(false);
  const [flyingCoins, setFlyingCoins] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const [dailyRewardCooldown, setDailyRewardCooldown] = useState(0);
  const [adBonusCooldown, setAdBonusCooldown] = useState(0);

  const [typingIndicator, setTypingIndicator] = useState<Record<string, boolean>>({});
  const [activeChat, setActiveChat] = useState<User | Agency | null>(null);

  const [sqLiquidityHistory, setSqLiquidityHistory] = useState<number[]>([]);
  const [platformHistory, setPlatformHistory] = useState<PlatformHistoryEntry[]>([]);

  const user = useMemo(() => allUsers.find(u => u.id === lastUserId) || null, [allUsers, lastUserId]);
  const levelData = useMemo(() => LEVELS.find(l => l.level === user?.level), [user]);
  const nextLevelData = useMemo(() => levelData?.nextLevel ? LEVELS.find(l => l.level === levelData.nextLevel) : null, [levelData]);
  
  useEffect(() => {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.PLATFORM_SETTINGS, JSON.stringify(platformSettings));
  }, [platformSettings]);

  useEffect(() => {
     const agencyIds = VERIFIED_AGENCIES.map(a => a.id);
     const missingAgencies = MOCK_USERS.filter(mu => agencyIds.includes(mu.id) && !allUsers.find(u => u.id === mu.id));
     
     if (missingAgencies.length > 0) {
         setAllUsers(prev => [...prev, ...missingAgencies]);
     }
  }, []);

  const setTheme = (theme: 'dark' | 'light') => {
    rawSetTheme(theme);
    localStorage.setItem(LS_KEYS.THEME, theme);
    document.documentElement.classList.toggle('light', theme === 'light');
  };

  useEffect(() => {
    setTheme(theme);
  }, [theme]);
  
  const checkAndApplyLevelUp = useCallback((userId: string) => {
    setAllUsers(prevUsers => {
      const userIndex = prevUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) return prevUsers;
      
      const userToUpdate = prevUsers[userIndex];
      const currentLevelData = LEVELS.find(l => l.level === userToUpdate.level);
      const nextLevelData = currentLevelData?.nextLevel ? LEVELS.find(l => l.level === currentLevelData.nextLevel) : null;
      
      if (!nextLevelData) return prevUsers;

      const meetsAllRequirements = nextLevelData.requirements.every(req => {
        switch (req.type) {
          case LevelRequirementType.COINS:
            return userToUpdate.totalCoinsEarned >= req.value;
          case LevelRequirementType.INVITES:
            return userToUpdate.invites >= req.value;
          case LevelRequirementType.AGENCY_APPROVAL:
            return false;
          default:
            return false;
        }
      });
      
      if (meetsAllRequirements) {
        const updatedUser = { ...userToUpdate, level: nextLevelData.level };
        const newUsers = [...prevUsers];
        newUsers[userIndex] = updatedUser;
        return newUsers;
      }
      
      return prevUsers;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        const now = Date.now();
        const dailyCooldownEnd = user.lastDailyRewardClaim + DAILY_REWARD_COOLDOWN_HOURS * 3600 * 1000;
        setDailyRewardCooldown(Math.max(0, Math.round((dailyCooldownEnd - now) / 1000)));
        
        const adCooldownEnd = user.lastAdBonusClaim + AD_BONUS_COOLDOWN_HOURS * 3600 * 1000;
        setAdBonusCooldown(Math.max(0, Math.round((adCooldownEnd - now) / 1000)));
      }
      
      setAllUsers(prevUsers => 
        prevUsers.map(u => {
            if (u.role !== 'USER' || !u.activeBotTier || !u.botSessionStartedAt) return u;

            const bot = BOT_TIERS.find(b => b.tier === u.activeBotTier);
            if (!bot) return u;
            
            const sessionDurationMs = BOT_SESSION_HOURS * 60 * 60 * 1000;
            const elapsedMs = Math.min(Date.now() - u.botSessionStartedAt, sessionDurationMs);
            const tapsPerSecond = bot.tapsPerHour / 3600;
            const currentLevel = LEVELS.find(l => l.level === u.level);
            const coinPerTap = currentLevel?.ctap || 0.002;
            
            const earnedCoins = (elapsedMs / 1000) * tapsPerSecond * coinPerTap;

            return { ...u, botAccumulatedCoins: Math.floor(earnedCoins) };
        })
      );
      
      setSqLiquidityHistory(prev => {
        const totalUserCoins = allUsers
            .filter(u => u.role === 'USER')
            .reduce((sum, u) => sum + u.coins + u.adCoins, 0);
        const newHistory = [...prev, totalUserCoins];
        return newHistory.length > 100 ? newHistory.slice(1) : newHistory;
      });

      setPlatformHistory(prev => {
         const totalUsers = allUsers.filter(u => u.role === 'USER').length;
         const bannedUsers = allUsers.filter(u => u.role === 'USER' && u.isBanned).length;
         const newEntry = { timestamp: Date.now(), totalUsers, bannedUsers };
         const newHistory = [...prev, newEntry];
         return newHistory.length > 100 ? newHistory.slice(1) : newHistory;
      });


    }, 2000);

    return () => clearInterval(interval);
  }, [user, allUsers]);

  const addFlyingCoin = useCallback((x: number, y: number) => {
    const newCoin = { id: Date.now(), x, y };
    setFlyingCoins(current => [...current, newCoin]);
    setTimeout(() => {
      setFlyingCoins(current => current.filter(c => c.id !== newCoin.id));
    }, 1500);
  }, []);

  const getCoinPerTap = useCallback(() => levelData?.ctap || 0.002, [levelData]);

  const handleTap = useCallback(() => {
    if (!user || isProcessingTap || user.tapsToday >= DAILY_TAP_LIMIT) return;

    setIsProcessingTap(true);
    if (navigator.vibrate) navigator.vibrate(10); // Haptic Feedback
    const ctap = getCoinPerTap();

    setAllUsers(prevUsers => {
        const userIndex = prevUsers.findIndex(u => u.id === user.id);
        if (userIndex === -1) return prevUsers;

        const userToUpdate = prevUsers[userIndex];
        const updatedUser = {
            ...userToUpdate,
            coins: userToUpdate.coins + ctap,
            totalCoinsEarned: userToUpdate.totalCoinsEarned + ctap,
            tapsToday: userToUpdate.tapsToday + 1,
        };
        const newUsers = [...prevUsers];
        newUsers[userIndex] = updatedUser;
        return newUsers;
    });

    setTimeout(() => {
        setIsProcessingTap(false);
        checkAndApplyLevelUp(user.id);
    }, 100);
  }, [user, isProcessingTap, getCoinPerTap, checkAndApplyLevelUp]);

  const claimDailyReward = useCallback(() => {
    if (!user || dailyRewardCooldown > 0) return;
    setAllUsers(prev => {
      const userIndex = prev.findIndex(u => u.id === user.id);
      if (userIndex === -1) return prev;
      
      const userToUpdate = prev[userIndex];
      const newTransaction: Transaction = {
        id: `txn_daily_${Date.now()}`, type: 'DAILY_REWARD', amount: DAILY_REWARD_AMOUNT,
        description: 'Claimed Daily Reward', timestamp: Date.now(), receiverId: user.id
      };
      const updatedUser: User = {
        ...userToUpdate,
        coins: userToUpdate.coins + DAILY_REWARD_AMOUNT,
        totalCoinsEarned: userToUpdate.totalCoinsEarned + DAILY_REWARD_AMOUNT,
        lastDailyRewardClaim: Date.now(),
        transactions: [...userToUpdate.transactions, newTransaction],
      };
      
      const newUsers = [...prev];
      newUsers[userIndex] = updatedUser;
      return newUsers;
    });
    checkAndApplyLevelUp(user.id);
  }, [user, dailyRewardCooldown, checkAndApplyLevelUp]);
  
  const claimAdBonus = useCallback(() => {
    if (!user || adBonusCooldown > 0 || !platformSettings.adContent) return;
    setAllUsers(prev => {
      const userIndex = prev.findIndex(u => u.id === user.id);
      if (userIndex === -1) return prev;

      const ad = platformSettings.adContent;
      if (ad.type === 'poll' && !user.votedAdPolls.includes(ad.id)) return prev;

      const userToUpdate = prev[userIndex];
      const newTransaction: Transaction = {
        id: `txn_ad_${Date.now()}`, type: 'AD_BONUS', amount: AD_BONUS_COINS,
        description: 'Claimed Ad Bonus', timestamp: Date.now(), receiverId: user.id
      };
      const updatedUser: User = {
        ...userToUpdate,
        coins: userToUpdate.coins + AD_BONUS_COINS,
        totalCoinsEarned: userToUpdate.totalCoinsEarned + AD_BONUS_COINS,
        lastAdBonusClaim: Date.now(),
        transactions: [...userToUpdate.transactions, newTransaction],
      };
      const newUsers = [...prev];
      newUsers[userIndex] = updatedUser;
      return newUsers;
    });
    checkAndApplyLevelUp(user.id);
  }, [user, adBonusCooldown, platformSettings.adContent, checkAndApplyLevelUp]);

  const handleTransfer = useCallback((recipientId: string, amount: number): Promise<Transaction> => {
    return new Promise((resolve, reject) => {
      if (!user) return reject(new Error("User not found."));
      if (user.id === recipientId) return reject(new Error("Cannot transfer to yourself."));
      if (amount > user.coins + user.adCoins) return reject(new Error("Insufficient balance."));
      
      setAllUsers(prevUsers => {
        const senderIndex = prevUsers.findIndex(u => u.id === user.id);
        const receiverIndex = prevUsers.findIndex(u => u.id === recipientId);

        if (senderIndex === -1) {
          reject(new Error("Sender not found."));
          return prevUsers;
        }
        if (receiverIndex === -1) {
          reject(new Error("Recipient not found."));
          return prevUsers;
        }
        
        const newUsers = [...prevUsers];
        let sender = { ...newUsers[senderIndex] };
        const receiver = { ...newUsers[receiverIndex] };

        let amountFromAdCoins = Math.min(amount, sender.adCoins);
        let amountFromMainCoins = amount - amountFromAdCoins;
        
        sender.adCoins -= amountFromAdCoins;
        sender.coins -= amountFromMainCoins;

        receiver.coins += amount;
        
        const transaction: Transaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'SENT',
          amount,
          description: `Transfer to ${receiver.name}`,
          timestamp: Date.now(),
          senderId: sender.id,
          receiverId: receiver.id
        };

        const receivedTransaction: Transaction = {
            ...transaction,
            type: 'RECEIVED',
            description: `Received from ${sender.name}`
        };

        sender.transactions = [...sender.transactions, transaction];
        receiver.transactions = [...receiver.transactions, receivedTransaction];
        
        newUsers[senderIndex] = sender;
        newUsers[receiverIndex] = receiver;
        
        resolve(transaction);
        return newUsers;
      });
    });
  }, [user]);
  
  const getFormattedProgress = useCallback((): { progress: number; text: string[]; levelText: string } => {
    if (!user || !levelData || !nextLevelData) {
      return { progress: 100, text: ["Max level reached!"], levelText: `Level ${user?.level || 1}` };
    }
    
    let totalProgress = 0;
    const requirementTexts: string[] = [];

    nextLevelData.requirements.forEach(req => {
        let current = 0;
        let target = req.value;
        switch(req.type) {
            case LevelRequirementType.COINS:
                current = user.totalCoinsEarned;
                requirementTexts.push(`${current.toLocaleString(undefined, {notation: 'compact'})} / ${target.toLocaleString(undefined, {notation: 'compact'})} Coins`);
                break;
            case LevelRequirementType.INVITES:
                current = user.invites;
                requirementTexts.push(`${current}/${target} Invites`);
                break;
            default:
                requirementTexts.push(req.description);
                break;
        }
        totalProgress += (Math.min(current, target) / target) * 100;
    });

    const averageProgress = totalProgress / nextLevelData.requirements.length;

    return {
      progress: averageProgress,
      text: requirementTexts,
      levelText: `Level ${user.level} → ${nextLevelData.level}`
    };
  }, [user, levelData, nextLevelData]);

  const registerUser = useCallback((details: { fullName: string; phone: string; email: string; password?: string; referralId?: string; photoUrl?: string; age?: number }) => {
    const newUser: User = {
      id: `SQ_B_${Math.floor(1000000 + Math.random() * 9000000)}`,
      name: details.fullName,
      nickname: details.fullName.split(' ')[0],
      phone: details.phone,
      email: details.email,
      password: details.password,
      photoUrl: details.photoUrl,
      age: details.age,
      coins: 0,
      totalCoinsEarned: 0,
      adCoins: 0,
      level: 1,
      invites: 0,
      tapsToday: 0,
      isBanned: false,
      role: 'USER',
      referralId: details.referralId?.trim() || undefined,
      claimedCoupons: [],
      votedPolls: [],
      votedAdPolls: [],
      tapsSinceLastCoupon: 0,
      transactions: [],
      lastDailyRewardClaim: 0,
      lastAdBonusClaim: 0,
      activeBotTier: null,
      botSessionStartedAt: null,
      botAccumulatedCoins: 0,
    };
    
    setAllUsers(prev => {
        let newUsers = [...prev, newUser];
        if (details.referralId) {
            const referrerIndex = newUsers.findIndex(u => u.id === details.referralId);
            if (referrerIndex !== -1) {
                const referrer = { ...newUsers[referrerIndex] };
                referrer.invites += 1;
                
                referrer.coins += REFERRAL_REWARD;
                referrer.totalCoinsEarned += REFERRAL_REWARD;
                referrer.transactions.push({
                    id: `txn_ref_${Date.now()}`,
                    type: 'REFERRAL_BONUS',
                    amount: REFERRAL_REWARD,
                    description: `Referral bonus for ${newUser.name}`,
                    timestamp: Date.now(),
                    receiverId: referrer.id
                });

                newUsers[referrerIndex] = referrer;
            }
        }
        return newUsers;
    });
    setLastUserId(newUser.id);
    localStorage.setItem(LS_KEYS.LAST_USER_ID, newUser.id);
    setActiveScreen('game');
  }, []);

  const loginUser = useCallback((identifier: string, password?: string) => {
      const targetUser = allUsers.find(u => u.email.toLowerCase() === identifier.toLowerCase() || u.id === identifier);
      
      if (!targetUser) {
          return { success: false, message: 'Account not found.' };
      }

      if (targetUser.isBanned) {
          return { success: false, message: 'This account has been banned.' };
      }

      if (targetUser.role !== 'USER' && (!password || targetUser.password !== password)) {
          return { success: false, message: 'Invalid agency credentials.' };
      }

      if (password && targetUser.password && targetUser.password !== password) {
           return { success: false, message: 'Invalid password.' };
      }

      if (password && !targetUser.password) {
           return { success: false, message: 'Please login with Google.' };
      }

      setLastUserId(targetUser.id);
      localStorage.setItem(LS_KEYS.LAST_USER_ID, targetUser.id);
      setActiveScreen('game');
      return { success: true };
  }, [allUsers]);

  const changePassword = useCallback((newPassword: string) => {
      if (!user) return;
      setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, password: newPassword } : u));
      alert('Password updated successfully!');
  }, [user]);

  const logout = useCallback(() => {
    setLastUserId(null);
    localStorage.removeItem(LS_KEYS.LAST_USER_ID);
    setActiveScreen('register');
  }, []);

  const switchUser = useCallback((userId: string) => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (targetUser) {
      setLastUserId(targetUser.id);
      localStorage.setItem(LS_KEYS.LAST_USER_ID, targetUser.id);
      setActiveScreen('game');
    }
  }, [allUsers]);
  
  const toggleUserBan = useCallback((userId: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: !u.isBanned } : u));
  }, []);
  
  const sendMessage = useCallback((receiverId: string, message: ChatMessageContent) => {
    if (!user) return;
    const fullMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: user.id,
      receiverId,
      timestamp: Date.now(),
      ...message,
    } as ChatMessage;
    setChatMessages(prev => [...prev, fullMessage]);
  }, [user]);

  const updatePlatformSettings = useCallback((settings: { platform: PlatformSettings }) => {
    setPlatformSettings(settings.platform);
  }, []);

   const redeemChannelCoupon = useCallback((messageId: string) => {
    if (!user) return;
    const message = chatMessages.find(m => m.id === messageId) as CouponMessage | undefined;
    if (!message || message.type !== 'COUPON') return alert("Coupon not found.");
    if (user.claimedCoupons.includes(messageId)) return alert("You have already claimed this coupon.");
    if (Date.now() > message.couponData.expiresAt) return alert("This coupon has expired.");

    setAllUsers(prev => {
        const userIndex = prev.findIndex(u => u.id === user.id);
        if (userIndex === -1) return prev;

        const userToUpdate = prev[userIndex];
        const newTransaction: Transaction = {
             id: `txn_cpn_${Date.now()}`, type: 'COUPON', amount: message.couponData.reward,
             description: `Redeemed Coupon ${message.couponData.code}`, timestamp: Date.now(), receiverId: user.id
        };

        const updatedUser = {
             ...userToUpdate,
             coins: userToUpdate.coins + message.couponData.reward,
             totalCoinsEarned: userToUpdate.totalCoinsEarned + message.couponData.reward,
             claimedCoupons: [...userToUpdate.claimedCoupons, messageId],
             transactions: [...userToUpdate.transactions, newTransaction]
        };

        const newUsers = [...prev];
        newUsers[userIndex] = updatedUser;
        return newUsers;
    });
    alert(`Coupon redeemed! You received ${message.couponData.reward} coins.`);
  }, [user, chatMessages]);

  const handleVote = useCallback((messageId: string) => {
      if (!user) return;
      const messageIndex = chatMessages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;
      const message = chatMessages[messageIndex];
      if (message.type !== 'POLL') return;
      if (user.votedPolls.includes(messageId)) return alert("You have already voted.");

      const updatedMessage = { ...message, pollData: { ...message.pollData, votes: message.pollData.votes + 1 } };
      setChatMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[messageIndex] = updatedMessage as PollMessage;
          return newMsgs;
      });

      setAllUsers(prev => {
          const uIdx = prev.findIndex(u => u.id === user.id);
          if (uIdx === -1) return prev;
          const updatedUser = { ...prev[uIdx], votedPolls: [...prev[uIdx].votedPolls, messageId] };
          const newUsers = [...prev];
          newUsers[uIdx] = updatedUser;
          return newUsers;
      });
  }, [user, chatMessages]);

  const handleAdVote = useCallback((adId: string) => {
      if (!user || !platformSettings.adContent || platformSettings.adContent.id !== adId) return;
      if (user.votedAdPolls.includes(adId)) return;

      const currentAd = platformSettings.adContent;
      if (currentAd.type !== 'poll') return;

      setPlatformSettings(prev => ({
          ...prev,
          adContent: { ...currentAd, votes: currentAd.votes + 1 }
      }));

       setAllUsers(prev => {
          const uIdx = prev.findIndex(u => u.id === user.id);
          if (uIdx === -1) return prev;
          const updatedUser = { ...prev[uIdx], votedAdPolls: [...prev[uIdx].votedAdPolls, adId] };
          const newUsers = [...prev];
          newUsers[uIdx] = updatedUser;
          return newUsers;
      });
  }, [user, platformSettings]);

  const verifyTransaction = useCallback((transactionId: string) => {
      for (const u of allUsers) {
          const txn = u.transactions.find(t => t.id === transactionId);
          if (txn) return txn;
      }
      return null;
  }, [allUsers]);

  const selectBot = useCallback(async (userId: string, tier: number) => {
      const bot = BOT_TIERS.find(b => b.tier === tier);
      if (!bot) throw new Error("Bot tier not found");

      setAllUsers(prev => {
          const uIdx = prev.findIndex(u => u.id === userId);
          if (uIdx === -1) return prev;
          
          const targetUser = prev[uIdx];
          if (targetUser.level < bot.levelRequirement) throw new Error(`Level ${bot.levelRequirement} required.`);
          
          if (targetUser.coins < bot.cost) throw new Error("Insufficient coins.");

          const updatedUser = {
              ...targetUser,
              activeBotTier: tier,
              coins: targetUser.coins - bot.cost,
              botSessionStartedAt: null,
              botAccumulatedCoins: 0
          };
          const newUsers = [...prev];
          newUsers[uIdx] = updatedUser;
          return newUsers;
      });
  }, []);

  const startBotSession = useCallback(() => {
      if (!user || !user.activeBotTier) return;
      
      setAllUsers(prev => {
          const uIdx = prev.findIndex(u => u.id === user.id);
          if (uIdx === -1) return prev;
          
          const updatedUser = {
              ...prev[uIdx],
              botSessionStartedAt: Date.now(),
              botAccumulatedCoins: 0
          };
          const newUsers = [...prev];
          newUsers[uIdx] = updatedUser;
          return newUsers;
      });
  }, [user]);

  const claimBotEarnings = useCallback(() => {
       if (!user || !user.activeBotTier || user.botAccumulatedCoins <= 0) return;

       setAllUsers(prev => {
          const uIdx = prev.findIndex(u => u.id === user.id);
          if (uIdx === -1) return prev;
          
          const userToUpdate = prev[uIdx];
          const newTransaction: Transaction = {
            id: `txn_bot_${Date.now()}`, type: 'BOT_PURCHASE', amount: userToUpdate.botAccumulatedCoins, 
            description: 'Bot Earnings Claim', timestamp: Date.now(), receiverId: user.id
          };
          
          const updatedUser = {
              ...userToUpdate,
              coins: userToUpdate.coins + userToUpdate.botAccumulatedCoins,
              totalCoinsEarned: userToUpdate.totalCoinsEarned + userToUpdate.botAccumulatedCoins,
              botSessionStartedAt: null,
              botAccumulatedCoins: 0,
              transactions: [...userToUpdate.transactions, newTransaction]
          };
          const newUsers = [...prev];
          newUsers[uIdx] = updatedUser;
          return newUsers;
       });
       checkAndApplyLevelUp(user.id);
  }, [user, checkAndApplyLevelUp]);

  const processCallPayment = useCallback((_callRecipientId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          if (!user) return reject(new Error("User not found."));
          const CALL_FEE = 55;
          // Agency 3 (SQ BOOM MS) designated as fee receiver
          const FEE_RECEIVER_ID = '551340'; 
          const totalBalance = user.coins + user.adCoins;

          if (totalBalance < CALL_FEE) return reject(new Error("Insufficient funds for call fee (55 Coins)."));

          setAllUsers(prevUsers => {
              const senderIndex = prevUsers.findIndex(u => u.id === user.id);
              const receiverIndex = prevUsers.findIndex(u => u.id === FEE_RECEIVER_ID);

              if (senderIndex === -1) {
                   reject(new Error("User not found."));
                   return prevUsers;
              }

              const newUsers = [...prevUsers];
              let sender = { ...newUsers[senderIndex] };
              
              let amountFromAdCoins = Math.min(CALL_FEE, sender.adCoins);
              let amountFromMainCoins = CALL_FEE - amountFromAdCoins;

              sender.adCoins -= amountFromAdCoins;
              sender.coins -= amountFromMainCoins;

              const transaction: Transaction = {
                  id: `txn_call_${Date.now()}`,
                  type: 'CALL_FEE',
                  amount: CALL_FEE,
                  description: `Service Fee for Live Call`,
                  timestamp: Date.now(),
                  senderId: sender.id,
                  receiverId: FEE_RECEIVER_ID
              };
              
              sender.transactions = [...sender.transactions, transaction];
              newUsers[senderIndex] = sender;

              // Add to receiver (Agency 3) if found
              if (receiverIndex !== -1) {
                  const receiver = { ...newUsers[receiverIndex] };
                  receiver.coins += CALL_FEE;
                  const receivedTransaction: Transaction = {
                      ...transaction,
                      type: 'RECEIVED',
                      description: `Service Fee from ${sender.name}`
                  };
                  receiver.transactions = [...receiver.transactions, receivedTransaction];
                  newUsers[receiverIndex] = receiver;
              }

              resolve();
              return newUsers;
          });
      });
  }, [user]);


  const value: GameContextType = {
    user,
    allUsers,
    levelData,
    nextLevelData,
    platformSettings,
    couponSettings: { code: '', reward: 0, requiredTaps: 0, isEnabled: false, prompt: '', limit: 0, redeemedCount: 0 },
    updatePlatformSettings,
    redeemChannelCoupon,
    handleVote,
    handleAdVote,
    adBonusCooldown,
    dailyRewardCooldown,
    isProcessingTap,
    handleTap,
    claimAdBonus,
    claimDailyReward,
    handleTransfer,
    verifyTransaction,
    getFormattedProgress,
    activeScreen,
    setActiveScreen,
    flyingCoins,
    addFlyingCoin,
    getCoinPerTap,
    registerUser,
    loginUser,
    changePassword,
    theme,
    setTheme,
    logout,
    switchUser,
    toggleUserBan,
    chatMessages,
    sendMessage,
    typingIndicator,
    activeChat,
    setActiveChat,
    sqLiquidityHistory,
    platformHistory,
    selectBot,
    startBotSession,
    claimBotEarnings,
    processCallPayment
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
