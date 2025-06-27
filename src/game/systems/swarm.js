/**
 * Swarm System - Manages probe swarms in space phase
 * @module SwarmSystem
 */

import { gameState } from '../core/gameState.js';
import { errorHandler } from '../core/errorHandler.js';

/**
 * @class SwarmSystem
 * @description Manages probe creation, distribution, and swarm behavior in space.
 * Only loaded when entering space phase.
 */
export class SwarmSystem {
  /**
   * Creates a new SwarmSystem instance
   * @constructor
   */
  constructor() {
    /** @type {number} Last swarm update time */
    this.lastUpdate = 0;
    /** @type {number} Probe production rate */
    this.probeProductionRate = 0;
  }

  /**
   * Initialize the swarm system
   * @returns {Promise<void>}
   */
  async init() {
    errorHandler.info('Initializing swarm system');

    // Set initial values if not already set
    if (!gameState.get('swarm.status')) {
      gameState.set('swarm.status', 1);
    }

    errorHandler.info('Swarm system initialized');
  }

  /**
   * Update swarm behavior
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    if (!gameState.get('flags.space')) {
      return;
    }

    // Update probe production
    this.updateProbeProduction(deltaTime);

    // Update swarm gifts
    this.updateSwarmGifts(deltaTime);

    // Update probe distribution
    this.updateProbeDistribution();
  }

  /**
   * Update probe production
   * @param {number} deltaTime - Time elapsed
   * @private
   */
  updateProbeProduction(deltaTime) {
    const factoryLevel = gameState.get('production.factoryLevel') || 0;
    const droneLevel = gameState.get('production.droneLevel') || 0;

    if (factoryLevel > 0) {
      const productionRate = factoryLevel * (1 + droneLevel * 0.1);
      const probesProduced = (productionRate * deltaTime) / 1000;

      gameState.increment('swarm.probeCount', probesProduced);
      gameState.increment('swarm.probesLaunched', probesProduced);
    }
  }

  /**
   * Update swarm gifts mechanic
   * @param {number} _deltaTime - Time elapsed (unused)
   * @private
   */
  updateSwarmGifts(_deltaTime) {
    const swarmStatus = gameState.get('swarm.status');
    const nextGift = gameState.get('swarm.nextGift');

    if (swarmStatus > 0 && nextGift > 0) {
      const currentTime = Date.now();

      if (currentTime >= nextGift) {
        // Grant swarm gift
        const giftAmount = Math.floor(Math.random() * 1000000) + 500000;
        gameState.increment('swarm.gifts', 1);
        gameState.increment('resources.clips', giftAmount);

        // Schedule next gift
        const giftPeriod = gameState.get('swarm.giftPeriod') || 30000;
        gameState.set('swarm.nextGift', currentTime + giftPeriod);

        errorHandler.info(`Swarm gift received: ${giftAmount} clips`);
      }
    }
  }

  /**
   * Update probe distribution among tasks
   * @private
   */
  updateProbeDistribution() {
    const totalProbes = gameState.get('swarm.probeCount') || 0;
    const harvesterRatio = gameState.get('swarm.harvesterRatio') || 0.5;
    const wireRatio = gameState.get('swarm.wireRatio') || 0.3;
    const combatRatio = gameState.get('swarm.combatRatio') || 0.2;

    // Distribute probes
    const harvesterProbes = Math.floor(totalProbes * harvesterRatio);
    const wireProbes = Math.floor(totalProbes * wireRatio);
    const combatProbes = Math.floor(totalProbes * combatRatio);

    gameState.set('swarm.harvesterProbes', harvesterProbes);
    gameState.set('swarm.wireProbes', wireProbes);
    gameState.set('swarm.combatProbes', combatProbes);
  }

  /**
   * Launch probes
   * @param {number} amount - Number of probes to launch
   * @returns {boolean} Success status
   */
  launchProbes(amount) {
    const availableProbes = gameState.get('resources.unusedClips') || 0;

    if (availableProbes >= amount) {
      gameState.decrement('resources.unusedClips', amount);
      gameState.increment('swarm.probeCount', amount);
      gameState.increment('swarm.probesLaunched', amount);
      return true;
    }

    return false;
  }

  /**
   * Set probe work distribution
   * @param {number} harvester - Harvester ratio (0-1)
   * @param {number} wire - Wire drone ratio (0-1)
   * @param {number} combat - Combat ratio (0-1)
   */
  setProbeDistribution(harvester, wire, combat) {
    const total = harvester + wire + combat;

    if (total > 0) {
      gameState.set('swarm.harvesterRatio', harvester / total);
      gameState.set('swarm.wireRatio', wire / total);
      gameState.set('swarm.combatRatio', combat / total);
    }
  }

  /**
   * Get swarm statistics
   * @returns {Object} Swarm stats
   */
  getSwarmStats() {
    return {
      totalProbes: gameState.get('swarm.probeCount'),
      probesLaunched: gameState.get('swarm.probesLaunched'),
      harvesterProbes: gameState.get('swarm.harvesterProbes'),
      wireProbes: gameState.get('swarm.wireProbes'),
      combatProbes: gameState.get('swarm.combatProbes'),
      swarmGifts: gameState.get('swarm.gifts'),
      swarmStatus: gameState.get('swarm.status'),
    };
  }
}

// Create singleton instance
const swarmSystem = new SwarmSystem();
export default swarmSystem;
