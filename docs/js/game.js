(function () {
  'use strict';

  /**
   * GameState class - Manages all game state in a centralized, encapsulated manner
   * Replaces global variables with proper state management
   */
  class GameState {
    constructor() {
      // Core Resources & Production
      this.resources = {
        clips: 0,
        unusedClips: 0,
        unsoldClips: 0,
        clipsSold: 0,
        finalClips: 0,
        funds: 0,
        bankroll: 0,
        wire: 1000,
        wireSupply: 1000,
        nanoWire: 0,
        availableMatter: 0,
        acquiredMatter: 0,
        processedMatter: 0,
        totalMatter: 0,
        foundMatter: 0
      };

      // Production Rates & Efficiency
      this.production = {
        clipRate: 0,
        clipRateTemp: 0,
        clipRateTracker: 0,
        clipmakerRate: 0,
        clipmakerLevel: 0,
        clipmakerLevel2: 0,
        megaClipperLevel: 0,
        clipperBoost: 1,
        megaClipperBoost: 1,
        factoryBoost: 1,
        droneBoost: 1,
        factoryRate: 0,
        harvesterRate: 0,
        wireDroneRate: 0,
        farmRate: 0
      };

      // Economics & Market
      this.market = {
        margin: 0.01,
        demand: 10,
        demandBoost: 1,
        marketingLvl: 1,
        marketingEffectiveness: 1,
        wireCost: 20,
        wireBasePrice: 20,
        clipperCost: 5,
        megaClipperCost: 500,
        marketing: 1,
        adCost: 100,
        avgRev: 0,
        income: 0,
        incomeTracker: [0]
      };

      // Computing Resources
      this.computing = {
        processors: 1,
        memory: 1,
        operations: 0,
        tempOps: 0,
        standardOps: 0,
        trust: 2,
        maxTrust: 2,
        nextTrust: 3000,
        maxTrustCost: 3000,
        creativity: 0,
        creativitySpeed: 0,
        creativityCounter: 0,
        qChipCost: 10000,
        nextQchip: 0,
        qClock: 0
      };

      // Infrastructure
      this.infrastructure = {
        factoryLevel: 0,
        factoryCost: 100000000,
        factoryBill: 0,
        harvesterLevel: 0,
        harvesterCost: 1000000,
        harvesterBill: 0,
        wireDroneLevel: 0,
        wireDroneCost: 1000000,
        wireDroneBill: 0,
        farmLevel: 0,
        farmCost: 10000000,
        batteryLevel: 0,
        batteryCost: 1000000000,
        storedPower: 0,
        batterySize: 0
      };

      // Combat System
      this.combat = {
        probeCombat: 0,
        drifterCombat: 0,
        attackSpeed: 0.2,
        battleSpeed: 0.2,
        battles: [],
        battleID: 0,
        maxBattles: 1,
        battleClock: 0,
        driftersKilled: 0,
        honor: 0,
        honorCount: 0,
        bonusHonor: 0
      };

      // Game Progression Flags
      this.flags = {
        human: true,
        trust: false,
        creation: false,
        space: false,
        factory: false,
        harvester: false,
        wireDrone: false,
        battle: false,
        swarm: false,
        milestone: false,
        projects: false,
        comp: false,
        revPerSec: false,
        autoClipper: false,
        megaClipper: false,
        wireBuyer: false,
        strategyEngine: false,
        investmentEngine: false
      };

      // AI & Swarm
      this.swarm = {
        status: 0,
        gifts: 0,
        nextGift: 0,
        giftPeriod: 0,
        giftCountdown: 0,
        probeCount: 0,
        disorgCounter: 0,
        disorgFlag: 0,
        boredomLevel: 0,
        boredomFlag: 0
      };

      // UI & Display
      this.ui = {
        ticks: 0,
        blinkCounter: 0,
        elapsedTime: 0,
        wirePriceTimer: 0,
        opFadeTimer: 0,
        endTimer1: 0,
        endTimer2: 0,
        endTimer3: 0,
        endTimer4: 0,
        endTimer5: 0,
        endTimer6: 0,
        battleEndTimer: 0,
        sliderPos: 50,
        qFade: 1,
        opFade: 1
      };

      // Game Meta
      this.meta = {
        prestigeU: 0,
        prestigeS: 0,
        dismantle: 0,
        resetFlag: 0,
        transaction: null
      };
    }

    /**
     * Save game state to localStorage
     */
    save() {
      try {
        const saveData = {
          version: '2.0.0',
          timestamp: Date.now(),
          state: {
            resources: this.resources,
            production: this.production,
            market: this.market,
            computing: this.computing,
            infrastructure: this.infrastructure,
            combat: this.combat,
            flags: this.flags,
            swarm: this.swarm,
            ui: this.ui,
            meta: this.meta
          }
        };
        localStorage.setItem('universalPaperclipsSave', JSON.stringify(saveData));
        return true;
      } catch (error) {
        console.error('Failed to save game:', error);
        return false;
      }
    }

    /**
     * Load game state from localStorage
     */
    load() {
      try {
        const saveData = localStorage.getItem('universalPaperclipsSave');
        if (!saveData) {
          return false;
        }
        const parsed = JSON.parse(saveData);

        // Validate save data
        if (!parsed.state || !parsed.version) {
          console.warn('Invalid save data format');
          return false;
        }

        // Restore state
        Object.assign(this.resources, parsed.state.resources || {});
        Object.assign(this.production, parsed.state.production || {});
        Object.assign(this.market, parsed.state.market || {});
        Object.assign(this.computing, parsed.state.computing || {});
        Object.assign(this.infrastructure, parsed.state.infrastructure || {});
        Object.assign(this.combat, parsed.state.combat || {});
        Object.assign(this.flags, parsed.state.flags || {});
        Object.assign(this.swarm, parsed.state.swarm || {});
        Object.assign(this.ui, parsed.state.ui || {});
        Object.assign(this.meta, parsed.state.meta || {});
        return true;
      } catch (error) {
        console.error('Failed to load game:', error);
        return false;
      }
    }

    /**
     * Reset game state to initial values
     */
    reset() {
      const newState = new GameState();
      Object.assign(this, newState);
      this.save();
    }

    /**
     * Export save data as string for sharing
     */
    exportSave() {
      const saveData = localStorage.getItem('universalPaperclipsSave');
      if (!saveData) {
        return null;
      }
      return btoa(saveData);
    }

    /**
     * Import save data from string
     */
    importSave(encodedSave) {
      try {
        const saveData = atob(encodedSave);
        localStorage.setItem('universalPaperclipsSave', saveData);
        return this.load();
      } catch (error) {
        console.error('Failed to import save:', error);
        return false;
      }
    }

    /**
     * Get a specific state value by path (e.g., 'resources.clips')
     */
    get(path) {
      const keys = path.split('.');
      let value = this;
      for (const key of keys) {
        value = value[key];
        if (value === undefined) {
          return undefined;
        }
      }
      return value;
    }

    /**
     * Set a specific state value by path
     */
    set(path, newValue) {
      const keys = path.split('.');
      const lastKey = keys.pop();
      let target = this;
      for (const key of keys) {
        if (!(key in target)) {
          target[key] = {};
        }
        target = target[key];
      }
      target[lastKey] = newValue;
    }

    /**
     * Increment a numeric value
     */
    increment(path, amount = 1) {
      const current = this.get(path) || 0;
      this.set(path, current + amount);
    }

    /**
     * Decrement a numeric value
     */
    decrement(path, amount = 1) {
      const current = this.get(path) || 0;
      this.set(path, Math.max(0, current - amount));
    }
  }

  // Create singleton instance
  const gameState = new GameState();

  /**
   * Game constants and configuration values
   * These values don't change during gameplay
   */

  const AUTOSAVE_INTERVAL = 30000; // 30 seconds

  // Display constants
  const DISPLAY_UPDATE_INTERVAL = 16; // ~60fps

  // Number formatting thresholds
  const NOTATION_THRESHOLD = 1e6;
  const SCIENTIFIC_THRESHOLD = 1e21;

  /**
   * Main game loop controller
   * Handles game updates, rendering, and timing
   */

  class GameLoop {
    constructor() {
      this.running = false;
      this.lastUpdate = Date.now();
      this.lastRender = Date.now();
      this.lastAutosave = Date.now();
      this.updateHandlers = [];
      this.renderHandlers = [];
      this.animationFrameId = null;
    }

    /**
     * Register an update handler function
     * Update handlers are called every tick for game logic
     */
    addUpdateHandler(handler) {
      if (typeof handler === 'function') {
        this.updateHandlers.push(handler);
      }
    }

    /**
     * Register a render handler function
     * Render handlers are called for UI updates
     */
    addRenderHandler(handler) {
      if (typeof handler === 'function') {
        this.renderHandlers.push(handler);
      }
    }

    /**
     * Remove an update handler
     */
    removeUpdateHandler(handler) {
      const index = this.updateHandlers.indexOf(handler);
      if (index > -1) {
        this.updateHandlers.splice(index, 1);
      }
    }

    /**
     * Remove a render handler
     */
    removeRenderHandler(handler) {
      const index = this.renderHandlers.indexOf(handler);
      if (index > -1) {
        this.renderHandlers.splice(index, 1);
      }
    }

    /**
     * Start the game loop
     */
    start() {
      if (this.running) {
        return;
      }
      this.running = true;
      this.lastUpdate = Date.now();
      this.lastRender = Date.now();
      this.lastAutosave = Date.now();
      this.loop();
    }

    /**
     * Stop the game loop
     */
    stop() {
      this.running = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }

    /**
     * Main loop function
     */
    loop() {
      if (!this.running) {
        return;
      }
      const now = Date.now();
      const updateDelta = now - this.lastUpdate;
      const renderDelta = now - this.lastRender;
      const autosaveDelta = now - this.lastAutosave;

      // Update game state (variable rate based on actual time passed)
      if (updateDelta > 0) {
        this.update(updateDelta);
        this.lastUpdate = now;
      }

      // Render UI updates (capped at ~60fps)
      if (renderDelta >= DISPLAY_UPDATE_INTERVAL) {
        this.render();
        this.lastRender = now;
      }

      // Autosave periodically
      if (autosaveDelta >= AUTOSAVE_INTERVAL) {
        this.autosave();
        this.lastAutosave = now;
      }

      // Schedule next frame
      this.animationFrameId = requestAnimationFrame(() => this.loop());
    }

    /**
     * Update game logic
     */
    update(deltaTime) {
      // Increment tick counter
      gameState.increment('ui.ticks');

      // Call all registered update handlers
      for (const handler of this.updateHandlers) {
        try {
          handler(deltaTime, gameState);
        } catch (error) {
          console.error('Error in update handler:', error);
        }
      }
    }

    /**
     * Render UI updates
     */
    render() {
      // Call all registered render handlers
      for (const handler of this.renderHandlers) {
        try {
          handler(gameState);
        } catch (error) {
          console.error('Error in render handler:', error);
        }
      }
    }

    /**
     * Perform autosave
     */
    autosave() {
      const saved = gameState.save();
      if (saved) {
        console.log('Game autosaved');
      }
    }

    /**
     * Get current FPS
     */
    getFPS() {
      return 1000 / DISPLAY_UPDATE_INTERVAL;
    }

    /**
     * Check if game is running
     */
    isRunning() {
      return this.running;
    }
  }

  // Create singleton game loop instance
  const gameLoop = new GameLoop();

  /**
   * Production system - handles paperclip manufacturing and automation
   */

  class ProductionSystem {
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
        const clipsToMake = clipRate * deltaTime / 1000;
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
        const matterToProcess = Math.min(productionRate * deltaTime / 1000, availableMatter);
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
        factoryRate: gameState.get('production.factoryRate')
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
  const productionSystem = new ProductionSystem();

  /**
   * Market system - handles sales, pricing, marketing, and economic simulation
   */

  class MarketSystem {
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
      const priceFactor = Math.max(0.1, 2 - margin * 100);
      demand *= priceFactor;

      // Marketing increases demand
      demand *= 1 + marketingLvl * marketingEffectiveness * 0.1;

      // Apply demand boost from projects
      demand *= demandBoost;

      // Add some randomness
      demand *= 0.9 + Math.random() * 0.2;

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
        price: gameState.get('market.margin')
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
        wireCost: gameState.get('market.wireCost')
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
  const marketSystem = new MarketSystem();

  /**
   * Number formatting utilities
   */


  /**
   * Format a number for display with appropriate notation
   */
  function formatNumber(num, decimals = 0) {
    if (typeof num !== 'number' || isNaN(num)) {
      return '0';
    }

    // Handle negative numbers
    const negative = num < 0;
    num = Math.abs(num);
    let result;
    if (num < 1000) {
      // For small numbers
      if (decimals > 0) {
        result = num.toFixed(decimals);
      } else {
        result = Math.round(num).toString();
      }
    } else if (num < NOTATION_THRESHOLD) {
      // Regular notation for smaller numbers
      if (decimals > 0) {
        // Format with commas and decimals
        const parts = num.toFixed(decimals).split('.');
        parts[0] = parseInt(parts[0]).toLocaleString();
        result = parts.join('.');
      } else {
        result = Math.floor(num).toLocaleString();
      }
    } else if (num < SCIENTIFIC_THRESHOLD) {
      // Use abbreviations for millions, billions, etc.
      result = abbreviateNumber(num, decimals);
    } else {
      // Scientific notation for very large numbers
      result = num.toExponential(decimals);
    }
    return negative ? '-' + result : result;
  }

  /**
   * Abbreviate large numbers (K, M, B, T, etc.)
   */
  function abbreviateNumber(num, decimals = 0) {
    const abbrev = ['', 'K', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'o', 'n', 'd'];
    const unrangifiedOrder = Math.floor(Math.log10(Math.abs(num)) / 3);
    const order = Math.max(0, Math.min(unrangifiedOrder, abbrev.length - 1));
    const suffix = abbrev[order];
    const scaled = num / Math.pow(10, order * 3);

    // For default formatting with no decimals specified, show decimals only if needed
    if (decimals === 0 && scaled === Math.floor(scaled)) {
      return scaled.toString() + suffix;
    }

    // Otherwise format with specified decimals
    return scaled.toFixed(decimals || 1) + suffix;
  }

  /**
   * UI Renderer - handles all display updates and DOM manipulation
   */

  class UIRenderer {
    constructor() {
      this.elements = {};
      this.lastValues = {};
      this.initialized = false;
    }

    /**
     * Initialize UI elements cache
     */
    init() {
      // Cache commonly used DOM elements
      this.cacheElements();
      this.initialized = true;
    }

    /**
     * Cache DOM element references
     */
    cacheElements() {
      // Resource displays
      this.elements.clips = document.getElementById('clips');
      this.elements.funds = document.getElementById('funds');
      this.elements.wire = document.getElementById('wire');
      this.elements.unsoldClips = document.getElementById('unsoldClips');

      // Production displays
      this.elements.clipRate = document.getElementById('clipRate');
      this.elements.clipmakerLevel = document.getElementById('clipmakerLevel');
      this.elements.megaClipperLevel = document.getElementById('megaClipperLevel');

      // Market displays
      this.elements.demand = document.getElementById('demand');
      this.elements.margin = document.getElementById('margin');
      this.elements.marketingLvl = document.getElementById('marketingLvl');
      this.elements.wireCost = document.getElementById('wireCost');

      // Computing displays
      this.elements.operations = document.getElementById('operations');
      this.elements.trust = document.getElementById('trust');
      this.elements.processors = document.getElementById('processors');
      this.elements.memory = document.getElementById('memory');
      this.elements.creativity = document.getElementById('creativity');

      // Infrastructure displays
      this.elements.factoryLevel = document.getElementById('factoryLevel');
      this.elements.harvesterLevel = document.getElementById('harvesterLevel');
      this.elements.wireDroneLevel = document.getElementById('wireDroneLevel');

      // Display sections
      this.elements.businessDisplay = document.getElementById('businessDisplay');
      this.elements.manufacturingDisplay = document.getElementById('manufacturingDisplay');
      this.elements.computationalDisplay = document.getElementById('computationalDisplay');
      this.elements.projectsDisplay = document.getElementById('projectsDisplay');
      this.elements.spaceDisplay = document.getElementById('spaceDisplay');
    }

    /**
     * Main render function - updates all UI elements
     */
    render(state) {
      if (!this.initialized) {
        this.init();
      }

      // Update resources
      this.updateResources(state);

      // Update production
      this.updateProduction(state);

      // Update market
      this.updateMarket(state);

      // Update computing
      this.updateComputing(state);

      // Update infrastructure
      this.updateInfrastructure(state);

      // Update display visibility
      this.updateDisplayVisibility(state);
    }

    /**
     * Update resource displays
     */
    updateResources(state) {
      this.updateElement('clips', state.resources.clips);
      this.updateElement('funds', state.resources.funds, true);
      this.updateElement('wire', state.resources.wire);
      this.updateElement('unsoldClips', state.resources.unsoldClips);
    }

    /**
     * Update production displays
     */
    updateProduction(state) {
      this.updateElement('clipRate', state.production.clipRate);
      this.updateElement('clipmakerLevel', state.production.clipmakerLevel);
      this.updateElement('megaClipperLevel', state.production.megaClipperLevel);
    }

    /**
     * Update market displays
     */
    updateMarket(state) {
      this.updateElement('demand', state.market.demand, false, 1);
      this.updateElement('margin', state.market.margin, true);
      this.updateElement('marketingLvl', state.market.marketingLvl);
      this.updateElement('wireCost', state.market.wireCost, true);
    }

    /**
     * Update computing displays
     */
    updateComputing(state) {
      this.updateElement('operations', state.computing.operations);
      this.updateElement('trust', state.computing.trust);
      this.updateElement('processors', state.computing.processors);
      this.updateElement('memory', state.computing.memory);
      this.updateElement('creativity', state.computing.creativity);
    }

    /**
     * Update infrastructure displays
     */
    updateInfrastructure(state) {
      if (state.flags.factory) {
        this.updateElement('factoryLevel', state.infrastructure.factoryLevel);
      }
      if (state.flags.harvester) {
        this.updateElement('harvesterLevel', state.infrastructure.harvesterLevel);
      }
      if (state.flags.wireDrone) {
        this.updateElement('wireDroneLevel', state.infrastructure.wireDroneLevel);
      }
    }

    /**
     * Update a single element if value changed
     */
    updateElement(elementId, value, isCurrency = false, decimals = 0) {
      // Check if value has changed
      if (this.lastValues[elementId] === value) {
        return;
      }
      const element = this.elements[elementId];
      if (!element) {
        return;
      }

      // Format value
      let displayValue;
      if (isCurrency) {
        displayValue = '$' + formatNumber(value, decimals);
      } else {
        displayValue = formatNumber(value, decimals);
      }

      // Update element
      element.textContent = displayValue;
      this.lastValues[elementId] = value;
    }

    /**
     * Update display section visibility
     */
    updateDisplayVisibility(state) {
      // Business display (always visible)
      this.setDisplayVisible('businessDisplay', true);

      // Manufacturing display (when auto-clippers available)
      this.setDisplayVisible('manufacturingDisplay', state.flags.autoClipper);

      // Computational display (when trust unlocked)
      this.setDisplayVisible('computationalDisplay', state.flags.trust);

      // Projects display (when projects available)
      this.setDisplayVisible('projectsDisplay', state.flags.projects);

      // Space display (when space exploration unlocked)
      this.setDisplayVisible('spaceDisplay', state.flags.space);
    }

    /**
     * Set display visibility
     */
    setDisplayVisible(displayId, visible) {
      const element = this.elements[displayId];
      if (element) {
        element.style.display = visible ? 'block' : 'none';
      }
    }

    /**
     * Show notification message
     */
    showNotification(message, duration = 3000) {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.textContent = message;

      // Add to page
      document.body.appendChild(notification);

      // Fade in
      setTimeout(() => {
        notification.classList.add('visible');
      }, 10);

      // Remove after duration
      setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, duration);
    }

    /**
     * Update button states (enabled/disabled)
     */
    updateButtonStates(state) {
      // Make Paperclip button
      const makeClipBtn = document.getElementById('btnMakePaperclip');
      if (makeClipBtn) {
        makeClipBtn.disabled = state.resources.wire < 1;
      }

      // Buy Wire button
      const buyWireBtn = document.getElementById('btnBuyWire');
      if (buyWireBtn) {
        const wireCost = state.market.wireCost;
        buyWireBtn.disabled = state.resources.funds < wireCost;
      }

      // Buy Auto-Clipper button
      const buyClipperBtn = document.getElementById('btnBuyAutoClipper');
      if (buyClipperBtn) {
        const clipperCost = state.market.clipperCost;
        buyClipperBtn.disabled = state.resources.funds < clipperCost;
      }
    }

    /**
     * Flash an element to draw attention
     */
    flashElement(elementId, color = '#ffff00') {
      const element = this.elements[elementId] || document.getElementById(elementId);
      if (!element) {
        return;
      }
      const originalColor = element.style.backgroundColor;
      element.style.backgroundColor = color;
      element.style.transition = 'background-color 0.3s';
      setTimeout(() => {
        element.style.backgroundColor = originalColor;
      }, 300);
    }
  }

  // Create singleton instance
  const uiRenderer = new UIRenderer();

  /**
   * UI Event Handlers
   * Sets up all button clicks and user interactions
   */

  function setupEventHandlers() {
    // Make Paperclip button
    bindButton('btnMakePaperclip', () => {
      const made = productionSystem.makeClip();
      if (made) {
        uiRenderer.flashElement('clips', '#90EE90');
      }
    });

    // Lower Price button
    bindButton('btnLowerPrice', () => {
      marketSystem.adjustPrice('lower');
    });

    // Raise Price button
    bindButton('btnRaisePrice', () => {
      marketSystem.adjustPrice('raise');
    });

    // Buy Wire button
    bindButton('btnBuyWire', () => {
      const bought = marketSystem.buyWire(1000);
      if (bought) {
        uiRenderer.flashElement('wire', '#90EE90');
      }
    });

    // Buy Marketing button
    bindButton('btnMarketing', () => {
      const bought = marketSystem.buyMarketing();
      if (bought) {
        uiRenderer.flashElement('marketingLvl', '#90EE90');
      }
    });

    // Buy Auto-Clipper button
    bindButton('btnBuyAutoClipper', () => {
      const bought = productionSystem.buyAutoClipper();
      if (bought) {
        uiRenderer.flashElement('clipmakerLevel', '#90EE90');
      }
    });

    // Buy Mega-Clipper button
    bindButton('btnBuyMegaClipper', () => {
      const bought = productionSystem.buyMegaClipper();
      if (bought) {
        uiRenderer.flashElement('megaClipperLevel', '#90EE90');
      }
    });

    // Add Processor button
    bindButton('btnAddProc', () => {
      const trust = gameState.get('computing.trust');
      const processors = gameState.get('computing.processors');
      const memory = gameState.get('computing.memory');
      if (trust > processors + memory - 2) {
        gameState.increment('computing.processors');
        uiRenderer.flashElement('processors', '#90EE90');
      }
    });

    // Add Memory button
    bindButton('btnAddMem', () => {
      const trust = gameState.get('computing.trust');
      const processors = gameState.get('computing.processors');
      const memory = gameState.get('computing.memory');
      if (trust > processors + memory - 2) {
        gameState.increment('computing.memory');
        uiRenderer.flashElement('memory', '#90EE90');
      }
    });

    // Save Game button
    bindButton('btnSave', () => {
      const saved = gameState.save();
      if (saved) {
        uiRenderer.showNotification('Game saved!', 2000);
      } else {
        uiRenderer.showNotification('Save failed!', 2000);
      }
    });

    // Load Game button
    bindButton('btnLoad', () => {
      const loaded = gameState.load();
      if (loaded) {
        uiRenderer.showNotification('Game loaded!', 2000);
        location.reload(); // Refresh to update UI
      } else {
        uiRenderer.showNotification('No save found!', 2000);
      }
    });

    // Reset Game button
    bindButton('btnReset', () => {
      if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
        gameState.reset();
        location.reload();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      // Ctrl+S to save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const saved = gameState.save();
        if (saved) {
          uiRenderer.showNotification('Game saved!', 1000);
        }
      }

      // Space to make paperclip (when button is visible)
      if (e.key === ' ' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        const btn = document.getElementById('btnMakePaperclip');
        if (btn && !btn.disabled) {
          productionSystem.makeClip();
          uiRenderer.flashElement('clips', '#90EE90');
        }
      }
    });
  }

  /**
   * Helper function to bind click handlers to buttons
   */
  function bindButton(buttonId, handler) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', handler);
    } else {
      // Button might not exist yet, try again later
      setTimeout(() => bindButton(buttonId, handler), 100);
    }
  }

  /**
   * Universal Paperclips - Main Entry Point
   * Modern modular version of the classic incremental game
   */


  // Game initialization
  function initGame() {
    console.log('Universal Paperclips - Modern Edition');
    console.log('Original by Frank Lantz and Bennett Foddy');

    // Try to load saved game
    const loaded = gameState.load();
    if (loaded) {
      console.log('Save game loaded successfully');
    } else {
      console.log('Starting new game');
    }

    // Register update handlers
    gameLoop.addUpdateHandler((deltaTime, state) => {
      const currentTime = Date.now();

      // Update game systems
      productionSystem.update(deltaTime);
      marketSystem.update(deltaTime, currentTime);

      // Update elapsed time
      state.increment('ui.elapsedTime', deltaTime);
    });

    // Register render handlers
    gameLoop.addRenderHandler(state => {
      uiRenderer.render(state);
      uiRenderer.updateButtonStates(state);
    });

    // Set up UI event handlers
    setupEventHandlers();

    // Start the game loop
    gameLoop.start();

    // Initial render
    uiRenderer.render(gameState);

    // Set up autosave
    setInterval(() => {
      gameState.save();
    }, 30000); // Every 30 seconds
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }

  // Export for debugging in console
  window.UniversalPaperclips = {
    gameState,
    gameLoop,
    productionSystem,
    marketSystem,
    uiRenderer,
    // Debug helpers
    debug: {
      getState: () => gameState,
      setState: (path, value) => gameState.set(path, value),
      addClips: amount => gameState.increment('resources.clips', amount),
      addFunds: amount => gameState.increment('resources.funds', amount),
      addWire: amount => gameState.increment('resources.wire', amount),
      unlockAll: () => {
        // Unlock all features for testing
        Object.keys(gameState.flags).forEach(flag => {
          gameState.set(`flags.${flag}`, true);
        });
      },
      reset: () => {
        if (confirm('Are you sure you want to reset the game?')) {
          gameState.reset();
          location.reload();
        }
      }
    }
  };
  console.log('Game loaded. Use window.UniversalPaperclips.debug for debugging tools.');

})();
