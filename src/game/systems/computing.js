/**
 * Computing system - handles processors, memory, operations, and quantum computing
 * @module ComputingSystem
 */

import { gameState } from '../core/gameState.js';

/**
 * @class ComputingSystem
 * @description Manages computational resources, operations generation, creativity, and quantum computing.
 * Handles processor/memory allocation, trust limits, and quantum chip generation.
 */
export class ComputingSystem {
  /**
   * Creates a new ComputingSystem instance
   * @constructor
   */
  constructor() {
    /** @type {number|null} Timer for quantum compute operations */
    this.quantumComputeTimer = null;
    /** @type {number} Timestamp of last quantum compute */
    this.lastQuantumCompute = 0;
    /** @type {number} Base creativity generation rate per processor per second */
    this.creativityBaseRate = 0.001;
  }

  /**
   * Update computing resources - operations, creativity, and quantum computing
   * @param {number} deltaTime - Time elapsed since last update in milliseconds
   * @returns {void}
   */
  update(deltaTime) {
    // Generate operations
    this.generateOperations(deltaTime);
    
    // Generate creativity
    this.generateCreativity(deltaTime);
    
    // Process quantum computing if available
    if (gameState.get('flags.quantum')) {
      this.updateQuantumComputing(deltaTime);
    }
  }

  /**
   * Generate operations based on processor and memory count
   * @param {number} deltaTime - Time elapsed since last update in milliseconds
   * @returns {void}
   * @private
   */
  generateOperations(deltaTime) {
    const processors = gameState.get('computing.processors');
    const memory = gameState.get('computing.memory');
    
    if (processors > 0) {
      // Operations generated per second = processors * memory
      const opsPerSecond = processors * memory;
      const opsGenerated = (opsPerSecond * deltaTime) / 1000;
      
      const currentOps = gameState.get('computing.operations');
      const maxOps = memory * 1000; // Max operations = memory * 1000
      
      const newOps = Math.min(currentOps + opsGenerated, maxOps);
      gameState.set('computing.operations', newOps);
    }
  }

  /**
   * Generate creativity based on processor count and creativity speed
   * @param {number} deltaTime - Time elapsed since last update in milliseconds
   * @returns {void}
   * @private
   */
  generateCreativity(deltaTime) {
    const processors = gameState.get('computing.processors');
    const creativityOn = gameState.get('flags.creativity');
    
    if (processors > 0 && creativityOn) {
      const creativitySpeed = gameState.get('computing.creativitySpeed') || this.creativityBaseRate;
      const creativityGenerated = (processors * creativitySpeed * deltaTime) / 1000;
      
      gameState.increment('computing.creativity', creativityGenerated);
      
      // Update creativity counter for display
      const counter = gameState.get('computing.creativityCounter') || 0;
      gameState.set('computing.creativityCounter', counter + creativityGenerated);
    }
  }

  /**
   * Add a processor if within trust limits
   * @returns {boolean} True if processor was added, false if at trust limit
   * @example
   * if (computingSystem.addProcessor()) {
   *   console.log('Processor added!');
   * }
   */
  addProcessor() {
    const trust = gameState.get('computing.trust');
    const processors = gameState.get('computing.processors');
    const memory = gameState.get('computing.memory');
    
    // Can only add if total (processors + memory) < trust
    if (processors + memory < trust) {
      gameState.increment('computing.processors');
      return true;
    }
    
    return false;
  }

  /**
   * Add memory if within trust limits
   * @returns {boolean} True if memory was added, false if at trust limit
   * @example
   * if (computingSystem.addMemory()) {
   *   console.log('Memory added!');
   * }
   */
  addMemory() {
    const trust = gameState.get('computing.trust');
    const processors = gameState.get('computing.processors');
    const memory = gameState.get('computing.memory');
    
    // Can only add if total (processors + memory) < trust
    if (processors + memory < trust) {
      gameState.increment('computing.memory');
      return true;
    }
    
    return false;
  }

  /**
   * Spend operations if available
   * @param {number} amount - Amount of operations to spend
   * @returns {boolean} True if operations were spent, false if insufficient
   * @example
   * if (computingSystem.spendOperations(1000)) {
   *   console.log('Operations spent!');
   * }
   */
  spendOperations(amount) {
    const currentOps = gameState.get('computing.operations');
    
    if (currentOps >= amount) {
      gameState.decrement('computing.operations', amount);
      return true;
    }
    
    return false;
  }

