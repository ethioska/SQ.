
export type Screen = 'game' | 'wallet' | 'transfer' | 'chat' | 'settings' | 'agency' | 'register' | 'leaderboard';

export type Role = 'USER' | 'ADMIN' | 'SUPPORT' | 'RECEIVER';

// New Discriminated Union for AdContent
interface BaseAdContent {
    id: string;
    text: string;
}
export interface ImageAdContent extends BaseAdContent {
    type: 'image';
    mediaUrl: string;
    link?: string;
}
export interface VideoAdContent extends BaseAdContent {
    type: 'video';
    mediaUrl: string;
}
export interface PollAdContent extends BaseAdContent {
    type: 'poll';
    question: string;
    votes: number;
}
export type AdContent = ImageAdContent | VideoAdContent | PollAdContent;


export interface PlatformSettings {
  etbRate: number;
  adContent: AdContent | null;
}

// This is now deprecated and will be removed from logic. Kept for type safety during transition.
export interface CouponSettings {
  code: string;
  reward: number;
  requiredTaps: number;
  isEnabled: boolean;
  prompt: string;
  limit: number;
  redeemedCount: number;
}

export interface Transaction {
  id: string;
  type: 'SENT' | 'RECEIVED' | 'COUPON' | 'AD_BONUS' | 'DAILY_REWARD' | 'BOT_PURCHASE' | 'REFERRAL_BONUS' | 'CALL_FEE';
  amount: number;
  description: string;
  timestamp: number;
  senderId?: string;
  receiverId?: string;
}

export type MessageType = 'TEXT' | 'COUPON' | 'POLL';

export interface BaseChatMessage {
  id: string;
  type: MessageType;
  senderId: string;
  receiverId: string; // For DMs or channel ID
  timestamp: number;
  text?: string;
  imageUrl?: string;
}

export interface TextMessage extends BaseChatMessage {
  type: 'TEXT';
}

export interface CouponMessage extends BaseChatMessage {
  type: 'COUPON';
  couponData: {
    code: string;
    reward: number;
    expiresAt: number; // Timestamp
  };
}

export interface PollMessage extends BaseChatMessage {
  type: 'POLL';
  pollData: {
    question: string;
    votes: number;
  };
}

export type ChatMessage = TextMessage | CouponMessage | PollMessage;

export type ChatMessageContent = 
  | Omit<TextMessage, 'id' | 'senderId' | 'receiverId' | 'timestamp'>
  | Omit<CouponMessage, 'id' | 'senderId' | 'receiverId' | 'timestamp'>
  | Omit<PollMessage, 'id' | 'senderId' | 'receiverId' | 'timestamp'>;

export interface BotTier {
    tier: number;
    name: string;
    cost: number;
    tapsPerHour: number;
    levelRequirement: number;
}

export interface User {
  id: string;
  name: string; // This acts as Full Name or Nickname
  nickname?: string; // Explicit nickname if different, otherwise defaults to name
  password?: string; // Optional for Google users initially, mandatory for Agencies
  photoUrl?: string;
  age?: number;
  phone: string;
  email: string;
  coins: number;
  totalCoinsEarned: number;
  adCoins: number;
  level: number;
  invites: number;
  tapsToday: number;
  isBanned: boolean;
  role: Role;
  referralId?: string;
  claimedCoupons: string[]; // Now stores message IDs of claimed coupons
  votedPolls: string[]; // Stores message IDs of voted polls
  votedAdPolls: string[]; // Stores message IDs of voted ad polls
  tapsSinceLastCoupon: number; // Deprecated
  transactions: Transaction[];
  lastDailyRewardClaim: number;
  lastAdBonusClaim: number;
  activeBotTier: number | null;
  botSessionStartedAt: number | null;
  botAccumulatedCoins: number;
}

export enum LevelRequirementType {
  COINS = 'COINS',
  INVITES = 'INVITES',
  AGENCY_APPROVAL = 'AGENCY_APPROVAL',
}

export interface LevelRequirement {
    type: LevelRequirementType;
    value: number;
    description: string;
}

export interface Level {
  level: number;
  requirements: LevelRequirement[];
  ctap: number;
  nextLevel: number | null;
}

export interface Agency {
  id:string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  photoUrl?: string;
}

export interface PlatformHistoryEntry {
    timestamp: number;
    totalUsers: number;
    bannedUsers: number;
}

export interface GameContextType {
  user: User | null;
  allUsers: User[];
  levelData: Level | null;
  nextLevelData: Level | null;
  platformSettings: PlatformSettings;
  // Deprecated coupon settings
  couponSettings: CouponSettings;
  updatePlatformSettings: (settings: { platform: PlatformSettings }) => void;
  redeemChannelCoupon: (messageId: string) => void;
  handleVote: (messageId: string) => void;
  handleAdVote: (adId: string) => void;
  adBonusCooldown: number;
  dailyRewardCooldown: number;
  isProcessingTap: boolean;
  handleTap: () => void;
  claimAdBonus: () => void;
  claimDailyReward: () => void;
  handleTransfer: (recipientId: string, amount: number) => Promise<Transaction>;
  verifyTransaction: (transactionId: string) => Transaction | null;
  getFormattedProgress: () => { progress: number; text: string[]; levelText: string; };
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  flyingCoins: { id: number; x: number; y: number }[];
  addFlyingCoin: (x: number, y: number) => void;
  getCoinPerTap: () => number;
  registerUser: (details: { fullName: string; phone: string; email: string; password?: string; referralId?: string; photoUrl?: string; age?: number; }) => void;
  loginUser: (identifier: string, password?: string) => { success: boolean; message?: string };
  changePassword: (newPassword: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  toggleUserBan: (userId: string) => void;
  chatMessages: ChatMessage[];
  sendMessage: (receiverId: string, message: ChatMessageContent) => void;
  typingIndicator: Record<string, boolean>;
  activeChat: User | Agency | null;
  setActiveChat: (chat: User | Agency | null) => void;
  sqLiquidityHistory: number[];
  platformHistory: PlatformHistoryEntry[];
  selectBot: (userId: string, tier: number) => Promise<void>;
  startBotSession: () => void;
  claimBotEarnings: () => void;
  processCallPayment: (receiverId: string) => Promise<void>;
}
