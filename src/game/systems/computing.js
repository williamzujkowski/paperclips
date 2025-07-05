/**
 * Computing System for Universal Paperclips
 *
 * Handles processors, memory, operations, creativity, trust,
 * and quantum computing mechanics.
 */

import { BALANCE } from '../core/constants.js';
import { errorHandler } from '../core/errorHandler.js';
import { performanceMonitor } from '../core/performanceMonitor.js';

export class ComputingSystem {
  constructor(gameState) {
    this.gameState = gameState;

    // Operation generation tracking
    this.lastOperationsUpdate = 0;
    this.operationGenerationRate = 1; // operations per processor per second

    // Creativity tracking
    this.lastCreativityUpdate = 0;
    this.creativityGenerationRate = 1; // creativity per processor per second

    // Bind methods for error boundaries
    this.update = errorHandler.createErrorBoundary(this.update.bind(this), 'computing.update');
  }

  /**
   * Generate operations based on processors
   * @param {number} deltaTime - Time since last update in milliseconds
   */
  generateOperations(deltaTime) {
    const processors = this.gameState.get('computing.processors');
    const creativityEnabled = this.gameState.get('computing.creativity.enabled');

    if (processors <= 0) return;

    // Calculate operations to generate
    const opsPerSecond = processors * this.operationGenerationRate;
    const opsToGenerate = (opsPerSecond * deltaTime) / 1000;

    // Split between standard operations and creativity if enabled
    if (creativityEnabled) {
      const creativitySpeed = this.gameState.get('computing.creativity.speed');
      const creativityOps = opsToGenerate * (creativitySpeed / 100);
      const standardOps = opsToGenerate - creativityOps;

      // Generate creativity
      this.gameState.increment('computing.creativity.amount', creativityOps);

      // Generate standard operations
      this.gameState.increment('computing.operations', standardOps);
    } else {
      // All operations go to standard pool
      this.gameState.increment('computing.operations', opsToGenerate);
    }
  }

  /**
   * Purchase additional processor
   * @returns {boolean} Whether purchase was successful
   */
  buyProcessor() {
    const currentProcessors = this.gameState.get('computing.processors');
    const trust = this.gameState.get('computing.trust.current');
    const operations = this.gameState.get('computing.operations');

    // Check trust limit
    if (currentProcessors >= trust) {
      return false; // Cannot exceed trust limit
    }

    // Calculate cost (exponential growth)
    const cost = Math.pow(2, currentProcessors) * 1000;

    if (operations >= cost) {
      this.gameState.decrement('computing.operations', cost);
      this.gameState.increment('computing.processors');

      errorHandler.debug(`Purchased processor #${currentProcessors + 1} for ${cost} operations`);
      return true;
    }

    return false;
  }

  /**
   * Purchase additional memory
   * @returns {boolean} Whether purchase was successful
   */
  buyMemory() {
    const currentMemory = this.gameState.get('computing.memory');
    const trust = this.gameState.get('computing.trust.current');
    const operations = this.gameState.get('computing.operations');

    // Check trust limit
    if (currentMemory >= trust) {
      return false; // Cannot exceed trust limit
    }

    // Calculate cost (exponential growth)
    const cost = Math.pow(2, currentMemory) * 1000;

    if (operations >= cost) {
      this.gameState.decrement('computing.operations', cost);
      this.gameState.increment('computing.memory');

      errorHandler.debug(`Purchased memory #${currentMemory + 1} for ${cost} operations`);
      return true;
    }

    return false;
  }

  /**
   * Increase trust (unlock more processor/memory slots)
   * @returns {boolean} Whether trust was increased
   */
  increaseTrust() {
    const currentTrust = this.gameState.get('computing.trust.current');
    const maxTrust = this.gameState.get('computing.trust.max');
    const nextThreshold = this.gameState.get('computing.trust.nextThreshold');
    const clips = this.gameState.get('resources.clips');

    if (currentTrust >= maxTrust) {
      return false; // Already at maximum trust
    }

    if (clips >= nextThreshold) {
      this.gameState.increment('computing.trust.current');

      // Calculate next threshold (increases exponentially)
      const newThreshold = Math.floor(nextThreshold * 2.5);
      this.gameState.set('computing.trust.nextThreshold', newThreshold);

      errorHandler.debug(`Trust increased to ${currentTrust + 1}, next threshold: ${newThreshold}`);
      return true;
    }

    return false;
  }

