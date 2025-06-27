/**
 * Main game loop controller
 * Handles game updates, rendering, and timing
 */

import { gameState } from './gameState.js';
import { DISPLAY_UPDATE_INTERVAL, AUTOSAVE_INTERVAL } from './constants.js';

export class GameLoop {
  constructor() {
    this.running = false;
    this.lastUpdate = Date.now();
    this.lastRender = Date.now();
    this.lastAutosave = Date.now();
    this.updateHandlers = [];
    this.renderHandlers = [];
    this.animationFrameId = null;
  }

  /**
   * Register an update handler function
   * Update handlers are called every tick for game logic
   */
  addUpdateHandler(handler) {
    if (typeof handler === 'function') {
      this.updateHandlers.push(handler);
    }
  }

  /**
   * Register a render handler function
   * Render handlers are called for UI updates
   */
  addRenderHandler(handler) {
    if (typeof handler === 'function') {
      this.renderHandlers.push(handler);
    }
  }

  /**
   * Remove an update handler
   */
  removeUpdateHandler(handler) {
    const index = this.updateHandlers.indexOf(handler);
    if (index > -1) {
      this.updateHandlers.splice(index, 1);
    }
  }

  /**
   * Remove a render handler
   */
  removeRenderHandler(handler) {
    const index = this.renderHandlers.indexOf(handler);
    if (index > -1) {
      this.renderHandlers.splice(index, 1);
    }
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastUpdate = Date.now();
    this.lastRender = Date.now();
    this.lastAutosave = Date.now();
    this.loop();
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main loop function
   */
  loop() {
    if (!this.running) {
      return;
    }

    const now = Date.now();
    const updateDelta = now - this.lastUpdate;
    const renderDelta = now - this.lastRender;
    const autosaveDelta = now - this.lastAutosave;

    // Update game state (variable rate based on actual time passed)
    if (updateDelta > 0) {
      this.update(updateDelta);
      this.lastUpdate = now;
    }

    // Render UI updates (capped at ~60fps)
    if (renderDelta >= DISPLAY_UPDATE_INTERVAL) {
      this.render();
      this.lastRender = now;
    }

    // Autosave periodically
    if (autosaveDelta >= AUTOSAVE_INTERVAL) {
      this.autosave();
      this.lastAutosave = now;
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  /**
   * Update game logic
   */
  update(deltaTime) {
    // Increment tick counter
    gameState.increment('ui.ticks');

    // Call all registered update handlers
    for (const handler of this.updateHandlers) {
      try {
        handler(deltaTime, gameState);
      } catch (error) {
        console.error('Error in update handler:', error);
      }
    }
  }

  /**
   * Render UI updates
   */
  render() {
    // Call all registered render handlers
    for (const handler of this.renderHandlers) {
      try {
        handler(gameState);
      } catch (error) {
        console.error('Error in render handler:', error);
      }
    }
  }

  /**
   * Perform autosave
   */
  autosave() {
    const saved = gameState.save();
    if (saved) {
      console.log('Game autosaved');
    }
  }

  /**
   * Get current FPS
   */
  getFPS() {
    return 1000 / DISPLAY_UPDATE_INTERVAL;
  }

  /**
   * Check if game is running
   */
  isRunning() {
    return this.running;
  }
}

// Create singleton game loop instance
export const gameLoop = new GameLoop();
