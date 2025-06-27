/**
 * Main game loop controller
 * Handles game updates, rendering, and timing
 */

import { gameState } from './gameState.js';
import { DISPLAY_UPDATE_INTERVAL, AUTOSAVE_INTERVAL } from './constants.js';
import { errorHandler } from './errorHandler.js';
import { performanceMonitor } from './performanceMonitor.js';
import { memoryMonitor } from './memoryMonitor.js';
import { uiRenderer } from '../ui/renderer.js';
import { domBatcher } from '../ui/domBatcher.js';

export class GameLoop {
  constructor() {
    this.running = false;
    this.lastUpdate = Date.now();
    this.lastRender = Date.now();
    this.lastAutosave = Date.now();
    this.lastCleanup = Date.now();
    this.updateHandlers = [];
    this.renderHandlers = [];
    this.animationFrameId = null;
    this.cleanupInterval = 60000; // Cleanup every 60 seconds
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
    errorHandler.info('Game loop started');
    performanceMonitor.start();
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
    errorHandler.info('Game loop stopped');
    performanceMonitor.stop();
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
    const cleanupDelta = now - this.lastCleanup;

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

    // Cleanup periodically
    if (cleanupDelta >= this.cleanupInterval) {
      this.cleanup();
      this.lastCleanup = now;
    }

    // Record frame for performance monitoring
    performanceMonitor.recordFrame();

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  /**
   * Update game logic
   */
  update(deltaTime) {
    performanceMonitor.measure(() => {
      // Increment tick counter
      gameState.increment('ui.ticks');

      // Call all registered update handlers
      for (const handler of this.updateHandlers) {
        try {
          handler(deltaTime, gameState);
        } catch (error) {
          errorHandler.handleError(error, 'gameLoop.update', {
            handler: handler.name || 'anonymous',
            deltaTime,
          });
        }
      }
    }, 'update');
  }

  /**
   * Render UI updates
   */
  render() {
    performanceMonitor.measure(() => {
      // Call all registered render handlers
      for (const handler of this.renderHandlers) {
        try {
          handler(gameState);
        } catch (error) {
          errorHandler.handleError(error, 'gameLoop.render', {
            handler: handler.name || 'anonymous',
          });
        }
      }
    }, 'render');
  }

  /**
   * Perform autosave
   */
  autosave() {
    try {
      const saved = gameState.save();
      if (saved) {
        errorHandler.debug('Game autosaved');
      } else {
        errorHandler.warn('Autosave failed');
      }
    } catch (error) {
      errorHandler.handleError(error, 'gameLoop.autosave');
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

  /**
   * Perform periodic cleanup tasks
   */
  cleanup() {
    try {
      // Clean up stale DOM references
      const cleanedElements = uiRenderer.cleanupStaleElements();
      if (cleanedElements > 0) {
        errorHandler.debug(`Cleaned ${cleanedElements} stale DOM references`);
      }

      // Clear DOM batcher cache if it's getting too large
      const cacheStats = domBatcher.getCacheStats();
      if (cacheStats.size > 500) {
        domBatcher.clearCache();
        errorHandler.debug('Cleared DOM batcher cache');
      }

      // Check memory trend
      const memStats = memoryMonitor.getStats();
      if (memStats.issues.length > 0) {
        errorHandler.warn('Memory issues detected', memStats.issues);
      }

      // Force GC if memory usage is high and GC is available
      if (memStats.current && memStats.current.usagePercent > 80) {
        if (memoryMonitor.forceGC()) {
          errorHandler.info('Triggered garbage collection due to high memory usage');
        }
      }
    } catch (error) {
      errorHandler.handleError(error, 'gameLoop.cleanup');
    }
  }
}

// Create singleton game loop instance
export const gameLoop = new GameLoop();
