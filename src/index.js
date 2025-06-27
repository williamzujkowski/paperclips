/**
 * Universal Paperclips - Main Entry Point
 * Modern modular version of the classic incremental game
 */

import { gameState } from './game/core/gameState.js';
import { gameLoop } from './game/core/gameLoop.js';
import { errorHandler } from './game/core/errorHandler.js';
import { productionSystem } from './game/systems/production.js';
import { marketSystem } from './game/systems/market.js';
import { computingSystem } from './game/systems/computing.js';
import { combatSystem } from './game/systems/combat.js';
import { projectsSystem } from './game/systems/projects.js';
import { uiRenderer } from './game/ui/renderer.js';
import { setupEventHandlers } from './game/ui/events.js';
import { devDashboard } from './game/ui/devDashboard.js';

// Game initialization
function initGame() {
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

  // Register update handlers with error boundaries
  gameLoop.addUpdateHandler(
    errorHandler.createErrorBoundary((deltaTime, state) => {
      const currentTime = Date.now();

      // Update game systems
      productionSystem.update(deltaTime);
      marketSystem.update(deltaTime, currentTime);
      computingSystem.update(deltaTime);
      combatSystem.update(deltaTime, currentTime);

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

// Export for debugging in console
window.UniversalPaperclips = {
  errorHandler,
  performanceMonitor,
  devDashboard,
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
  },
};

errorHandler.info('Game loaded. Use window.UniversalPaperclips.debug for debugging tools.');
