/**
 * Market system - handles sales, pricing, marketing, and economic simulation
 */

import { gameState } from '../core/gameState.js';

export class MarketSystem {
  constructor() {
    this.demandUpdateInterval = 1000; // Update demand every second
    this.lastDemandUpdate = 0;
    this.priceHistory = [];
    this.maxPriceHistory = 100;
  }

  /**
   * Update market simulation
   */
  update(deltaTime, currentTime) {
    // Update demand periodically
    if (currentTime - this.lastDemandUpdate >= this.demandUpdateInterval) {
      this.updateDemand();
      this.lastDemandUpdate = currentTime;
    }
    
    // Process sales
    this.processSales(deltaTime);
    
    // Update revenue tracking
    this.updateRevenueTracking();
    
    // Update wire prices if wire buyer is active
    if (gameState.get('flags.wireBuyer')) {
      this.updateWirePrices();
    }
  }

  /**
   * Update market demand based on price and marketing
   */
  updateDemand() {
    const margin = gameState.get('market.margin');
    const marketingLvl = gameState.get('market.marketingLvl');
    const marketingEffectiveness = gameState.get('market.marketingEffectiveness');
    const demandBoost = gameState.get('market.demandBoost');
    
    // Base demand calculation
    let demand = 10;
    
    // Price affects demand (lower price = higher demand)
    const priceFactor = Math.max(0.1, 2 - (margin * 100));
    demand *= priceFactor;
    
    // Marketing increases demand
    demand *= (1 + (marketingLvl * marketingEffectiveness * 0.1));
    
    // Apply demand boost from projects
    demand *= demandBoost;
    
    // Add some randomness
    demand *= (0.9 + Math.random() * 0.2);
    
    // Set minimum demand
    demand = Math.max(1, demand);
    
    gameState.set('market.demand', demand);
  }

  /**
   * Process clip sales based on demand
   */
  processSales(deltaTime) {
    const demand = gameState.get('market.demand');
    const unsoldClips = gameState.get('resources.unsoldClips');
    const margin = gameState.get('market.margin');
    
    if (unsoldClips > 0 && demand > 0) {
      // Calculate clips to sell this tick
      const salesRate = demand * (deltaTime / 1000);
      const clipsToSell = Math.min(salesRate, unsoldClips);
      
      if (clipsToSell > 0) {
        // Process sale
        const revenue = clipsToSell * margin;
        gameState.increment('resources.funds', revenue);
        gameState.decrement('resources.unsoldClips', clipsToSell);
        gameState.increment('resources.clipsSold', clipsToSell);
        
        // Track revenue
        this.trackRevenue(revenue);
      }
    }
  }

  /**
   * Sell clips manually (for button click)
   */
  sellClips(amount = null) {
    const unsoldClips = gameState.get('resources.unsoldClips');
    const margin = gameState.get('market.margin');
    
    // If no amount specified, sell all
    const clipsToSell = amount || unsoldClips;
    
    if (clipsToSell > 0 && clipsToSell <= unsoldClips) {
      const revenue = clipsToSell * margin;
      gameState.increment('resources.funds', revenue);
      gameState.decrement('resources.unsoldClips', clipsToSell);
      gameState.increment('resources.clipsSold', clipsToSell);
      
      this.trackRevenue(revenue);
      return true;
    }
    
    return false;
  }

  /**
   * Track revenue for averaging
   */
  trackRevenue(revenue) {
    const incomeTracker = gameState.get('market.incomeTracker') || [];
    incomeTracker.push(revenue);
    
    // Keep only recent revenue data
    if (incomeTracker.length > 100) {
      incomeTracker.shift();
    }
    
    gameState.set('market.incomeTracker', incomeTracker);
    gameState.set('market.income', revenue);
  }

  /**
   * Update average revenue calculation
   */
  updateRevenueTracking() {
    const incomeTracker = gameState.get('market.incomeTracker') || [];
    
    if (incomeTracker.length > 0) {
      const avgRev = incomeTracker.reduce((a, b) => a + b, 0) / incomeTracker.length;
      gameState.set('market.avgRev', avgRev);
    }
  }

  /**
   * Adjust clip price
   */
  adjustPrice(direction) {
    const currentMargin = gameState.get('market.margin');
    const adjustment = 0.01;
    
    if (direction === 'raise') {
      const newMargin = Math.min(5, currentMargin + adjustment);
      gameState.set('market.margin', newMargin);
    } else if (direction === 'lower') {
      const newMargin = Math.max(0.01, currentMargin - adjustment);
      gameState.set('market.margin', newMargin);
    }
    
    // Record price in history
    this.priceHistory.push({
      time: Date.now(),
      price: gameState.get('market.margin'),
    });
    
    if (this.priceHistory.length > this.maxPriceHistory) {
      this.priceHistory.shift();
    }
  }

  /**
   * Buy marketing
   */
  buyMarketing() {
    const funds = gameState.get('resources.funds');
    const cost = gameState.get('market.adCost');
    
    if (funds >= cost) {
      gameState.decrement('resources.funds', cost);
      gameState.increment('market.marketingLvl');
      
      // Increase cost for next level
      const newCost = Math.ceil(cost * 2);
      gameState.set('market.adCost', newCost);
      
      return true;
    }
    
    return false;
  }

  /**
   * Buy wire
   */
  buyWire(amount) {
    const funds = gameState.get('resources.funds');
    const wireCost = gameState.get('market.wireCost');
    const totalCost = wireCost * (amount / 1000); // Wire sold in spools of 1000
    
    if (funds >= totalCost) {
      gameState.decrement('resources.funds', totalCost);
      gameState.increment('resources.wire', amount);
      return true;
    }
    
    return false;
  }

  /**
   * Update wire prices (fluctuate based on market)
   */
  updateWirePrices() {
    const basePrice = gameState.get('market.wireBasePrice');
    const currentPrice = gameState.get('market.wireCost');
    
    // Random walk with mean reversion
    const change = (Math.random() - 0.5) * 2;
    const reversion = (basePrice - currentPrice) * 0.1;
    
    const newPrice = Math.max(5, Math.min(50, currentPrice + change + reversion));
    gameState.set('market.wireCost', Math.round(newPrice * 100) / 100);
  }

  /**
   * Get market statistics
   */
  getMarketStats() {
    return {
      demand: gameState.get('market.demand'),
      margin: gameState.get('market.margin'),
      unsoldClips: gameState.get('resources.unsoldClips'),
      avgRevenue: gameState.get('market.avgRev'),
      marketingLevel: gameState.get('market.marketingLvl'),
      wireCost: gameState.get('market.wireCost'),
    };
  }

  /**
   * Apply marketing boost (from projects)
   */
  applyMarketingBoost(multiplier) {
    gameState.set('market.marketingEffectiveness', multiplier);
  }

  /**
   * Apply demand boost (from projects)
   */
  applyDemandBoost(multiplier) {
    gameState.set('market.demandBoost', multiplier);
  }
}

// Create singleton instance
export const marketSystem = new MarketSystem();