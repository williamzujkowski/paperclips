/**
 * Memory Monitor - Tracks memory usage and identifies potential leaks
 * @module MemoryMonitor
 */

import { errorHandler } from './errorHandler.js';

/**
 * @class MemoryMonitor
 * @description Monitors memory usage, tracks object allocations, and detects potential memory leaks.
 * Provides insights into memory patterns and helps optimize memory usage.
 */
export class MemoryMonitor {
  /**
   * Creates a new MemoryMonitor instance
   * @constructor
   */
  constructor() {
    /** @type {boolean} Whether monitoring is enabled */
    this.enabled = false;
    /** @type {number} Monitoring interval in ms */
    this.monitoringInterval = 5000;
    /** @type {number|null} Interval timer ID */
    this.intervalId = null;
    /** @type {Array<Object>} Memory usage samples */
    this.samples = [];
    /** @type {number} Maximum samples to keep */
    this.maxSamples = 100;
    /** @type {Map<string, WeakRef>} Tracked objects for leak detection */
    this.trackedObjects = new Map();
    /** @type {Map<string, number>} Object allocation counts */
    this.allocationCounts = new Map();
    /** @type {number} Baseline memory usage */
    this.baselineMemory = 0;
    /** @type {number} Memory growth threshold (MB) */
    this.growthThreshold = 50;
    /** @type {Array<Object>} Detected memory issues */
    this.issues = [];
  }

  /**
   * Start memory monitoring
   * @returns {void}
   */
  start() {
    if (this.enabled) {
      return;
    }

    this.enabled = true;
    this.baselineMemory = this.getCurrentMemory();
    errorHandler.info('Memory monitoring started');

    // Take initial sample
    this.takeSample();

    // Start periodic monitoring
    this.intervalId = setInterval(() => {
      this.takeSample();
      this.analyzeMemory();
    }, this.monitoringInterval);
  }

  /**
   * Stop memory monitoring
   * @returns {void}
   */
  stop() {
    if (!this.enabled) {
      return;
    }

    this.enabled = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    errorHandler.info('Memory monitoring stopped');
  }

