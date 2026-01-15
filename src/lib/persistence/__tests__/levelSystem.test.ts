import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  getLevelInfo,
  getLevelInfoFromXP,
  calculateLevelProgress,
  getXPForNextLevel,
  willLevelUp,
  getLevelUpBadges,
  LEVELS,
} from '../levelSystem';

describe('levelSystem', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('should return level 1 for 0-99 XP', () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(50)).toBe(1);
      expect(calculateLevel(99)).toBe(1);
    });

    it('should return level 2 for 100-299 XP', () => {
      expect(calculateLevel(100)).toBe(2);
      expect(calculateLevel(200)).toBe(2);
      expect(calculateLevel(299)).toBe(2);
    });

    it('should return level 3 for 300-599 XP', () => {
      expect(calculateLevel(300)).toBe(3);
      expect(calculateLevel(450)).toBe(3);
      expect(calculateLevel(599)).toBe(3);
    });

    it('should return level 4 for 600+ XP', () => {
      expect(calculateLevel(600)).toBe(4);
      expect(calculateLevel(1000)).toBe(4);
      expect(calculateLevel(10000)).toBe(4);
    });

    it('should handle edge cases at level boundaries', () => {
      expect(calculateLevel(99)).toBe(1);
      expect(calculateLevel(100)).toBe(2);
      expect(calculateLevel(299)).toBe(2);
      expect(calculateLevel(300)).toBe(3);
      expect(calculateLevel(599)).toBe(3);
      expect(calculateLevel(600)).toBe(4);
    });
  });

  describe('getLevelInfo', () => {
    it('should return correct info for each level', () => {
      const level1 = getLevelInfo(1);
      expect(level1.name_es).toBe('Principiante');
      expect(level1.name_eu).toBe('Hasiberria');
      expect(level1.minXP).toBe(0);

      const level2 = getLevelInfo(2);
      expect(level2.name_es).toBe('Explorador/a');
      expect(level2.minXP).toBe(100);

      const level3 = getLevelInfo(3);
      expect(level3.name_es).toBe('Músico/a');
      expect(level3.minXP).toBe(300);

      const level4 = getLevelInfo(4);
      expect(level4.name_es).toBe('Maestro/a');
      expect(level4.minXP).toBe(600);
    });

    it('should return level 1 for invalid level numbers', () => {
      const invalid = getLevelInfo(999);
      expect(invalid.level).toBe(1);
    });
  });

  describe('getLevelInfoFromXP', () => {
    it('should return correct level info based on XP', () => {
      expect(getLevelInfoFromXP(50).level).toBe(1);
      expect(getLevelInfoFromXP(150).level).toBe(2);
      expect(getLevelInfoFromXP(400).level).toBe(3);
      expect(getLevelInfoFromXP(800).level).toBe(4);
    });
  });

  describe('calculateLevelProgress', () => {
    it('should return 0 at start of level', () => {
      expect(calculateLevelProgress(0)).toBe(0);
      expect(calculateLevelProgress(100)).toBe(0);
      expect(calculateLevelProgress(300)).toBe(0);
    });

    it('should return progress percentage within level', () => {
      // Level 1: 0-99 (100 XP range)
      expect(calculateLevelProgress(50)).toBe(50);

      // Level 2: 100-299 (200 XP range)
      expect(calculateLevelProgress(200)).toBe(50);
    });

    it('should return 100 at max level', () => {
      expect(calculateLevelProgress(600)).toBe(100);
      expect(calculateLevelProgress(1000)).toBe(100);
    });
  });

  describe('getXPForNextLevel', () => {
    it('should return XP needed for next level', () => {
      const level1Progress = getXPForNextLevel(50);
      expect(level1Progress.current).toBe(50);
      expect(level1Progress.needed).toBe(100);

      const level2Progress = getXPForNextLevel(150);
      expect(level2Progress.current).toBe(150);
      expect(level2Progress.needed).toBe(300);

      const level3Progress = getXPForNextLevel(400);
      expect(level3Progress.current).toBe(400);
      expect(level3Progress.needed).toBe(600);
    });

    it('should return same value for current and needed at max level', () => {
      const maxLevel = getXPForNextLevel(800);
      expect(maxLevel.current).toBe(800);
      expect(maxLevel.needed).toBe(800);
    });
  });

  describe('willLevelUp', () => {
    it('should return true when XP will cause level up', () => {
      expect(willLevelUp(90, 20)).toBe(true); // 90 + 20 = 110 (level 2)
      expect(willLevelUp(280, 30)).toBe(true); // 280 + 30 = 310 (level 3)
      expect(willLevelUp(580, 50)).toBe(true); // 580 + 50 = 630 (level 4)
    });

    it('should return false when XP will not cause level up', () => {
      expect(willLevelUp(50, 20)).toBe(false); // 50 + 20 = 70 (still level 1)
      expect(willLevelUp(150, 30)).toBe(false); // 150 + 30 = 180 (still level 2)
      expect(willLevelUp(700, 100)).toBe(false); // 700 + 100 = 800 (still level 4)
    });

    it('should handle boundary cases', () => {
      expect(willLevelUp(99, 1)).toBe(true); // Exactly crossing to level 2
      expect(willLevelUp(99, 0)).toBe(false); // No XP added
    });
  });

  describe('getLevelUpBadges', () => {
    it('should return empty array when no level change', () => {
      expect(getLevelUpBadges(1, 1)).toEqual([]);
      expect(getLevelUpBadges(2, 2)).toEqual([]);
    });

    it('should return level_2 badge when reaching level 2', () => {
      const badges = getLevelUpBadges(1, 2);
      expect(badges).toContain('level_2');
      expect(badges).not.toContain('level_3');
      expect(badges).not.toContain('level_4');
    });

    it('should return level_3 badge when reaching level 3', () => {
      const badges = getLevelUpBadges(2, 3);
      expect(badges).toContain('level_3');
      expect(badges).not.toContain('level_2');
      expect(badges).not.toContain('level_4');
    });

    it('should return multiple badges when jumping multiple levels', () => {
      const badges = getLevelUpBadges(1, 4);
      expect(badges).toContain('level_2');
      expect(badges).toContain('level_3');
      expect(badges).toContain('level_4');
      expect(badges.length).toBe(3);
    });

    it('should return correct badges when jumping from level 2 to 4', () => {
      const badges = getLevelUpBadges(2, 4);
      expect(badges).not.toContain('level_2');
      expect(badges).toContain('level_3');
      expect(badges).toContain('level_4');
      expect(badges.length).toBe(2);
    });
  });

  describe('LEVELS constant', () => {
    it('should have 4 levels defined', () => {
      expect(LEVELS.length).toBe(4);
    });

    it('should have non-overlapping XP ranges', () => {
      for (let i = 0; i < LEVELS.length - 1; i++) {
        expect(LEVELS[i].maxXP).toBeLessThan(LEVELS[i + 1].minXP);
      }
    });

    it('should have consecutive level numbers', () => {
      LEVELS.forEach((level, index) => {
        expect(level.level).toBe(index + 1);
      });
    });
  });
});
