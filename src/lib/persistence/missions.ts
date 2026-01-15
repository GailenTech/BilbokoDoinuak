/**
 * Daily Missions System
 * Generates 3 deterministic missions per day based on date as seed
 */

/**
 * Types of missions available
 */
export type MissionType = 'play_quiz' | 'streak' | 'unlock_sounds' | 'fast_memory';

/**
 * A single mission
 */
export interface Mission {
  id: string;
  type: MissionType;
  target: number;
  reward: number; // Coins
  description_es: string;
  description_eu: string;
}

/**
 * Daily missions state with progress tracking
 */
export interface DailyMissions {
  date: string; // ISO date "2024-01-15"
  missions: Mission[];
  progress: Record<string, number>; // missionId -> current progress
  claimed: string[]; // IDs of missions where reward was claimed
}

/**
 * Mission templates used for generation
 */
interface MissionTemplate {
  type: MissionType;
  targets: number[];
  rewards: number[];
  description_es: (target: number) => string;
  description_eu: (target: number) => string;
}

const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    type: 'play_quiz',
    targets: [2, 3, 5],
    rewards: [50, 75, 100],
    description_es: (target) => `Juega ${target} partidas de Quiz`,
    description_eu: (target) => `Jokatu ${target} Quiz partida`,
  },
  {
    type: 'streak',
    targets: [3, 5, 7],
    rewards: [75, 100, 150],
    description_es: (target) => `Consigue una racha de ${target}`,
    description_eu: (target) => `Lortu ${target}eko raxa`,
  },
  {
    type: 'unlock_sounds',
    targets: [1, 2, 3],
    rewards: [30, 50, 75],
    description_es: (target) => `Desbloquea ${target} sonido${target > 1 ? 's' : ''}`,
    description_eu: (target) => `Desblokeatu ${target} soinu`,
  },
  {
    type: 'fast_memory',
    targets: [15, 12, 10],
    rewards: [50, 75, 100],
    description_es: (target) => `Memory en menos de ${target} movimientos`,
    description_eu: (target) => `Memory ${target} mugimendu baino gutxiagorekin`,
  },
];

/**
 * Simple seeded random number generator (mulberry32)
 */
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert date string to seed number
 */
function dateSeed(date: string): number {
  // Format: "2024-01-15" -> 20240115
  return parseInt(date.replace(/-/g, ''), 10);
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Shuffle array using seeded random
 */
function shuffleWithSeed<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate 3 deterministic missions for a given date
 * All users will get the same missions on the same day
 */
export function generateDailyMissions(date: string): Mission[] {
  const seed = dateSeed(date);
  const random = seededRandom(seed);

  // Shuffle templates and pick 3
  const shuffledTemplates = shuffleWithSeed(MISSION_TEMPLATES, random);
  const selectedTemplates = shuffledTemplates.slice(0, 3);

  return selectedTemplates.map((template, index) => {
    // Pick difficulty based on seed
    const difficultyIndex = Math.floor(random() * template.targets.length);

    return {
      id: `${date}-${template.type}-${index}`,
      type: template.type,
      target: template.targets[difficultyIndex],
      reward: template.rewards[difficultyIndex],
      description_es: template.description_es(template.targets[difficultyIndex]),
      description_eu: template.description_eu(template.targets[difficultyIndex]),
    };
  });
}

/**
 * Create initial daily missions state for a date
 */
export function createDailyMissionsState(date: string): DailyMissions {
  const missions = generateDailyMissions(date);
  const progress: Record<string, number> = {};

  // Initialize progress for all missions
  missions.forEach((mission) => {
    progress[mission.id] = 0;
  });

  return {
    date,
    missions,
    progress,
    claimed: [],
  };
}

/**
 * Get default daily missions state (for today)
 */
export function getDefaultDailyMissions(): DailyMissions {
  return createDailyMissionsState(getTodayDate());
}

/**
 * Check if missions need to be regenerated (new day)
 */
export function shouldRegenerateMissions(currentMissions: DailyMissions | null): boolean {
  if (!currentMissions) return true;
  return currentMissions.date !== getTodayDate();
}

/**
 * Check if a mission is completed (progress >= target)
 */
export function isMissionCompleted(mission: Mission, progress: number): boolean {
  return progress >= mission.target;
}

/**
 * Check if a mission reward has been claimed
 */
export function isMissionClaimed(missionId: string, claimed: string[]): boolean {
  return claimed.includes(missionId);
}

/**
 * Get mission progress as percentage (0-100)
 */
export function getMissionProgressPercent(mission: Mission, progress: number): number {
  return Math.min(100, Math.round((progress / mission.target) * 100));
}

/**
 * Update mission progress based on game actions
 */
export interface MissionProgressUpdate {
  quizGamesPlayed?: number;
  bestStreak?: number;
  soundsUnlocked?: number;
  memoryMoves?: number; // For fast_memory, we check if moves < target
}

/**
 * Calculate updated progress for missions based on game stats
 */
export function calculateMissionProgress(
  missions: DailyMissions,
  stats: MissionProgressUpdate
): Record<string, number> {
  const newProgress = { ...missions.progress };

  missions.missions.forEach((mission) => {
    switch (mission.type) {
      case 'play_quiz':
        if (stats.quizGamesPlayed !== undefined) {
          newProgress[mission.id] = stats.quizGamesPlayed;
        }
        break;
      case 'streak':
        if (stats.bestStreak !== undefined) {
          newProgress[mission.id] = stats.bestStreak;
        }
        break;
      case 'unlock_sounds':
        if (stats.soundsUnlocked !== undefined) {
          newProgress[mission.id] = stats.soundsUnlocked;
        }
        break;
      case 'fast_memory':
        // For fast_memory, mission is completed if moves <= target
        // Progress shows: target - moves (how close they are)
        // If moves is undefined or >= target, progress stays 0
        // If moves < target, we consider it completed (progress = target)
        if (stats.memoryMoves !== undefined && stats.memoryMoves <= mission.target) {
          newProgress[mission.id] = mission.target; // Mark as completed
        }
        break;
    }
  });

  return newProgress;
}
