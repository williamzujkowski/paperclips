/**
 * GameState class - Manages all game state in a centralized, encapsulated manner
 * Replaces global variables with proper state management
 */
class GameState {
  constructor() {
    // Observers for state changes
    this.observers = new Map();

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
      endgame: false,
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
      investmentEngine: false,
      creativity: false,
      quantum: false
    };

    // AI & Swarm
    this.swarm = {
      status: 0,
      gifts: 0,
      nextGift: 0,
      giftPeriod: 0,
      probeCount: 0,
      probesLaunched: 0,
      harvesterProbes: 0,
      wireProbes: 0,
      combatProbes: 0,
      harvesterRatio: 0.5,
      wireRatio: 0.3,
      combatRatio: 0.2,
      giftCountdown: 0,
      disorgCounter: 0,
      disorgFlag: 0,
      boredomLevel: 0,
      boredomFlag: 0
    };

    // Exploration System
    this.exploration = {
      exploredSpace: 0,
      sectors: [],
      probeSpeed: 1,
      matterDensity: 0.1
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
          exploration: this.exploration,
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
      Object.assign(this.exploration, parsed.state.exploration || {});
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
    const oldValue = target[lastKey];
    target[lastKey] = newValue;

    // Notify observers if value changed
    if (oldValue !== newValue) {
      this.notifyObservers(path, newValue, oldValue);
    }
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

  /**
   * Add an observer for state changes
   * @param {string} path - Path to observe (e.g., 'flags.space')
   * @param {Function} callback - Callback function (value, oldValue) => void
   * @returns {Function} Unsubscribe function
   */
  addObserver(path, callback) {
    if (!this.observers.has(path)) {
      this.observers.set(path, new Set());
    }
    this.observers.get(path).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.observers.get(path);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.observers.delete(path);
        }
      }
    };
  }

  /**
   * Notify observers of a state change
   * @param {string} path - Path that changed
   * @param {*} newValue - New value
   * @param {*} oldValue - Old value
   * @private
   */
  notifyObservers(path, newValue, oldValue) {
    // Notify exact path observers
    const exactObservers = this.observers.get(path);
    if (exactObservers) {
      for (const callback of exactObservers) {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error(`Observer error for path ${path}:`, error);
        }
      }
    }

    // Notify wildcard observers (e.g., 'flags.*')
    const pathParts = path.split('.');
    for (let i = pathParts.length - 1; i > 0; i--) {
      const wildcardPath = pathParts.slice(0, i).join('.') + '.*';
      const wildcardObservers = this.observers.get(wildcardPath);
      if (wildcardObservers) {
        for (const callback of wildcardObservers) {
          try {
            callback(newValue, oldValue, path);
          } catch (error) {
            console.error(`Wildcard observer error for path ${wildcardPath}:`, error);
          }
        }
      }
    }
  }
}

// Create singleton instance
const gameState = new GameState();

/**
 * Error handling and logging system
 * @module ErrorHandler
 */

/**
 * @class ErrorHandler
 * @description Centralized error handling and logging for the game.
 * Provides error boundaries, logging levels, and error recovery mechanisms.
 */
class ErrorHandler {
  /**
   * Creates a new ErrorHandler instance
   * @constructor
   */
  constructor() {
    /** @type {Array<Object>} Error log history */
    this.errorLog = [];
    /** @type {number} Maximum log entries to keep */
    this.maxLogSize = 100;
    /** @type {string} Current log level */
    this.logLevel = 'info'; // debug, info, warn, error
    /** @type {boolean} Whether to send errors to console */
    this.consoleOutput = true;
    /** @type {Function|null} Custom error reporter */
    this.errorReporter = null;

    // Set up global error handlers
    this.setupGlobalHandlers();
  }

