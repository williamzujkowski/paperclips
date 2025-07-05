/**
 * Game Loop for Universal Paperclips
 *
 * Replaces the multiple setInterval timers from the legacy code with a single
 * requestAnimationFrame-based loop for better performance and consistency.
 */

import { TIMING } from "./constants.js";
import { errorHandler } from "./errorHandler.js";
import { performanceMonitor } from "./performanceMonitor.js";
import { gameState } from "./gameState.js";

class GameLoop {
  constructor() {
    this.running = false;
    this.lastFrame = 0;
    this.frameId = null;

    // Timing for different update frequencies
    this.timers = {
      fast: { interval: TIMING.FAST_LOOP_INTERVAL, lastUpdate: 0 },
      medium: { interval: TIMING.MEDIUM_LOOP_INTERVAL, lastUpdate: 0 },
      slow: { interval: TIMING.SLOW_LOOP_INTERVAL, lastUpdate: 0 },
    };

    // System update callbacks
    this.systems = {
      fast: [], // 100 FPS - critical game logic
      medium: [], // 10 FPS - UI updates
      slow: [], // 1 FPS - background tasks
    };

    // Renderer callbacks
    this.renderers = [];

    // Initialize error boundary
    this.boundLoop = errorHandler.createErrorBoundary(
      this._loop.bind(this),
      "gameLoop.main",
      () => {
        errorHandler.error("Game loop crashed, attempting restart");
        this.restart();
      },
    );
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.running) {
      errorHandler.warn("Game loop already running");
      return;
    }

    this.running = true;
    this.lastFrame = performance.now();

    // Reset timers
    Object.values(this.timers).forEach((timer) => {
      timer.lastUpdate = this.lastFrame;
    });

