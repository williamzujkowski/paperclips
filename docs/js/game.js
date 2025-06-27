import { e as errorHandler, g as gameState } from './phase-space-675f4e58.js';

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
 * Performance monitoring system
 * @module PerformanceMonitor
 */


/**
 * @class PerformanceMonitor
 * @description Tracks game performance metrics and detects performance issues.
 * Monitors FPS, update times, memory usage, and other performance indicators.
 */
class PerformanceMonitor {
  /**
   * Creates a new PerformanceMonitor instance
   * @constructor
   */
  constructor() {
    /** @type {Array<number>} Frame time history */
    this.frameTimes = [];
    /** @type {number} Maximum frame history size */
    this.maxFrameHistory = 60;
    /** @type {number} Last frame timestamp */
    this.lastFrameTime = performance.now();
    /** @type {Object} Performance metrics */
    this.metrics = {
      fps: 0,
      avgFrameTime: 0,
      maxFrameTime: 0,
      minFps: 60,
      updateTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      gcCount: 0
    };
    /** @type {number} Performance check interval */
    this.checkInterval = 1000; // 1 second
    /** @type {number} Last performance check */
    this.lastCheck = performance.now();
    /** @type {boolean} Whether monitoring is active */
    this.active = true;
    /** @type {Object} Performance thresholds */
    this.thresholds = {
      minFps: 30,
      maxFrameTime: 100,
      // ms
      maxUpdateTime: 50,
      // ms
      maxRenderTime: 16,
      // ms (60fps target)
      maxMemoryMB: 100
    };
  }

  /**
   * Start monitoring performance
   */
  start() {
    this.active = true;
    this.lastFrameTime = performance.now();
    errorHandler.debug('Performance monitoring started');
  }

  /**
   * Stop monitoring performance
   */
  stop() {
    this.active = false;
    errorHandler.debug('Performance monitoring stopped');
  }

  /**
   * Record frame timing
   */
  recordFrame() {
    if (!this.active) {
      return;
    }
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Add to frame history
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxFrameHistory) {
      this.frameTimes.shift();
    }

    // Update max frame time
    if (frameTime > this.metrics.maxFrameTime) {
      this.metrics.maxFrameTime = frameTime;
    }

