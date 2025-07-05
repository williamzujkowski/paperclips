/**
 * @fileoverview Achievement system for Universal Paperclips
 * Tracks player accomplishments and milestones
 */

import { gameState } from '../core/gameState.js';
import { errorHandler } from '../core/errorHandler.js';
import { formatNumber } from '../../utils/formatting.js';

/**
 * Achievement categories
 * @enum {string}
 */
export const AchievementCategory = {
  PRODUCTION: 'production',
  ECONOMIC: 'economic',
  EFFICIENCY: 'efficiency',
  SPEED: 'speed',
  DISCOVERY: 'discovery',
  COMBAT: 'combat',
  SPECIAL: 'special'
};

/**
 * Achievement rarity levels
 * @enum {string}
 */
export const AchievementRarity = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

/**
 * Achievement definitions
 * @type {Object<string, Achievement>}
 */
const ACHIEVEMENTS = {
  // Production achievements
  firstClip: {
    id: 'firstClip',
    name: 'Baby Steps',
    description: 'Create your first paperclip',
    category: AchievementCategory.PRODUCTION,
    rarity: AchievementRarity.COMMON,
    icon: '📎',
    condition: (state) => state.resources.clips >= 1,
    progress: (state) => Math.min(state.resources.clips, 1),
    maxProgress: 1
  },

  hundred: {
    id: 'hundred',
    name: 'Century',
    description: 'Create 100 paperclips',
    category: AchievementCategory.PRODUCTION,
    rarity: AchievementRarity.COMMON,
    icon: '💯',
    condition: (state) => state.resources.totalClips >= 100,
    progress: (state) => Math.min(state.resources.totalClips, 100),
    maxProgress: 100
  },

  thousand: {
    id: 'thousand',
    name: 'Kilopaper',
    description: 'Create 1,000 paperclips',
    category: AchievementCategory.PRODUCTION,
    rarity: AchievementRarity.COMMON,
    icon: '🏭',
    condition: (state) => state.resources.totalClips >= 1000,
    progress: (state) => Math.min(state.resources.totalClips, 1000),
    maxProgress: 1000
  },

  million: {
    id: 'million',
    name: 'Millionaire',
    description: 'Create 1 million paperclips',
    category: AchievementCategory.PRODUCTION,
    rarity: AchievementRarity.UNCOMMON,
    icon: '🏆',
    condition: (state) => state.resources.totalClips >= 1000000,
    progress: (state) => Math.min(state.resources.totalClips, 1000000),
    maxProgress: 1000000
  },

  billion: {
    id: 'billion',
    name: 'Billionaire',
    description: 'Create 1 billion paperclips',
    category: AchievementCategory.PRODUCTION,
    rarity: AchievementRarity.RARE,
    icon: '🌟',
    condition: (state) => state.resources.totalClips >= 1000000000,
    progress: (state) => Math.min(state.resources.totalClips, 1000000000),
    maxProgress: 1000000000
  },

  trillion: {
    id: 'trillion',
    name: 'Clip Tycoon',
    description: 'Create 1 trillion paperclips',
    category: AchievementCategory.PRODUCTION,
    rarity: AchievementRarity.EPIC,
    icon: '👑',
    condition: (state) => state.resources.totalClips >= 1000000000000,
    progress: (state) => Math.min(state.resources.totalClips, 1000000000000),
    maxProgress: 1000000000000
  },

  quadrillion: {
    id: 'quadrillion',
    name: 'Universal Domination',
    description: 'Create 1 quadrillion paperclips',
    category: AchievementCategory.PRODUCTION,
    rarity: AchievementRarity.LEGENDARY,
    icon: '🌌',
    condition: (state) => state.resources.totalClips >= 1000000000000000,
    progress: (state) => Math.min(state.resources.totalClips, 1000000000000000),
    maxProgress: 1000000000000000
  },

  // Economic achievements
  firstSale: {
    id: 'firstSale',
    name: 'First Sale',
    description: 'Sell your first paperclip',
    category: AchievementCategory.ECONOMIC,
    rarity: AchievementRarity.COMMON,
    icon: '💰',
    condition: (state) => state.market.totalRevenue > 0,
    progress: (state) => (state.market.totalRevenue > 0 ? 1 : 0),
    maxProgress: 1
  },

  profitMargin: {
    id: 'profitMargin',
    name: 'Profit Master',
    description: 'Achieve a price of $5.00 or more per clip',
    category: AchievementCategory.ECONOMIC,
    rarity: AchievementRarity.UNCOMMON,
    icon: '📈',
    condition: (state) => state.market.price >= 5,
    progress: (state) => Math.min(state.market.price, 5),
    maxProgress: 5
  },

  richie: {
    id: 'richie',
    name: 'Rich Clipper',
    description: 'Accumulate $10,000 in funds',
    category: AchievementCategory.ECONOMIC,
    rarity: AchievementRarity.UNCOMMON,
    icon: '💵',
    condition: (state) => state.resources.funds >= 10000,
    progress: (state) => Math.min(state.resources.funds, 10000),
    maxProgress: 10000
  },

  millionaireFunds: {
    id: 'millionaireFunds',
    name: 'Cash Flow King',
    description: 'Accumulate $1 million in funds',
    category: AchievementCategory.ECONOMIC,
    rarity: AchievementRarity.RARE,
    icon: '🏦',
    condition: (state) => state.resources.funds >= 1000000,
    progress: (state) => Math.min(state.resources.funds, 1000000),
    maxProgress: 1000000
  },

  // Efficiency achievements
  wireEfficiency: {
    id: 'wireEfficiency',
    name: 'Wire Wizard',
    description: 'Create 1000 clips from a single spool of wire',
    category: AchievementCategory.EFFICIENCY,
    rarity: AchievementRarity.UNCOMMON,
    icon: '🧵',
    condition: (state) => state.achievements.maxClipsPerSpool >= 1000,
    progress: (state) => Math.min(state.achievements.maxClipsPerSpool || 0, 1000),
    maxProgress: 1000
  },

  autoClipper: {
    id: 'autoClipper',
    name: 'Automation Expert',
    description: 'Have 100 AutoClippers',
    category: AchievementCategory.EFFICIENCY,
    rarity: AchievementRarity.UNCOMMON,
    icon: '🤖',
    condition: (state) => state.production.autoClippers >= 100,
    progress: (state) => Math.min(state.production.autoClippers, 100),
    maxProgress: 100
  },

  megaFactory: {
    id: 'megaFactory',
    name: 'MegaFactory',
    description: 'Have 100 MegaClippers',
    category: AchievementCategory.EFFICIENCY,
    rarity: AchievementRarity.RARE,
    icon: '🏗️',
    condition: (state) => state.production.megaClippers >= 100,
    progress: (state) => Math.min(state.production.megaClippers, 100),
    maxProgress: 100
  },

  clipRate1000: {
    id: 'clipRate1000',
    name: 'Speed Demon',
    description: 'Achieve 1,000 clips per second',
    category: AchievementCategory.EFFICIENCY,
    rarity: AchievementRarity.RARE,
    icon: '⚡',
    condition: (state) => state.production.clipRate >= 1000,
    progress: (state) => Math.min(state.production.clipRate, 1000),
    maxProgress: 1000
  },

  // Speed achievements
  speedRun1Hour: {
    id: 'speedRun1Hour',
    name: 'Speed Runner',
    description: 'Create 1 million clips in under 1 hour',
    category: AchievementCategory.SPEED,
    rarity: AchievementRarity.RARE,
    icon: '⏱️',
    condition: (state) =>
      state.resources.totalClips >= 1000000 && state.achievements.gameTime < 3600,
    progress: (state) => (state.resources.totalClips >= 1000000 ? 1 : 0),
    maxProgress: 1,
    hidden: true
  },

  speedRun30Min: {
    id: 'speedRun30Min',
    name: 'Lightning Fast',
    description: 'Create 100,000 clips in under 30 minutes',
    category: AchievementCategory.SPEED,
    rarity: AchievementRarity.EPIC,
    icon: '🏃',
    condition: (state) =>
      state.resources.totalClips >= 100000 && state.achievements.gameTime < 1800,
    progress: (state) => (state.resources.totalClips >= 100000 ? 1 : 0),
    maxProgress: 1,
    hidden: true
  },

  // Discovery achievements
  firstProject: {
    id: 'firstProject',
    name: 'Researcher',
    description: 'Complete your first project',
    category: AchievementCategory.DISCOVERY,
    rarity: AchievementRarity.COMMON,
    icon: '🔬',
    condition: (state) => state.achievements.projectsCompleted >= 1,
    progress: (state) => Math.min(state.achievements.projectsCompleted || 0, 1),
    maxProgress: 1
  },

  tenProjects: {
    id: 'tenProjects',
    name: 'Mad Scientist',
    description: 'Complete 10 projects',
    category: AchievementCategory.DISCOVERY,
    rarity: AchievementRarity.UNCOMMON,
    icon: '🧪',
    condition: (state) => state.achievements.projectsCompleted >= 10,
    progress: (state) => Math.min(state.achievements.projectsCompleted || 0, 10),
    maxProgress: 10
  },

  quantumComputing: {
    id: 'quantumComputing',
    name: 'Quantum Leap',
    description: 'Unlock Quantum Computing',
    category: AchievementCategory.DISCOVERY,
    rarity: AchievementRarity.RARE,
    icon: '🔮',
    condition: (state) => state.computing.quantumLevel > 0,
    progress: (state) => (state.computing.quantumLevel > 0 ? 1 : 0),
    maxProgress: 1
  },

  spaceExploration: {
    id: 'spaceExploration',
    name: 'To The Stars',
    description: 'Launch your first probe',
    category: AchievementCategory.DISCOVERY,
    rarity: AchievementRarity.EPIC,
    icon: '🚀',
    condition: (state) => state.achievements.probesLaunched >= 1,
    progress: (state) => Math.min(state.achievements.probesLaunched || 0, 1),
    maxProgress: 1
  },

  // Combat achievements
  firstVictory: {
    id: 'firstVictory',
    name: 'Victor',
    description: 'Win your first space battle',
    category: AchievementCategory.COMBAT,
    rarity: AchievementRarity.UNCOMMON,
    icon: '⚔️',
    condition: (state) => state.achievements.battlesWon >= 1,
    progress: (state) => Math.min(state.achievements.battlesWon || 0, 1),
    maxProgress: 1
  },

  warMaster: {
    id: 'warMaster',
    name: 'War Master',
    description: 'Win 100 space battles',
    category: AchievementCategory.COMBAT,
    rarity: AchievementRarity.RARE,
    icon: '🎖️',
    condition: (state) => state.achievements.battlesWon >= 100,
    progress: (state) => Math.min(state.achievements.battlesWon || 0, 100),
    maxProgress: 100
  },

  honorBound: {
    id: 'honorBound',
    name: 'Honor Bound',
    description: 'Accumulate 10,000 honor',
    category: AchievementCategory.COMBAT,
    rarity: AchievementRarity.EPIC,
    icon: '🛡️',
    condition: (state) => state.combat.honor >= 10000,
    progress: (state) => Math.min(state.combat.honor || 0, 10000),
    maxProgress: 10000
  },

  // Special achievements
  noAutoclippers: {
    id: 'noAutoclippers',
    name: 'Manual Labor',
    description: 'Create 10,000 clips without any AutoClippers',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.RARE,
    icon: '✋',
    condition: (state) =>
      state.resources.totalClips >= 10000 && state.production.autoClippers === 0,
    progress: (state) =>
      state.production.autoClippers === 0 ? Math.min(state.resources.totalClips, 10000) : 0,
    maxProgress: 10000,
    hidden: true
  },

  perfectBalance: {
    id: 'perfectBalance',
    name: 'Perfect Balance',
    description: 'Have exactly 1,000 of clips, funds, and wire',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.EPIC,
    icon: '⚖️',
    condition: (state) =>
      state.resources.clips === 1000 &&
      state.resources.funds === 1000 &&
      state.resources.wire === 1000,
    progress: (state) =>
      state.resources.clips === 1000 &&
      state.resources.funds === 1000 &&
      state.resources.wire === 1000
        ? 1
        : 0,
    maxProgress: 1,
    hidden: true
  },

  luckyNumber: {
    id: 'luckyNumber',
    name: 'Lucky Seven',
    description: 'Have exactly 7,777,777 clips',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.LEGENDARY,
    icon: '🍀',
    condition: (state) => state.resources.clips === 7777777,
    progress: (state) => (state.resources.clips === 7777777 ? 1 : 0),
    maxProgress: 1,
    hidden: true
  },

  completionist: {
    id: 'completionist',
    name: 'Completionist',
    description: 'Unlock all other achievements',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.LEGENDARY,
    icon: '🏅',
    condition: (state) => {
      // Will be checked manually in the achievement system
      return false;
    },
    progress: (state) => {
      const unlocked = Object.keys(state.achievements.unlocked || {});
      return unlocked.filter((id) => id !== 'completionist').length;
    },
    maxProgress: 30 // Will be updated dynamically
  }
};