  /**
   * Spend creativity if available
   * @param {number} amount - Amount of creativity to spend
   * @returns {boolean} True if creativity was spent, false if insufficient
   * @example
   * if (computingSystem.spendCreativity(50)) {
   *   console.log('Creativity spent!');
   * }
   */
  spendCreativity(amount) {
    const currentCreativity = gameState.get('computing.creativity');
    
    if (currentCreativity >= amount) {
      gameState.decrement('computing.creativity', amount);
      return true;
    }
    
    return false;
  }

  /**
   * Update quantum computing timer and check for chip generation
   * @param {number} deltaTime - Time elapsed since last update in milliseconds
   * @returns {void}
   * @private
   */
  updateQuantumComputing(deltaTime) {
    const qClock = gameState.get('computing.qClock') || 0;
    const nextQchip = gameState.get('computing.nextQchip') || 0;
    
    // Increment quantum clock
    const newQClock = qClock + deltaTime;
    gameState.set('computing.qClock', newQClock);
    
    // Check if time to generate quantum chip
    if (nextQchip > 0 && newQClock >= nextQchip) {
      this.generateQuantumChip();
    }
  }

  /**
   * Start quantum computation if operations available
   * @returns {boolean} True if quantum compute started, false if insufficient operations
   * @example
   * if (computingSystem.startQuantumCompute()) {
   *   console.log('Quantum computation started!');
   * }
   */
  startQuantumCompute() {
    const operations = gameState.get('computing.operations');
    const qChipCost = gameState.get('computing.qChipCost');
    
    if (operations >= qChipCost) {
      gameState.decrement('computing.operations', qChipCost);
      
      // Set next quantum chip time (random between 5-15 seconds)
      const computeTime = 5000 + Math.random() * 10000;
      gameState.set('computing.nextQchip', Date.now() + computeTime);
      gameState.set('computing.qClock', 0);
      
      // Increase cost for next chip
      const newCost = Math.ceil(qChipCost * 1.5);
      gameState.set('computing.qChipCost', newCost);
      
      return true;
    }
    
    return false;
  }

  /**
   * Generate quantum chip result - randomly boosts operations or creativity
   * @returns {{type: string, amount: number}} Result object with type and amount of bonus
   * @private
   */
  generateQuantumChip() {
    // Quantum computing gives random boost to operations or creativity
    const result = Math.random();
    
    if (result < 0.5) {
      // Boost operations
      const currentOps = gameState.get('computing.operations');
      const bonus = Math.floor(Math.random() * 10000) + 5000;
      gameState.set('computing.operations', currentOps + bonus);
      
      // Reset quantum state
      gameState.set('computing.nextQchip', 0);
      
      return { type: 'operations', amount: bonus };
    } else {
      // Boost creativity
      const bonus = Math.floor(Math.random() * 500) + 250;
      gameState.increment('computing.creativity', bonus);
      
      // Reset quantum state
      gameState.set('computing.nextQchip', 0);
      
      return { type: 'creativity', amount: bonus };
    }
  }

  /**
   * Get current computing statistics
   * @returns {Object} Computing statistics including processors, memory, operations, etc.
   * @example
   * const stats = computingSystem.getComputingStats();
   * console.log(`Operations: ${stats.operations}/${stats.maxOperations}`);
   */
  getComputingStats() {
    return {
      processors: gameState.get('computing.processors'),
      memory: gameState.get('computing.memory'),
      operations: gameState.get('computing.operations'),
      maxOperations: gameState.get('computing.memory') * 1000,
      creativity: gameState.get('computing.creativity'),
      trust: gameState.get('computing.trust'),
      maxTrust: gameState.get('computing.maxTrust'),
      qChipCost: gameState.get('computing.qChipCost'),
      quantumActive: gameState.get('computing.nextQchip') > 0,
    };
  }

  /**
   * Add trust points (increases processor/memory allocation limit)
   * @param {number} [amount=1] - Amount of trust to add
   * @returns {void}
   * @example
   * computingSystem.addTrust(2); // Add 2 trust points
   */
  addTrust(amount = 1) {
    gameState.increment('computing.trust', amount);
    
    // Update max trust
    const currentMaxTrust = gameState.get('computing.maxTrust');
    const newTrust = gameState.get('computing.trust');
    if (newTrust > currentMaxTrust) {
      gameState.set('computing.maxTrust', newTrust);
    }
  }

  /**
   * Set creativity generation speed multiplier
   * @param {number} speed - New creativity generation speed
   * @returns {void}
   * @example
   * computingSystem.setCreativitySpeed(0.01); // Set to 1% per processor per second
   */
  setCreativitySpeed(speed) {
    gameState.set('computing.creativitySpeed', speed);
  }
}

// Create singleton instance
export const computingSystem = new ComputingSystem();