/**
 * Performance Monitor for Universal Paperclips
 *
 * Tracks FPS, memory usage, and function performance to ensure
 * the game runs smoothly and identify bottlenecks.
 */

import { PERFORMANCE } from "./constants.js";
import { errorHandler } from "./errorHandler.js";

class PerformanceMonitor {
  constructor() {
    this.enabled = true;
    this.metrics = {
      fps: {
        current: 0,
        average: 0,
        min: Infinity,
        max: 0,
        samples: [],
        lastFrame: performance.now(),
      },
      memory: {
        used: 0,
        peak: 0,
        samples: [],
      },
      gameLoop: {
        updateTime: 0,
        renderTime: 0,
        totalTime: 0,
        slowFrames: 0,
        samples: [],
      },
      functions: new Map(), // Function performance tracking
    };

    this.thresholds = {
      fps: {
        warning: PERFORMANCE.MIN_FPS,
        critical: PERFORMANCE.MIN_FPS * 0.5,
      },
      frameTime: {
        warning: PERFORMANCE.FRAME_TIME_TARGET * 2,
        critical: PERFORMANCE.FRAME_TIME_TARGET * 4,
      },
      memory: {
        warning: PERFORMANCE.MAX_MEMORY_USAGE * 0.8,
        critical: PERFORMANCE.MAX_MEMORY_USAGE,
      },
    };

    this.sampleSize = PERFORMANCE.PERFORMANCE_SAMPLE_SIZE;
    this.warningCallbacks = [];

    this._startMonitoring();
  }

  /**
   * Start performance monitoring
   * @private
   */
  _startMonitoring() {
    if (!this.enabled) return;

    // Monitor FPS
    this._monitorFPS();

    // Monitor memory usage
    this._monitorMemory();
  }

