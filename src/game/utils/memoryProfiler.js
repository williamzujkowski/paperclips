/**
 * Memory Profiler - Tools for memory profiling and analysis
 * @module MemoryProfiler
 */

import { memoryMonitor } from '../core/memoryMonitor.js';
import { errorHandler } from '../core/errorHandler.js';

/**
 * @class MemoryProfiler
 * @description Provides tools for profiling memory usage and identifying allocation hotspots
 */
export class MemoryProfiler {
  constructor() {
    this.profiles = new Map();
    this.allocationSites = new Map();
    this.objectPools = new Map();
  }

  /**
   * Start profiling a specific operation
   * @param {string} name - Profile name
   * @returns {Function} Stop function to call when done
   */
  startProfile(name) {
    const startMemory = this.getMemorySnapshot();
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const endMemory = this.getMemorySnapshot();
      
      const profile = {
        name,
        duration: endTime - startTime,
        memoryDelta: endMemory.used - startMemory.used,
        allocations: this.allocationSites.get(name) || 0,
        timestamp: Date.now(),
      };
      
      if (!this.profiles.has(name)) {
        this.profiles.set(name, []);
      }
      this.profiles.get(name).push(profile);
      
      // Keep only recent profiles
      const profiles = this.profiles.get(name);
      if (profiles.length > 100) {
        profiles.shift();
      }
      
      return profile;
    };
  }

  /**
   * Get memory snapshot
   * @returns {Object} Memory snapshot
   * @private
   */
  getMemorySnapshot() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }

  /**
   * Track allocation at a specific site
   * @param {string} site - Allocation site identifier
   * @param {number} count - Number of allocations
   */
  trackAllocation(site, count = 1) {
    const current = this.allocationSites.get(site) || 0;
    this.allocationSites.set(site, current + count);
  }

  /**
   * Get allocation hotspots
   * @param {number} limit - Number of top sites to return
   * @returns {Array} Top allocation sites
   */
  getHotspots(limit = 10) {
    const sites = Array.from(this.allocationSites.entries());
    sites.sort((a, b) => b[1] - a[1]);
    
    return sites.slice(0, limit).map(([site, count]) => ({
      site,
      count,
      percentage: (count / this.getTotalAllocations()) * 100,
    }));
  }

  /**
   * Get total allocations
   * @returns {number} Total allocation count
   * @private
   */
  getTotalAllocations() {
    let total = 0;
    for (const count of this.allocationSites.values()) {
      total += count;
    }
    return total;
  }

  /**
   * Create object pool for frequent allocations
   * @param {string} type - Object type
   * @param {Function} factory - Factory function to create new objects
   * @param {Function} reset - Reset function to clear object state
   * @param {number} maxSize - Maximum pool size
   * @returns {Object} Pool interface
   */
  createObjectPool(type, factory, reset, maxSize = 100) {
    const pool = {
      available: [],
      inUse: new Set(),
      factory,
      reset,
      maxSize,
      stats: {
        created: 0,
        reused: 0,
        returned: 0,
      },
    };
    
    this.objectPools.set(type, pool);
    
    return {
      get: () => this.getFromPool(type),
      release: (obj) => this.releaseToPool(type, obj),
      getStats: () => pool.stats,
    };
  }

  /**
   * Get object from pool
   * @param {string} type - Pool type
   * @returns {Object} Object from pool
   * @private
   */
  getFromPool(type) {
    const pool = this.objectPools.get(type);
    if (!pool) {
      throw new Error(`Object pool '${type}' not found`);
    }
    
    let obj;
    if (pool.available.length > 0) {
      obj = pool.available.pop();
      pool.stats.reused++;
    } else {
      obj = pool.factory();
      pool.stats.created++;
    }
    
    pool.inUse.add(obj);
    return obj;
  }

  /**
   * Release object back to pool
   * @param {string} type - Pool type
   * @param {Object} obj - Object to release
   * @private
   */
  releaseToPool(type, obj) {
    const pool = this.objectPools.get(type);
    if (!pool) {
      throw new Error(`Object pool '${type}' not found`);
    }
    
    if (!pool.inUse.has(obj)) {
      errorHandler.warn(`Object not from pool '${type}'`);
      return;
    }
    
    pool.inUse.delete(obj);
    pool.reset(obj);
    
    if (pool.available.length < pool.maxSize) {
      pool.available.push(obj);
      pool.stats.returned++;
    }
  }

  /**
   * Analyze memory usage patterns
   * @returns {Object} Analysis results
   */
  analyzePatterns() {
    const results = {
      profiles: {},
      hotspots: this.getHotspots(),
      pools: {},
      recommendations: [],
    };
    
    // Analyze profiles
    for (const [name, profiles] of this.profiles.entries()) {
      if (profiles.length > 0) {
        const avgMemory = profiles.reduce((sum, p) => sum + p.memoryDelta, 0) / profiles.length;
        const avgDuration = profiles.reduce((sum, p) => sum + p.duration, 0) / profiles.length;
        
        results.profiles[name] = {
          count: profiles.length,
          avgMemoryDelta: avgMemory,
          avgDuration: avgDuration,
          memoryPerMs: avgMemory / avgDuration,
        };
        
        // Generate recommendations
        if (avgMemory > 1024 * 1024) { // > 1MB
          results.recommendations.push({
            type: 'high-memory',
            target: name,
            message: `Operation '${name}' allocates ${(avgMemory / 1024 / 1024).toFixed(2)}MB on average`,
          });
        }
      }
    }
    
    // Analyze pools
    for (const [type, pool] of this.objectPools.entries()) {
      const reuseRate = pool.stats.reused / (pool.stats.created + pool.stats.reused) * 100;
      results.pools[type] = {
        ...pool.stats,
        reuseRate: reuseRate.toFixed(1) + '%',
        poolSize: pool.available.length,
        inUse: pool.inUse.size,
      };
      
      if (reuseRate < 50) {
        results.recommendations.push({
          type: 'low-reuse',
          target: type,
          message: `Pool '${type}' has low reuse rate (${reuseRate.toFixed(1)}%)`,
        });
      }
    }
    
    // Check for allocation hotspots
    for (const hotspot of results.hotspots) {
      if (hotspot.percentage > 20) {
        results.recommendations.push({
          type: 'hotspot',
          target: hotspot.site,
          message: `Site '${hotspot.site}' accounts for ${hotspot.percentage.toFixed(1)}% of allocations`,
        });
      }
    }
    
    return results;
  }

  /**
   * Generate profiling report
   * @returns {string} Formatted report
   */
  generateReport() {
    const analysis = this.analyzePatterns();
    
    let report = '=== Memory Profiling Report ===\n\n';
    
    // Profile results
    if (Object.keys(analysis.profiles).length > 0) {
      report += 'Operation Profiles:\n';
      for (const [name, stats] of Object.entries(analysis.profiles)) {
        report += `  ${name}:\n`;
        report += `    Calls: ${stats.count}\n`;
        report += `    Avg Memory: ${(stats.avgMemoryDelta / 1024).toFixed(2)} KB\n`;
        report += `    Avg Duration: ${stats.avgDuration.toFixed(2)} ms\n`;
        report += `    Memory/ms: ${(stats.memoryPerMs / 1024).toFixed(2)} KB/ms\n`;
      }
      report += '\n';
    }
    
    // Allocation hotspots
    if (analysis.hotspots.length > 0) {
      report += 'Allocation Hotspots:\n';
      for (const hotspot of analysis.hotspots) {
        report += `  ${hotspot.site}: ${hotspot.count} (${hotspot.percentage.toFixed(1)}%)\n`;
      }
      report += '\n';
    }
    
    // Object pools
    if (Object.keys(analysis.pools).length > 0) {
      report += 'Object Pools:\n';
      for (const [type, stats] of Object.entries(analysis.pools)) {
        report += `  ${type}:\n`;
        report += `    Created: ${stats.created}\n`;
        report += `    Reused: ${stats.reused}\n`;
        report += `    Reuse Rate: ${stats.reuseRate}\n`;
        report += `    Pool Size: ${stats.poolSize}\n`;
        report += `    In Use: ${stats.inUse}\n`;
      }
      report += '\n';
    }
    
    // Recommendations
    if (analysis.recommendations.length > 0) {
      report += 'Recommendations:\n';
      for (const rec of analysis.recommendations) {
        report += `  [${rec.type}] ${rec.message}\n`;
      }
    }
    
    return report;
  }

  /**
   * Reset profiler data
   */
  reset() {
    this.profiles.clear();
    this.allocationSites.clear();
    
    // Clear pool stats but keep pools
    for (const pool of this.objectPools.values()) {
      pool.stats.created = 0;
      pool.stats.reused = 0;
      pool.stats.returned = 0;
    }
  }
}

// Create singleton instance
export const memoryProfiler = new MemoryProfiler();