  /**
   * Purchase trust with funds (late game mechanic)
   * @returns {boolean} Whether trust was purchased
   */
  buyTrust() {
    const currentTrust = this.gameState.get('computing.trust.current');
    const maxTrust = this.gameState.get('computing.trust.max');
    const funds = this.gameState.get('resources.funds');

    if (currentTrust >= maxTrust) {
      return false;
    }

    // Trust costs increase exponentially
    const cost = Math.pow(2, currentTrust) * 10000;

    if (funds >= cost) {
      this.gameState.decrement('resources.funds', cost);
      this.gameState.increment('computing.trust.current');

      errorHandler.debug(`Purchased trust level ${currentTrust + 1} for $${cost}`);
      return true;
    }

    return false;
  }

  /**
   * Enable/disable creativity allocation
   * @param {boolean} enabled - Whether to enable creativity
   * @param {number} speed - Percentage of ops to allocate to creativity
   */
  setCreativity(enabled, speed = 50) {
    this.gameState.set('computing.creativity.enabled', enabled);

    if (enabled) {
      this.gameState.set('computing.creativity.speed', Math.max(0, Math.min(100, speed)));
      errorHandler.debug(`Creativity enabled at ${speed}% allocation`);
    } else {
      errorHandler.debug('Creativity disabled');
    }
  }

  /**
   * Spend creativity on projects
   * @param {number} amount - Amount of creativity to spend
   * @returns {boolean} Whether creativity was spent
   */
  spendCreativity(amount) {
    const currentCreativity = this.gameState.get('computing.creativity.amount');

    if (currentCreativity >= amount) {
      this.gameState.decrement('computing.creativity.amount', amount);
      return true;
    }

    return false;
  }

  /**
   * Spend operations on projects or purchases
   * @param {number} amount - Amount of operations to spend
   * @returns {boolean} Whether operations were spent
   */
  spendOperations(amount) {
    const currentOperations = this.gameState.get('computing.operations');

    if (currentOperations >= amount) {
      this.gameState.decrement('computing.operations', amount);
      return true;
    }

    return false;
  }

  /**
   * Enable quantum computing
   */
  enableQuantumComputing() {
    this.gameState.set('computing.quantum.enabled', true);
    this.gameState.set('computing.quantum.clock', 0);

    errorHandler.info('Quantum computing enabled');
  }

  /**
   * Update quantum computing
   * @param {number} deltaTime - Time since last update
   */
  updateQuantumComputing(deltaTime) {
    const quantumEnabled = this.gameState.get('computing.quantum.enabled');

    if (!quantumEnabled) return;

    // Update quantum clock
    let quantumClock = this.gameState.get('computing.quantum.clock');
    quantumClock += deltaTime / 1000; // Convert to seconds
    this.gameState.set('computing.quantum.clock', quantumClock);

    // Quantum operations generation (more efficient than regular)
    const processors = this.gameState.get('computing.processors');
    const quantumBonus = 1.5; // 50% bonus for quantum computing
    const quantumOpsPerSecond = processors * this.operationGenerationRate * quantumBonus;
    const quantumOpsToGenerate = (quantumOpsPerSecond * deltaTime) / 1000;

    this.gameState.increment('computing.operations', quantumOpsToGenerate);
  }

  /**
   * Purchase quantum chip
   * @returns {boolean} Whether chip was purchased
   */
  buyQuantumChip() {
    const operations = this.gameState.get('computing.operations');
    const chipCost = this.gameState.get('computing.quantum.chipCost');

    if (operations >= chipCost) {
      this.gameState.decrement('computing.operations', chipCost);
      this.gameState.increment('computing.quantum.nextChip');

      // Increase cost for next chip
      const newCost = Math.floor(chipCost * 1.5);
      this.gameState.set('computing.quantum.chipCost', newCost);

      errorHandler.debug(`Purchased quantum chip for ${chipCost} operations`);
      return true;
    }

    return false;
  }

  /**
   * Update operations fade effect (visual)
   * @param {number} deltaTime - Time since last update
   */
  updateOperationsFade(deltaTime) {
    let fadeTimer = this.gameState.get('computing.operations.fadeTimer');
    fadeTimer += deltaTime;

    if (fadeTimer >= this.gameState.get('computing.operations.fadeDelay')) {
      let fade = this.gameState.get('computing.operations.fade');
      fade = Math.max(0, fade - 0.1);

      this.gameState.set('computing.operations.fade', fade);
      this.gameState.set('computing.operations.fadeTimer', 0);
    } else {
      this.gameState.set('computing.operations.fadeTimer', fadeTimer);
    }
  }

