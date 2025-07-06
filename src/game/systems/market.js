/**
 * Market System for Universal Paperclips
 *
 * Handles clip sales, pricing, demand calculations, marketing,
 * and wire purchasing mechanics.
 */

import { BALANCE, TIMING } from "../core/constants.js";
import { errorHandler } from "../core/errorHandler.js";
import { performanceMonitor } from "../core/performanceMonitor.js";

export class MarketSystem {
  constructor(gameState) {
    this.gameState = gameState;

    // Revenue tracking
    this.incomeHistory = [];
    this.maxIncomeHistory = 10; // Track last 10 seconds
    this.lastIncomeUpdate = 0;
    this.lastRevenueCalculation = 0;

    // Wire market timing
    this.wirePriceUpdateTimer = 0;

    // Bind methods for error boundaries
    this.update = errorHandler.createErrorBoundary(
      this.update.bind(this),
      "market.update",
    );
  }

  /**
   * Calculate current demand based on price and marketing
   * @returns {number} Current demand percentage
   */
  calculateDemand() {
    const margin = this.gameState.get("market.pricing.margin");
    const marketingLevel = this.gameState.get("market.marketing.level");
    const marketingEffectiveness = this.gameState.get(
      "market.marketing.effectiveness",
    );
    const demandBoost = this.gameState.get("market.demandBoost");
    const prestigeU = this.gameState.get("prestige.u");
    const humanFlag = this.gameState.get("gameState.flags.human");

    if (humanFlag !== 1) {
      return 0; // No demand in non-human phases
    }

    // Ensure margin is positive to prevent division by zero or negative values
    const safeMargin = Math.max(0.01, margin);

    // Marketing multiplier: 1.1^(level-1)
    const marketing = Math.pow(1.1, Math.max(0, marketingLevel - 1));

    // Core demand formula from legacy code
    let demand =
      (0.8 / safeMargin) *
      marketing *
      Math.max(0, marketingEffectiveness) *
      Math.max(0, demandBoost);

    // Add prestige bonus
    demand = demand + (demand / 10) * Math.max(0, prestigeU);

    // Ensure demand is never negative
    return Math.max(0, demand);
  }

  /**
   * Attempt to sell clips based on current demand
   * @returns {Object} Sales result with clips sold and revenue
   */
  processSales() {
    const demand = this.calculateDemand();
    const unsoldClips = this.gameState.get("resources.unsoldClips");

    if (unsoldClips <= 0) {
      return { clipsSold: 0, revenue: 0 };
    }

    // Check if a sale occurs (probability based on demand)
    const saleChance = Math.min(demand / 100, 1); // Cap at 100%

    if (Math.random() < saleChance) {
      // Calculate how many clips are demanded
      const clipsDemanded = Math.floor(0.7 * Math.pow(demand, 1.15));
      return this.sellClips(clipsDemanded);
    }

    return { clipsSold: 0, revenue: 0 };
  }

  /**
   * Sell clips to customers
   * @param {number} clipsDemanded - Number of clips requested
   * @returns {Object} Sales result
   */
  sellClips(clipsDemanded) {
    const unsoldClips = this.gameState.get("resources.unsoldClips");
    const margin = this.gameState.get("market.pricing.margin");

    if (unsoldClips <= 0 || clipsDemanded <= 0) {
      return { clipsSold: 0, revenue: 0 };
    }

    // Determine actual clips to sell
    const clipsToSell = Math.min(clipsDemanded, unsoldClips);

    // Calculate revenue
    const revenue = Math.floor(clipsToSell * margin * 1000) / 1000;

    // Check if this is the first sale
    const wasFirstSale = this.gameState.get("market.totalRevenue") === 0;

    // Update game state
    this.gameState.decrement("resources.unsoldClips", clipsToSell);
    this.gameState.increment("resources.funds", revenue);
    this.gameState.increment("market.sales.clipsSold", clipsToSell);
    this.gameState.increment("market.sales.income", revenue);
    this.gameState.increment("market.totalRevenue", revenue);
    this.gameState.set("market.transaction", revenue);

    errorHandler.debug(`Sold ${clipsToSell} clips for $${revenue.toFixed(2)}`);

    // Log milestone for first sale
    if (wasFirstSale && revenue > 0 && window.renderer) {
      window.renderer.logMilestone("First sale! Your paperclip empire has begun.", "💰");
    }

    return { clipsSold: clipsToSell, revenue };
  }

  /**
   * Raise clip price
   * @param {number} amount - Amount to increase price (default 0.01)
   * @returns {boolean} Whether price was raised
   */
  raisePrice(amount = 0.01) {
    const currentMargin = this.gameState.get("market.pricing.margin");
    const newMargin = Math.round((currentMargin + amount) * 100) / 100;

    this.gameState.set("market.pricing.margin", newMargin);
    this.updateDemandDisplay();

    errorHandler.debug(`Price raised to $${newMargin.toFixed(2)}`);
    return true;
  }

