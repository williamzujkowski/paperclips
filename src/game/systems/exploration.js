/**
 * Exploration System - Manages space exploration in space phase
 * @module ExplorationSystem
 */

import { gameState } from '../core/gameState.js';
import { errorHandler } from '../core/errorHandler.js';

/**
 * @class ExplorationSystem
 * @description Manages exploration of the universe, matter acquisition, and expansion.
 * Only loaded when entering space phase.
 */
export class ExplorationSystem {
  /**
   * Creates a new ExplorationSystem instance
   * @constructor
   */
  constructor() {
    /** @type {number} Exploration progress */
    this.explorationProgress = 0;
    /** @type {number} Matter discovery rate */
    this.matterDiscoveryRate = 0;
    /** @type {Array<Object>} Discovered sectors */
    this.discoveredSectors = [];
  }

  /**
   * Initialize the exploration system
   * @returns {Promise<void>}
   */
  async init() {
    errorHandler.info('Initializing exploration system');

    // Initialize exploration state
    if (!gameState.get('exploration.exploredSpace')) {
      gameState.set('exploration.exploredSpace', 0);
      gameState.set('exploration.sectors', []);
    }

    errorHandler.info('Exploration system initialized');
  }

  /**
   * Update exploration progress
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    if (!gameState.get('flags.space')) {
      return;
    }

    // Update exploration
    this.updateExploration(deltaTime);

    // Discover matter
    this.discoverMatter(deltaTime);

    // Process discovered sectors
    this.processSectors(deltaTime);
  }

  /**
   * Update exploration progress
   * @param {number} deltaTime - Time elapsed
   * @private
   */
  updateExploration(deltaTime) {
    const probeSpeed = gameState.get('exploration.probeSpeed') || 1;
    const activeProbes = gameState.get('swarm.probeCount') || 0;

    if (activeProbes > 0) {
      const explorationRate = Math.log(activeProbes + 1) * probeSpeed;
      const progress = (explorationRate * deltaTime) / 1000;

      gameState.increment('exploration.exploredSpace', progress);

      // Check for new sector discoveries
      const explored = gameState.get('exploration.exploredSpace');
      const nextSectorThreshold = Math.pow(10, this.discoveredSectors.length + 3);

      if (explored >= nextSectorThreshold) {
        this.discoverNewSector();
      }
    }
  }

  /**
   * Discover matter in explored space
   * @param {number} deltaTime - Time elapsed
   * @private
   */
  discoverMatter(deltaTime) {
    const exploredSpace = gameState.get('exploration.exploredSpace') || 0;
    const matterDensity = gameState.get('exploration.matterDensity') || 0.1;

    if (exploredSpace > 0) {
      const discoveryRate = exploredSpace * matterDensity;
      const matterFound = (discoveryRate * deltaTime) / 1000;

      gameState.increment('resources.availableMatter', matterFound);
      gameState.increment('resources.foundMatter', matterFound);
    }
  }

  /**
   * Process discovered sectors
   * @param {number} deltaTime - Time elapsed
   * @private
   */
  processSectors(deltaTime) {
    const sectors = gameState.get('exploration.sectors') || [];

    for (const sector of sectors) {
      if (sector.active) {
        // Extract resources from sector
        const extractionRate = sector.richness * (sector.probes || 0);
        const extracted = (extractionRate * deltaTime) / 1000;

        gameState.increment('resources.acquiredMatter', extracted);

        // Deplete sector
        sector.remainingMatter = Math.max(0, sector.remainingMatter - extracted);

        if (sector.remainingMatter <= 0) {
          sector.active = false;
          errorHandler.info(`Sector ${sector.id} depleted`);
        }
      }
    }

    gameState.set('exploration.sectors', sectors);
  }

  /**
   * Discover a new sector
   * @private
   */
  discoverNewSector() {
    const sectorId = this.discoveredSectors.length + 1;
    const richness = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
    const size = Math.pow(10, 6 + Math.random() * 3); // 10^6 to 10^9

    const newSector = {
      id: sectorId,
      name: `Sector ${sectorId}`,
      richness: richness,
      totalMatter: size,
      remainingMatter: size,
      probes: 0,
      active: true,
      discovered: Date.now(),
    };

    this.discoveredSectors.push(newSector);

    const sectors = gameState.get('exploration.sectors') || [];
    sectors.push(newSector);
    gameState.set('exploration.sectors', sectors);

    errorHandler.info(`New sector discovered: ${newSector.name}`);
  }

  /**
   * Assign probes to a sector
   * @param {number} sectorId - Sector ID
   * @param {number} probeCount - Number of probes to assign
   * @returns {boolean} Success status
   */
  assignProbesToSector(sectorId, probeCount) {
    const sectors = gameState.get('exploration.sectors') || [];
    const sector = sectors.find((s) => s.id === sectorId);

    if (!sector) {
      return false;
    }

    const availableProbes = gameState.get('swarm.harvesterProbes') || 0;

    if (availableProbes >= probeCount) {
      sector.probes = (sector.probes || 0) + probeCount;
      gameState.set('exploration.sectors', sectors);
      return true;
    }

    return false;
  }

  /**
   * Get exploration statistics
   * @returns {Object} Exploration stats
   */
  getExplorationStats() {
    return {
      exploredSpace: gameState.get('exploration.exploredSpace'),
      discoveredSectors: this.discoveredSectors.length,
      activeSectors: this.discoveredSectors.filter((s) => s.active).length,
      totalMatterFound: gameState.get('resources.foundMatter'),
      matterAcquired: gameState.get('resources.acquiredMatter'),
    };
  }
}

// Create singleton instance
const explorationSystem = new ExplorationSystem();
export default explorationSystem;
