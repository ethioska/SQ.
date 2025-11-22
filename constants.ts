
import { LevelRequirementType, Role, BotTier } from './types';
import type { Level, Agency, User } from './types';

export const DAILY_TAP_LIMIT = 5000;
export const AD_BONUS_COINS = 5;
export const AD_BONUS_COOLDOWN_HOURS = 3;
export const DAILY_REWARD_AMOUNT = 1000;
export const DAILY_REWARD_COOLDOWN_HOURS = 24;
export const BOT_SESSION_HOURS = 3;
export const REFERRAL_REWARD = 200;

export const PRIMARY_AGENCY_ID = '445133';
export const OFFICIAL_CHANNEL_ID = 'SQ_OFFICIAL_CHANNEL';

export const BOT_TIERS: BotTier[] = [
    { tier: 1, name: "Bronze Bot", cost: 0, tapsPerHour: 1500, levelRequirement: 1 },
    { tier: 2, name: "Silver Bot", cost: 0, tapsPerHour: 2500, levelRequirement: 2 },
    { tier: 3, name: "Gold Bot", cost: 0, tapsPerHour: 15000, levelRequirement: 5 },
];


export const LEVELS: Level[] = [
    { level: 1, ctap: 0.002, requirements: [{ type: LevelRequirementType.COINS, value: 25000, description: "Earn {value} Coins" }], nextLevel: 2 },
    { level: 2, ctap: 0.004, requirements: [
        { type: LevelRequirementType.COINS, value: 50000, description: "Earn {value} Coins" },
        { type: LevelRequirementType.INVITES, value: 3, description: "Invite {value} Users" }
    ], nextLevel: 3 },
    { level: 3, ctap: 0.008, requirements: [{ type: LevelRequirementType.COINS, value: 100000, description: "Earn {value} Coins" }], nextLevel: 4 },
    { level: 4, ctap: 0.016, requirements: [{ type: LevelRequirementType.COINS, value: 200000, description: "Earn {value} Coins" }], nextLevel: 5 },
    { level: 5, ctap: 0.032, requirements: [{ type: LevelRequirementType.COINS, value: 400000, description: "Earn {value} Coins" }], nextLevel: 6 },
    { level: 6, ctap: 0.064, requirements: [{ type: LevelRequirementType.COINS, value: 800000, description: "Earn {value} Coins" }], nextLevel: 7 },
    { level: 7, ctap: 0.128, requirements: [{ type: LevelRequirementType.COINS, value: 1600000, description: "Earn {value} Coins" }], nextLevel: 8 },
    { level: 8, ctap: 0.256, requirements: [{ type: LevelRequirementType.COINS, value: 3200000, description: "Earn {value} Coins" }], nextLevel: 9 },
    { level: 9, ctap: 0.512, requirements: [{ type: LevelRequirementType.COINS, value: 6400000, description: "Earn {value} Coins" }], nextLevel: 10 },
    { level: 10, ctap: 1.024, requirements: [{ type: LevelRequirementType.COINS, value: 12800000, description: "Earn {value} Coins" }], nextLevel: 11 },
    { level: 11, ctap: 2.048, requirements: [{ type: LevelRequirementType.COINS, value: 25600000, description: "Earn {value} Coins" }], nextLevel: 12 },
    { level: 12, ctap: 4.096, requirements: [{ type: LevelRequirementType.COINS, value: 51200000, description: "Earn {value} Coins" }], nextLevel: 13 },
    { level: 13, ctap: 8.192, requirements: [{ type: LevelRequirementType.COINS, value: 102400000, description: "Earn {value} Coins" }], nextLevel: 14 },
    { level: 14, ctap: 16.384, requirements: [{ type: LevelRequirementType.COINS, value: 204800000, description: "Earn {value} Coins" }], nextLevel: 15 },
    { level: 15, ctap: 32.768, requirements: [{ type: LevelRequirementType.COINS, value: 409600000, description: "Earn {value} Coins" }], nextLevel: 16 },
    { level: 16, ctap: 65.536, requirements: [{ type: LevelRequirementType.AGENCY_APPROVAL, value: 1, description: "Get Agency Approval" }], nextLevel: 17 },
    { level: 17, ctap: 131.072, requirements: [{ type: LevelRequirementType.COINS, value: 819200000, description: "Earn {value} Coins" }], nextLevel: 18 },
    { level: 18, ctap: 262.144, requirements: [{ type: LevelRequirementType.COINS, value: 1638400000, description: "Earn {value} Coins" }], nextLevel: 19 },
    { level: 19, ctap: 524.288, requirements: [{ type: LevelRequirementType.COINS, value: 3276800000, description: "Earn {value} Coins" }], nextLevel: 20 },
    { level: 20, ctap: 1048.576, requirements: [{ type: LevelRequirementType.COINS, value: 6553600000, description: "Earn {value} Coins" }], nextLevel: 21 },
    { level: 21, ctap: 2097.152, requirements: [{ type: LevelRequirementType.COINS, value: Infinity, description: "Max Level Reached" }], nextLevel: null },
];

export const VERIFIED_AGENCIES: Agency[] = [
  { 
    id: '445133', 
    name: 'SQ BOOM Platform Control', 
    email: 'ethioska@gmail.com',
    role: 'ADMIN',
    phone: "+251 90 000 0000",
    photoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
  },
  { 
    id: '620034', 
    name: 'User Support & Approvals',
    email: 'seidk1430@gmail.com',
    role: 'SUPPORT',
    phone: "+251 91 123 4567",
    photoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=support"
  },
  { 
    id: '551340', 
    name: 'SQ BOOM MS', 
    email: 'sqboomms@gmail.com',
    role: 'RECEIVER',
    phone: "+251 98 765 4321",
    photoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=bank"
  },
  { 
    id: '748158', 
    name: 'SQ BOOM App', 
    email: 'sqboomapp@gmail.com',
    role: 'RECEIVER',
    phone: "+221 7X XXX XXXX",
    photoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=app"
  },
];

export const MOCK_USERS: User[] = [
  // Mock users cleared. Only Verified Agencies are initialized with default passwords.
  ...VERIFIED_AGENCIES.map(agency => ({
    id: agency.id,
    name: agency.name,
    nickname: agency.name,
    phone: agency.phone || '',
    email: agency.email,
    password: 'sqboom2025', // Default password for agencies
    coins: 1000000, 
    totalCoinsEarned: 1000000,
    adCoins: 0,
    level: 21,
    invites: 0,
    tapsToday: 0,
    isBanned: false,
    role: agency.role,
    referralId: '',
    claimedCoupons: [],
    tapsSinceLastCoupon: 0,
    transactions: [],
    lastDailyRewardClaim: 0,
    votedPolls: [],
    votedAdPolls: [],
    lastAdBonusClaim: 0,
    activeBotTier: null,
    botSessionStartedAt: null,
    botAccumulatedCoins: 0,
    photoUrl: agency.photoUrl
  }))
];


export const SUPPORT_CONTACTS = {
  phoneNumbers: ['+251 91 123 4567', '+251 91 765 4321'],
  telegramGroups: [
    { name: 't.me/sqboomhelpdesk', link: 'https://t.me/sqboomhelpdesk' },
    { name: 't.me/sqboomcommunity', link: 'https://t.me/sqboomcommunity' },
    { name: 'telegramtech', link: 'https://t.me/telegram' },
    { name: 't.me/sqboomchannel', link: 'https://t.me/sqboomchannel' },
  ],
};
