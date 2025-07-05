/**
 * GameState class - Centralized state management for Universal Paperclips
 *
 * This class replaces the 182 global variables from the legacy codebase
 * with a structured, maintainable state management system.
 */
export class GameState {
  constructor() {
    // Event system for accessibility and other notifications
    this.events = new Map();
    this.eventListeners = new Map();
    this.resources = {
      clips: 0,
      totalClips: 0,
      unusedClips: 0,
      unsoldClips: 0,
      funds: 0,
      wire: 1000,
      nanoWire: 0,
      bankroll: 0
    };

    this.production = {
      clipRate: 0,
      clipRateTemp: 0,
      prevClips: 0,
      clipRateTracker: 0,
      clipmakerRate: 0,
      boosts: {
        clipper: 1,
        megaClipper: 1,
        factory: 1,
        drone: 1
      }
    };

    this.manufacturing = {
      clipmakers: {
        level: 0,
        cost: 5
      },
      megaClippers: {
        level: 0,
        cost: 500
      },
      factories: {
        level: 0,
        cost: 100000000,
        rate: 1000000000,
        powerConsumption: 0
      }
    };

    this.market = {
      pricing: {
        margin: 0.25,
        wireCost: 20,
        wireBasePrice: 20,
        wirePriceCounter: 0,
        adCost: 100
      },
      demand: 5,
      demandBoost: 1,
      marketing: {
        level: 1,
        effectiveness: 1
      },
      sales: {
        clipsSold: 0,
        avgRevenue: 0,
        income: 0,
        incomeTracker: [0]
      },
      totalRevenue: 0,
      wire: {
        supply: 1000,
        purchase: 0,
        buyerStatus: 1,
        priceTimer: 0
      }
    };

    this.computing = {
      processors: 1,
      memory: 1,
      operations: 0,
      creativity: {
        amount: 0,
        enabled: false,
        speed: 1,
        counter: 0
      },
      trust: {
        current: 2,
        nextThreshold: 3000,
        max: 20,
        maxCost: 91117.99
      },
      quantum: {
        enabled: false,
        clock: 0,
        chipCost: 10000,
        nextChip: 0,
        fade: 1
      },
      operations: {
        temp: 0,
        standard: 0,
        fade: 0,
        fadeTimer: 0,
        fadeDelay: 800
      },
      transaction: 1
    };

    this.space = {
      probes: {
        count: 0
      },
      harvesters: {
        level: 0,
        cost: 1000000,
        rate: 26180337,
        powerConsumption: 0
      },
      wireDrones: {
        level: 0,
        cost: 1000000,
        rate: 16180339,
        powerConsumption: 0
      },
      matter: {
        available: Math.pow(10, 24) * 6000,
        acquired: 0,
        processed: 0,
        total: Math.pow(10, 54) * 30,
        found: Math.pow(10, 24) * 6000
      }
    };

    this.power = {
      stored: 0,
      modifier: 0,
      solarFarms: {
        level: 0,
        cost: 10000000,
        rate: 50,
        bill: 0
      },
      batteries: {
        level: 0,
        cost: 1000000,
        capacity: 10000,
        bill: 0
      },
      consumption: {
        factory: 200,
        drone: 1
      }
    };

    this.combat = {
      honor: 0,
      momentum: 0,
      battleEnabled: false,
      disorganization: {
        counter: 0,
        enabled: false,
        message: 0,
        synchCost: 5000
      },
      entertainment: {
        cost: 10000,
        boredom: {
          level: 0,
          enabled: false,
          message: 0
        }
      },
      threnody: {
        cost: 50000,
        audio: null, // Will be initialized when needed
        loaded: false
      }
    };

    this.swarm = {
      enabled: false,
      status: 7,
      gifts: {
        received: 0,
        next: 0,
        period: 125000,
        countdown: 125000
      }
    };

    this.prestige = {
      u: 0,
      s: 0
    };

    this.gameState = {
      ticks: 0,
      elapsedTime: 0,
      resetFlag: 2,
      flags: {
        milestone: 0,
        strategy: 0,
        investment: 0,
        revPerSec: 0,
        comp: 0,
        projects: 0,
        autoClipper: 0,
        megaClipper: 0,
        wireBuyer: 0,
        human: 1,
        trust: 1,
        creation: 0,
        wireProduction: 0,
        space: 0,
        factory: 0,
        harvester: 0,
        wireDrone: 0,
        autoTourney: 0,
        ego: 0,
        toth: 0,
        safety: false,
        test: 0
      },
      automation: {
        tourneyStatus: 1,
        wireBuyerEnabled: false
      }
    };

    this.ui = {
      blinkCounter: 0,
      sliderPos: 0,
      driftKingMessageCost: 1,
      bribe: 1000000
    };

    this.endGame = {
      dismantle: 0,
      finalClips: 0,
      timers: {
        end1: 0,
        end2: 0,
        end3: 0,
        end4: 0,
        end5: 0,
        end6: 0
      }
    };

    this.legacy = {
      x: 0,
      fib1: 2,
      fib2: 3,
      boostLvl: 0
    };

    this._changeListeners = [];
  }