  /**
   * Lower clip price
   * @param {number} amount - Amount to decrease price (default 0.01)
   * @returns {boolean} Whether price was lowered
   */
  lowerPrice(amount = 0.01) {
    const currentMargin = this.gameState.get("market.pricing.margin");

    if (currentMargin <= amount) {
      return false; // Can't go below minimum
    }

    const newMargin = Math.round((currentMargin - amount) * 100) / 100;
    this.gameState.set("market.pricing.margin", newMargin);
    this.updateDemandDisplay();

    errorHandler.debug(`Price lowered to $${newMargin.toFixed(2)}`);
    return true;
  }

  /**
   * Purchase marketing/advertising
   * @returns {boolean} Whether purchase was successful
   */
  buyMarketing() {
    const adCost = this.gameState.get("market.pricing.adCost");
    const funds = this.gameState.get("resources.funds");

    if (funds >= adCost) {
      const currentLevel = this.gameState.get("market.marketing.level");

      this.gameState.decrement("resources.funds", adCost);
      this.gameState.increment("market.marketing.level");

      // Double the cost for next ad purchase
      this.gameState.set("market.pricing.adCost", Math.floor(adCost * 2));

      errorHandler.debug(
        `Purchased marketing level ${currentLevel + 1} for $${adCost}`,
      );
      return true;
    }

    return false;
  }

  /**
   * Purchase wire
   * @returns {boolean} Whether purchase was successful
   */
  buyWire() {
    const wireCost = this.gameState.get("market.pricing.wireCost");
    const funds = this.gameState.get("resources.funds");

    if (funds >= wireCost) {
      const wireSupply = this.gameState.get("market.wire.supply");

      this.gameState.decrement("resources.funds", wireCost);
      this.gameState.increment("resources.wire", wireSupply);
      this.gameState.increment("market.wire.purchase");

      // Reset spool tracking for achievements when new wire is bought
      const currentSpoolClips =
        this.gameState.get("achievements.currentSpoolClips") || 0;
      const maxClipsPerSpool =
        this.gameState.get("achievements.maxClipsPerSpool") || 0;
      if (currentSpoolClips > maxClipsPerSpool) {
        this.gameState.set("achievements.maxClipsPerSpool", currentSpoolClips);
      }
      this.gameState.set("achievements.currentSpoolClips", 0);

      // Reset wire price timer
      this.gameState.set("market.wire.priceTimer", 0);

      // Increase base price slightly
      const basePrice = this.gameState.get("market.pricing.wireBasePrice");
      this.gameState.set("market.pricing.wireBasePrice", basePrice + 0.05);

      errorHandler.debug(`Purchased ${wireSupply} wire for $${wireCost}`);
      return true;
    }

    return false;
  }

  /**
   * Toggle automatic wire buying
   * @returns {boolean} New wire buyer status
   */
  toggleWireBuyer() {
    const currentStatus = this.gameState.get(
      "gameState.automation.wireBuyerEnabled",
    );
    const newStatus = !currentStatus;

    this.gameState.set("gameState.automation.wireBuyerEnabled", newStatus);

    errorHandler.debug(`Wire buyer ${newStatus ? "enabled" : "disabled"}`);
    return newStatus;
  }

  /**
   * Auto-buy wire if conditions are met
   */
  processAutoBuyer() {
    const wireBuyerEnabled = this.gameState.get(
      "gameState.automation.wireBuyerEnabled",
    );
    const wireBuyerFlag = this.gameState.get("gameState.flags.wireBuyer");
    const humanFlag = this.gameState.get("gameState.flags.human");
    const wire = this.gameState.get("resources.wire");

    if (
      humanFlag === 1 &&
      wireBuyerFlag === 1 &&
      wireBuyerEnabled &&
      wire <= 1
    ) {
      this.buyWire();
    }
  }

  /**
   * Update wire pricing with market fluctuations
   */
  updateWirePricing() {
    let priceTimer = this.gameState.get("market.wire.priceTimer");
    priceTimer++;
    this.gameState.set("market.wire.priceTimer", priceTimer);

    let basePrice = this.gameState.get("market.pricing.wireBasePrice");

    // Gradual price decrease over time
    if (priceTimer > 250 && basePrice > 15) {
      basePrice = basePrice - basePrice / 1000;
      this.gameState.set("market.pricing.wireBasePrice", basePrice);
      this.gameState.set("market.wire.priceTimer", 0);
    }

    // Random price fluctuation (1.5% chance per update)
    if (Math.random() < 0.015) {
      let priceCounter = this.gameState.get("market.pricing.wirePriceCounter");
      priceCounter++;
      this.gameState.set("market.pricing.wirePriceCounter", priceCounter);

      // Sine wave fluctuation
      const wireAdjust = 6 * Math.sin(priceCounter);
      const newWireCost = Math.ceil(basePrice + wireAdjust);

      this.gameState.set("market.pricing.wireCost", newWireCost);
    }
  }