    // Check if we should update metrics
    if (now - this.lastCheck >= this.checkInterval) {
      this.updateMetrics();
      this.checkPerformance();
      this.lastCheck = now;
    }
  }

  /**
   * Measure function execution time
   * @param {Function} fn - Function to measure
   * @param {string} name - Name for logging
   * @returns {*} Function result
   */
  measure(fn, name) {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      if (name.includes('update')) {
        this.metrics.updateTime = duration;
      } else if (name.includes('render')) {
        this.metrics.renderTime = duration;
      }

      // Log slow operations
      if (duration > 16) {
        errorHandler.debug(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
      }
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      errorHandler.handleError(error, `performanceMonitor.measure.${name}`, {
        duration
      });
      throw error;
    }
  }

  /**
   * Update performance metrics
   * @private
   */
  updateMetrics() {
    if (this.frameTimes.length === 0) {
      return;
    }

    // Calculate average frame time
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.metrics.avgFrameTime = avgFrameTime;

    // Calculate FPS
    this.metrics.fps = 1000 / avgFrameTime;

    // Track minimum FPS
    if (this.metrics.fps < this.metrics.minFps) {
      this.metrics.minFps = this.metrics.fps;
    }

    // Update memory usage if available
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    // Reset max frame time periodically
    if (this.metrics.maxFrameTime > 1000) {
      this.metrics.maxFrameTime = Math.max(...this.frameTimes);
    }
  }

  /**
   * Check for performance issues
   * @private
   */
  checkPerformance() {
    const issues = [];

    // Check FPS
    if (this.metrics.fps < this.thresholds.minFps) {
      issues.push(`Low FPS: ${this.metrics.fps.toFixed(1)} (threshold: ${this.thresholds.minFps})`);
    }

    // Check frame time spikes
    if (this.metrics.maxFrameTime > this.thresholds.maxFrameTime) {
      issues.push(`Frame time spike: ${this.metrics.maxFrameTime.toFixed(1)}ms`);
    }

    // Check update time
    if (this.metrics.updateTime > this.thresholds.maxUpdateTime) {
      issues.push(`Slow update: ${this.metrics.updateTime.toFixed(1)}ms`);
    }

    // Check render time
    if (this.metrics.renderTime > this.thresholds.maxRenderTime) {
      issues.push(`Slow render: ${this.metrics.renderTime.toFixed(1)}ms`);
    }

    // Check memory usage
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryMB) {
      issues.push(`High memory: ${this.metrics.memoryUsage.toFixed(1)}MB`);
    }

    // Log issues if any
    if (issues.length > 0) {
      errorHandler.warn('Performance issues detected', {
        issues,
        metrics: this.getMetrics()
      });
    }
  }

  /**
   * Get current performance metrics
   * @returns {Object} Current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      frameCount: this.frameTimes.length
    };
  }

  /**
   * Get performance report
   * @returns {string} Formatted performance report
   */
  getReport() {
    const m = this.metrics;
    return `
Performance Report:
  FPS: ${m.fps.toFixed(1)} (min: ${m.minFps.toFixed(1)})
  Avg Frame Time: ${m.avgFrameTime.toFixed(2)}ms
  Max Frame Time: ${m.maxFrameTime.toFixed(2)}ms
  Update Time: ${m.updateTime.toFixed(2)}ms
  Render Time: ${m.renderTime.toFixed(2)}ms
  Memory Usage: ${m.memoryUsage.toFixed(1)}MB
    `.trim();
  }

  /**
   * Reset performance metrics
   */
  reset() {
    this.frameTimes = [];
    this.metrics = {
      fps: 0,
      avgFrameTime: 0,
      maxFrameTime: 0,
      minFps: 60,
      updateTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      gcCount: 0
    };
    this.lastFrameTime = performance.now();
    this.lastCheck = performance.now();
    errorHandler.debug('Performance metrics reset');
  }

  /**
   * Set performance threshold
   * @param {string} metric - Metric name
   * @param {number} value - Threshold value
   */
  setThreshold(metric, value) {
    if (metric in this.thresholds) {
      this.thresholds[metric] = value;
      errorHandler.debug(`Performance threshold set: ${metric} = ${value}`);
    } else {
      errorHandler.warn(`Invalid performance metric: ${metric}`);
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export for debugging
if (typeof window !== 'undefined') {
  window.UniversalPaperclipsPerformance = performanceMonitor;
}

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
    errorHandler.info('Game loop started');
    performanceMonitor.start();
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
    errorHandler.info('Game loop stopped');
    performanceMonitor.stop();
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

    // Record frame for performance monitoring
    performanceMonitor.recordFrame();

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  /**
   * Update game logic
   */
  update(deltaTime) {
    performanceMonitor.measure(() => {
      // Increment tick counter
      gameState.increment('ui.ticks');

      // Call all registered update handlers
      for (const handler of this.updateHandlers) {
        try {
          handler(deltaTime, gameState);
        } catch (error) {
          errorHandler.handleError(error, 'gameLoop.update', {
            handler: handler.name || 'anonymous',
            deltaTime
          });
        }
      }
    }, 'update');
  }

  /**
   * Render UI updates
   */
  render() {
    performanceMonitor.measure(() => {
      // Call all registered render handlers
      for (const handler of this.renderHandlers) {
        try {
          handler(gameState);
        } catch (error) {
          errorHandler.handleError(error, 'gameLoop.render', {
            handler: handler.name || 'anonymous'
          });
        }
      }
    }, 'render');
  }

  /**
   * Perform autosave
   */
  autosave() {
    try {
      const saved = gameState.save();
      if (saved) {
        errorHandler.debug('Game autosaved');
      } else {
        errorHandler.warn('Autosave failed');
      }
    } catch (error) {
      errorHandler.handleError(error, 'gameLoop.autosave');
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
 * Phase Manager - Handles lazy loading of game phases
 * @module PhaseManager
 */


/**
 * @class PhaseManager
 * @description Manages game phases and lazy loads systems as needed.
 * Reduces initial load time by only loading necessary systems.
 */
class PhaseManager {
  /**
   * Creates a new PhaseManager instance
   * @constructor
   */
  constructor() {
    /** @type {Map<string, Object>} Loaded modules cache */
    this.loadedModules = new Map();
    /** @type {Map<string, Function>} Phase transition handlers */
    this.phaseHandlers = new Map();
    /** @type {string} Current game phase */
    this.currentPhase = 'human';
    /** @type {boolean} Whether lazy loading is enabled */
    this.lazyLoadingEnabled = true;
    /** @type {Map<string, Array<string>>} Phase dependencies */
    this.phaseDependencies = new Map([['human', ['production', 'market', 'computing', 'projects']], ['space', ['combat', 'swarm', 'exploration']], ['endgame', []] // TODO: Add strategic and universal modules
    ]);
  }

  /**
   * Initialize the phase manager
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // Determine initial phase
      this.currentPhase = this.determinePhase();
      errorHandler.info(`Initializing phase manager in ${this.currentPhase} phase`);

      // Load initial phase modules
      await this.loadPhase(this.currentPhase);

      // Set up phase transition watchers
      this.setupPhaseWatchers();
      errorHandler.info('Phase manager initialized successfully');
    } catch (error) {
      errorHandler.handleError(error, 'phaseManager.init');
      // Fallback: load all modules
      this.lazyLoadingEnabled = false;
      await this.loadAllModules();
    }
  }

  /**
   * Determine current game phase based on flags
   * @returns {string} Current phase name
   * @private
   */
  determinePhase() {
    if (gameState.get('flags.endgame')) {
      return 'endgame';
    } else if (gameState.get('flags.space')) {
      return 'space';
    } else {
      return 'human';
    }
  }

  /**
   * Set up watchers for phase transitions
   * @private
   */
  setupPhaseWatchers() {
    // Watch for space phase transition
    gameState.addObserver('flags.space', async value => {
      if (value && this.currentPhase !== 'space') {
        await this.transitionToPhase('space');
      }
    });

    // Watch for endgame phase transition
    gameState.addObserver('flags.endgame', async value => {
      if (value && this.currentPhase !== 'endgame') {
        await this.transitionToPhase('endgame');
      }
    });
  }

  /**
   * Transition to a new phase
   * @param {string} newPhase - Phase to transition to
   * @returns {Promise<void>}
   */
  async transitionToPhase(newPhase) {
    try {
      errorHandler.info(`Transitioning from ${this.currentPhase} to ${newPhase} phase`);

      // Run exit handler for current phase
      const exitHandler = this.phaseHandlers.get(`${this.currentPhase}_exit`);
      if (exitHandler) {
        await exitHandler();
      }

      // Load new phase modules
      await this.loadPhase(newPhase);

      // Update current phase
      this.currentPhase = newPhase;

      // Run enter handler for new phase
      const enterHandler = this.phaseHandlers.get(`${newPhase}_enter`);
      if (enterHandler) {
        await enterHandler();
      }
      errorHandler.info(`Successfully transitioned to ${newPhase} phase`);
    } catch (error) {
      errorHandler.handleError(error, 'phaseManager.transitionToPhase', {
        newPhase
      });
    }
  }

  /**
   * Load modules for a specific phase
   * @param {string} phase - Phase name
   * @returns {Promise<void>}
   */
  async loadPhase(phase) {
    const dependencies = this.phaseDependencies.get(phase) || [];
    for (const dep of dependencies) {
      if (!this.loadedModules.has(dep)) {
        await this.loadModule(dep);
      }
    }
  }

  /**
   * Dynamically load a module
   * @param {string} moduleName - Module to load
   * @returns {Promise<Object>} Loaded module
   */
  async loadModule(moduleName) {
    try {
      if (this.loadedModules.has(moduleName)) {
        return this.loadedModules.get(moduleName);
      }
      errorHandler.debug(`Lazy loading module: ${moduleName}`);
      let module;
      switch (moduleName) {
        case 'combat':
          module = await Promise.resolve().then(function () { return combat; });
          break;
        case 'swarm':
          module = await import('./phase-space-675f4e58.js').then(function (n) { return n.s; });
          break;
        case 'exploration':
          module = await import('./phase-space-675f4e58.js').then(function (n) { return n.a; });
          break;
        // TODO: Implement these modules
        // case 'strategic':
        //   module = await import('../systems/strategic.js');
        //   break;
        // case 'universal':
        //   module = await import('../systems/universal.js');
        //   break;
        default:
          // Module already loaded in main bundle
          return null;
      }

      // Initialize module if it has an init method
      if (module && module.default && typeof module.default.init === 'function') {
        await module.default.init();
      }
      this.loadedModules.set(moduleName, module);
      errorHandler.debug(`Successfully loaded module: ${moduleName}`);
      return module;
    } catch (error) {
      errorHandler.handleError(error, 'phaseManager.loadModule', {
        moduleName
      });
      return null;
    }
  }

  /**
   * Load all modules (fallback)
   * @returns {Promise<void>}
   * @private
   */
  async loadAllModules() {
    errorHandler.warn('Lazy loading disabled, loading all modules');
    for (const [, deps] of this.phaseDependencies) {
      for (const dep of deps) {
        await this.loadModule(dep);
      }
    }
  }

  /**
   * Register a phase transition handler
   * @param {string} phase - Phase name
   * @param {string} type - Handler type ('enter' or 'exit')
   * @param {Function} handler - Handler function
   */
  registerPhaseHandler(phase, type, handler) {
    this.phaseHandlers.set(`${phase}_${type}`, handler);
  }

  /**
   * Get loaded modules
   * @returns {Map<string, Object>} Loaded modules
   */
  getLoadedModules() {
    return new Map(this.loadedModules);
  }

  /**
   * Check if a module is loaded
   * @param {string} moduleName - Module name
   * @returns {boolean} Whether module is loaded
   */
  isModuleLoaded(moduleName) {
    return this.loadedModules.has(moduleName);
  }

  /**
   * Get current phase
   * @returns {string} Current phase
   */
  getCurrentPhase() {
    return this.currentPhase;
  }

  /**
   * Enable or disable lazy loading
   * @param {boolean} enabled - Whether to enable lazy loading
   */
  setLazyLoadingEnabled(enabled) {
    this.lazyLoadingEnabled = enabled;
  }
}

// Create singleton instance
const phaseManager = new PhaseManager();

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
   * Apply production boost to specific producer type
   * @param {string} type - Type of boost ('clipper', 'megaClipper', or 'factory')
   * @param {number} multiplier - Boost multiplier to apply
   * @returns {void}
   * @example
   * productionSystem.applyProductionBoost('clipper', 2.0); // Double clipper speed
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
 * @module ComputingSystem
 */


/**
 * @class ComputingSystem
 * @description Manages computational resources, operations generation, creativity, and quantum computing.
 * Handles processor/memory allocation, trust limits, and quantum chip generation.
 */
class ComputingSystem {
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
      const opsGenerated = opsPerSecond * deltaTime / 1000;
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
      const creativityGenerated = processors * creativitySpeed * deltaTime / 1000;
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
      quantumActive: gameState.get('computing.nextQchip') > 0
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

var combat = /*#__PURE__*/Object.freeze({
  __proto__: null,
  CombatSystem: CombatSystem,
  combatSystem: combatSystem
});

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
      requirement: _state => this.isPurchased('improvedAutoclippers'),
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
      requirement: _state => this.isPurchased('evenBetterAutoclippers'),
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
      requirement: _state => this.isPurchased('newSlogan'),
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
 * DOM Batching system for efficient updates
 * @module DOMBatcher
 */


/**
 * @class DOMBatcher
 * @description Batches DOM updates to minimize reflows and repaints.
 * Uses requestAnimationFrame to schedule updates at optimal times.
 */
class DOMBatcher {
  /**
   * Creates a new DOMBatcher instance
   * @constructor
   */
  constructor() {
    /** @type {Map<string, Function>} Pending DOM updates */
    this.pendingUpdates = new Map();
    /** @type {Map<string, Function>} Pending style updates */
    this.pendingStyles = new Map();
    /** @type {Map<string, Function>} Pending class updates */
    this.pendingClasses = new Map();
    /** @type {Set<string>} Elements to show/hide */
    this.pendingVisibility = new Set();
    /** @type {number|null} Current animation frame ID */
    this.frameId = null;
    /** @type {boolean} Whether batching is enabled */
    this.enabled = true;
    /** @type {Map<string, HTMLElement>} Element cache */
    this.elementCache = new Map();
    /** @type {number} Cache hit/miss statistics */
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Get element by ID with caching
   * @param {string} elementId - Element ID
   * @returns {HTMLElement|null} The element or null
   * @private
   */
  getElement(elementId) {
    let element = this.elementCache.get(elementId);
    if (!element || !document.body.contains(element)) {
      element = document.getElementById(elementId);
      if (element) {
        this.elementCache.set(elementId, element);
        this.cacheMisses++;
      }
    } else {
      this.cacheHits++;
    }
    return element;
  }

  /**
   * Queue a text content update
   * @param {string} elementId - Element ID
   * @param {string} text - New text content
   * @returns {void}
   */
  updateText(elementId, text) {
    if (!this.enabled) {
      const element = this.getElement(elementId);
      if (element && element.textContent !== text) {
        element.textContent = text;
      }
      return;
    }
    this.pendingUpdates.set(elementId, () => {
      const element = this.getElement(elementId);
      if (element && element.textContent !== text) {
        element.textContent = text;
      }
    });
    this.scheduleUpdate();
  }

  /**
   * Queue an innerHTML update
   * @param {string} elementId - Element ID
   * @param {string} html - New HTML content
   * @returns {void}
   */
  updateHTML(elementId, html) {
    if (!this.enabled) {
      const element = this.getElement(elementId);
      if (element && element.innerHTML !== html) {
        element.innerHTML = html;
      }
      return;
    }
    this.pendingUpdates.set(elementId, () => {
      const element = this.getElement(elementId);
      if (element && element.innerHTML !== html) {
        element.innerHTML = html;
      }
    });
    this.scheduleUpdate();
  }

  /**
   * Queue a style update
   * @param {string} elementId - Element ID
   * @param {Object} styles - Style properties to update
   * @returns {void}
   */
  updateStyles(elementId, styles) {
    if (!this.enabled) {
      const element = this.getElement(elementId);
      if (element) {
        Object.assign(element.style, styles);
      }
      return;
    }
    this.pendingStyles.set(elementId, () => {
      const element = this.getElement(elementId);
      if (element) {
        Object.assign(element.style, styles);
      }
    });
    this.scheduleUpdate();
  }

  /**
   * Queue a class list update
   * @param {string} elementId - Element ID
   * @param {Object} classes - Classes to add/remove {add: [], remove: []}
   * @returns {void}
   */
  updateClasses(elementId, classes) {
    if (!this.enabled) {
      const element = this.getElement(elementId);
      if (element) {
        if (classes.add) {
          element.classList.add(...classes.add);
        }
        if (classes.remove) {
          element.classList.remove(...classes.remove);
        }
      }
      return;
    }
    this.pendingClasses.set(elementId, () => {
      const element = this.getElement(elementId);
      if (element) {
        if (classes.add) {
          element.classList.add(...classes.add);
        }
        if (classes.remove) {
          element.classList.remove(...classes.remove);
        }
      }
    });
    this.scheduleUpdate();
  }

  /**
   * Queue visibility update
   * @param {string} elementId - Element ID
   * @param {boolean} visible - Whether element should be visible
   * @returns {void}
   */
  updateVisibility(elementId, visible) {
    if (!this.enabled) {
      const element = this.getElement(elementId);
      if (element) {
        element.style.display = visible ? '' : 'none';
      }
      return;
    }
    this.pendingVisibility.add(JSON.stringify({
      elementId,
      visible
    }));
    this.scheduleUpdate();
  }

  /**
   * Schedule a batch update
   * @private
   */
  scheduleUpdate() {
    if (this.frameId !== null) {
      return; // Update already scheduled
    }
    this.frameId = requestAnimationFrame(() => {
      this.flush();
    });
  }

  /**
   * Flush all pending updates
   * @returns {void}
   */
  flush() {
    try {
      // Clear frame ID first
      this.frameId = null;

      // Batch write operations (mutate)
      // Note: Read operations would go first if we needed measurements

      // 1. Update visibility first (can affect layout)
      for (const data of this.pendingVisibility) {
        const {
          elementId,
          visible
        } = JSON.parse(data);
        const element = this.getElement(elementId);
        if (element) {
          element.style.display = visible ? '' : 'none';
        }
      }
      this.pendingVisibility.clear();

      // 2. Update styles (can affect layout)
      for (const [, updateFn] of this.pendingStyles) {
        updateFn();
      }
      this.pendingStyles.clear();

      // 3. Update classes (can affect layout)
      for (const [, updateFn] of this.pendingClasses) {
        updateFn();
      }
      this.pendingClasses.clear();

      // 4. Update content last (least likely to affect other elements)
      for (const [, updateFn] of this.pendingUpdates) {
        updateFn();
      }
      this.pendingUpdates.clear();
    } catch (error) {
      errorHandler.handleError(error, 'domBatcher.flush');
    }
  }

  /**
   * Enable or disable batching
   * @param {boolean} enabled - Whether to enable batching
   * @returns {void}
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.flush(); // Flush any pending updates
    }
  }

  /**
   * Clear element cache
   * @returns {void}
   */
  clearCache() {
    this.elementCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: total > 0 ? (this.cacheHits / total * 100).toFixed(2) + '%' : '0%',
      size: this.elementCache.size
    };
  }

  /**
   * Batch multiple updates together
   * @param {Function} updateFn - Function containing multiple updates
   * @returns {void}
   */
  batch(updateFn) {
    const wasEnabled = this.enabled;
    this.enabled = true;
    try {
      updateFn();
    } catch (error) {
      errorHandler.handleError(error, 'domBatcher.batch');
    } finally {
      if (!wasEnabled) {
        this.flush();
        this.enabled = false;
      }
    }
  }

  /**
   * Read layout property safely
   * @param {string} elementId - Element ID
   * @param {string} property - Property to read
   * @returns {*} Property value
   */
  read(elementId, property) {
    const element = this.getElement(elementId);
    if (!element) {
      return null;
    }

    // Common layout properties that trigger reflow
    const layoutProperties = ['offsetWidth', 'offsetHeight', 'offsetTop', 'offsetLeft', 'clientWidth', 'clientHeight', 'clientTop', 'clientLeft', 'scrollWidth', 'scrollHeight', 'scrollTop', 'scrollLeft', 'getBoundingClientRect'];
    if (layoutProperties.includes(property)) {
      // These properties trigger reflow, so flush pending updates first
      this.flush();
    }
    if (property === 'getBoundingClientRect') {
      return element.getBoundingClientRect();
    }
    return element[property];
  }
}

// Create singleton instance
const domBatcher = new DOMBatcher();

// Export for debugging
if (typeof window !== 'undefined') {
  window.UniversalPaperclipsDOMBatcher = domBatcher;
}

/**
 * UI Renderer - handles all display updates and DOM manipulation
 * @module UIRenderer
 */


/**
 * @class UIRenderer
 * @description Manages UI updates with efficient DOM batching and caching.
 */
class UIRenderer {
  /**
   * Creates a new UIRenderer instance
   * @constructor
   */
  constructor() {
    /** @type {Object} Cached DOM elements */
    this.elements = {};
    /** @type {Object} Last rendered values for change detection */
    this.lastValues = {};
    /** @type {boolean} Whether renderer is initialized */
    this.initialized = false;
    /** @type {number} Update counter for debugging */
    this.updateCount = 0;
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
   * @param {Object} state - Current game state
   * @returns {void}
   */
  render(state) {
    if (!this.initialized) {
      this.init();
    }

    // Batch all DOM updates together
    domBatcher.batch(() => {
      try {
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
      } catch (error) {
        errorHandler.handleError(error, 'uiRenderer.render');
      }
    });
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

    // Update element using DOM batcher
    domBatcher.updateText(elementId, displayValue);
    this.lastValues[elementId] = value;
    this.updateCount++;
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
    // Update visibility through DOM batcher
    // Note: Using inline update for display blocks since they need 'block' not ''
    const element = this.elements[displayId];
    if (element) {
      domBatcher.updateStyles(displayId, {
        display: visible ? 'block' : 'none'
      });
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
  /**
   * Flash element with color animation
   * @param {string} elementId - Element to flash
   * @param {string} [color='#ffff00'] - Flash color
   * @returns {void}
   */
  flashElement(elementId, color = '#ffff00') {
    const element = this.elements[elementId] || document.getElementById(elementId);
    if (!element) {
      return;
    }
    const originalColor = element.style.backgroundColor;

    // Use DOM batcher for style updates
    domBatcher.updateStyles(elementId, {
      backgroundColor: color,
      transition: 'background-color 0.3s'
    });
    setTimeout(() => {
      domBatcher.updateStyles(elementId, {
        backgroundColor: originalColor
      });
    }, 300);
  }
}

// Create singleton instance
const uiRenderer = new UIRenderer();

// Export for debugging
if (typeof window !== 'undefined') {
  window.UniversalPaperclipsRenderer = uiRenderer;
}

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
 * Development Dashboard for debugging and monitoring
 * @module DevDashboard
 */


/**
 * @class DevDashboard
 * @description Development dashboard for monitoring game state, performance, and debugging.
 */
class DevDashboard {
  /**
   * Creates a new DevDashboard instance
   * @constructor
   */
  constructor() {
    /** @type {boolean} Whether dashboard is visible */
    this.visible = false;
    /** @type {HTMLElement|null} Dashboard container */
    this.container = null;
    /** @type {number} Update interval ID */
    this.updateInterval = null;
    /** @type {Object} Dashboard panels */
    this.panels = {};
    /** @type {boolean} Whether dashboard is initialized */
    this.initialized = false;
  }

  /**
   * Initialize the dashboard
   * @returns {void}
   */
  init() {
    if (this.initialized) {
      return;
    }

    // Create dashboard HTML
    this.createDashboard();

    // Set up keyboard shortcut (Ctrl+Shift+D)
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });
    this.initialized = true;
    errorHandler.info('Dev dashboard initialized (Ctrl+Shift+D to toggle)');
  }

  /**
   * Create dashboard HTML structure
   * @private
   */
  createDashboard() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'devDashboard';
    this.container.className = 'dev-dashboard';
    this.container.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      max-height: 90vh;
      background: rgba(0, 0, 0, 0.9);
      color: #0f0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      border: 2px solid #0f0;
      border-radius: 5px;
      padding: 10px;
      overflow-y: auto;
      z-index: 10000;
      display: none;
    `;

    // Create header
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #0f0; padding-bottom: 5px;">
        <h3 style="margin: 0; color: #0f0;">DEV DASHBOARD</h3>
        <button id="devDashboardClose" style="background: none; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 2px 8px;">X</button>
      </div>
    `;
    this.container.appendChild(header);

    // Create panels
    this.createPerformancePanel();
    this.createStatePanel();
    this.createErrorPanel();
    this.createDOMPanel();
    this.createControlsPanel();

    // Add to document
    document.body.appendChild(this.container);

    // Set up close button
    document.getElementById('devDashboardClose').addEventListener('click', () => {
      this.hide();
    });
  }

  /**
   * Create performance monitoring panel
   * @private
   */
  createPerformancePanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">PERFORMANCE</h4>
      <div id="devPerfContent" style="font-size: 11px;"></div>
    `;
    this.container.appendChild(panel);
    this.panels.performance = panel;
  }

  /**
   * Create game state panel
   * @private
   */
  createStatePanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">GAME STATE</h4>
      <div id="devStateContent" style="font-size: 11px; max-height: 200px; overflow-y: auto;"></div>
    `;
    this.container.appendChild(panel);
    this.panels.state = panel;
  }

  /**
   * Create error log panel
   * @private
   */
  createErrorPanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">ERROR LOG</h4>
      <div id="devErrorContent" style="font-size: 11px; max-height: 150px; overflow-y: auto;"></div>
    `;
    this.container.appendChild(panel);
    this.panels.errors = panel;
  }

  /**
   * Create DOM batching panel
   * @private
   */
  createDOMPanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">DOM BATCHING</h4>
      <div id="devDOMContent" style="font-size: 11px;"></div>
    `;
    this.container.appendChild(panel);
    this.panels.dom = panel;
  }

  /**
   * Create controls panel
   * @private
   */
  createControlsPanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">CONTROLS</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
        <button id="devAddClips" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">+10K Clips</button>
        <button id="devAddFunds" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">+$1000</button>
        <button id="devAddWire" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">+10K Wire</button>
        <button id="devAddOps" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">+10K Ops</button>
        <button id="devUnlockAll" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">Unlock All</button>
        <button id="devResetPerf" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">Reset Perf</button>
        <button id="devClearErrors" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">Clear Errors</button>
        <button id="devExportState" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">Export State</button>
      </div>
    `;
    this.container.appendChild(panel);
    this.panels.controls = panel;

    // Set up control buttons
    this.setupControls();
  }

  /**
   * Set up control button handlers
   * @private
   */
  setupControls() {
    // Add resources
    document.getElementById('devAddClips').addEventListener('click', () => {
      gameState.increment('resources.clips', 10000);
      errorHandler.debug('Added 10,000 clips');
    });
    document.getElementById('devAddFunds').addEventListener('click', () => {
      gameState.increment('resources.funds', 1000);
      errorHandler.debug('Added $1,000');
    });
    document.getElementById('devAddWire').addEventListener('click', () => {
      gameState.increment('resources.wire', 10000);
      errorHandler.debug('Added 10,000 wire');
    });
    document.getElementById('devAddOps').addEventListener('click', () => {
      gameState.increment('computing.operations', 10000);
      errorHandler.debug('Added 10,000 operations');
    });

    // Unlock all features
    document.getElementById('devUnlockAll').addEventListener('click', () => {
      Object.keys(gameState.flags).forEach(flag => {
        gameState.set(`flags.${flag}`, true);
      });
      errorHandler.debug('Unlocked all features');
    });

    // Reset performance
    document.getElementById('devResetPerf').addEventListener('click', () => {
      performanceMonitor.reset();
      errorHandler.debug('Performance metrics reset');
    });

    // Clear errors
    document.getElementById('devClearErrors').addEventListener('click', () => {
      errorHandler.clearErrorLog();
      this.updateErrorPanel();
    });

    // Export state
    document.getElementById('devExportState').addEventListener('click', () => {
      const state = JSON.stringify(gameState, null, 2);
      const blob = new Blob([state], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gamestate.json';
      a.click();
      URL.revokeObjectURL(url);
      errorHandler.debug('Game state exported');
    });
  }

  /**
   * Update dashboard content
   * @private
   */
  update() {
    if (!this.visible) {
      return;
    }
    this.updatePerformancePanel();
    this.updateStatePanel();
    this.updateErrorPanel();
    this.updateDOMPanel();
  }

  /**
   * Update performance panel
   * @private
   */
  updatePerformancePanel() {
    const metrics = performanceMonitor.getMetrics();
    const content = document.getElementById('devPerfContent');
    content.innerHTML = `
      <div>FPS: <span style="color: ${metrics.fps < 30 ? '#f00' : '#0f0'}">${metrics.fps.toFixed(1)}</span> (min: ${metrics.minFps.toFixed(1)})</div>
      <div>Frame Time: ${metrics.avgFrameTime.toFixed(2)}ms (max: ${metrics.maxFrameTime.toFixed(2)}ms)</div>
      <div>Update: ${metrics.updateTime.toFixed(2)}ms | Render: ${metrics.renderTime.toFixed(2)}ms</div>
      <div>Memory: ${metrics.memoryUsage.toFixed(1)}MB</div>
    `;
  }

  /**
   * Update game state panel
   * @private
   */
  updateStatePanel() {
    const content = document.getElementById('devStateContent');
    const state = gameState;
    const stateInfo = `
      <div style="color: #ff0;">RESOURCES</div>
      <div>Clips: ${formatNumber(state.resources.clips)}</div>
      <div>Funds: $${formatNumber(state.resources.funds)}</div>
      <div>Wire: ${formatNumber(state.resources.wire)}</div>
      <div style="margin-top: 5px; color: #ff0;">PRODUCTION</div>
      <div>Rate: ${formatNumber(state.production.clipRate)}/sec</div>
      <div>Auto-Clippers: ${state.production.clipmakerLevel}</div>
      <div>Mega-Clippers: ${state.production.megaClipperLevel}</div>
      <div style="margin-top: 5px; color: #ff0;">COMPUTING</div>
      <div>Processors: ${state.computing.processors} | Memory: ${state.computing.memory}</div>
      <div>Operations: ${formatNumber(state.computing.operations)}</div>
      <div>Trust: ${state.computing.trust}/${state.computing.maxTrust}</div>
    `;
    content.innerHTML = stateInfo;
  }

  /**
   * Update error panel
   * @private
   */
  updateErrorPanel() {
    const content = document.getElementById('devErrorContent');
    const errors = errorHandler.getErrorLog(10); // Last 10 errors

    if (errors.length === 0) {
      content.innerHTML = '<div style="color: #666;">No errors logged</div>';
      return;
    }
    const errorHtml = errors.reverse().map(err => {
      const time = new Date(err.timestamp).toLocaleTimeString();
      const color = err.level === 'error' ? '#f00' : err.level === 'warn' ? '#fa0' : '#999';
      return `<div style="color: ${color}; margin-bottom: 2px;">[${time}] ${err.message}</div>`;
    }).join('');
    content.innerHTML = errorHtml;
  }

  /**
   * Update DOM batching panel
   * @private
   */
  updateDOMPanel() {
    const content = document.getElementById('devDOMContent');
    const cacheStats = domBatcher.getCacheStats();
    const renderer = window.UniversalPaperclipsRenderer;
    content.innerHTML = `
      <div>Cache Hits: ${cacheStats.hits} | Misses: ${cacheStats.misses}</div>
      <div>Hit Rate: ${cacheStats.hitRate} | Size: ${cacheStats.size}</div>
      <div>Render Updates: ${renderer ? renderer.updateCount : 0}</div>
      <div>Batching: ${domBatcher.enabled ? 'Enabled' : 'Disabled'}</div>
    `;
  }

  /**
   * Show the dashboard
   * @returns {void}
   */
  show() {
    if (!this.initialized) {
      this.init();
    }
    this.container.style.display = 'block';
    this.visible = true;

    // Start update interval
    this.updateInterval = setInterval(() => this.update(), 100);

    // Initial update
    this.update();
    errorHandler.debug('Dev dashboard shown');
  }

  /**
   * Hide the dashboard
   * @returns {void}
   */
  hide() {
    this.container.style.display = 'none';
    this.visible = false;

    // Stop update interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    errorHandler.debug('Dev dashboard hidden');
  }

  /**
   * Toggle dashboard visibility
   * @returns {void}
   */
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if dashboard is visible
   * @returns {boolean} True if visible
   */
  isVisible() {
    return this.visible;
  }
}

// Create singleton instance
const devDashboard = new DevDashboard();

// Export for debugging
if (typeof window !== 'undefined') {
  window.UniversalPaperclipsDevDashboard = devDashboard;
}

/**
 * Universal Paperclips - Main Entry Point
 * Modern modular version of the classic incremental game
 */


// Game initialization
async function initGame() {
  errorHandler.info('Universal Paperclips - Modern Edition');
  errorHandler.info('Original by Frank Lantz and Bennett Foddy');

  // Set error handler log level based on environment
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  errorHandler.setLogLevel(isDev ? 'debug' : 'info');

  // Initialize dev dashboard in development
  if (isDev) {
    devDashboard.init();
  }

  // Try to load saved game
  try {
    const loaded = gameState.load();
    if (loaded) {
      errorHandler.info('Save game loaded successfully');
    } else {
      errorHandler.info('Starting new game');
    }
  } catch (error) {
    errorHandler.handleError(error, 'initGame.load');
    errorHandler.warn('Failed to load save, starting new game');
  }

  // Initialize phase manager for lazy loading
  try {
    await phaseManager.init();
    errorHandler.info(`Game initialized in ${phaseManager.getCurrentPhase()} phase`);
  } catch (error) {
    errorHandler.handleError(error, 'initGame.phaseManager');
    errorHandler.warn('Phase manager failed, continuing with all modules loaded');
  }

  // Register update handlers with error boundaries
  gameLoop.addUpdateHandler(errorHandler.createErrorBoundary((deltaTime, state) => {
    const currentTime = Date.now();

    // Always update core systems
    productionSystem.update(deltaTime);
    computingSystem.update(deltaTime);

    // Update phase-specific systems
    const currentPhase = phaseManager.getCurrentPhase();
    if (currentPhase === 'human') {
      // Human phase: market is active
      marketSystem.update(deltaTime, currentTime);
    }
    if (currentPhase === 'space' || currentPhase === 'endgame') {
      // Space phase: combat and lazy-loaded systems
      combatSystem.update(deltaTime, currentTime);

      // Update lazy-loaded systems if available
      const swarmModule = phaseManager.isModuleLoaded('swarm');
      if (swarmModule) {
        const swarmSystem = phaseManager.getLoadedModules().get('swarm').default;
        if (swarmSystem && swarmSystem.update) {
          swarmSystem.update(deltaTime);
        }
      }
      const explorationModule = phaseManager.isModuleLoaded('exploration');
      if (explorationModule) {
        const explorationSystem = phaseManager.getLoadedModules().get('exploration').default;
        if (explorationSystem && explorationSystem.update) {
          explorationSystem.update(deltaTime);
        }
      }
    }

    // Update elapsed time
    state.increment('ui.elapsedTime', deltaTime);
  }, 'mainUpdateHandler'));

  // Register render handlers with error boundaries
  gameLoop.addRenderHandler(errorHandler.createErrorBoundary(state => {
    uiRenderer.render(state);
    uiRenderer.updateButtonStates(state);
  }, 'mainRenderHandler'));

  // Set up UI event handlers with error handling
  try {
    setupEventHandlers();
  } catch (error) {
    errorHandler.handleError(error, 'initGame.setupEventHandlers');
  }

  // Start the game loop
  gameLoop.start();

  // Initial render
  uiRenderer.render(gameState);

  // Set up autosave with error handling
  setInterval(() => {
    try {
      gameState.save();
    } catch (error) {
      errorHandler.handleError(error, 'autosave.interval');
    }
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
  errorHandler,
  performanceMonitor,
  devDashboard,
  phaseManager,
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
    },
    // Error and performance debugging
    getErrors: () => errorHandler.getErrorLog(),
    clearErrors: () => errorHandler.clearErrorLog(),
    getPerformance: () => performanceMonitor.getReport(),
    resetPerformance: () => performanceMonitor.reset(),
    setLogLevel: level => errorHandler.setLogLevel(level)
  }
};
errorHandler.info('Game loaded. Use window.UniversalPaperclips.debug for debugging tools.');