  /**
   * Get value using dot notation path
   * @param {string} path - Dot notation path (e.g., 'resources.clips')
   * @returns {*} Value at the path
   */
  get(path) {
    if (!path) {
      return this;
    }

    const keys = path.split('.');
    let current = this;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * Set value using dot notation path
   * @param {string} path - Dot notation path (e.g., 'resources.clips')
   * @param {*} value - Value to set
   */
  set(path, value) {
    if (!path) {
      return;
    }

    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this;

    for (const key of keys) {
      if (current[key] === undefined) {
        current[key] = {};
      }
      current = current[key];
    }

    const oldValue = current[lastKey];
    current[lastKey] = value;

    this._notifyChange(path, oldValue, value);
  }

  /**
   * Increment value at path
   * @param {string} path - Dot notation path
   * @param {number} amount - Amount to increment
   */
  increment(path, amount = 1) {
    const currentValue = this.get(path) || 0;
    this.set(path, currentValue + amount);
  }

  /**
   * Decrement value at path
   * @param {string} path - Dot notation path
   * @param {number} amount - Amount to decrement
   */
  decrement(path, amount = 1) {
    this.increment(path, -amount);
  }

  /**
   * Add change listener
   * @param {Function} listener - Callback function
   */
  addChangeListener(listener) {
    this._changeListeners.push(listener);
  }

  /**
   * Remove change listener
   * @param {Function} listener - Callback function
   */
  removeChangeListener(listener) {
    const index = this._changeListeners.indexOf(listener);
    if (index !== -1) {
      this._changeListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of a change
   * @private
   */
  _notifyChange(path, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._changeListeners.forEach((listener) => {
        try {
          listener(path, oldValue, newValue);
        } catch (error) {
          console.error('Error in change listener:', error);
        }
      });
    }
  }

  /**
   * Save state to localStorage
   */
  save() {
    try {
      const saveData = {
        resources: this.resources,
        production: this.production,
        manufacturing: this.manufacturing,
        market: this.market,
        computing: this.computing,
        space: this.space,
        power: this.power,
        combat: { ...this.combat, threnody: { ...this.combat.threnody, audio: null } },
        swarm: this.swarm,
        prestige: this.prestige,
        gameState: this.gameState,
        ui: this.ui,
        endGame: this.endGame,
        legacy: this.legacy,
        version: '2.0.0',
        timestamp: Date.now()
      };

      localStorage.setItem('paperclips-save', JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Failed to save game state:', error);
      return false;
    }
  }

  /**
   * Load state from localStorage
   */
  load() {
    try {
      const saveData = localStorage.getItem('paperclips-save');
      if (!saveData) {
        return false;
      }

      const data = JSON.parse(saveData);

      // Merge saved data with current state structure
      this._mergeState(data);

      return true;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return false;
    }
  }

  /**
   * Merge saved state with current state structure
   * @private
   */
  _mergeState(data) {
    const merge = (target, source) => {
      for (const key in source) {
        if (
          source[key] !== null &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key])
        ) {
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
          }
          merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    merge(this, data);
  }

  /**
   * Reset to initial state
   */
  reset() {
    const initialState = new GameState();

    // Copy all properties from initial state
    Object.keys(initialState).forEach((key) => {
      if (key !== '_changeListeners') {
        this[key] = JSON.parse(JSON.stringify(initialState[key]));
      }
    });

    this._notifyChange('*', null, 'reset');
  }

  /**
   * Export state as JSON string
   */
  export() {
    const saveData = {
      resources: this.resources,
      production: this.production,
      manufacturing: this.manufacturing,
      market: this.market,
      computing: this.computing,
      space: this.space,
      power: this.power,
      combat: { ...this.combat, threnody: { ...this.combat.threnody, audio: null } },
      swarm: this.swarm,
      prestige: this.prestige,
      gameState: this.gameState,
      ui: this.ui,
      endGame: this.endGame,
      legacy: this.legacy,
      version: '2.0.0',
      timestamp: Date.now()
    };
    return JSON.stringify(saveData, null, 2);
  }

  /**
   * Import state from JSON string
   * @param {string} jsonString - JSON string to import
   */
  import(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this._mergeState(data);
      this._notifyChange('*', null, 'import');
      return true;
    } catch (error) {
      console.error('Failed to import game state:', error);
      return false;
    }
  }

  /**
   * Get a deep copy of the current state
   */
  getSnapshot() {
    return JSON.parse(JSON.stringify(this));
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Create singleton instance
export const gameState = new GameState();