  /**
   * Get computing efficiency metrics
   * @returns {Object} Computing efficiency stats
   */
  getEfficiencyStats() {
    const processors = this.gameState.get('computing.processors');
    const memory = this.gameState.get('computing.memory');
    const trust = this.gameState.get('computing.trust.current');
    const operations = this.gameState.get('computing.operations');
    const creativity = this.gameState.get('computing.creativity.amount');

    return {
      processorUtilization: processors / Math.max(trust, 1),
      memoryUtilization: memory / Math.max(trust, 1),
      operationsPerSecond: processors * this.operationGenerationRate,
      creativityPerSecond: this.gameState.get('computing.creativity.enabled')
        ? processors *
          this.operationGenerationRate *
          (this.gameState.get('computing.creativity.speed') / 100)
        : 0,
      trustUtilization: Math.max(processors, memory) / Math.max(trust, 1),
      quantumBonus: this.gameState.get('computing.quantum.enabled') ? 1.5 : 1.0
    };
  }

  /**
   * Get computing statistics
   * @returns {Object} Computing statistics
   */
  getStats() {
    const processors = this.gameState.get('computing.processors');
    const memory = this.gameState.get('computing.memory');
    const trust = this.gameState.get('computing.trust.current');
    const maxTrust = this.gameState.get('computing.trust.max');
    const operations = this.gameState.get('computing.operations');
    const creativity = this.gameState.get('computing.creativity.amount');

    return {
      processors,
      memory,
      trust,
      maxTrust,
      operations: Math.floor(operations),
      creativity: Math.floor(creativity),
      processorCost: Math.pow(2, processors) * 1000,
      memoryCost: Math.pow(2, memory) * 1000,
      trustProgress: this.gameState.get('computing.trust.nextThreshold'),
      quantumEnabled: this.gameState.get('computing.quantum.enabled'),
      creativityEnabled: this.gameState.get('computing.creativity.enabled'),
      creativitySpeed: this.gameState.get('computing.creativity.speed'),
      efficiency: this.getEfficiencyStats()
    };
  }

  /**
   * Check if computing resources are available for projects
   * @param {Object} requirements - Resource requirements
   * @returns {boolean} Whether requirements are met
   */
  canAfford(requirements) {
    const operations = this.gameState.get('computing.operations');
    const creativity = this.gameState.get('computing.creativity.amount');

    const needsOps = requirements.operations || 0;
    const needsCreativity = requirements.creativity || 0;

    return operations >= needsOps && creativity >= needsCreativity;
  }

  /**
   * Spend computing resources for projects
   * @param {Object} cost - Resource costs
   * @returns {boolean} Whether resources were spent
   */
  spend(cost) {
    if (!this.canAfford(cost)) {
      return false;
    }

    if (cost.operations) {
      this.spendOperations(cost.operations);
    }

    if (cost.creativity) {
      this.spendCreativity(cost.creativity);
    }

    return true;
  }

  /**
   * Main computing system update
   * @param {number} timestamp - Current timestamp
   * @param {number} deltaTime - Time since last update
   */
  update(timestamp, deltaTime) {
    performanceMonitor.measure(() => {
      // Generate operations and creativity
      this.generateOperations(deltaTime);

      // Update quantum computing if enabled
      this.updateQuantumComputing(deltaTime);

      // Update visual effects
      this.updateOperationsFade(deltaTime);

      // Check for automatic trust increases
      this.increaseTrust();
    }, 'computing.update');
  }

  /**
   * Reset computing system
   */
  reset() {
    this.lastOperationsUpdate = 0;
    this.lastCreativityUpdate = 0;

    errorHandler.info('Computing system reset');
  }

  /**
   * Get optimal processor/memory allocation
   * @returns {Object} Allocation recommendations
   */
  getOptimalAllocation() {
    const trust = this.gameState.get('computing.trust.current');
    const processors = this.gameState.get('computing.processors');
    const memory = this.gameState.get('computing.memory');

    // Balanced allocation for most efficient operation generation
    const optimalProcessors = Math.ceil(trust * 0.6);
    const optimalMemory = Math.floor(trust * 0.4);

    return {
      processors: {
        current: processors,
        optimal: optimalProcessors,
        recommendation:
          processors < optimalProcessors
            ? 'increase'
            : processors > optimalProcessors
              ? 'sufficient'
              : 'optimal'
      },
      memory: {
        current: memory,
        optimal: optimalMemory,
        recommendation:
          memory < optimalMemory ? 'increase' : memory > optimalMemory ? 'sufficient' : 'optimal'
      }
    };
  }
}

export default ComputingSystem;
