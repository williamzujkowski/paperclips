/**
 * GameState class - Manages all game state in a centralized, encapsulated manner
 * Replaces global variables with proper state management
 */
export class GameState {
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
      foundMatter: 0,
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
      farmRate: 0,
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
      incomeTracker: [0],
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
      qClock: 0,
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
      batterySize: 0,
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
      bonusHonor: 0,
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
      investmentEngine: false,
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
      boredomFlag: 0,
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
      opFade: 1,
    };

    // Game Meta
    this.meta = {
      prestigeU: 0,
      prestigeS: 0,
      dismantle: 0,
      resetFlag: 0,
      transaction: null,
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
          meta: this.meta,
        },
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
export const gameState = new GameState();

// Backward compatibility layer - maps old global variable names to state paths
export const legacyMapping = {
  clips: 'resources.clips',
  funds: 'resources.funds',
  wire: 'resources.wire',
  processors: 'computing.processors',
  memory: 'computing.memory',
  trust: 'computing.trust',
  operations: 'computing.operations',
  creativity: 'computing.creativity',
  factoryLevel: 'infrastructure.factoryLevel',
  harvesterLevel: 'infrastructure.harvesterLevel',
  wireDroneLevel: 'infrastructure.wireDroneLevel',
  margin: 'market.margin',
  demand: 'market.demand',
  marketingLvl: 'market.marketingLvl',
  clipRate: 'production.clipRate',
  clipmakerLevel: 'production.clipmakerLevel',
  megaClipperLevel: 'production.megaClipperLevel',
  probeCount: 'swarm.probeCount',
  honor: 'combat.honor',
  humanFlag: 'flags.human',
  spaceFlag: 'flags.space',
  battleFlag: 'flags.battle',
  ticks: 'ui.ticks',
  prestigeU: 'meta.prestigeU',
  prestigeS: 'meta.prestigeS',
};