  /**
   * Monitor FPS using requestAnimationFrame
   * @private
   */
  _monitorFPS() {
    const measureFPS = () => {
      if (!this.enabled) return;

      const now = performance.now();
      const delta = now - this.metrics.fps.lastFrame;

      if (delta > 0) {
        const fps = 1000 / delta;
        this._recordFPS(fps);
      }

      this.metrics.fps.lastFrame = now;
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Record FPS measurement
   * @private
   */
  _recordFPS(fps) {
    this.metrics.fps.current = fps;
    this.metrics.fps.samples.push(fps);

    // Keep only recent samples
    if (this.metrics.fps.samples.length > this.sampleSize) {
      this.metrics.fps.samples.shift();
    }

    // Update statistics
    this.metrics.fps.min = Math.min(this.metrics.fps.min, fps);
    this.metrics.fps.max = Math.max(this.metrics.fps.max, fps);
    this.metrics.fps.average =
      this.metrics.fps.samples.reduce((a, b) => a + b, 0) /
      this.metrics.fps.samples.length;

    // Check thresholds
    this._checkFPSThresholds(fps);
  }

  /**
   * Monitor memory usage
   * @private
   */
  _monitorMemory() {
    const measureMemory = () => {
      if (!this.enabled) return;

      if ("memory" in performance) {
        const memory = performance.memory;
        this._recordMemory(memory.usedJSHeapSize);
        this.metrics.memory.peak = Math.max(
          this.metrics.memory.peak,
          memory.usedJSHeapSize,
        );
      }

      setTimeout(measureMemory, 1000); // Check every second
    };

    measureMemory();
  }

  /**
   * Record memory measurement
   * @private
   */
  _recordMemory(memoryUsed) {
    this.metrics.memory.used = memoryUsed;
    this.metrics.memory.samples.push(memoryUsed);

    // Keep only recent samples
    if (this.metrics.memory.samples.length > this.sampleSize) {
      this.metrics.memory.samples.shift();
    }

    // Check thresholds
    this._checkMemoryThresholds(memoryUsed);
  }

  /**
   * Start measuring game loop performance
   */
  startGameLoopMeasurement() {
    this.gameLoopStart = performance.now();
  }

  /**
   * Record update phase time
   */
  recordUpdateTime() {
    if (!this.gameLoopStart) return;
    this.updateEnd = performance.now();
    this.metrics.gameLoop.updateTime = this.updateEnd - this.gameLoopStart;
  }

  /**
   * End game loop measurement
   */
  endGameLoopMeasurement() {
    if (!this.gameLoopStart) return;

    const now = performance.now();
    const totalTime = now - this.gameLoopStart;
    const renderTime = now - (this.updateEnd || this.gameLoopStart);

    this.metrics.gameLoop.renderTime = renderTime;
    this.metrics.gameLoop.totalTime = totalTime;

    // Record sample
    this.metrics.gameLoop.samples.push({
      update: this.metrics.gameLoop.updateTime,
      render: renderTime,
      total: totalTime,
      timestamp: now,
    });

    // Keep only recent samples
    if (this.metrics.gameLoop.samples.length > this.sampleSize) {
      this.metrics.gameLoop.samples.shift();
    }

    // Check for slow frames
    if (totalTime > this.thresholds.frameTime.warning) {
      this.metrics.gameLoop.slowFrames++;

      if (totalTime > this.thresholds.frameTime.critical) {
        errorHandler.warn(
          "Critical frame time detected:",
          `${totalTime.toFixed(2)}ms`,
        );
      }
    }

    // Reset for next measurement
    this.gameLoopStart = null;
    this.updateEnd = null;
  }

  /**
   * Measure function performance
   * @param {Function} fn - Function to measure
   * @param {string} name - Name for tracking
   * @returns {*} Function result
   */
  measure(fn, name) {
    if (!this.enabled) {
      return fn();
    }

    const start = performance.now();

    try {
      const result = fn();

      const end = performance.now();
      const duration = end - start;

      this._recordFunctionPerformance(name, duration, true);

      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;

      this._recordFunctionPerformance(name, duration, false);
      throw error;
    }
  }

  /**
   * Create a performance wrapper for a function
   * @param {Function} fn - Function to wrap
   * @param {string} name - Name for tracking
   * @returns {Function} Wrapped function
   */
  wrap(fn, name) {
    return (...args) => this.measure(() => fn(...args), name);
  }

  /**
   * Record function performance
   * @private
   */
  _recordFunctionPerformance(name, duration, success) {
    if (!this.metrics.functions.has(name)) {
      this.metrics.functions.set(name, {
        calls: 0,
        totalTime: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0,
        samples: [],
      });
    }

    const stats = this.metrics.functions.get(name);
    stats.calls++;
    stats.totalTime += duration;
    stats.averageTime = stats.totalTime / stats.calls;
    stats.minTime = Math.min(stats.minTime, duration);
    stats.maxTime = Math.max(stats.maxTime, duration);

    if (!success) {
      stats.errors++;
    }

    stats.samples.push({
      duration,
      success,
      timestamp: performance.now(),
    });

    // Keep only recent samples
    if (stats.samples.length > this.sampleSize) {
      stats.samples.shift();
    }
  }

  /**
   * Check FPS thresholds
   * @private
   */
  _checkFPSThresholds(fps) {
    if (fps < this.thresholds.fps.critical) {
      this._triggerWarning("fps", "critical", fps);
    } else if (fps < this.thresholds.fps.warning) {
      this._triggerWarning("fps", "warning", fps);
    }
  }

  /**
   * Check memory thresholds
   * @private
   */
  _checkMemoryThresholds(memory) {
    if (memory > this.thresholds.memory.critical) {
      this._triggerWarning("memory", "critical", memory);
    } else if (memory > this.thresholds.memory.warning) {
      this._triggerWarning("memory", "warning", memory);
    }
  }

  /**
   * Trigger performance warning
   * @private
   */
  _triggerWarning(type, level, value) {
    const warning = {
      type,
      level,
      value,
      timestamp: Date.now(),
    };

    if (level === "critical") {
      errorHandler.error(`Performance ${level}:`, `${type} = ${value}`);
    } else {
      errorHandler.warn(`Performance ${level}:`, `${type} = ${value}`);
    }

    this.warningCallbacks.forEach((callback) => {
      try {
        callback(warning);
      } catch (error) {
        errorHandler.error("Error in performance warning callback:", error);
      }
    });
  }

  /**
   * Add warning callback
   * @param {Function} callback - Callback function
   */
  addWarningCallback(callback) {
    this.warningCallbacks.push(callback);
  }

  /**
   * Remove warning callback
   * @param {Function} callback - Callback function
   */
  removeWarningCallback(callback) {
    const index = this.warningCallbacks.indexOf(callback);
    if (index !== -1) {
      this.warningCallbacks.splice(index, 1);
    }
  }

  /**
   * Get performance report
   * @returns {Object} Performance report
   */
  getReport() {
    const functionStats = {};
    this.metrics.functions.forEach((stats, name) => {
      functionStats[name] = { ...stats, samples: stats.samples.length };
    });

    return {
      fps: {
        current: Math.round(this.metrics.fps.current),
        average: Math.round(this.metrics.fps.average),
        min: Math.round(this.metrics.fps.min),
        max: Math.round(this.metrics.fps.max),
      },
      memory: {
        used: this.metrics.memory.used,
        peak: this.metrics.memory.peak,
        usedMB: Math.round(this.metrics.memory.used / 1024 / 1024),
        peakMB: Math.round(this.metrics.memory.peak / 1024 / 1024),
      },
      gameLoop: {
        updateTime: Math.round(this.metrics.gameLoop.updateTime * 100) / 100,
        renderTime: Math.round(this.metrics.gameLoop.renderTime * 100) / 100,
        totalTime: Math.round(this.metrics.gameLoop.totalTime * 100) / 100,
        slowFrames: this.metrics.gameLoop.slowFrames,
      },
      functions: functionStats,
      enabled: this.enabled,
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics.fps.samples = [];
    this.metrics.fps.min = Infinity;
    this.metrics.fps.max = 0;
    this.metrics.memory.samples = [];
    this.metrics.memory.peak = 0;
    this.metrics.gameLoop.samples = [];
    this.metrics.gameLoop.slowFrames = 0;
    this.metrics.functions.clear();

    errorHandler.info("Performance metrics reset");
  }

  /**
   * Enable/disable monitoring
   * @param {boolean} enabled - Whether to enable monitoring
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    errorHandler.info(
      `Performance monitoring ${enabled ? "enabled" : "disabled"}`,
    );
  }

  /**
   * Get detailed function statistics
   * @param {string} name - Function name
   * @returns {Object} Function statistics
   */
  getFunctionStats(name) {
    return this.metrics.functions.get(name) || null;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export class for testing
export { PerformanceMonitor };
