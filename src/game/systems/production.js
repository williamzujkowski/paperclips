/**
 * Production System for Universal Paperclips
 *
 * Handles all clip production mechanics including manual clipping,
 * AutoClippers, MegaClippers, and Factories.
 */

import { BALANCE } from "../core/constants.js";
import { errorHandler } from "../core/errorHandler.js";
import { performanceMonitor } from "../core/performanceMonitor.js";

export class ProductionSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.lastClipCount = 0;
    this.clipRateTracker = [];
    this.maxTrackerSize = 100;

    // Bind methods for error boundaries
    this.update = errorHandler.createErrorBoundary(
      this.update.bind(this),
      "production.update",
    );
  }

  /**
   * Core clip production function - consumes wire to make clips
   * @param {number} amount - Amount of clips to produce
   * @returns {number} Actual clips produced
   */
  produceClips(amount) {
    if (amount <= 0) return 0;

    const wire = this.gameState.get("resources.wire");
    const actualAmount = Math.min(amount, wire);

    if (actualAmount > 0) {
      // Check for endgame condition
      const dismantle = this.gameState.get("endGame.dismantle");
      if (dismantle >= 4) {
        return 0; // Stop production during endgame
      }

      // Produce clips
      this.gameState.increment("resources.clips", actualAmount);
      this.gameState.increment("resources.totalClips", actualAmount);
      this.gameState.increment("resources.unsoldClips", actualAmount);
      this.gameState.increment("resources.unusedClips", actualAmount);
      this.gameState.decrement("resources.wire", actualAmount);

      // Track clips per spool for achievements
      const currentSpoolClips =
        (this.gameState.get("achievements.currentSpoolClips") || 0) +
        actualAmount;
      this.gameState.set("achievements.currentSpoolClips", currentSpoolClips);

      // Update production tracking
      this.trackProduction(actualAmount);
    }

    return actualAmount;
  }

  /**
   * Manual clip production (clicking)
   * @param {number} amount - Number of clicks/clips to produce
   * @returns {number} Clips produced
   */
  manualClip(amount = 1) {
    return performanceMonitor.measure(() => {
      return this.produceClips(amount);
    }, "production.manualClip");
  }

  /**
   * AutoClipper production update
   * @returns {number} Clips produced this update
   */
  updateAutoClippers() {
    const level = this.gameState.get("manufacturing.clipmakers.level");
    if (level <= 0) return 0;

    const boost = this.gameState.get("production.boosts.clipper");
    const rate = boost * (level / 100); // Each clipmaker produces level/100 clips per tick

    return this.produceClips(rate);
  }

  /**
   * MegaClipper production update
   * @returns {number} Clips produced this update
   */
  updateMegaClippers() {
    const level = this.gameState.get("manufacturing.megaClippers.level");
    if (level <= 0) return 0;

    const boost = this.gameState.get("production.boosts.megaClipper");
    const rate = boost * (level * 5); // Each MegaClipper produces 5 clips per tick

    return this.produceClips(rate);
  }

  /**
   * Factory production update
   * @returns {number} Clips produced this update
   */
  updateFactories() {
    const level = this.gameState.get("manufacturing.factories.level");
    if (level <= 0) return 0;

    const boost = this.gameState.get("production.boosts.factory");
    const powMod = this.gameState.get("power.modifier") || 1;
    const factoryRate = BALANCE.FACTORY_RATE;

    const rate = powMod * boost * (level * factoryRate);

    return this.produceClips(rate);
  }

  /**
   * Purchase an AutoClipper
   * @returns {boolean} Whether purchase was successful
   */
  buyAutoClipper() {
    const level = this.gameState.get("manufacturing.clipmakers.level");
    const cost = this.calculateAutoClipperCost(level);
    const funds = this.gameState.get("resources.funds");

    if (funds >= cost) {
      this.gameState.decrement("resources.funds", cost);
      this.gameState.increment("manufacturing.clipmakers.level");
      this.gameState.set(
        "manufacturing.clipmakers.cost",
        this.calculateAutoClipperCost(level + 1),
      );

      errorHandler.debug(`Purchased AutoClipper #${level + 1} for $${cost}`);
      return true;
    }

    return false;
  }

  /**
   * Calculate AutoClipper cost
   * @param {number} level - Current level
   * @returns {number} Cost for next AutoClipper
   */
  calculateAutoClipperCost(level) {
    return (
      Math.round((Math.pow(1.1, level) + BALANCE.CLIPMAKER_BASE_COST) * 100) /
      100
    );
  }

  /**
   * Purchase a MegaClipper
   * @returns {boolean} Whether purchase was successful
   */
  buyMegaClipper() {
    const level = this.gameState.get("manufacturing.megaClippers.level");
    const cost = this.calculateMegaClipperCost(level);
    const funds = this.gameState.get("resources.funds");

    if (funds >= cost) {
      this.gameState.decrement("resources.funds", cost);
      this.gameState.increment("manufacturing.megaClippers.level");
      this.gameState.set(
        "manufacturing.megaClippers.cost",
        this.calculateMegaClipperCost(level + 1),
      );

      errorHandler.debug(`Purchased MegaClipper #${level + 1} for $${cost}`);
      return true;
    }

    return false;
  }

  /**
   * Calculate MegaClipper cost
   * @param {number} level - Current level
   * @returns {number} Cost for next MegaClipper
   */
  calculateMegaClipperCost(level) {
    // Cost grows exponentially
    return Math.pow(1.2, level) * BALANCE.MEGACLIPPER_BASE_COST;
  }

  /**
   * Purchase a Factory
   * @returns {boolean} Whether purchase was successful
   */
  buyFactory() {
    const level = this.gameState.get("manufacturing.factories.level");
    const cost = this.calculateFactoryCost(level);
    const unusedClips = this.gameState.get("resources.unusedClips");

    if (unusedClips >= cost) {
      this.gameState.decrement("resources.unusedClips", cost);
      this.gameState.increment("manufacturing.factories.level");
      this.gameState.set(
        "manufacturing.factories.cost",
        this.calculateFactoryCost(level + 1),
      );

      errorHandler.debug(`Purchased Factory #${level + 1} for ${cost} clips`);
      return true;
    }

    return false;
  }

  /**
   * Calculate Factory cost using legacy formula
   * @param {number} level - Current level
   * @returns {number} Cost for next Factory
   */
  calculateFactoryCost(level) {
    let baseCost = BALANCE.FACTORY_BASE_COST;

    // Apply the complex factory cost modifier from legacy code
    let fcmod = 1;
    if (level > 0 && level < 8) {
      fcmod = 11 - level;
    } else if (level > 7 && level < 13) {
      fcmod = 2;
    } else if (level > 12 && level < 20) {
      fcmod = 1.5;
    } else if (level > 19 && level < 39) {
      fcmod = 1.25;
    } else if (level > 38 && level < 79) {
      fcmod = 1.15;
    } else if (level >= 79) {
      fcmod = 1.1;
    }

    // Calculate total cost with compounding
    let totalCost = baseCost;
    for (let i = 0; i < level; i++) {
      totalCost *= fcmod;
    }

    return Math.floor(totalCost);
  }

  /**
   * Track clip production for rate calculation
   * @param {number} clipsProduced - Clips produced this update
   */
  trackProduction(clipsProduced) {
    this.clipRateTracker.push(clipsProduced);

    // Keep only recent samples
    if (this.clipRateTracker.length > this.maxTrackerSize) {
      this.clipRateTracker.shift();
    }

    // Calculate and update clip rate
    const totalProduced = this.clipRateTracker.reduce(
      (sum, clips) => sum + clips,
      0,
    );
    const rate = totalProduced / this.clipRateTracker.length;

    this.gameState.set("production.clipRate", rate);
  }

  /**
   * Get current production rates
   * @returns {Object} Production rates for all systems
   */
  getProductionRates() {
    const autoClipperLevel = this.gameState.get(
      "manufacturing.clipmakers.level",
    );
    const megaClipperLevel = this.gameState.get(
      "manufacturing.megaClippers.level",
    );
    const factoryLevel = this.gameState.get("manufacturing.factories.level");

    const clipperBoost = this.gameState.get("production.boosts.clipper");
    const megaClipperBoost = this.gameState.get(
      "production.boosts.megaClipper",
    );
    const factoryBoost = this.gameState.get("production.boosts.factory");
    const powMod = this.gameState.get("power.modifier") || 1;

    return {
      autoClippers: clipperBoost * (autoClipperLevel / 100),
      megaClippers: megaClipperBoost * (megaClipperLevel * 5),
      factories: powMod * factoryBoost * (factoryLevel * BALANCE.FACTORY_RATE),
      total: 0, // Will be calculated by summing the above
    };
  }

  /**
   * Get production statistics
   * @returns {Object} Production statistics
   */
  getStats() {
    const rates = this.getProductionRates();
    rates.total = rates.autoClippers + rates.megaClippers + rates.factories;

    return {
      currentRate: this.gameState.get("production.clipRate"),
      theoreticalRates: rates,
      wireEfficiency: this.calculateWireEfficiency(),
      totalClipsProduced: this.gameState.get("resources.clips"),
      autoClipperCount: this.gameState.get("manufacturing.clipmakers.level"),
      megaClipperCount: this.gameState.get("manufacturing.megaClippers.level"),
      factoryCount: this.gameState.get("manufacturing.factories.level"),
    };
  }

  /**
   * Calculate wire efficiency (clips per wire)
   * @returns {number} Wire efficiency ratio
   */
  calculateWireEfficiency() {
    const totalClips = this.gameState.get("resources.clips");
    const startingWire = BALANCE.STARTING_WIRE;
    const currentWire = this.gameState.get("resources.wire");
    const wireUsed = startingWire - currentWire;

    return wireUsed > 0 ? totalClips / wireUsed : 1;
  }

  /**
   * Main production system update
   * Called by the game loop
   */
  update() {
    performanceMonitor.measure(() => {
      // Update all production systems
      const autoClipperProduction = this.updateAutoClippers();
      const megaClipperProduction = this.updateMegaClippers();
      const factoryProduction = this.updateFactories();

      // Track total production this tick
      const totalProduction =
        autoClipperProduction + megaClipperProduction + factoryProduction;

      if (totalProduction > 0) {
        this.trackProduction(totalProduction);
      }

      // Update temporary tracking values
      this.gameState.set("production.clipRateTemp", totalProduction);
    }, "production.update");
  }

  /**
   * Reset production system
   */
  reset() {
    this.clipRateTracker = [];
    this.lastClipCount = 0;
    errorHandler.info("Production system reset");
  }

  /**
   * Check if production is possible
   * @returns {boolean} Whether production can occur
   */
  canProduce() {
    const wire = this.gameState.get("resources.wire");
    const dismantle = this.gameState.get("endGame.dismantle");

    return wire > 0 && dismantle < 4;
  }

  /**
   * Estimate time to produce target clips
   * @param {number} targetClips - Target number of clips
   * @returns {number} Estimated time in seconds
   */
  estimateProductionTime(targetClips) {
    const currentRate = this.gameState.get("production.clipRate");

    if (currentRate <= 0) {
      return Infinity;
    }

    return targetClips / currentRate;
  }
}

export default ProductionSystem;
