/**
 * Universal Paperclips - Modern ES6 Implementation
 *
 * Main entry point that initializes all game systems and starts the game loop.
 * This replaces the legacy global variable architecture with a clean modular system.
 */

import { gameState } from './game/core/gameState.js';
import { gameLoop } from './game/core/gameLoop.js';
import { errorHandler } from './game/core/errorHandler.js';
import { performanceMonitor } from './game/core/performanceMonitor.js';

import ProductionSystem from './game/systems/production.js';
import MarketSystem from './game/systems/market.js';
import ComputingSystem from './game/systems/computing.js';
import CombatSystem from './game/systems/combat.js';
import ProjectsSystem from './game/systems/projects.js';
import { achievementSystem } from './game/systems/achievements.js';

import Renderer from './game/ui/renderer.js';
import EventsSystem from './game/ui/events.js';
import { achievementUI } from './game/ui/achievementUI.js';
import { accessibilityManager } from './game/ui/accessibility.js';

/**
 * Main Game class that orchestrates all systems
 */
class UniversalPaperclips {
  constructor() {
    this.initialized = false;
    this.systems = {};
    this.ui = {};

    // Initialize in the correct order
    this.initializeSystems();
    this.initializeUI();
    this.setupGameLoop();
    this.setupDebugInterface();

    errorHandler.info('Universal Paperclips initialized');
  }

  /**
   * Initialize all game systems
   */
  initializeSystems() {
    try {
      // Initialize systems in dependency order
      this.systems.production = new ProductionSystem(gameState);
      this.systems.market = new MarketSystem(gameState);
      this.systems.computing = new ComputingSystem(gameState);
      this.systems.combat = new CombatSystem(gameState);
      this.systems.projects = new ProjectsSystem(gameState);
      this.systems.achievements = achievementSystem;

      // Initialize achievement system
      achievementSystem.initialize();

      errorHandler.info('Game systems initialized');
    } catch (error) {
      errorHandler.handleError(error, 'game.initializeSystems', {}, true);
    }
  }

  /**
   * Initialize UI systems
   */
  initializeUI() {
    try {
      this.ui.renderer = new Renderer(gameState);
      this.ui.events = new EventsSystem(gameState, this.systems);
      this.ui.achievements = achievementUI;
      this.ui.accessibility = accessibilityManager;

      // Initialize achievement UI
      achievementUI.initialize();

      // Connect accessibility to game events
      this.setupAccessibilityEvents();

      errorHandler.info('UI systems initialized');
    } catch (error) {
      errorHandler.handleError(error, 'game.initializeUI', {}, true);
    }
  }

  /**
   * Set up accessibility event connections
   */
  setupAccessibilityEvents() {
    // Wire up game events to accessibility announcements
    gameState.on('milestone', (data) => {
      accessibilityManager.announceGameEvent('milestone', data);
    });

    gameState.on('unlock', (data) => {
      accessibilityManager.announceGameEvent('unlock', data);
    });

    gameState.on('achievement', (data) => {
      accessibilityManager.announceGameEvent('achievement', data);
    });

    gameState.on('warning', (data) => {
      accessibilityManager.announceGameEvent('warning', data);
    });

    gameState.on('purchase', (data) => {
      accessibilityManager.announceGameEvent('purchase', data);
    });

    gameState.on('insufficient', (data) => {
      accessibilityManager.announceGameEvent('insufficient', data);
    });
  }

  /**
   * Set up the main game loop
   */
  setupGameLoop() {
    try {
      // Register system updates with appropriate frequencies

      // Fast updates (100 FPS equivalent) - critical game logic
      gameLoop.addSystem('fast', this.systems.production.update, 'production');
      gameLoop.addSystem('fast', this.systems.market.update, 'market');
      gameLoop.addSystem('fast', this.systems.computing.update, 'computing');
      gameLoop.addSystem('fast', this.systems.combat.update, 'combat');

      // Medium updates (10 FPS equivalent) - UI and secondary logic
      gameLoop.addSystem('medium', this.systems.projects.update, 'projects');
      gameLoop.addSystem('medium', this.handleAutoSave.bind(this), 'autoSave');
      gameLoop.addSystem(
        'medium',
        this.systems.achievements.checkAchievements.bind(this.systems.achievements),
        'achievements'
      );

      // Slow updates (1 FPS equivalent) - background tasks
      gameLoop.addSystem('slow', this.updateGamePhase.bind(this), 'gamePhase');

      // Register renderer
      gameLoop.addRenderer(this.ui.renderer.render, 'main');

      errorHandler.info('Game loop configured');
    } catch (error) {
      errorHandler.handleError(error, 'game.setupGameLoop', {}, true);
    }
  }