  /**
   * Calculate revenue statistics
   */
  calculateRevenue() {
    const currentIncome = this.gameState.get("market.sales.income");
    const lastIncome = this.lastIncomeUpdate;

    // Calculate income since last update
    const incomeThisSecond =
      Math.round((currentIncome - lastIncome) * 100) / 100;
    this.lastIncomeUpdate = currentIncome;

    // Track income history
    this.incomeHistory.push(incomeThisSecond);
    if (this.incomeHistory.length > this.maxIncomeHistory) {
      this.incomeHistory.shift();
    }

    // Calculate average revenue over tracked period
    const totalTracked = this.incomeHistory.reduce(
      (sum, income) => sum + income,
      0,
    );
    const avgRevenue = totalTracked / this.incomeHistory.length;

    this.gameState.set(
      "market.sales.avgRevenue",
      Math.round(avgRevenue * 100) / 100,
    );

    // Calculate projected revenue based on current market conditions
    const demand = this.calculateDemand();
    const margin = this.gameState.get("market.pricing.margin");
    const unsoldClips = this.gameState.get("resources.unsoldClips");

    let chanceOfPurchase = Math.min(demand / 100, 1);
    if (unsoldClips < 1) {
      chanceOfPurchase = 0;
    }

    const projectedSales =
      chanceOfPurchase * (0.7 * Math.pow(demand, 1.15)) * 10;
    const projectedRevenue = projectedSales * margin;

    // Use actual revenue if demand exceeds inventory
    const finalProjectedRevenue =
      demand > unsoldClips ? avgRevenue : projectedRevenue;

    this.gameState.set("market.projectedRevenue", finalProjectedRevenue);
    this.gameState.set("market.projectedSales", projectedSales);
  }

  /**
   * Update demand display (called when price changes)
   */
  updateDemandDisplay() {
    const demand = this.calculateDemand();
    this.gameState.set("market.demand", demand);
  }

  /**
   * Get market statistics
   * @returns {Object} Market statistics
   */
  getStats() {
    const demand = this.calculateDemand();
    const margin = this.gameState.get("market.pricing.margin");
    const avgRevenue = this.gameState.get("market.sales.avgRevenue");
    const totalIncome = this.gameState.get("market.sales.income");
    const clipsSold = this.gameState.get("market.sales.clipsSold");

    return {
      currentDemand: demand,
      clipPrice: margin,
      averageRevenue: avgRevenue,
      totalIncome: totalIncome,
      totalClipsSold: clipsSold,
      revenuePerClip: clipsSold > 0 ? totalIncome / clipsSold : 0,
      demandEfficiency: demand > 0 ? avgRevenue / demand : 0,
      wirePrice: this.gameState.get("market.pricing.wireCost"),
      marketingLevel: this.gameState.get("market.marketing.level"),
      marketingCost: this.gameState.get("market.pricing.adCost"),
    };
  }

  /**
   * Main market system update (called by game loop)
   * @param {number} timestamp - Current timestamp
   * @param {number} deltaTime - Time since last update
   */
  update(timestamp, deltaTime) {
    performanceMonitor.measure(() => {
      // Update demand calculation
      this.updateDemandDisplay();

      // Process sales (multiple times per second)
      this.processSales();

      // Handle auto wire buyer
      this.processAutoBuyer();

      // Update wire pricing
      this.updateWirePricing();

      // Calculate revenue (once per second)
      if (timestamp - this.lastRevenueCalculation >= 1000) {
        this.calculateRevenue();
        this.lastRevenueCalculation = timestamp;
      }
    }, "market.update");
  }

  /**
   * Reset market system
   */
  reset() {
    this.incomeHistory = [];
    this.lastIncomeUpdate = 0;
    this.lastRevenueCalculation = 0;
    this.wirePriceUpdateTimer = 0;

    errorHandler.info("Market system reset");
  }

  /**
   * Get current market efficiency
   * @returns {number} Market efficiency ratio
   */
  getMarketEfficiency() {
    const demand = this.calculateDemand();
    const unsoldClips = this.gameState.get("resources.unsoldClips");

    if (demand <= 0) return 0;
    if (unsoldClips <= 0) return 0;

    // Efficiency is how well current inventory meets demand
    return Math.min(unsoldClips / demand, 1);
  }

  /**
   * Get optimal price suggestion based on demand
   * @returns {number} Suggested optimal price
   */
  getOptimalPrice() {
    const currentDemand = this.calculateDemand();
    const marketingLevel = this.gameState.get("market.marketing.level");
    const marketing = Math.pow(1.1, marketingLevel - 1);

    // Find price that maximizes revenue (demand * price)
    // This is a simplified optimization
    const optimalMargin = (0.8 * marketing) / 100;

    return Math.max(0.01, Math.round(optimalMargin * 100) / 100);
  }
}

export default MarketSystem;
