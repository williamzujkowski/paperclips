/**
 * Universal Paperclips - Main Entry Point
 * Modern modular version of the classic incremental game
 */

import { gameState } from './game/core/gameState.js';
import { gameLoop } from './game/core/gameLoop.js';
import { errorHandler } from './game/core/errorHandler.js';
import { phaseManager } from './game/core/phaseManager.js';
import { productionSystem } from './game/systems/production.js';
import { marketSystem } from './game/systems/market.js';
import { computingSystem } from './game/systems/computing.js';
import { combatSystem } from './game/systems/combat.js';
import { projectsSystem } from './game/systems/projects.js';
import { uiRenderer } from './game/ui/renderer.js';
import { setupEventHandlers } from './game/ui/events.js';
import { devDashboard } from './game/ui/devDashboard.js';

// Game initialization
async function initGame() {
  errorHandler.info('Universal Paperclips - Modern Edition');
  errorHandler.info('Original by Frank Lantz and Bennett Foddy');

  // Set error handler log level based on environment
  const isDev =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  errorHandler.setLogLevel(isDev ? 'debug' : 'info');

  // Initialize dev dashboard in development
  if (isDev) {
    devDashboard.init();
  }

  // Try to load saved game
  try {
    const loaded = gameState.load();
    if (loaded) {
      errorHandler.info('Save game loaded successfully');
    } else {
      errorHandler.info('Starting new game');
    }
  } catch (error) {
    errorHandler.handleError(error, 'initGame.load');
    errorHandler.warn('Failed to load save, starting new game');
  }

  // Initialize phase manager for lazy loading
  try {
    await phaseManager.init();
    errorHandler.info(`Game initialized in ${phaseManager.getCurrentPhase()} phase`);
  } catch (error) {
    errorHandler.handleError(error, 'initGame.phaseManager');
    errorHandler.warn('Phase manager failed, continuing with all modules loaded');
  }

  // Register update handlers with error boundaries
  gameLoop.addUpdateHandler(
    errorHandler.createErrorBoundary((deltaTime, state) => {
      const currentTime = Date.now();

      // Always update core systems
      productionSystem.update(deltaTime);
      computingSystem.update(deltaTime);

      // Update phase-specific systems
      const currentPhase = phaseManager.getCurrentPhase();

      if (currentPhase === 'human') {
        // Human phase: market is active
        marketSystem.update(deltaTime, currentTime);
      }

      if (currentPhase === 'space' || currentPhase === 'endgame') {
        // Space phase: combat and lazy-loaded systems
        combatSystem.update(deltaTime, currentTime);

        // Update lazy-loaded systems if available
        const swarmModule = phaseManager.isModuleLoaded('swarm');
        if (swarmModule) {
          const swarmSystem = phaseManager.getLoadedModules().get('swarm').default;
          if (swarmSystem && swarmSystem.update) {
            swarmSystem.update(deltaTime);
          }
        }

        const explorationModule = phaseManager.isModuleLoaded('exploration');
        if (explorationModule) {
          const explorationSystem = phaseManager.getLoadedModules().get('exploration').default;
          if (explorationSystem && explorationSystem.update) {
            explorationSystem.update(deltaTime);
          }
        }
      }

      // Update elapsed time
      state.increment('ui.elapsedTime', deltaTime);
    }, 'mainUpdateHandler'),
  );

  // Register render handlers with error boundaries
  gameLoop.addRenderHandler(
    errorHandler.createErrorBoundary((state) => {
      uiRenderer.render(state);
      uiRenderer.updateButtonStates(state);
    }, 'mainRenderHandler'),
  );

  // Set up UI event handlers with error handling
  try {
    setupEventHandlers();
  } catch (error) {
    errorHandler.handleError(error, 'initGame.setupEventHandlers');
  }

  // Start the game loop
  gameLoop.start();

  // Initial render
  uiRenderer.render(gameState);

  // Set up autosave with error handling
  setInterval(() => {
    try {
      gameState.save();
    } catch (error) {
      errorHandler.handleError(error, 'autosave.interval');
    }
  }, 30000); // Every 30 seconds
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

// Import performance monitor for debugging
import { performanceMonitor } from './game/core/performanceMonitor.js';
import { memoryMonitor } from './game/core/memoryMonitor.js';

// Export for debugging in console
window.UniversalPaperclips = {
  errorHandler,
  performanceMonitor,
  memoryMonitor,
  devDashboard,
  phaseManager,
  gameState,
  gameLoop,
  productionSystem,
  marketSystem,
  computingSystem,
  combatSystem,
  projectsSystem,
  uiRenderer,
  // Debug helpers
  debug: {
    getState: () => gameState,
    setState: (path, value) => gameState.set(path, value),
    addClips: (amount) => gameState.increment('resources.clips', amount),
    addFunds: (amount) => gameState.increment('resources.funds', amount),
    addWire: (amount) => gameState.increment('resources.wire', amount),
    unlockAll: () => {
      // Unlock all features for testing
      Object.keys(gameState.flags).forEach((flag) => {
        gameState.set(`flags.${flag}`, true);
      });
    },
    reset: () => {
      if (confirm('Are you sure you want to reset the game?')) {
        gameState.reset();
        location.reload();
      }
    },
    // Error and performance debugging
    getErrors: () => errorHandler.getErrorLog(),
    clearErrors: () => errorHandler.clearErrorLog(),
    getPerformance: () => performanceMonitor.getReport(),
    resetPerformance: () => performanceMonitor.reset(),
    setLogLevel: (level) => errorHandler.setLogLevel(level),
    // Memory debugging
    getMemory: () => memoryMonitor.getStats(),
    getMemoryReport: () => memoryMonitor.generateReport(),
    startMemoryMonitor: () => memoryMonitor.start(),
    stopMemoryMonitor: () => memoryMonitor.stop(),
    forceGC: () => memoryMonitor.forceGC(),
  },
};

errorHandler.info('Game loaded. Use window.UniversalPaperclips.debug for debugging tools.');
