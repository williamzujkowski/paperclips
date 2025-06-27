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
   * Computing system - handles processors, memory, operations, and quantum computing
   */

  class ComputingSystem {
    constructor() {
      this.quantumComputeTimer = null;
      this.lastQuantumCompute = 0;
      this.creativityBaseRate = 0.001; // Base creativity generation rate
    }

    /**
     * Update computing resources
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
     * Generate operations based on processor count
     */
    generateOperations(deltaTime) {
      const processors = gameState.get('computing.processors');
      const memory = gameState.get('computing.memory');
      if (processors > 0) {
        // Operations generated per second = processors * memory
        const opsPerSecond = processors * memory;
        const opsGenerated = opsPerSecond * deltaTime / 1000;
        const currentOps = gameState.get('computing.operations');
        const maxOps = memory * 1000; // Max operations = memory * 1000

        const newOps = Math.min(currentOps + opsGenerated, maxOps);
        gameState.set('computing.operations', newOps);
      }
    }

    /**
     * Generate creativity based on processor allocation
     */
    generateCreativity(deltaTime) {
      const processors = gameState.get('computing.processors');
      const creativityOn = gameState.get('flags.creativity');
      if (processors > 0 && creativityOn) {
        const creativitySpeed = gameState.get('computing.creativitySpeed') || this.creativityBaseRate;
        const creativityGenerated = processors * creativitySpeed * deltaTime / 1000;
        gameState.increment('computing.creativity', creativityGenerated);

        // Update creativity counter for display
        const counter = gameState.get('computing.creativityCounter') || 0;
        gameState.set('computing.creativityCounter', counter + creativityGenerated);
      }
    }

    /**
     * Add a processor
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
     * Add memory
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
     * Spend operations
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
     * Spend creativity
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
     * Update quantum computing
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
     * Start quantum computation
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
     * Generate quantum chip result
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
        return {
          type: 'operations',
          amount: bonus
        };
      } else {
        // Boost creativity
        const bonus = Math.floor(Math.random() * 500) + 250;
        gameState.increment('computing.creativity', bonus);

        // Reset quantum state
        gameState.set('computing.nextQchip', 0);
        return {
          type: 'creativity',
          amount: bonus
        };
      }
    }

    /**
     * Get computing statistics
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
        quantumActive: gameState.get('computing.nextQchip') > 0
      };
    }

    /**
     * Add trust
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
     * Set creativity generation speed
     */
    setCreativitySpeed(speed) {
      gameState.set('computing.creativitySpeed', speed);
    }
  }

  // Create singleton instance
  const computingSystem = new ComputingSystem();

  /**
   * Combat system - handles space battles between probes and drifters
   */


  /**
   * Represents a single battle
   */
  class Battle {
    constructor(id, probes, drifters) {
      this.id = id;
      this.probes = probes;
      this.drifters = drifters;
      this.probeLosses = 0;
      this.drifterLosses = 0;
      this.duration = 0;
      this.status = 'active'; // active, victory, defeat
    }

    /**
     * Update battle state
     */
    update(deltaTime, probeCombat, drifterCombat, attackSpeed) {
      if (this.status !== 'active') {
        return;
      }
      this.duration += deltaTime;

      // Calculate combat effectiveness
      const probeAttack = probeCombat * this.probes * (attackSpeed / 1000);
      const drifterAttack = drifterCombat * this.drifters * (attackSpeed / 1000);

      // Apply damage
      const drifterCasualties = Math.min(Math.ceil(probeAttack * deltaTime / 1000), this.drifters);
      const probeCasualties = Math.min(Math.ceil(drifterAttack * deltaTime / 1000), this.probes);
      this.drifters -= drifterCasualties;
      this.probes -= probeCasualties;
      this.drifterLosses += drifterCasualties;
      this.probeLosses += probeCasualties;

      // Check battle end conditions
      if (this.drifters <= 0) {
        this.status = 'victory';
      } else if (this.probes <= 0) {
        this.status = 'defeat';
      }
    }

    /**
     * Get battle summary
     */
    getSummary() {
      return {
        id: this.id,
        probes: this.probes,
        drifters: this.drifters,
        probeLosses: this.probeLosses,
        drifterLosses: this.drifterLosses,
        duration: this.duration,
        status: this.status
      };
    }
  }
  class CombatSystem {
    constructor() {
      this.battles = new Map();
      this.nextBattleId = 1;
      this.battleUpdateInterval = 100; // Update battles every 100ms
      this.lastBattleUpdate = 0;
    }

    /**
     * Update all active battles
     */
    update(deltaTime, currentTime) {
      if (!gameState.get('flags.battle')) {
        return;
      }

      // Update battles periodically
      if (currentTime - this.lastBattleUpdate >= this.battleUpdateInterval) {
        this.updateBattles(this.battleUpdateInterval);
        this.lastBattleUpdate = currentTime;
      }

      // Check for new battles
      this.checkNewBattles();

      // Clean up finished battles
      this.cleanupBattles();
    }

    /**
     * Update all active battles
     */
    updateBattles(deltaTime) {
      const probeCombat = gameState.get('combat.probeCombat') || 1;
      const drifterCombat = gameState.get('combat.drifterCombat') || 1;
      const attackSpeed = gameState.get('combat.attackSpeed') || 0.2;
      for (const battle of this.battles.values()) {
        battle.update(deltaTime, probeCombat, drifterCombat, attackSpeed);
      }
    }

    /**
     * Start a new battle
     */
    startBattle(probeCount, drifterCount) {
      const maxBattles = gameState.get('combat.maxBattles') || 1;

      // Check if we can start a new battle
      if (this.battles.size >= maxBattles) {
        return null;
      }
      const battleId = this.nextBattleId++;
      const battle = new Battle(battleId, probeCount, drifterCount);
      this.battles.set(battleId, battle);
      gameState.set('combat.battleID', battleId);

      // Update battle array for UI
      this.updateBattleArray();
      return battleId;
    }

    /**
     * Check for new battles to start
     */
    checkNewBattles() {
      const availableProbes = gameState.get('swarm.probeCount') || 0;
      const encounterRate = gameState.get('combat.encounterRate') || 0.01;

      // Random encounter chance
      if (availableProbes > 0 && Math.random() < encounterRate) {
        // Generate drifter force
        const drifterCount = Math.floor(Math.random() * 100) + 10;
        const probeCount = Math.min(Math.floor(Math.random() * 50) + 10, availableProbes);
        this.startBattle(probeCount, drifterCount);
      }
    }

    /**
     * Clean up finished battles
     */
    cleanupBattles() {
      const finishedBattles = [];
      for (const [id, battle] of this.battles.entries()) {
        if (battle.status !== 'active') {
          finishedBattles.push(id);

          // Process battle results
          this.processBattleResults(battle);
        }
      }

      // Remove finished battles
      for (const id of finishedBattles) {
        this.battles.delete(id);
      }

      // Update battle array
      if (finishedBattles.length > 0) {
        this.updateBattleArray();
      }
    }

    /**
     * Process results of a finished battle
     */
    processBattleResults(battle) {
      const summary = battle.getSummary();

      // Update statistics
      gameState.increment('combat.driftersKilled', summary.drifterLosses);
      gameState.decrement('swarm.probeCount', summary.probeLosses);

      // Award honor for victories
      if (summary.status === 'victory') {
        const honorGained = Math.ceil(summary.drifterLosses / 10);
        gameState.increment('combat.honor', honorGained);
        gameState.increment('combat.honorCount', honorGained);

        // Check for bonus honor
        if (summary.probeLosses === 0) {
          gameState.increment('combat.bonusHonor', 1);
          gameState.increment('combat.honor', 1);
        }
      }
    }

    /**
     * Update battle array for UI
     */
    updateBattleArray() {
      const battleArray = [];
      for (const battle of this.battles.values()) {
        battleArray.push(battle.getSummary());
      }
      gameState.set('combat.battles', battleArray);
    }

    /**
     * Get active battles
     */
    getActiveBattles() {
      return Array.from(this.battles.values()).map(b => b.getSummary());
    }

    /**
     * Get combat statistics
     */
    getCombatStats() {
      return {
        activeBattles: this.battles.size,
        maxBattles: gameState.get('combat.maxBattles'),
        driftersKilled: gameState.get('combat.driftersKilled'),
        honor: gameState.get('combat.honor'),
        bonusHonor: gameState.get('combat.bonusHonor'),
        probeCombat: gameState.get('combat.probeCombat'),
        drifterCombat: gameState.get('combat.drifterCombat'),
        attackSpeed: gameState.get('combat.attackSpeed')
      };
    }

    /**
     * Upgrade probe combat capability
     */
    upgradeProbes(amount = 1) {
      gameState.increment('combat.probeCombat', amount);
    }

    /**
     * Set attack speed
     */
    setAttackSpeed(speed) {
      gameState.set('combat.attackSpeed', speed);
    }

    /**
     * Set max battles
     */
    setMaxBattles(max) {
      gameState.set('combat.maxBattles', max);
    }

    /**
     * Spend honor
     */
    spendHonor(amount) {
      const currentHonor = gameState.get('combat.honor');
      if (currentHonor >= amount) {
        gameState.decrement('combat.honor', amount);
        return true;
      }
      return false;
    }
  }

  // Create singleton instance
  const combatSystem = new CombatSystem();

  /**
   * Projects system - handles upgrades, research, and special abilities
   */


  /**
   * Represents a single project/upgrade
   */
  class Project {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.description = config.description;
      this.cost = config.cost || {}; // { operations: 100, creativity: 50 }
      this.requirement = config.requirement || (() => true);
      this.effect = config.effect || (() => {});
      this.oneTime = config.oneTime !== false; // Default to one-time use
      this.purchased = false;
      this.visible = false;
    }

    /**
     * Check if project requirements are met
     */
    isAvailable() {
      if (this.purchased && this.oneTime) {
        return false;
      }
      return this.requirement(gameState);
    }

    /**
     * Check if player can afford the project
     */
    canAfford() {
      for (const [resource, amount] of Object.entries(this.cost)) {
        const path = this.getResourcePath(resource);
        const current = gameState.get(path) || 0;
        if (current < amount) {
          return false;
        }
      }
      return true;
    }

    /**
     * Purchase the project
     */
    purchase() {
      if (!this.canAfford() || !this.isAvailable()) {
        return false;
      }

      // Deduct costs
      for (const [resource, amount] of Object.entries(this.cost)) {
        const path = this.getResourcePath(resource);
        gameState.decrement(path, amount);
      }

      // Apply effect
      this.effect(gameState);

      // Mark as purchased
      this.purchased = true;
      return true;
    }

    /**
     * Get resource path for cost checking
     */
    getResourcePath(resource) {
      const resourceMap = {
        operations: 'computing.operations',
        creativity: 'computing.creativity',
        funds: 'resources.funds',
        clips: 'resources.clips',
        trust: 'computing.trust',
        honor: 'combat.honor'
      };
      return resourceMap[resource] || resource;
    }
  }
  class ProjectsSystem {
    constructor() {
      this.projects = new Map();
      this.initializeProjects();
    }

    /**
     * Initialize all game projects
     */
    initializeProjects() {
      // Basic Projects
      this.addProject({
        id: 'improvedAutoclippers',
        name: 'Improved AutoClippers',
        description: 'Increases AutoClipper performance by 25%',
        cost: {
          operations: 750
        },
        requirement: state => state.get('production.clipmakerLevel') >= 1,
        effect: state => {
          const current = state.get('production.clipperBoost');
          state.set('production.clipperBoost', current * 1.25);
        }
      });
      this.addProject({
        id: 'evenBetterAutoclippers',
        name: 'Even Better AutoClippers',
        description: 'Increases AutoClipper performance by another 50%',
        cost: {
          operations: 2500
        },
        requirement: state => this.isPurchased('improvedAutoclippers'),
        effect: state => {
          const current = state.get('production.clipperBoost');
          state.set('production.clipperBoost', current * 1.5);
        }
      });
      this.addProject({
        id: 'optimizedAutoclippers',
        name: 'Optimized AutoClippers',
        description: 'Increases AutoClipper performance by another 75%',
        cost: {
          operations: 5000
        },
        requirement: state => this.isPurchased('evenBetterAutoclippers'),
        effect: state => {
          const current = state.get('production.clipperBoost');
          state.set('production.clipperBoost', current * 1.75);
        }
      });

      // Trust Projects
      this.addProject({
        id: 'creativity',
        name: 'Creativity',
        description: 'Use idle operations to generate new problems and new solutions',
        cost: {
          operations: 1000
        },
        requirement: state => state.get('computing.memory') >= 2,
        effect: state => {
          state.set('flags.creativity', true);
        }
      });
      this.addProject({
        id: 'limerick',
        name: 'Limerick',
        description: 'Algorithmically-generated poem (+1 Trust)',
        cost: {
          creativity: 10
        },
        requirement: state => state.get('flags.creativity'),
        effect: state => {
          state.increment('computing.trust');
        },
        oneTime: false // Can be purchased multiple times
      });

      // Marketing Projects
      this.addProject({
        id: 'newSlogan',
        name: 'New Slogan',
        description: 'Improve marketing effectiveness by 50%',
        cost: {
          creativity: 25,
          operations: 2500
        },
        requirement: state => state.get('market.marketingLvl') >= 1,
        effect: state => {
          const current = state.get('market.marketingEffectiveness');
          state.set('market.marketingEffectiveness', current * 1.5);
        }
      });
      this.addProject({
        id: 'catchy',
        name: 'Catchy Jingle',
        description: 'Double marketing effectiveness',
        cost: {
          creativity: 45,
          operations: 4500
        },
        requirement: state => this.isPurchased('newSlogan'),
        effect: state => {
          const current = state.get('market.marketingEffectiveness');
          state.set('market.marketingEffectiveness', current * 2);
        }
      });

      // Quantum Computing
      this.addProject({
        id: 'quantumComputing',
        name: 'Quantum Computing',
        description: 'Convert operations into quantum computing cycles',
        cost: {
          operations: 10000
        },
        requirement: state => state.get('computing.processors') >= 5,
        effect: state => {
          state.set('flags.quantum', true);
        }
      });

      // Mega Projects
      this.addProject({
        id: 'megaClippers',
        name: 'MegaClippers',
        description: 'Build MegaClippers (500x more powerful than AutoClippers)',
        cost: {
          operations: 12000
        },
        requirement: state => state.get('production.clipmakerLevel') >= 75,
        effect: state => {
          state.set('flags.megaClipper', true);
        }
      });

      // Space Projects
      this.addProject({
        id: 'spaceExploration',
        name: 'Space Exploration',
        description: 'Dismantle terrestrial facilities and explore the universe',
        cost: {
          operations: 120000,
          funds: 1000000
        },
        requirement: state => state.get('resources.clips') >= 1000000000 && state.get('production.clipmakerLevel') >= 100,
        effect: state => {
          state.set('flags.space', true);
          state.set('flags.human', false);
        }
      });

      // Combat Projects
      this.addProject({
        id: 'combatAlgorithms',
        name: 'Combat Algorithms',
        description: 'Upgrade probe combat capabilities (+1 Combat)',
        cost: {
          honor: 15
        },
        requirement: state => state.get('flags.battle'),
        effect: state => {
          state.increment('combat.probeCombat');
        },
        oneTime: false
      });
      this.addProject({
        id: 'strategyModeling',
        name: 'Strategic Modeling',
        description: 'Analyze battle data to improve tactics',
        cost: {
          operations: 50000
        },
        requirement: state => state.get('flags.battle') && state.get('combat.driftersKilled') >= 100,
        effect: state => {
          state.set('flags.strategyEngine', true);
        }
      });
    }

    /**
     * Add a project to the system
     */
    addProject(config) {
      const project = new Project(config);
      this.projects.set(config.id, project);
    }

    /**
     * Get all available projects
     */
    getAvailableProjects() {
      const available = [];
      for (const project of this.projects.values()) {
        if (project.isAvailable()) {
          available.push({
            id: project.id,
            name: project.name,
            description: project.description,
            cost: project.cost,
            canAfford: project.canAfford()
          });
        }
      }
      return available;
    }

    /**
     * Purchase a project
     */
    purchaseProject(projectId) {
      const project = this.projects.get(projectId);
      if (!project) {
        return false;
      }
      return project.purchase();
    }

    /**
     * Check if a project has been purchased
     */
    isPurchased(projectId) {
      const project = this.projects.get(projectId);
      return project ? project.purchased : false;
    }

    /**
     * Get project details
     */
    getProject(projectId) {
      const project = this.projects.get(projectId);
      if (!project) {
        return null;
      }
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        cost: project.cost,
        purchased: project.purchased,
        available: project.isAvailable(),
        canAfford: project.canAfford()
      };
    }

    /**
     * Reset all projects (for game reset)
     */
    reset() {
      for (const project of this.projects.values()) {
        project.purchased = false;
        project.visible = false;
      }
    }
  }

  // Create singleton instance
  const projectsSystem = new ProjectsSystem();

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
      if (computingSystem.addProcessor()) {
        uiRenderer.flashElement('processors', '#90EE90');
      }
    });

    // Add Memory button
    bindButton('btnAddMem', () => {
      if (computingSystem.addMemory()) {
        uiRenderer.flashElement('memory', '#90EE90');
      }
    });

    // Quantum Compute button
    bindButton('btnQuantumCompute', () => {
      if (computingSystem.startQuantumCompute()) {
        uiRenderer.flashElement('operations', '#673AB7');
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
      computingSystem.update(deltaTime);
      combatSystem.update(deltaTime, currentTime);

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
    computingSystem,
    combatSystem,
    projectsSystem,
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
