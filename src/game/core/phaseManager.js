/**
 * Phase Manager - Handles lazy loading of game phases
 * @module PhaseManager
 */

import { gameState } from './gameState.js';
import { errorHandler } from './errorHandler.js';

/**
 * @class PhaseManager
 * @description Manages game phases and lazy loads systems as needed.
 * Reduces initial load time by only loading necessary systems.
 */
export class PhaseManager {
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
    this.phaseDependencies = new Map([
      ['human', ['production', 'market', 'computing', 'projects']],
      ['space', ['combat', 'swarm', 'exploration']],
      ['endgame', []], // TODO: Add strategic and universal modules
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
    gameState.addObserver('flags.space', async (value) => {
      if (value && this.currentPhase !== 'space') {
        await this.transitionToPhase('space');
      }
    });

    // Watch for endgame phase transition
    gameState.addObserver('flags.endgame', async (value) => {
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
      errorHandler.handleError(error, 'phaseManager.transitionToPhase', { newPhase });
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
          module = await import('../systems/combat.js');
          break;
        case 'swarm':
          module = await import('../systems/swarm.js');
          break;
        case 'exploration':
          module = await import('../systems/exploration.js');
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
      errorHandler.handleError(error, 'phaseManager.loadModule', { moduleName });
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
export const phaseManager = new PhaseManager();
