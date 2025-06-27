/**
 * Performance monitoring system
 * @module PerformanceMonitor
 */

import { errorHandler } from './errorHandler.js';

/**
 * @class PerformanceMonitor
 * @description Tracks game performance metrics and detects performance issues.
 * Monitors FPS, update times, memory usage, and other performance indicators.
 */
export class PerformanceMonitor {
  /**
   * Creates a new PerformanceMonitor instance
   * @constructor
   */
  constructor() {
    /** @type {Array<number>} Frame time history */
    this.frameTimes = [];
    /** @type {number} Maximum frame history size */
    this.maxFrameHistory = 60;
    /** @type {number} Last frame timestamp */
    this.lastFrameTime = performance.now();
    /** @type {Object} Performance metrics */
    this.metrics = {
      fps: 0,
      avgFrameTime: 0,
      maxFrameTime: 0,
      minFps: 60,
      updateTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      gcCount: 0,
    };
    /** @type {number} Performance check interval */
    this.checkInterval = 1000; // 1 second
    /** @type {number} Last performance check */
    this.lastCheck = performance.now();
    /** @type {boolean} Whether monitoring is active */
    this.active = true;
    /** @type {Object} Performance thresholds */
    this.thresholds = {
      minFps: 30,
      maxFrameTime: 100, // ms
      maxUpdateTime: 50, // ms
      maxRenderTime: 16, // ms (60fps target)
      maxMemoryMB: 100,
    };
  }

  /**
   * Start monitoring performance
   */
  start() {
    this.active = true;
    this.lastFrameTime = performance.now();
    errorHandler.debug('Performance monitoring started');
  }

  /**
   * Stop monitoring performance
   */
  stop() {
    this.active = false;
    errorHandler.debug('Performance monitoring stopped');
  }

  /**
   * Record frame timing
   */
  recordFrame() {
    if (!this.active) {
      return;
    }

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Add to frame history
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxFrameHistory) {
      this.frameTimes.shift();
    }

    // Update max frame time
    if (frameTime > this.metrics.maxFrameTime) {
      this.metrics.maxFrameTime = frameTime;
    }

    // Check if we should update metrics
    if (now - this.lastCheck >= this.checkInterval) {
      this.updateMetrics();
      this.checkPerformance();
      this.lastCheck = now;
    }
  }

  /**
   * Measure function execution time
   * @param {Function} fn - Function to measure
   * @param {string} name - Name for logging
   * @returns {*} Function result
   */
  measure(fn, name) {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;

      if (name.includes('update')) {
        this.metrics.updateTime = duration;
      } else if (name.includes('render')) {
        this.metrics.renderTime = duration;
      }

      // Log slow operations
      if (duration > 16) {
        errorHandler.debug(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      errorHandler.handleError(error, `performanceMonitor.measure.${name}`, { duration });
      throw error;
    }
  }

  /**
   * Update performance metrics
   * @private
   */
  updateMetrics() {
    if (this.frameTimes.length === 0) {
      return;
    }

    // Calculate average frame time
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.metrics.avgFrameTime = avgFrameTime;

    // Calculate FPS
    this.metrics.fps = 1000 / avgFrameTime;

    // Track minimum FPS
    if (this.metrics.fps < this.metrics.minFps) {
      this.metrics.minFps = this.metrics.fps;
    }

    // Update memory usage if available
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    // Reset max frame time periodically
    if (this.metrics.maxFrameTime > 1000) {
      this.metrics.maxFrameTime = Math.max(...this.frameTimes);
    }
  }

  /**
   * Check for performance issues
   * @private
   */
  checkPerformance() {
    const issues = [];

    // Check FPS
    if (this.metrics.fps < this.thresholds.minFps) {
      issues.push(`Low FPS: ${this.metrics.fps.toFixed(1)} (threshold: ${this.thresholds.minFps})`);
    }

    // Check frame time spikes
    if (this.metrics.maxFrameTime > this.thresholds.maxFrameTime) {
      issues.push(`Frame time spike: ${this.metrics.maxFrameTime.toFixed(1)}ms`);
    }

    // Check update time
    if (this.metrics.updateTime > this.thresholds.maxUpdateTime) {
      issues.push(`Slow update: ${this.metrics.updateTime.toFixed(1)}ms`);
    }

    // Check render time
    if (this.metrics.renderTime > this.thresholds.maxRenderTime) {
      issues.push(`Slow render: ${this.metrics.renderTime.toFixed(1)}ms`);
    }

    // Check memory usage
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryMB) {
      issues.push(`High memory: ${this.metrics.memoryUsage.toFixed(1)}MB`);
    }

    // Log issues if any
    if (issues.length > 0) {
      errorHandler.warn('Performance issues detected', {
        issues,
        metrics: this.getMetrics(),
      });
    }
  }

  /**
   * Get current performance metrics
   * @returns {Object} Current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      frameCount: this.frameTimes.length,
    };
  }

  /**
   * Get performance report
   * @returns {string} Formatted performance report
   */
  getReport() {
    const m = this.metrics;
    return `
Performance Report:
  FPS: ${m.fps.toFixed(1)} (min: ${m.minFps.toFixed(1)})
  Avg Frame Time: ${m.avgFrameTime.toFixed(2)}ms
  Max Frame Time: ${m.maxFrameTime.toFixed(2)}ms
  Update Time: ${m.updateTime.toFixed(2)}ms
  Render Time: ${m.renderTime.toFixed(2)}ms
  Memory Usage: ${m.memoryUsage.toFixed(1)}MB
    `.trim();
  }

  /**
   * Reset performance metrics
   */
  reset() {
    this.frameTimes = [];
    this.metrics = {
      fps: 0,
      avgFrameTime: 0,
      maxFrameTime: 0,
      minFps: 60,
      updateTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      gcCount: 0,
    };
    this.lastFrameTime = performance.now();
    this.lastCheck = performance.now();
    errorHandler.debug('Performance metrics reset');
  }

  /**
   * Set performance threshold
   * @param {string} metric - Metric name
   * @param {number} value - Threshold value
   */
  setThreshold(metric, value) {
    if (metric in this.thresholds) {
      this.thresholds[metric] = value;
      errorHandler.debug(`Performance threshold set: ${metric} = ${value}`);
    } else {
      errorHandler.warn(`Invalid performance metric: ${metric}`);
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for debugging
if (typeof window !== 'undefined') {
  window.UniversalPaperclipsPerformance = performanceMonitor;
}
