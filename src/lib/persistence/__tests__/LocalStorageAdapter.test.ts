import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAdapter } from '../LocalStorageAdapter';
import type { UserProfile, GameProgress } from '../types';
import { getDefaultProgress } from '../types';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter();
  });

  describe('Profile operations', () => {
    beforeEach(() => {
      localStorage.clear();
      adapter = new LocalStorageAdapter();
    });

    it('should return null when no profile exists', async () => {
      const profile = await adapter.getProfile();
      expect(profile).toBeNull();
    });

    it('should save and retrieve profile correctly', async () => {
      const testProfile: UserProfile = {
        id: 'test-user-123',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        profileCompleted: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2024-01-15T10:30:00Z',
      };

      await adapter.saveProfile(testProfile);
      const retrieved = await adapter.getProfile();

      expect(retrieved).toEqual(testProfile);
    });

    it('should update profile when saved again', async () => {
      const originalProfile: UserProfile = {
        id: 'test-user-123',
        displayName: 'Original Name',
        profileCompleted: false,
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2024-01-15T10:30:00Z',
      };

      await adapter.saveProfile(originalProfile);

      const updatedProfile: UserProfile = {
        ...originalProfile,
        displayName: 'Updated Name',
        lastLoginAt: '2024-01-16T08:00:00Z',
      };

      await adapter.saveProfile(updatedProfile);
      const retrieved = await adapter.getProfile();

      expect(retrieved?.displayName).toBe('Updated Name');
      expect(retrieved?.lastLoginAt).toBe('2024-01-16T08:00:00Z');
    });
  });

  describe('Progress operations', () => {
    beforeEach(() => {
      localStorage.clear();
      adapter = new LocalStorageAdapter();
    });

    it('should return default progress when no progress exists', async () => {
      const progress = await adapter.getProgress();
      expect(progress).toEqual(getDefaultProgress());
    });

    it('should save and retrieve progress correctly', async () => {
      const testProgress: GameProgress = {
        odisea2xp: 150,
        level: 2,
        coins: 0,
        badges: [{ id: 'first_quiz', unlockedAt: '2024-01-15T10:00:00Z' }],
        gamesPlayed: [
          {
            gameType: 'quiz',
            score: 4,
            maxScore: 5,
            playedAt: '2024-01-15T10:00:00Z',
          },
        ],
        unlockedSounds: [],
      };

      await adapter.saveProgress(testProgress);
      const retrieved = await adapter.getProgress();

      expect(retrieved).toEqual(testProgress);
    });

    it('should handle partial progress data gracefully', async () => {
      // Simulate old/partial data in localStorage
      localStorage.setItem(
        'bilboko_doinuak_progress',
        JSON.stringify({ odisea2xp: 50 })
      );

      const progress = await adapter.getProgress();

      expect(progress.odisea2xp).toBe(50);
      expect(progress.level).toBe(1);
      expect(progress.badges).toEqual([]);
      expect(progress.gamesPlayed).toEqual([]);
    });
  });

  describe('addXP', () => {
    beforeEach(() => {
      localStorage.clear();
      adapter = new LocalStorageAdapter();
    });

    it('should increment XP correctly', async () => {
      // Start with 0 XP
      let progress = await adapter.addXP(50);
      expect(progress.odisea2xp).toBe(50);

      // Add more XP
      progress = await adapter.addXP(30);
      expect(progress.odisea2xp).toBe(80);
    });

    it('should update level when XP threshold is reached', async () => {
      // Add XP to reach level 2 (100 XP)
      const progress = await adapter.addXP(150);

      expect(progress.odisea2xp).toBe(150);
      expect(progress.level).toBe(2);
    });

    it('should unlock level badges when leveling up', async () => {
      // Start at level 1
      let progress = await adapter.getProgress();
      expect(progress.level).toBe(1);

      // Add XP to reach level 2
      progress = await adapter.addXP(100);

      expect(progress.level).toBe(2);
      expect(progress.badges).toContainEqual(
        expect.objectContaining({ id: 'level_2' })
      );
    });

    it('should unlock multiple level badges if jumping multiple levels', async () => {
      // Add enough XP to reach level 4 directly
      const progress = await adapter.addXP(700);

      expect(progress.level).toBe(4);
      expect(progress.badges).toContainEqual(
        expect.objectContaining({ id: 'level_2' })
      );
      expect(progress.badges).toContainEqual(
        expect.objectContaining({ id: 'level_3' })
      );
      expect(progress.badges).toContainEqual(
        expect.objectContaining({ id: 'level_4' })
      );
    });
  });

  describe('unlockBadge', () => {
    beforeEach(() => {
      localStorage.clear();
      adapter = new LocalStorageAdapter();
    });

    it('should add badge when not already unlocked', async () => {
      await adapter.unlockBadge('first_quiz');
      const progress = await adapter.getProgress();

      expect(progress.badges.length).toBe(1);
      expect(progress.badges[0].id).toBe('first_quiz');
      expect(progress.badges[0].unlockedAt).toBeDefined();
    });

    it('should not duplicate badge if already unlocked', async () => {
      await adapter.unlockBadge('first_quiz');
      await adapter.unlockBadge('first_quiz');
      await adapter.unlockBadge('first_quiz');

      const progress = await adapter.getProgress();
      const firstQuizBadges = progress.badges.filter(
        (b) => b.id === 'first_quiz'
      );

      expect(firstQuizBadges.length).toBe(1);
    });

    it('should allow multiple different badges', async () => {
      await adapter.unlockBadge('first_quiz');
      await adapter.unlockBadge('first_memory');
      await adapter.unlockBadge('perfect_quiz');

      const progress = await adapter.getProgress();

      expect(progress.badges.length).toBe(3);
      expect(progress.badges.map((b) => b.id)).toContain('first_quiz');
      expect(progress.badges.map((b) => b.id)).toContain('first_memory');
      expect(progress.badges.map((b) => b.id)).toContain('perfect_quiz');
    });
  });

  describe('recordGame', () => {
    beforeEach(() => {
      localStorage.clear();
      adapter = new LocalStorageAdapter();
    });

    it('should record game correctly', async () => {
      await adapter.recordGame({
        gameType: 'quiz',
        score: 4,
        maxScore: 5,
      });

      const progress = await adapter.getProgress();

      expect(progress.gamesPlayed.length).toBe(1);
      expect(progress.gamesPlayed[0].gameType).toBe('quiz');
      expect(progress.gamesPlayed[0].score).toBe(4);
      expect(progress.gamesPlayed[0].maxScore).toBe(5);
      expect(progress.gamesPlayed[0].playedAt).toBeDefined();
    });

    it('should unlock first_quiz badge on first quiz game', async () => {
      await adapter.recordGame({
        gameType: 'quiz',
        score: 3,
        maxScore: 5,
      });

      const progress = await adapter.getProgress();

      expect(progress.badges).toContainEqual(
        expect.objectContaining({ id: 'first_quiz' })
      );
    });

    it('should unlock first_memory badge on first memory game', async () => {
      await adapter.recordGame({
        gameType: 'memory',
        score: 15,
        maxScore: 12,
      });

      const progress = await adapter.getProgress();

      expect(progress.badges).toContainEqual(
        expect.objectContaining({ id: 'first_memory' })
      );
    });

    it('should record multiple games', async () => {
      await adapter.recordGame({ gameType: 'quiz', score: 3, maxScore: 5 });
      await adapter.recordGame({ gameType: 'memory', score: 20, maxScore: 12 });
      await adapter.recordGame({ gameType: 'quiz', score: 5, maxScore: 5 });

      const progress = await adapter.getProgress();

      expect(progress.gamesPlayed.length).toBe(3);
    });
  });

  describe('localStorage unavailable', () => {
    beforeEach(() => {
      localStorage.clear();
      adapter = new LocalStorageAdapter();
    });

    it('should handle localStorage not available gracefully', async () => {
      // Mock localStorage to throw
      const originalGetItem = localStorage.getItem;
      const originalSetItem = localStorage.setItem;

      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage disabled');
      });

      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage disabled');
      });

      // Create new adapter (it will detect storage is unavailable)
      const brokenAdapter = new LocalStorageAdapter();

      // Should return defaults without crashing
      const profile = await brokenAdapter.getProfile();
      expect(profile).toBeNull();

      const progress = await brokenAdapter.getProgress();
      expect(progress).toEqual(getDefaultProgress());

      // Restore mocks
      vi.restoreAllMocks();
      localStorage.getItem = originalGetItem;
      localStorage.setItem = originalSetItem;
    });
  });
});