  /**
   * Set up global error event listeners
   * @private
   */
  setupGlobalHandlers() {
    // Handle unhandled errors
    window.addEventListener('error', event => {
      this.handleError(event.error, 'window.error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.handleError(event.reason, 'unhandledrejection', {
        promise: event.promise
      });
    });
  }

  /**
   * Log a message at the specified level
   * @param {string} level - Log level (debug, info, warn, error)
   * @param {string} message - Log message
   * @param {Object} [context={}] - Additional context data
   */
  log(level, message, context = {}) {
    const logEntry = {
      timestamp: Date.now(),
      level,
      message,
      context
    };

    // Add to log history
    this.errorLog.push(logEntry);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console output if enabled
    if (this.consoleOutput && this.shouldLog(level)) {
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[logMethod](`[${level.toUpperCase()}] ${message}`, context);
    }

    // Send to custom reporter if configured
    if (this.errorReporter && level === 'error') {
      try {
        this.errorReporter(logEntry);
      } catch (reporterError) {
        console.error('Error reporter failed:', reporterError);
      }
    }
  }

  /**
   * Check if a message should be logged based on current log level
   * @param {string} level - Log level to check
   * @returns {boolean} True if should log
   * @private
   */
  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} [context={}] - Additional context
   */
  debug(message, context = {}) {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} [context={}] - Additional context
   */
  info(message, context = {}) {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} [context={}] - Additional context
   */
  warn(message, context = {}) {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Object} [context={}] - Additional context
   */
  error(message, context = {}) {
    this.log('error', message, context);
  }

  /**
   * Handle an error with context
   * @param {Error} error - The error object
   * @param {string} source - Where the error occurred
   * @param {Object} [context={}] - Additional context
   */
  handleError(error, source, context = {}) {
    this.error(`Error in ${source}: ${error.message}`, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });

    // Attempt recovery if possible
    this.attemptRecovery(error, source);
  }

  /**
   * Attempt to recover from an error
   * @param {Error} error - The error object
   * @param {string} source - Where the error occurred
   * @private
   */
  attemptRecovery(error, source) {
    // Log recovery attempt
    this.info(`Attempting recovery from error in ${source}`);

    // Specific recovery strategies based on error type
    if (error.name === 'QuotaExceededError') {
      // localStorage quota exceeded
      this.warn('localStorage quota exceeded, clearing old data');
      try {
        // Clear old saves or compress data
        const saves = Object.keys(localStorage).filter(key => key.startsWith('paperclips_'));
        if (saves.length > 5) {
          // Keep only the 5 most recent saves
          saves.sort().slice(0, -5).forEach(key => localStorage.removeItem(key));
        }
      } catch (clearError) {
        this.error('Failed to clear localStorage', {
          error: clearError
        });
      }
    }
  }

  /**
   * Create an error boundary wrapper for functions
   * @param {Function} fn - Function to wrap
   * @param {string} [name='anonymous'] - Function name for logging
   * @returns {Function} Wrapped function with error handling
   */
  createErrorBoundary(fn, name = 'anonymous') {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error, `function:${name}`, {
          args
        });
        // Return a safe default or re-throw based on context
        if (name.includes('render') || name.includes('update')) {
          // Don't crash the render/update loop
          return undefined;
        }
        throw error;
      }
    };
  }

  /**
   * Get error log entries
   * @param {number} [count] - Number of entries to return (default: all)
   * @returns {Array<Object>} Error log entries
   */
  getErrorLog(count) {
    if (count) {
      return this.errorLog.slice(-count);
    }
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    this.info('Error log cleared');
  }

  /**
   * Set log level
   * @param {string} level - New log level (debug, info, warn, error)
   */
  setLogLevel(level) {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (validLevels.includes(level)) {
      this.logLevel = level;
      this.info(`Log level set to ${level}`);
    } else {
      this.warn(`Invalid log level: ${level}`);
    }
  }

  /**
   * Set custom error reporter
   * @param {Function} reporter - Function to call with error data
   */
  setErrorReporter(reporter) {
    this.errorReporter = reporter;
    this.info('Custom error reporter configured');
  }

  /**
   * Export error log as JSON
   * @returns {string} JSON string of error log
   */
  exportErrorLog() {
    return JSON.stringify({
      timestamp: Date.now(),
      logLevel: this.logLevel,
      errors: this.errorLog
    }, null, 2);
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export for debugging
if (typeof window !== 'undefined') {
  window.UniversalPaperclipsErrorHandler = errorHandler;
}

/**
 * Swarm System - Manages probe swarms in space phase
 * @module SwarmSystem
 */


/**
 * @class SwarmSystem
 * @description Manages probe creation, distribution, and swarm behavior in space.
 * Only loaded when entering space phase.
 */
class SwarmSystem {
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
      const probesProduced = productionRate * deltaTime / 1000;
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
      swarmStatus: gameState.get('swarm.status')
    };
  }
}

// Create singleton instance
const swarmSystem = new SwarmSystem();

var swarm = /*#__PURE__*/Object.freeze({
  __proto__: null,
  SwarmSystem: SwarmSystem,
  default: swarmSystem
});

/**
 * Exploration System - Manages space exploration in space phase
 * @module ExplorationSystem
 */


/**
 * @class ExplorationSystem
 * @description Manages exploration of the universe, matter acquisition, and expansion.
 * Only loaded when entering space phase.
 */
class ExplorationSystem {
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
      const progress = explorationRate * deltaTime / 1000;
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
      const matterFound = discoveryRate * deltaTime / 1000;
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
        const extracted = extractionRate * deltaTime / 1000;
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
      discovered: Date.now()
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
    const sector = sectors.find(s => s.id === sectorId);
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
      activeSectors: this.discoveredSectors.filter(s => s.active).length,
      totalMatterFound: gameState.get('resources.foundMatter'),
      matterAcquired: gameState.get('resources.acquiredMatter')
    };
  }
}

// Create singleton instance
const explorationSystem = new ExplorationSystem();

var exploration = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ExplorationSystem: ExplorationSystem,
  default: explorationSystem
});

export { exploration as a, errorHandler as e, gameState as g, swarm as s };