    errorHandler.info("Game loop started");
    this._requestFrame();
  }

  /**
   * Stop the game loop
   */
  stop() {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    errorHandler.info("Game loop stopped");
  }

  /**
   * Restart the game loop
   */
  restart() {
    this.stop();
    setTimeout(() => this.start(), 100);
  }

  /**
   * Add a system to the specified frequency tier
   * @param {string} frequency - 'fast', 'medium', or 'slow'
   * @param {Function} updateFn - Update function
   * @param {string} name - System name for debugging
   */
  addSystem(frequency, updateFn, name = "unknown") {
    if (!this.systems[frequency]) {
      errorHandler.error(`Invalid frequency: ${frequency}`);
      return;
    }

    const wrappedUpdate = errorHandler.createErrorBoundary(
      updateFn,
      `system.${name}`,
      () => errorHandler.warn(`System ${name} failed, skipping update`),
    );

    this.systems[frequency].push({
      update: wrappedUpdate,
      name,
    });

    errorHandler.debug(`System ${name} added to ${frequency} tier`);
  }

  /**
   * Remove a system
   * @param {string} frequency - 'fast', 'medium', or 'slow'
   * @param {string} name - System name
   */
  removeSystem(frequency, name) {
    if (!this.systems[frequency]) {
      return;
    }

    const index = this.systems[frequency].findIndex(
      (system) => system.name === name,
    );
    if (index !== -1) {
      this.systems[frequency].splice(index, 1);
      errorHandler.debug(`System ${name} removed from ${frequency} tier`);
    }
  }

  /**
   * Add a renderer
   * @param {Function} renderFn - Render function
   * @param {string} name - Renderer name for debugging
   */
  addRenderer(renderFn, name = "unknown") {
    const wrappedRender = errorHandler.createErrorBoundary(
      renderFn,
      `renderer.${name}`,
      () => errorHandler.warn(`Renderer ${name} failed, skipping render`),
    );

    this.renderers.push({
      render: wrappedRender,
      name,
    });

    errorHandler.debug(`Renderer ${name} added`);
  }

  /**
   * Remove a renderer
   * @param {string} name - Renderer name
   */
  removeRenderer(name) {
    const index = this.renderers.findIndex(
      (renderer) => renderer.name === name,
    );
    if (index !== -1) {
      this.renderers.splice(index, 1);
      errorHandler.debug(`Renderer ${name} removed`);
    }
  }

  /**
   * Request the next animation frame
   * @private
   */
  _requestFrame() {
    if (this.running) {
      this.frameId = requestAnimationFrame(this.boundLoop);
    }
  }

  /**
   * Main game loop
   * @private
   */
  _loop(timestamp) {
    try {
      performanceMonitor.startGameLoopMeasurement();

      // Calculate delta time
      const deltaTime = timestamp - this.lastFrame;
      this.lastFrame = timestamp;

      // Update game state ticks
      gameState.increment("gameState.ticks");
      gameState.increment("gameState.elapsedTime", deltaTime);

      // Update systems based on their timing
      this._updateSystems(timestamp, deltaTime);

      performanceMonitor.recordUpdateTime();

      // Render everything
      this._render(timestamp, deltaTime);

      performanceMonitor.endGameLoopMeasurement();

      // Request next frame
      this._requestFrame();
    } catch (error) {
      errorHandler.handleError(error, "gameLoop.main", { timestamp }, true);
      this.restart();
    }
  }

  /**
   * Update all systems based on their timing
   * @private
   */
  _updateSystems(timestamp, deltaTime) {
    // Fast systems (100 FPS equivalent)
    if (this._shouldUpdate("fast", timestamp)) {
      this._updateSystemTier("fast", timestamp, deltaTime);
    }

    // Medium systems (10 FPS equivalent)
    if (this._shouldUpdate("medium", timestamp)) {
      this._updateSystemTier("medium", timestamp, deltaTime);
    }

    // Slow systems (1 FPS equivalent)
    if (this._shouldUpdate("slow", timestamp)) {
      this._updateSystemTier("slow", timestamp, deltaTime);
    }
  }

  /**
   * Check if a timer tier should update
   * @private
   */
  _shouldUpdate(tier, timestamp) {
    const timer = this.timers[tier];
    const elapsed = timestamp - timer.lastUpdate;

    if (elapsed >= timer.interval) {
      timer.lastUpdate = timestamp;
      return true;
    }

    return false;
  }

  /**
   * Update a specific tier of systems
   * @private
   */
  _updateSystemTier(tier, timestamp, deltaTime) {
    const systems = this.systems[tier];

    for (const system of systems) {
      try {
        performanceMonitor.measure(
          () => system.update(timestamp, deltaTime),
          `system.${system.name}`,
        );
      } catch (error) {
        errorHandler.handleError(error, `gameLoop.system.${system.name}`, {
          tier,
          timestamp,
          deltaTime,
        });
      }
    }
  }

  /**
   * Render all registered renderers
   * @private
   */
  _render(timestamp, deltaTime) {
    for (const renderer of this.renderers) {
      try {
        performanceMonitor.measure(
          () => renderer.render(timestamp, deltaTime),
          `renderer.${renderer.name}`,
        );
      } catch (error) {
        errorHandler.handleError(error, `gameLoop.renderer.${renderer.name}`, {
          timestamp,
          deltaTime,
        });
      }
    }
  }

  /**
   * Get loop statistics
   * @returns {Object} Loop statistics
   */
  getStats() {
    return {
      running: this.running,
      frameId: this.frameId,
      systems: {
        fast: this.systems.fast.length,
        medium: this.systems.medium.length,
        slow: this.systems.slow.length,
      },
      renderers: this.renderers.length,
      timers: { ...this.timers },
    };
  }

  /**
   * Get system information
   * @returns {Object} System information
   */
  getSystemInfo() {
    const info = {};

    ["fast", "medium", "slow"].forEach((tier) => {
      info[tier] = this.systems[tier].map((system) => ({
        name: system.name,
        lastUpdate: this.timers[tier].lastUpdate,
      }));
    });

    info.renderers = this.renderers.map((renderer) => ({
      name: renderer.name,
    }));

    return info;
  }

  /**
   * Force update all systems once
   */
  forceUpdate() {
    const timestamp = performance.now();
    const deltaTime = timestamp - this.lastFrame;

    ["fast", "medium", "slow"].forEach((tier) => {
      this._updateSystemTier(tier, timestamp, deltaTime);
    });

    this._render(timestamp, deltaTime);

    errorHandler.debug("Forced update of all systems");
  }

  /**
   * Pause the game loop (but keep it alive)
   */
  pause() {
    if (!this.running) {
      return;
    }

    this.paused = true;
    errorHandler.info("Game loop paused");
  }

  /**
   * Resume the game loop
   */
  resume() {
    if (!this.running || !this.paused) {
      return;
    }

    this.paused = false;
    this.lastFrame = performance.now();

    // Reset timers
    Object.values(this.timers).forEach((timer) => {
      timer.lastUpdate = this.lastFrame;
    });

    errorHandler.info("Game loop resumed");
  }

  /**
   * Check if the loop is paused
   * @returns {boolean} Whether the loop is paused
   */
  isPaused() {
    return this.paused || false;
  }
}

// Create singleton instance
export const gameLoop = new GameLoop();

// Export class for testing
export { GameLoop };