  /**
   * Get current memory usage
   * @returns {Object|null} Memory info or null if not available
   * @private
   */
  getCurrentMemory() {
    if (performance.memory) {
      return {
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Take a memory sample
   * @private
   */
  takeSample() {
    const memory = this.getCurrentMemory();
    if (!memory) {
      return;
    }

    const sample = {
      timestamp: Date.now(),
      memory: memory,
      usedMB: memory.usedJSHeapSize / (1024 * 1024),
      totalMB: memory.totalJSHeapSize / (1024 * 1024),
      limitMB: memory.jsHeapSizeLimit / (1024 * 1024),
    };

    this.samples.push(sample);

    // Keep only recent samples
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Analyze memory patterns
   * @private
   */
  analyzeMemory() {
    if (this.samples.length < 2) {
      return;
    }

    const recent = this.samples[this.samples.length - 1];
    const baseline = this.samples[0];

    // Check for memory growth
    const growthMB = recent.usedMB - baseline.usedMB;
    if (growthMB > this.growthThreshold) {
      this.reportIssue('memory-growth', {
        growthMB: growthMB.toFixed(2),
        duration: recent.timestamp - baseline.timestamp,
        currentMB: recent.usedMB.toFixed(2),
      });
    }

    // Check for high memory usage
    const usagePercent = (recent.usedMB / recent.limitMB) * 100;
    if (usagePercent > 80) {
      this.reportIssue('high-memory', {
        usagePercent: usagePercent.toFixed(1),
        usedMB: recent.usedMB.toFixed(2),
        limitMB: recent.limitMB.toFixed(2),
      });
    }

    // Check tracked objects for leaks
    this.checkTrackedObjects();
  }

  /**
   * Track an object for leak detection
   * @param {string} id - Unique identifier for the object
   * @param {Object} obj - Object to track
   * @returns {void}
   */
  trackObject(id, obj) {
    try {
      this.trackedObjects.set(id, new WeakRef(obj));
      this.incrementAllocation(obj.constructor.name);
    } catch (error) {
      errorHandler.debug(`Failed to track object ${id}:`, error);
    }
  }

  /**
   * Untrack an object
   * @param {string} id - Object identifier
   * @returns {void}
   */
  untrackObject(id) {
    this.trackedObjects.delete(id);
  }

  /**
   * Check tracked objects for potential leaks
   * @private
   */
  checkTrackedObjects() {
    const alive = [];
    const dead = [];

    for (const [id, ref] of this.trackedObjects) {
      const obj = ref.deref();
      if (obj) {
        alive.push(id);
      } else {
        dead.push(id);
        this.trackedObjects.delete(id);
      }
    }

    // Report if too many objects are still alive
    if (alive.length > 1000) {
      this.reportIssue('object-leak', {
        aliveCount: alive.length,
        deadCount: dead.length,
        totalTracked: this.trackedObjects.size,
      });
    }
  }

  /**
   * Increment allocation count for a type
   * @param {string} type - Object type name
   * @private
   */
  incrementAllocation(type) {
    const count = this.allocationCounts.get(type) || 0;
    this.allocationCounts.set(type, count + 1);
  }

  /**
   * Report a memory issue
   * @param {string} type - Issue type
   * @param {Object} details - Issue details
   * @private
   */
  reportIssue(type, details) {
    const issue = {
      type,
      timestamp: Date.now(),
      details,
    };

    this.issues.push(issue);

    // Keep only recent issues
    if (this.issues.length > 50) {
      this.issues.shift();
    }

    errorHandler.warn(`Memory issue detected: ${type}`, details);
  }

  /**
   * Get memory statistics
   * @returns {Object} Memory statistics
   */
  getStats() {
    const current = this.getCurrentMemory();
    const recentSamples = this.samples.slice(-10);

    return {
      enabled: this.enabled,
      current: current ? {
        usedMB: (current.usedJSHeapSize / (1024 * 1024)).toFixed(2),
        totalMB: (current.totalJSHeapSize / (1024 * 1024)).toFixed(2),
        limitMB: (current.jsHeapSizeLimit / (1024 * 1024)).toFixed(2),
        usagePercent: ((current.usedJSHeapSize / current.jsHeapSizeLimit) * 100).toFixed(1),
      } : null,
      samples: recentSamples,
      trackedObjects: this.trackedObjects.size,
      allocations: Object.fromEntries(this.allocationCounts),
      issues: this.issues.slice(-10),
    };
  }

  /**
   * Get memory trend
   * @returns {string} Trend indicator (stable, growing, shrinking)
   */
  getTrend() {
    if (this.samples.length < 5) {
      return 'unknown';
    }

    const recent = this.samples.slice(-5);
    const first = recent[0].usedMB;
    const last = recent[recent.length - 1].usedMB;
    const diff = last - first;

    if (Math.abs(diff) < 1) {
      return 'stable';
    } else if (diff > 0) {
      return 'growing';
    } else {
      return 'shrinking';
    }
  }

  /**
   * Force garbage collection (if available)
   * @returns {boolean} Whether GC was triggered
   */
  forceGC() {
    if (window.gc) {
      try {
        window.gc();
        errorHandler.info('Garbage collection triggered');
        return true;
      } catch (error) {
        errorHandler.debug('Failed to trigger GC:', error);
      }
    }
    return false;
  }

  /**
   * Clear all monitoring data
   * @returns {void}
   */
  reset() {
    this.samples = [];
    this.trackedObjects.clear();
    this.allocationCounts.clear();
    this.issues = [];
    this.baselineMemory = this.getCurrentMemory();
  }

  /**
   * Generate memory report
   * @returns {string} Formatted memory report
   */
  generateReport() {
    const stats = this.getStats();
    const trend = this.getTrend();

    let report = '=== Memory Report ===\n';
    report += `Status: ${this.enabled ? 'Monitoring' : 'Stopped'}\n`;
    report += `Trend: ${trend}\n\n`;

    if (stats.current) {
      report += 'Current Usage:\n';
      report += `  Used: ${stats.current.usedMB} MB\n`;
      report += `  Total: ${stats.current.totalMB} MB\n`;
      report += `  Limit: ${stats.current.limitMB} MB\n`;
      report += `  Usage: ${stats.current.usagePercent}%\n\n`;
    }

    if (stats.trackedObjects > 0) {
      report += `Tracked Objects: ${stats.trackedObjects}\n\n`;
    }

    if (Object.keys(stats.allocations).length > 0) {
      report += 'Allocations:\n';
      for (const [type, count] of Object.entries(stats.allocations)) {
        report += `  ${type}: ${count}\n`;
      }
      report += '\n';
    }

    if (stats.issues.length > 0) {
      report += 'Recent Issues:\n';
      for (const issue of stats.issues) {
        report += `  ${issue.type}: ${JSON.stringify(issue.details)}\n`;
      }
    }

    return report;
  }
}

// Create singleton instance
export const memoryMonitor = new MemoryMonitor();