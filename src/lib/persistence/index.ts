// Types
export type {
  UserProfile,
  Badge,
  BadgeId,
  GameRecord,
  GameProgress,
  StorageAdapter,
  AgeRange,
  Gender,
  Barrio,
} from './types';

export { DEFAULT_PROGRESS, getDefaultProgress } from './types';

// Adapters
export { LocalStorageAdapter } from './LocalStorageAdapter';

// Level System
export {
  LEVELS,
  calculateLevel,
  getLevelInfo,
  getLevelInfoFromXP,
  calculateLevelProgress,
  getXPForNextLevel,
  willLevelUp,
  getLevelUpBadges,
  BADGE_DEFINITIONS,
} from './levelSystem';