  /**
   * Set up debug interface for browser console
   */
  setupDebugInterface() {
    // Expose debug interface to global scope
    window.UniversalPaperclips = {
      debug: {
        getState: () => gameState.getSnapshot(),
        getStats: () => this.getGameStats(),
        getPerformance: () => performanceMonitor.getReport(),
        getErrors: () => errorHandler.getRecentErrors(),

        // Resource cheats for testing
        addClips: (amount = 1000) => {
          gameState.increment('resources.clips', amount);
          gameState.increment('resources.totalClips', amount);
          gameState.increment('resources.unsoldClips', amount);
          errorHandler.debug(`Added ${amount} clips`);
        },

        addFunds: (amount = 1000) => {
          gameState.increment('resources.funds', amount);
          errorHandler.debug(`Added $${amount}`);
        },

        addWire: (amount = 1000) => {
          gameState.increment('resources.wire', amount);
          errorHandler.debug(`Added ${amount} wire`);
        },

        addOperations: (amount = 10000) => {
          gameState.increment('computing.operations', amount);
          errorHandler.debug(`Added ${amount} operations`);
        },

        addCreativity: (amount = 1000) => {
          gameState.increment('computing.creativity.amount', amount);
          errorHandler.debug(`Added ${amount} creativity`);
        },

        // System controls
        resetGame: () => {
          if (confirm('Really reset? This cannot be undone.')) {
            this.reset();
          }
        },

        saveGame: () => gameState.save(),
        loadGame: () => gameState.load(),

        // Performance controls
        setLogLevel: (level) => errorHandler.setLogLevel(level),
        enablePerformanceMonitoring: (enabled) => performanceMonitor.setEnabled(enabled),

        // System access
        systems: this.systems,
        gameState: gameState,
        gameLoop: gameLoop,
        errorHandler: errorHandler,
        performanceMonitor: performanceMonitor
      }
    };

    // Expose achievement system globally for UI access
    window.achievementSystem = achievementSystem;

    errorHandler.info('Debug interface available at window.UniversalPaperclips.debug');
  }

  /**
   * Handle automatic saving
   */
  handleAutoSave(timestamp, deltaTime) {
    // Auto-save every 30 seconds
    const lastSave = gameState.get('gameState.lastAutoSave') || 0;
    if (timestamp - lastSave > 30000) {
      gameState.save();
      gameState.set('gameState.lastAutoSave', timestamp);
    }
  }

  /**
   * Update game phase based on progress
   */
  updateGamePhase(timestamp, deltaTime) {
    const flags = gameState.get('gameState.flags');
    const clips = gameState.get('resources.clips');
    const funds = gameState.get('resources.funds');
    const autoClippers = gameState.get('manufacturing.clipmakers.level');
    const megaClippers = gameState.get('manufacturing.megaClippers.level');
    const processors = gameState.get('computing.processors');
    const unusedClips = gameState.get('resources.unusedClips');

    // Enable business section after first AutoClipper
    if (autoClippers >= 1 && flags.autoClipper === 0) {
      gameState.set('gameState.flags.autoClipper', 1);
      errorHandler.info('Business section unlocked');
    }

    // Enable MegaClipper section
    if (megaClippers >= 1 && flags.megaClipper === 0) {
      gameState.set('gameState.flags.megaClipper', 1);
      errorHandler.info('Manufacturing section unlocked');
    }

    // Enable computing section
    if (processors >= 1 && flags.comp === 0) {
      gameState.set('gameState.flags.comp', 1);
      errorHandler.info('Computing section unlocked');
    }

    // Enable projects section
    if (processors >= 5 && flags.projects === 0) {
      gameState.set('gameState.flags.projects', 1);
      errorHandler.info('Projects section unlocked');
    }

    // Enable space exploration
    if (unusedClips >= 5000000000 && flags.space === 0) {
      gameState.set('gameState.flags.space', 1);
      errorHandler.info('Space exploration unlocked');
    }
  }

