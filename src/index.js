/**
 * Universal Paperclips - Main Entry Point
 * Modern modular version of the classic incremental game
 */

import { gameState } from './game/core/gameState.js';
import { gameLoop } from './game/core/gameLoop.js';
import { productionSystem } from './game/systems/production.js';
import { marketSystem } from './game/systems/market.js';
import { uiRenderer } from './game/ui/renderer.js';
import { setupEventHandlers } from './game/ui/events.js';

// Game initialization
function initGame() {
  console.log('Universal Paperclips - Modern Edition');
  console.log('Original by Frank Lantz and Bennett Foddy');

  // Try to load saved game
  const loaded = gameState.load();
  if (loaded) {
    console.log('Save game loaded successfully');
  } else {
    console.log('Starting new game');
  }

  // Register update handlers
  gameLoop.addUpdateHandler((deltaTime, state) => {
    const currentTime = Date.now();

    // Update game systems
    productionSystem.update(deltaTime);
    marketSystem.update(deltaTime, currentTime);

    // Update elapsed time
    state.increment('ui.elapsedTime', deltaTime);
  });

  // Register render handlers
  gameLoop.addRenderHandler((state) => {
    uiRenderer.render(state);
    uiRenderer.updateButtonStates(state);
  });

  // Set up UI event handlers
  setupEventHandlers();

  // Start the game loop
  gameLoop.start();

  // Initial render
  uiRenderer.render(gameState);

  // Set up autosave
  setInterval(() => {
    gameState.save();
  }, 30000); // Every 30 seconds
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

// Export for debugging in console
window.UniversalPaperclips = {
  gameState,
  gameLoop,
  productionSystem,
  marketSystem,
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
  },
};

console.log('Game loaded. Use window.UniversalPaperclips.debug for debugging tools.');