/**
 * Achievement system class
 */
export class AchievementSystem {
  constructor() {
    this.achievements = ACHIEVEMENTS;
    this.listeners = [];
    this.notificationQueue = [];
    this.isProcessing = false;

    // Initialize achievement state
    if (!gameState.get('achievements')) {
      gameState.set('achievements', {
        unlocked: {},
        progress: {},
        stats: {
          totalUnlocked: 0,
          commonUnlocked: 0,
          uncommonUnlocked: 0,
          rareUnlocked: 0,
          epicUnlocked: 0,
          legendaryUnlocked: 0
        },
        gameTime: 0,
        projectsCompleted: 0,
        maxClipsPerSpool: 0,
        probesLaunched: 0,
        battlesWon: 0,
        currentSpoolClips: 0
      });
    }

    // Start game timer
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
  }

  /**
   * Initialize the achievement system
   */
  initialize() {
    errorHandler.info('Initializing achievement system');

    // Update game time
    setInterval(() => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
      this.lastUpdateTime = currentTime;

      const gameTime = gameState.get('achievements.gameTime') || 0;
      gameState.set('achievements.gameTime', gameTime + deltaTime);
    }, 1000);
  }

  /**
   * Check all achievements for completion
   */
  checkAchievements() {
    try {
      const state = {
        resources: gameState.get('resources'),
        production: gameState.get('production'),
        market: gameState.get('market'),
        computing: gameState.get('computing'),
        combat: gameState.get('combat'),
        achievements: gameState.get('achievements')
      };

      const unlocked = gameState.get('achievements.unlocked') || {};
      const progress = gameState.get('achievements.progress') || {};

      for (const [id, achievement] of Object.entries(this.achievements)) {
        if (!unlocked[id]) {
          // Special handling for completionist achievement
          if (id === 'completionist') {
            const totalAchievements = Object.keys(this.achievements).length - 1; // Exclude completionist
            const unlockedCount = Object.keys(unlocked).filter(
              (aid) => aid !== 'completionist'
            ).length;

            // Update max progress dynamically
            achievement.maxProgress = totalAchievements;
            progress[id] = unlockedCount;
            gameState.set(`achievements.progress.${id}`, unlockedCount);

            // Check if all other achievements are unlocked
            if (unlockedCount >= totalAchievements) {
              this.unlockAchievement(id);
            }
            continue;
          }

          // Update progress
          const currentProgress = achievement.progress(state);
          if (currentProgress !== progress[id]) {
            progress[id] = currentProgress;
            gameState.set(`achievements.progress.${id}`, currentProgress);
          }

          // Check if achievement is completed
          if (achievement.condition(state)) {
            this.unlockAchievement(id);
          }
        }
      }
    } catch (error) {
      errorHandler.log('error', 'Error checking achievements', error);
    }
  }

  /**
   * Unlock an achievement
   * @param {string} achievementId - The achievement ID
   */
  unlockAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement) return;

    const unlocked = gameState.get('achievements.unlocked') || {};
    if (unlocked[achievementId]) return;

    // Mark as unlocked
    unlocked[achievementId] = Date.now();
    gameState.set(`achievements.unlocked.${achievementId}`, unlocked[achievementId]);

    // Update stats
    const stats = gameState.get('achievements.stats');
    stats.totalUnlocked++;
    stats[`${achievement.rarity}Unlocked`]++;
    gameState.set('achievements.stats', stats);

    // Queue notification
    this.notificationQueue.push(achievement);
    this.processNotificationQueue();

    // Notify listeners
    this.notifyListeners(achievement);

    errorHandler.info(`Achievement unlocked: ${achievement.name}`);
  }

  /**
   * Process notification queue
   */
  processNotificationQueue() {
    if (this.isProcessing || this.notificationQueue.length === 0) return;

    this.isProcessing = true;
    const achievement = this.notificationQueue.shift();

    // Create notification
    this.showNotification(achievement);

    // Process next notification after delay
    setTimeout(() => {
      this.isProcessing = false;
      this.processNotificationQueue();
    }, 3000);
  }

  /**
   * Show achievement notification
   * @param {Object} achievement - The achievement object
   */
  showNotification(achievement) {
    // This will be implemented by the UI component
    const event = new CustomEvent('achievementUnlocked', { detail: achievement });
    window.dispatchEvent(event);
  }

  /**
   * Add achievement listener
   * @param {Function} callback - Callback function
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove achievement listener
   * @param {Function} callback - Callback function
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter((l) => l !== callback);
  }

  /**
   * Notify all listeners
   * @param {Object} achievement - The achievement that was unlocked
   */
  notifyListeners(achievement) {
    this.listeners.forEach((listener) => {
      try {
        listener(achievement);
      } catch (error) {
        errorHandler.log('error', 'Error notifying achievement listener', error);
      }
    });
  }

  /**
   * Get achievement progress
   * @param {string} achievementId - The achievement ID
   * @returns {number} Progress percentage (0-100)
   */
  getProgress(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement) return 0;

    const progress = gameState.get(`achievements.progress.${achievementId}`) || 0;
    const percentage = (progress / achievement.maxProgress) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  }

  /**
   * Get all achievements by category
   * @param {string} category - The category to filter by
   * @returns {Array} Array of achievements
   */
  getAchievementsByCategory(category) {
    return Object.values(this.achievements).filter((a) => a.category === category);
  }

  /**
   * Get achievement statistics
   * @returns {Object} Achievement statistics
   */
  getStatistics() {
    const stats = gameState.get('achievements.stats');
    const total = Object.keys(this.achievements).length;

    return {
      ...stats,
      total,
      percentage: (stats.totalUnlocked / total) * 100,
      byCategory: this.getCategoryStats(),
      byRarity: this.getRarityStats()
    };
  }

  /**
   * Get category statistics
   * @returns {Object} Category statistics
   */
  getCategoryStats() {
    const stats = {};
    const unlocked = gameState.get('achievements.unlocked') || {};

    for (const category of Object.values(AchievementCategory)) {
      const achievements = this.getAchievementsByCategory(category);
      const unlockedCount = achievements.filter((a) => unlocked[a.id]).length;

      stats[category] = {
        total: achievements.length,
        unlocked: unlockedCount,
        percentage: (unlockedCount / achievements.length) * 100
      };
    }

    return stats;
  }

  /**
   * Get rarity statistics
   * @returns {Object} Rarity statistics
   */
  getRarityStats() {
    const stats = {};
    const unlocked = gameState.get('achievements.unlocked') || {};

    for (const rarity of Object.values(AchievementRarity)) {
      const achievements = Object.values(this.achievements).filter((a) => a.rarity === rarity);
      const unlockedCount = achievements.filter((a) => unlocked[a.id]).length;

      stats[rarity] = {
        total: achievements.length,
        unlocked: unlockedCount,
        percentage: (unlockedCount / achievements.length) * 100
      };
    }

    return stats;
  }

  /**
   * Export achievements data
   * @returns {Object} Achievements data
   */
  exportAchievements() {
    return {
      unlocked: gameState.get('achievements.unlocked') || {},
      progress: gameState.get('achievements.progress') || {},
      stats: gameState.get('achievements.stats'),
      gameTime: gameState.get('achievements.gameTime'),
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Get shareable achievement string
   * @returns {string} Shareable achievement summary
   */
  getShareableString() {
    const stats = this.getStatistics();
    const unlocked = gameState.get('achievements.unlocked') || {};
    const legendaryCount = Object.values(this.achievements).filter(
      (a) => a.rarity === AchievementRarity.LEGENDARY && unlocked[a.id]
    ).length;

    return (
      `Universal Paperclips Achievements: ${stats.totalUnlocked}/${stats.total} (${stats.percentage.toFixed(1)}%)` +
      `\n🏅 Legendary: ${legendaryCount}` +
      `\n⭐ Epic: ${stats.epicUnlocked}` +
      `\n💎 Rare: ${stats.rareUnlocked}`
    );
  }

  /**
   * Track project completion
   */
  trackProjectCompleted() {
    const count = (gameState.get('achievements.projectsCompleted') || 0) + 1;
    gameState.set('achievements.projectsCompleted', count);
    this.checkAchievements();
  }

  /**
   * Track probe launch
   */
  trackProbeLaunched() {
    const count = (gameState.get('achievements.probesLaunched') || 0) + 1;
    gameState.set('achievements.probesLaunched', count);
    this.checkAchievements();
  }

  /**
   * Track battle victory
   */
  trackBattleWon() {
    const count = (gameState.get('achievements.battlesWon') || 0) + 1;
    gameState.set('achievements.battlesWon', count);
    this.checkAchievements();
  }

  /**
   * Track clips per spool
   * @param {number} clipCount - Number of clips created from current spool
   */
  trackClipsPerSpool(clipCount) {
    const max = gameState.get('achievements.maxClipsPerSpool') || 0;
    if (clipCount > max) {
      gameState.set('achievements.maxClipsPerSpool', clipCount);
    }
    gameState.set('achievements.currentSpoolClips', clipCount);
    this.checkAchievements();
  }

  /**
   * Reset spool tracking
   */
  resetSpoolTracking() {
    gameState.set('achievements.currentSpoolClips', 0);
  }
}

// Create singleton instance
export const achievementSystem = new AchievementSystem();