  /**
   * Start the game
   */
  start() {
    if (this.initialized) {
      errorHandler.warn('Game already initialized');
      return;
    }

    try {
      // Try to load saved game
      const loaded = gameState.load();
      if (loaded) {
        errorHandler.info('Saved game loaded');
      } else {
        errorHandler.info('Starting new game');
      }

      // Start the game loop
      gameLoop.start();

      this.initialized = true;
      errorHandler.info('Game started successfully');
    } catch (error) {
      errorHandler.handleError(error, 'game.start', {}, true);
    }
  }

  /**
   * Stop the game
   */
  stop() {
    if (!this.initialized) {
      return;
    }

    try {
      // Save before stopping
      gameState.save();

      // Stop game loop
      gameLoop.stop();

      // Cleanup UI
      this.ui.events?.cleanup();

      this.initialized = false;
      errorHandler.info('Game stopped');
    } catch (error) {
      errorHandler.handleError(error, 'game.stop');
    }
  }

  /**
   * Reset the entire game
   */
  reset() {
    try {
      // Stop game loop
      gameLoop.stop();

      // Reset all systems
      Object.values(this.systems).forEach((system) => {
        if (system.reset) {
          system.reset();
        }
      });

      // Reset game state
      gameState.reset();

      // Reset UI
      this.ui.renderer?.reset();

      // Restart game loop
      gameLoop.start();

      errorHandler.info('Game reset completed');
    } catch (error) {
      errorHandler.handleError(error, 'game.reset', {}, true);
    }
  }

  /**
   * Get comprehensive game statistics
   */
  getGameStats() {
    return {
      gameState: {
        clips: gameState.get('resources.clips'),
        funds: gameState.get('resources.funds'),
        wire: gameState.get('resources.wire'),
        elapsedTime: gameState.get('gameState.elapsedTime'),
        ticks: gameState.get('gameState.ticks')
      },
      systems: {
        production: this.systems.production?.getStats(),
        market: this.systems.market?.getStats(),
        computing: this.systems.computing?.getStats(),
        combat: this.systems.combat?.getStats(),
        projects: this.systems.projects?.getStats()
      },
      performance: performanceMonitor.getReport(),
      errors: errorHandler.getStats(),
      ui: {
        renderer: this.ui.renderer?.getStats(),
        events: this.ui.events?.getStats()
      },
      gameLoop: gameLoop.getStats()
    };
  }

  /**
   * Export game data
   */
  exportGame() {
    return {
      gameState: gameState.export(),
      systemStates: {
        production: this.systems.production?.getSaveData?.(),
        market: this.systems.market?.getSaveData?.(),
        computing: this.systems.computing?.getSaveData?.(),
        combat: this.systems.combat?.getSaveData?.(),
        projects: this.systems.projects?.getSaveData?.()
      },
      timestamp: Date.now(),
      version: '2.0.0'
    };
  }

  /**
   * Import game data
   */
  importGame(data) {
    try {
      // Import game state
      gameState.import(data.gameState);

      // Import system states if available
      if (data.systemStates) {
        Object.entries(data.systemStates).forEach(([systemName, saveData]) => {
          const system = this.systems[systemName];
          if (system?.loadSaveData) {
            system.loadSaveData(saveData);
          }
        });
      }

      errorHandler.info('Game data imported successfully');
      return true;
    } catch (error) {
      errorHandler.handleError(error, 'game.importGame');
      return false;
    }
  }
}

// Initialize and start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new UniversalPaperclips();
    game.start();
  } catch (error) {
    console.error('Failed to initialize Universal Paperclips:', error);
  }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  try {
    gameState.save();
  } catch (error) {
    console.warn('Failed to save on page unload:', error);
  }
});

export default UniversalPaperclips;
