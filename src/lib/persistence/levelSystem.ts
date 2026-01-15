import type { BadgeId } from './types';

/**
 * Level thresholds and names
 */
export const LEVELS = [
  { level: 1, minXP: 0, maxXP: 99, name_es: 'Principiante', name_eu: 'Hasiberria' },
  { level: 2, minXP: 100, maxXP: 299, name_es: 'Explorador/a', name_eu: 'Esploratzailea' },
  { level: 3, minXP: 300, maxXP: 599, name_es: 'Músico/a', name_eu: 'Musikaria' },
  { level: 4, minXP: 600, maxXP: Infinity, name_es: 'Maestro/a', name_eu: 'Maisua' },
] as const;

/**
 * Calculate level from XP amount
 */
export function calculateLevel(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

/**
 * Get level info by level number
 */
export function getLevelInfo(level: number) {
  return LEVELS.find(l => l.level === level) || LEVELS[0];
}

/**
 * Get level info from XP
 */
export function getLevelInfoFromXP(xp: number) {
  const level = calculateLevel(xp);
  return getLevelInfo(level);
}

/**
 * Calculate progress to next level (0-100)
 */
export function calculateLevelProgress(xp: number): number {
  const levelInfo = getLevelInfoFromXP(xp);

  // Max level
  if (levelInfo.level === LEVELS.length) {
    return 100;
  }

  const xpInLevel = xp - levelInfo.minXP;
  const xpNeededForLevel = levelInfo.maxXP - levelInfo.minXP + 1;

  return Math.min(100, Math.round((xpInLevel / xpNeededForLevel) * 100));
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(xp: number): { current: number; needed: number } {
  const levelInfo = getLevelInfoFromXP(xp);

  // Max level
  if (levelInfo.level === LEVELS.length) {
    return { current: xp, needed: xp };
  }

  const nextLevelInfo = getLevelInfo(levelInfo.level + 1);
  return {
    current: xp,
    needed: nextLevelInfo.minXP,
  };
}

/**
 * Check if adding XP will result in a level up
 */
export function willLevelUp(currentXP: number, xpToAdd: number): boolean {
  const currentLevel = calculateLevel(currentXP);
  const newLevel = calculateLevel(currentXP + xpToAdd);
  return newLevel > currentLevel;
}

/**
 * Get badges earned from level up
 */
export function getLevelUpBadges(oldLevel: number, newLevel: number): BadgeId[] {
  const badges: BadgeId[] = [];

  if (oldLevel < 2 && newLevel >= 2) badges.push('level_2');
  if (oldLevel < 3 && newLevel >= 3) badges.push('level_3');
  if (oldLevel < 4 && newLevel >= 4) badges.push('level_4');

  return badges;
}

/**
 * Badge definitions with display info
 */
export const BADGE_DEFINITIONS: Record<BadgeId, {
  name_es: string;
  name_eu: string;
  description_es: string;
  description_eu: string;
  icon: string;
}> = {
  // Original badges
  first_quiz: {
    name_es: 'Primer Quiz',
    name_eu: 'Lehen Quiz-a',
    description_es: 'Completa tu primer Quiz Sonoro',
    description_eu: 'Osatu zure lehen Soinu Quiz-a',
    icon: '🎯',
  },
  first_memory: {
    name_es: 'Primer Memory',
    name_eu: 'Lehen Memory',
    description_es: 'Completa tu primer Memory Sonoro',
    description_eu: 'Osatu zure lehen Soinu Memory',
    icon: '🧠',
  },
  perfect_quiz: {
    name_es: 'Quiz Perfecto',
    name_eu: 'Quiz Perfektua',
    description_es: 'Consigue el 100% en un Quiz',
    description_eu: 'Lortu %100 Quiz batean',
    icon: '⭐',
  },
  fast_memory: {
    name_es: 'Memory Veloz',
    name_eu: 'Memory Azkarra',
    description_es: 'Completa Memory en menos de 12 movimientos',
    description_eu: 'Osatu Memory 12 mugimendu baino gutxiagoan',
    icon: '⚡',
  },
  level_2: {
    name_es: 'Explorador/a',
    name_eu: 'Esploratzailea',
    description_es: 'Alcanza el Nivel 2',
    description_eu: 'Iritsi 2. mailara',
    icon: '🥉',
  },
  level_3: {
    name_es: 'Musico/a',
    name_eu: 'Musikaria',
    description_es: 'Alcanza el Nivel 3',
    description_eu: 'Iritsi 3. mailara',
    icon: '🥈',
  },
  level_4: {
    name_es: 'Maestro/a',
    name_eu: 'Maisua',
    description_es: 'Alcanza el Nivel 4',
    description_eu: 'Iritsi 4. mailara',
    icon: '🥇',
  },
  // New badges from Base44
  novato: {
    name_es: 'Novato',
    name_eu: 'Hasiberria',
    description_es: 'Juega tu primera partida',
    description_eu: 'Jokatu zure lehen partida',
    icon: '🌱',
  },
  oido_fino: {
    name_es: 'Oido Fino',
    name_eu: 'Belarri Fina',
    description_es: 'Consigue 1000 puntos en una partida',
    description_eu: 'Lortu 1000 puntu partida batean',
    icon: '👂',
  },
  racha_5: {
    name_es: 'Racha 5',
    name_eu: '5eko Raxa',
    description_es: 'Consigue una racha de 5 respuestas correctas',
    description_eu: 'Lortu 5 erantzun zuzeneko segida',
    icon: '🔥',
  },
  veterano: {
    name_es: 'Veterano',
    name_eu: 'Beteranoa',
    description_es: 'Juega 50 partidas',
    description_eu: 'Jokatu 50 partida',
    icon: '🎖️',
  },
};
