/**
 * Production system - handles paperclip manufacturing and automation
 */

import { gameState } from '../core/gameState.js';

export class ProductionSystem {
  constructor() {
    this.baseClipTime = 1000; // milliseconds per manual clip
    this.lastClipTime = 0;
  }

  /**
   * Update production rates and process automated production
   */
  update(deltaTime) {
    // Calculate clip production rate
    this.updateClipRate();
    
    // Process automated production
    this.processAutomatedProduction(deltaTime);
    
    // Update wire consumption
    this.updateWireConsumption();
    
    // Update factory systems if unlocked
    if (gameState.get('flags.factory')) {
      this.updateFactoryProduction(deltaTime);
    }
  }

  /**
   * Calculate current clip production rate
   */
  updateClipRate() {
    let rate = 0;
    
    // Add clipmaker production
    const clipmakerLevel = gameState.get('production.clipmakerLevel');
    const clipperBoost = gameState.get('production.clipperBoost');
    if (clipmakerLevel > 0) {
      rate += clipmakerLevel * clipperBoost;
    }
    
    // Add megaclipper production
    const megaClipperLevel = gameState.get('production.megaClipperLevel');
    const megaClipperBoost = gameState.get('production.megaClipperBoost');
    if (megaClipperLevel > 0) {
      rate += megaClipperLevel * megaClipperBoost * 500;
    }
    
    gameState.set('production.clipRate', rate);
    gameState.set('production.clipRateTemp', rate);
  }

  /**
   * Process automated clip production
   */
  processAutomatedProduction(deltaTime) {
    const clipRate = gameState.get('production.clipRate');
    const wire = gameState.get('resources.wire');
    
    if (clipRate > 0 && wire > 0) {
      // Calculate clips to produce this tick
      const clipsToMake = (clipRate * deltaTime) / 1000;
      const wireNeeded = Math.ceil(clipsToMake);
      
      if (wire >= wireNeeded) {
        // Produce clips
        gameState.increment('resources.clips', clipsToMake);
        gameState.increment('resources.unusedClips', clipsToMake);
        gameState.decrement('resources.wire', wireNeeded);
      } else {
        // Partial production based on available wire
        const partialClips = wire;
        gameState.increment('resources.clips', partialClips);
        gameState.increment('resources.unusedClips', partialClips);
        gameState.set('resources.wire', 0);
      }
    }
  }

  /**
   * Make a single paperclip manually
   */
  makeClip() {
    const wire = gameState.get('resources.wire');
    
    if (wire >= 1) {
      gameState.increment('resources.clips');
      gameState.increment('resources.unusedClips');
      gameState.decrement('resources.wire');
      
      // Track manual clip production for achievements
      gameState.increment('meta.manualClips');
      
      return true;
    }
    
    return false;
  }

  /**
   * Buy an auto-clipper
   */
  buyAutoClipper() {
    const funds = gameState.get('resources.funds');
    const cost = gameState.get('market.clipperCost');
    
    if (funds >= cost) {
      gameState.decrement('resources.funds', cost);
      gameState.increment('production.clipmakerLevel');
      
      // Increase cost for next clipper
      const newCost = Math.ceil(cost * 1.1);
      gameState.set('market.clipperCost', newCost);
      
      // Update clip rate
      this.updateClipRate();
      
      return true;
    }
    
    return false;
  }

  /**
   * Buy a mega-clipper
   */
  buyMegaClipper() {
    const funds = gameState.get('resources.funds');
    const cost = gameState.get('market.megaClipperCost');
    
    if (funds >= cost) {
      gameState.decrement('resources.funds', cost);
      gameState.increment('production.megaClipperLevel');
      
      // Increase cost for next mega-clipper
      const newCost = Math.ceil(cost * 1.12);
      gameState.set('market.megaClipperCost', newCost);
      
      // Update clip rate
      this.updateClipRate();
      
      return true;
    }
    
    return false;
  }

  /**
   * Update wire consumption tracking
   */
  updateWireConsumption() {
    const clipRate = gameState.get('production.clipRate');
    const wireConsumptionRate = clipRate; // 1 wire per clip
    
    gameState.set('production.wireConsumptionRate', wireConsumptionRate);
  }

  /**
   * Update factory production (space phase)
   */
  updateFactoryProduction(deltaTime) {
    const factoryLevel = gameState.get('infrastructure.factoryLevel');
    const factoryBoost = gameState.get('production.factoryBoost');
    const availableMatter = gameState.get('resources.availableMatter');
    
    if (factoryLevel > 0 && availableMatter > 0) {
      const productionRate = factoryLevel * factoryBoost;
      const matterToProcess = Math.min(
        (productionRate * deltaTime) / 1000,
        availableMatter,
      );
      
      if (matterToProcess > 0) {
        gameState.decrement('resources.availableMatter', matterToProcess);
        gameState.increment('resources.processedMatter', matterToProcess);
        gameState.increment('resources.wire', matterToProcess * 1000); // 1 matter = 1000 wire
      }
    }
  }

  /**
   * Get current production statistics
   */
  getProductionStats() {
    return {
      clipRate: gameState.get('production.clipRate'),
      clipmakerLevel: gameState.get('production.clipmakerLevel'),
      megaClipperLevel: gameState.get('production.megaClipperLevel'),
      factoryLevel: gameState.get('infrastructure.factoryLevel'),
      wireConsumptionRate: gameState.get('production.wireConsumptionRate') || 0,
      factoryRate: gameState.get('production.factoryRate'),
    };
  }

  /**
   * Apply production boost (from projects/upgrades)
   */
  applyProductionBoost(type, multiplier) {
    switch (type) {
      case 'clipper':
        gameState.set('production.clipperBoost', multiplier);
        break;
      case 'megaClipper':
        gameState.set('production.megaClipperBoost', multiplier);
        break;
      case 'factory':
        gameState.set('production.factoryBoost', multiplier);
        break;
      case 'drone':
        gameState.set('production.droneBoost', multiplier);
        break;
    }
    
    // Recalculate rates
    this.updateClipRate();
  }
}

// Create singleton instance
export const productionSystem = new ProductionSystem();