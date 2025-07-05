/**
 * Tests for Achievement System
 */

import { AchievementSystem, AchievementCategory, AchievementRarity } from '../../src/game/systems/achievements.js';
import { gameState } from '../../src/game/core/gameState.js';

describe('Achievement System', () => {
  let achievementSystem;
  
  beforeEach(() => {
    // Reset game state
    gameState.reset();
    
    // Create fresh achievement system
    achievementSystem = new AchievementSystem();
  });

  describe('Initialization', () => {
    it('should initialize with default achievement state', () => {
      const achievements = gameState.get('achievements');
      expect(achievements).toBeDefined();
      expect(achievements.unlocked).toEqual({});
      expect(achievements.stats.totalUnlocked).toBe(0);
    });

    it('should have all achievement categories defined', () => {
      expect(Object.values(AchievementCategory)).toContain('production');
      expect(Object.values(AchievementCategory)).toContain('economic');
      expect(Object.values(AchievementCategory)).toContain('efficiency');
      expect(Object.values(AchievementCategory)).toContain('discovery');
    });
  });

  describe('Basic Production Achievements', () => {
    it('should unlock first clip achievement', () => {
      // Set up state for first clip
      gameState.set('resources.clips', 1);
      gameState.set('resources.totalClips', 1);
      
      // Check achievements
      achievementSystem.checkAchievements();
      
      // Verify achievement unlocked
      const unlocked = gameState.get('achievements.unlocked');
      expect(unlocked.firstClip).toBeDefined();
      
      const stats = gameState.get('achievements.stats');
      expect(stats.totalUnlocked).toBe(1);
    });

    it('should track progress towards hundred clips', () => {
      gameState.set('resources.totalClips', 50);
      
      achievementSystem.checkAchievements();
      
      const progress = achievementSystem.getProgress('hundred');
      expect(progress).toBe(50); // 50% of 100
    });

    it('should unlock multiple milestones in sequence', () => {
      // Set up for multiple achievements
      gameState.set('resources.clips', 1000);
      gameState.set('resources.totalClips', 1000);
      
      achievementSystem.checkAchievements();
      
      const unlocked = gameState.get('achievements.unlocked');
      expect(unlocked.firstClip).toBeDefined();
      expect(unlocked.hundred).toBeDefined();
      expect(unlocked.thousand).toBeDefined();
    });
  });

  describe('Economic Achievements', () => {
    it('should unlock first sale achievement', () => {
      gameState.set('market.totalRevenue', 5.50);
      
      achievementSystem.checkAchievements();
      
      const unlocked = gameState.get('achievements.unlocked');
      expect(unlocked.firstSale).toBeDefined();
    });

    it('should track profit margin achievement', () => {
      gameState.set('market.price', 3.75);
      
      achievementSystem.checkAchievements();
      
      const progress = achievementSystem.getProgress('profitMargin');
      expect(progress).toBe(75); // 3.75 / 5.0 * 100
    });
  });

  describe('Efficiency Achievements', () => {
    it('should track wire efficiency', () => {
      gameState.set('achievements.maxClipsPerSpool', 500);
      
      achievementSystem.checkAchievements();
      
      const progress = achievementSystem.getProgress('wireEfficiency');
      expect(progress).toBe(50); // 500 / 1000 * 100
    });

    it('should unlock AutoClipper achievement', () => {
      gameState.set('production.autoClippers', 100);
      
      achievementSystem.checkAchievements();
      
      const unlocked = gameState.get('achievements.unlocked');
      expect(unlocked.autoClipper).toBeDefined();
    });
  });

  describe('Discovery Achievements', () => {
    it('should track project completion', () => {
      gameState.set('achievements.projectsCompleted', 5);
      
      achievementSystem.checkAchievements();
      
      const progress = achievementSystem.getProgress('tenProjects');
      expect(progress).toBe(50); // 5 / 10 * 100
    });

    it('should unlock quantum computing achievement', () => {
      gameState.set('computing.quantumLevel', 1);
      
      achievementSystem.checkAchievements();
      
      const unlocked = gameState.get('achievements.unlocked');
      expect(unlocked.quantumComputing).toBeDefined();
    });
  });

  describe('Combat Achievements', () => {
    it('should unlock first victory achievement', () => {
      gameState.set('achievements.battlesWon', 1);
      
      achievementSystem.checkAchievements();
      
      const unlocked = gameState.get('achievements.unlocked');
      expect(unlocked.firstVictory).toBeDefined();
    });

    it('should track honor accumulation', () => {
      gameState.set('combat.honor', 5000);
      
      achievementSystem.checkAchievements();
      
      const progress = achievementSystem.getProgress('honorBound');
      expect(progress).toBe(50); // 5000 / 10000 * 100
    });
  });

  describe('Special Achievements', () => {
    it('should check manual labor achievement', () => {
      gameState.set('resources.totalClips', 10000);
      gameState.set('production.autoClippers', 0);
      
      achievementSystem.checkAchievements();
      
      const unlocked = gameState.get('achievements.unlocked');
      expect(unlocked.noAutoclippers).toBeDefined();
    });

    it('should check perfect balance achievement', () => {
      gameState.set('resources.clips', 1000);
      gameState.set('resources.funds', 1000);
      gameState.set('resources.wire', 1000);
      
      achievementSystem.checkAchievements();
      
      const unlocked = gameState.get('achievements.unlocked');
      expect(unlocked.perfectBalance).toBeDefined();
    });

    it('should check lucky number achievement', () => {
      gameState.set('resources.clips', 7777777);
      
      achievementSystem.checkAchievements();
      
      const unlocked = gameState.get('achievements.unlocked');
      expect(unlocked.luckyNumber).toBeDefined();
    });
  });

  describe('Achievement Progress and Statistics', () => {
    it('should calculate achievement progress correctly', () => {
      // Test progress calculation functionality
      gameState.reset();
      const freshSystem = new AchievementSystem();
      
      // Set up partial progress for wire efficiency achievement
      gameState.set('achievements.maxClipsPerSpool', 500);
      freshSystem.checkAchievements();
      
      const progress = freshSystem.getProgress('wireEfficiency');
      expect(progress).toBe(50); // 500 / 1000 * 100
    });

    it('should generate comprehensive statistics', () => {
      // Unlock a few achievements
      gameState.set('resources.totalClips', 1000);
      gameState.set('market.totalRevenue', 100);
      achievementSystem.checkAchievements();
      
      const stats = achievementSystem.getStatistics();
      expect(stats.totalUnlocked).toBeGreaterThan(0);
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.percentage).toBeGreaterThan(0);
      expect(stats.byCategory).toBeDefined();
      expect(stats.byRarity).toBeDefined();
    });

    it('should filter achievements by category', () => {
      const productionAchievements = achievementSystem.getAchievementsByCategory(AchievementCategory.PRODUCTION);
      expect(productionAchievements.length).toBeGreaterThan(0);
      
      productionAchievements.forEach(achievement => {
        expect(achievement.category).toBe(AchievementCategory.PRODUCTION);
      });
    });
  });

  describe('Achievement Export and Sharing', () => {
    it('should export achievement data', () => {
      // Unlock some achievements
      gameState.set('resources.totalClips', 1000);
      achievementSystem.checkAchievements();
      
      const exportData = achievementSystem.exportAchievements();
      expect(exportData.unlocked).toBeDefined();
      expect(exportData.stats).toBeDefined();
      expect(exportData.exportDate).toBeDefined();
    });

    it('should generate shareable string', () => {
      gameState.set('resources.totalClips', 1000);
      achievementSystem.checkAchievements();
      
      const shareString = achievementSystem.getShareableString();
      expect(shareString).toContain('Universal Paperclips Achievements');
      expect(shareString).toContain('/');
    });
  });

  describe('Achievement Tracking Integration', () => {
    it('should track project completion correctly', () => {
      const initialCount = gameState.get('achievements.projectsCompleted') || 0;
      
      achievementSystem.trackProjectCompleted();
      
      const newCount = gameState.get('achievements.projectsCompleted');
      expect(newCount).toBe(initialCount + 1);
    });

    it('should track battle victories correctly', () => {
      const initialCount = gameState.get('achievements.battlesWon') || 0;
      
      achievementSystem.trackBattleWon();
      
      const newCount = gameState.get('achievements.battlesWon');
      expect(newCount).toBe(initialCount + 1);
    });

    it('should track clips per spool correctly', () => {
      achievementSystem.trackClipsPerSpool(750);
      
      const maxClips = gameState.get('achievements.maxClipsPerSpool');
      expect(maxClips).toBe(750);
      
      // Track higher amount
      achievementSystem.trackClipsPerSpool(900);
      
      const newMaxClips = gameState.get('achievements.maxClipsPerSpool');
      expect(newMaxClips).toBe(900);
    });

    it('should reset spool tracking correctly', () => {
      achievementSystem.trackClipsPerSpool(500);
      achievementSystem.resetSpoolTracking();
      
      const currentClips = gameState.get('achievements.currentSpoolClips');
      expect(currentClips).toBe(0);
    });
  });

  describe('Game Time Tracking', () => {
    it('should initialize game time tracking', () => {
      const gameTime = gameState.get('achievements.gameTime');
      expect(gameTime).toBeDefined();
      expect(gameTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Achievement Notifications', () => {
    it('should have notification queue functionality', () => {
      gameState.reset();
      const freshSystem = new AchievementSystem();
      
      // Test that notification queue exists and can be accessed
      expect(Array.isArray(freshSystem.notificationQueue)).toBe(true);
      expect(freshSystem.notificationQueue).toEqual([]);
      
      // Test notification processing function exists
      expect(typeof freshSystem.processNotificationQueue).toBe('function');
    });
  });

  describe('Completionist Achievement', () => {
    it('should unlock completionist when all other achievements are unlocked', () => {
      // Get all achievement IDs except completionist
      const allAchievements = Object.keys(achievementSystem.achievements);
      const otherAchievements = allAchievements.filter(id => id !== 'completionist');
      
      // Mock unlocking all other achievements
      const unlocked = {};
      otherAchievements.forEach(id => {
        unlocked[id] = Date.now();
      });
      gameState.set('achievements.unlocked', unlocked);
      
      achievementSystem.checkAchievements();
      
      const finalUnlocked = gameState.get('achievements.unlocked');
      expect(finalUnlocked.completionist).toBeDefined();
    });
  });
});