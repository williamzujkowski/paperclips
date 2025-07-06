/**
 * Combat System for Universal Paperclips
 *
 * Handles space exploration, probe combat, battles with drifters,
 * honor system, and tactical combat visualization.
 */

import { BALANCE } from "../core/constants.js";
import { errorHandler } from "../core/errorHandler.js";
import { performanceMonitor } from "../core/performanceMonitor.js";

export class CombatSystem {
  constructor(gameState) {
    this.gameState = gameState;

    // Combat constants
    this.COMBAT_BASE_RATE = 0.15;
    this.DRIFTER_COMBAT = 1.75;
    this.BATTLE_SPEED = 0.2;
    this.DEATH_THRESHOLD = 0.5;
    this.WAR_TRIGGER = 1000000;
    this.MAX_BATTLES = 1;

    // Active battles
    this.battles = [];
    this.battleIdCounter = 0;

    // Battle visualization (for future canvas implementation)
    this.battleCanvas = null;
    this.battleContext = null;
    this.visualizationEnabled = false;

    // Bind methods for error boundaries
    this.update = errorHandler.createErrorBoundary(
      this.update.bind(this),
      "combat.update",
    );
  }

  /**
   * Check if war conditions are met and create battles
   */
  checkForBattles() {
    const probeCount = this.gameState.get("space.probes.count");
    const drifterCount = this.gameState.get("combat.drifterCount") || 0;
    const battleEnabled = this.gameState.get("combat.battleEnabled");

    // War triggers when drifters exceed threshold and probes exist
    if (drifterCount > this.WAR_TRIGGER && probeCount > 0 && battleEnabled) {
      // 50% chance to create a new battle each check
      if (Math.random() < 0.5 && this.battles.length < this.MAX_BATTLES) {
        this.createBattle();
      }
    }
  }

  /**
   * Create a new battle
   */
  createBattle() {
    const probeCount = this.gameState.get("space.probes.count");
    const drifterCount = this.gameState.get("combat.drifterCount");

    // Calculate forces for this battle
    const unitSize = this.calculateUnitSize(probeCount, drifterCount);
    const probeForces = Math.min(Math.ceil(probeCount / 100), 200); // Cap at 200 for performance
    const drifterForces = Math.min(Math.ceil(drifterCount / 100), 200);

    const battle = {
      id: this.battleIdCounter++,
      probeShips: probeForces,
      drifterShips: drifterForces,
      originalProbeShips: probeForces,
      originalDrifterShips: drifterForces,
      unitSize: unitSize,
      territory: Math.floor(Math.random() * 1000000), // Territory at stake
      duration: 0,
      active: true,
      victor: null,
    };

    this.battles.push(battle);

    errorHandler.debug(
      `Battle created: ${probeForces} probes vs ${drifterForces} drifters`,
    );

    return battle;
  }

  /**
   * Calculate unit size for battle scaling
   */
  calculateUnitSize(probeCount, drifterCount) {
    let unitSize;

    if (drifterCount >= probeCount) {
      unitSize = probeCount / 100;
    } else {
      unitSize = drifterCount / 100;
    }

    return Math.max(1, unitSize);
  }

  /**
   * Update all active battles
   */
  updateBattles() {
    this.battles = this.battles.filter((battle) => {
      if (!battle.active) return false;

      this.processBattleTick(battle);

      // Remove completed battles
      if (battle.victor) {
        this.handleBattleOutcome(battle);
        return false;
      }

      return true;
    });
  }

  /**
   * Process a single battle tick
   */
  processBattleTick(battle) {
    battle.duration++;

    // Battle occurs on random intervals based on battle speed
    if (Math.random() >= this.BATTLE_SPEED) {
      this.resolveCombat(battle);
    }

    // Check for battle end conditions
    if (battle.probeShips <= 0) {
      battle.victor = "drifters";
      battle.active = false;
    } else if (battle.drifterShips <= 0) {
      battle.victor = "probes";
      battle.active = false;
    }
  }

  /**
   * Resolve combat for a battle tick
   */
  resolveCombat(battle) {
    const probeCombat = this.gameState.get("combat.probeCombat") || 1;
    const probeSpeed = this.gameState.get("combat.probeSpeed") || 1;
    const combatEffectiveness = this.getCombatEffectiveness();

    // Random determines who attacks
    if (Math.random() >= this.BATTLE_SPEED) {
      // Drifters attack probes
      const casualties = Math.floor(
        battle.drifterShips * this.DRIFTER_COMBAT * (1 - this.BATTLE_SPEED),
      );

      battle.probeShips = Math.max(0, battle.probeShips - casualties);

      // Update global probe count
      const globalCasualties = casualties * battle.unitSize;
      this.gameState.decrement("space.probes.count", globalCasualties);
      this.gameState.increment("combat.probesLostCombat", globalCasualties);
    } else {
      // Probes attack drifters
      const attackPower = Math.pow(probeCombat, 1.7) * combatEffectiveness;
      const speedBonus = 1 + probeSpeed * 0.2; // OODA loop bonus

      const casualties = Math.floor(
        battle.probeShips * attackPower * speedBonus,
      );

      battle.drifterShips = Math.max(0, battle.drifterShips - casualties);

      // Update global drifter count
      const globalCasualties = casualties * battle.unitSize;
      this.gameState.decrement("combat.drifterCount", globalCasualties);
    }
  }

  /**
   * Calculate combat effectiveness based on projects and upgrades
   */
  getCombatEffectiveness() {
    let effectiveness = 1.0;

    // Base combat effectiveness
    const probeCombat = this.gameState.get("combat.probeCombat") || 1;

    // Check for combat projects
    const nameBattlesProject = this.gameState.get(
      "projects.nameBattles.completed",
    );
    if (nameBattlesProject) {
      effectiveness *= 2.0; // 2x combat effectiveness from naming battles
    }

    // Attack speed upgrades
    const attackSpeedFlag = this.gameState.get("combat.attackSpeedFlag");
    if (attackSpeedFlag) {
      effectiveness *= 1.1; // 10% bonus from attack speed
    }

    return effectiveness;
  }

  /**
   * Handle battle outcome (victory or defeat)
   */
  handleBattleOutcome(battle) {
    const currentHonor = this.gameState.get("combat.honor");

    if (battle.victor === "probes") {
      // Victory: Gain honor
      let honorGain = battle.originalDrifterShips;

      // Check for Glory project bonus
      const gloryProject = this.gameState.get("projects.glory.completed");
      if (gloryProject) {
        const consecutiveWins =
          this.gameState.get("combat.consecutiveWins") || 0;
        honorGain += consecutiveWins * 10; // +10 honor per consecutive win
        this.gameState.set("combat.consecutiveWins", consecutiveWins + 1);
      }

      this.gameState.set("combat.honor", currentHonor + honorGain);

      // Track battle victory for achievements
      const battlesWon =
        (this.gameState.get("achievements.battlesWon") || 0) + 1;
      this.gameState.set("achievements.battlesWon", battlesWon);

      // Gain territory (available matter)
      this.gameState.increment("space.matter.available", battle.territory);

      errorHandler.debug(`Battle won! Gained ${honorGain} honor`);

      // Log to console
      if (window.renderer) {
        window.renderer.logCombatEvent(
          `Victory! Gained ${honorGain} honor and ${battle.territory.toLocaleString()} territory.`,
          true
        );
      }
    } else if (battle.victor === "drifters") {
      // Defeat: Lose honor and territory
      const honorLoss = battle.originalProbeShips;
      this.gameState.set("combat.honor", Math.max(0, currentHonor - honorLoss));

      // Lose territory
      this.gameState.decrement("space.matter.available", battle.territory);

      // Reset consecutive wins
      this.gameState.set("combat.consecutiveWins", 0);

      errorHandler.debug(`Battle lost! Lost ${honorLoss} honor`);

      // Log to console
      if (window.renderer) {
        window.renderer.logCombatEvent(
          `Defeat! Lost ${honorLoss} honor and ${battle.territory.toLocaleString()} territory.`,
          false
        );
      }
    }

    // Update battle statistics
    this.updateBattleStats(battle);
  }

  /**
   * Update battle statistics
   */
  updateBattleStats(battle) {
    const stats = this.gameState.get("combat.battleStats") || {
      totalBattles: 0,
      victories: 0,
      defeats: 0,
      probesLost: 0,
      driftersDestroyed: 0,
    };

    stats.totalBattles++;

    if (battle.victor === "probes") {
      stats.victories++;
    } else {
      stats.defeats++;
    }

    stats.probesLost +=
      (battle.originalProbeShips - battle.probeShips) * battle.unitSize;
    stats.driftersDestroyed +=
      (battle.originalDrifterShips - battle.drifterShips) * battle.unitSize;

    this.gameState.set("combat.battleStats", stats);
  }

  /**
   * Allocate probe statistics (combat, speed, replication)
   */
  allocateProbeStats(combat, speed, replication) {
    const total = combat + speed + replication;

    if (total !== 100) {
      errorHandler.warn("Probe stat allocation must total 100%");
      return false;
    }

    this.gameState.set("combat.probeCombat", combat / 100);
    this.gameState.set("combat.probeSpeed", speed / 100);
    this.gameState.set("combat.probeReplication", replication / 100);

    errorHandler.debug(
      `Probe stats allocated: ${combat}% combat, ${speed}% speed, ${replication}% replication`,
    );

    return true;
  }

  /**
   * Enable combat mode
   */
  enableCombat() {
    this.gameState.set("combat.battleEnabled", true);
    errorHandler.info("Combat enabled");
  }

  /**
   * Disable combat mode
   */
  disableCombat() {
    this.gameState.set("combat.battleEnabled", false);
    this.battles = []; // Clear active battles
    errorHandler.info("Combat disabled");
  }

  /**
   * Get combat statistics
   */
  getStats() {
    const stats = this.gameState.get("combat.battleStats") || {};
    const honor = this.gameState.get("combat.honor");
    const probeCombat = this.gameState.get("combat.probeCombat");
    const probeSpeed = this.gameState.get("combat.probeSpeed");
    const probeReplication = this.gameState.get("combat.probeReplication");

    return {
      honor,
      activeBattles: this.battles.length,
      combatEffectiveness: this.getCombatEffectiveness(),
      probeStats: {
        combat: Math.round((probeCombat || 0) * 100),
        speed: Math.round((probeSpeed || 0) * 100),
        replication: Math.round((probeReplication || 0) * 100),
      },
      battleHistory: {
        totalBattles: stats.totalBattles || 0,
        victories: stats.victories || 0,
        defeats: stats.defeats || 0,
        winRate:
          stats.totalBattles > 0
            ? (stats.victories / stats.totalBattles) * 100
            : 0,
        probesLost: stats.probesLost || 0,
        driftersDestroyed: stats.driftersDestroyed || 0,
      },
      consecutiveWins: this.gameState.get("combat.consecutiveWins") || 0,
    };
  }

  /**
   * Get current battle status
   */
  getBattleStatus() {
    return this.battles.map((battle) => ({
      id: battle.id,
      probeShips: battle.probeShips,
      drifterShips: battle.drifterShips,
      territory: battle.territory,
      duration: battle.duration,
      victor: battle.victor,
    }));
  }

  /**
   * Calculate optimal probe stat allocation based on current situation
   */
  getOptimalAllocation() {
    const drifterCount = this.gameState.get("combat.drifterCount") || 0;
    const probeCount = this.gameState.get("space.probes.count");

    if (drifterCount === 0) {
      // No enemies: focus on replication
      return { combat: 10, speed: 10, replication: 80 };
    }

    if (drifterCount > probeCount * 2) {
      // Outnumbered: focus on combat and speed
      return { combat: 50, speed: 30, replication: 20 };
    }

    if (probeCount > drifterCount * 2) {
      // Overwhelming force: focus on replication
      return { combat: 20, speed: 20, replication: 60 };
    }

    // Balanced forces: balanced allocation
    return { combat: 35, speed: 25, replication: 40 };
  }

  /**
   * Initialize battle visualization canvas
   */
  initializeBattleVisualization(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      errorHandler.warn(
        `Canvas ${canvasId} not found for battle visualization`,
      );
      return false;
    }

    this.battleCanvas = canvas;
    this.battleContext = canvas.getContext("2d");
    this.visualizationEnabled = true;

    errorHandler.info("Battle visualization initialized");
    return true;
  }

  /**
   * Update battle visualization (placeholder for canvas implementation)
   */
  updateBattleVisualization() {
    if (!this.visualizationEnabled || !this.battleContext) {
      return;
    }

    // Clear canvas
    this.battleContext.clearRect(
      0,
      0,
      this.battleCanvas.width,
      this.battleCanvas.height,
    );

    // Draw active battles (simplified representation)
    this.battles.forEach((battle, index) => {
      const y = index * 100 + 50;

      // Draw probe forces (blue)
      this.battleContext.fillStyle = "#0066cc";
      this.battleContext.fillRect(50, y, battle.probeShips * 2, 20);

      // Draw drifter forces (red)
      this.battleContext.fillStyle = "#cc0000";
      this.battleContext.fillRect(300, y, battle.drifterShips * 2, 20);

      // Draw battle info
      this.battleContext.fillStyle = "#000000";
      this.battleContext.font = "12px Arial";
      this.battleContext.fillText(
        `Battle ${battle.id}: ${battle.probeShips} vs ${battle.drifterShips}`,
        50,
        y - 5,
      );
    });
  }

  /**
   * Main combat system update
   */
  update(timestamp, deltaTime) {
    performanceMonitor.measure(() => {
      // Check for new battles
      this.checkForBattles();

      // Update existing battles
      this.updateBattles();

      // Update visualization if enabled
      if (this.visualizationEnabled) {
        this.updateBattleVisualization();
      }
    }, "combat.update");
  }

  /**
   * Reset combat system
   */
  reset() {
    this.battles = [];
    this.battleIdCounter = 0;
    this.visualizationEnabled = false;

    errorHandler.info("Combat system reset");
  }

  /**
   * Get battle prediction for given forces
   */
  predictBattleOutcome(probeForces, drifterForces) {
    const combatEffectiveness = this.getCombatEffectiveness();
    const probeCombat = this.gameState.get("combat.probeCombat") || 1;
    const probeSpeed = this.gameState.get("combat.probeSpeed") || 1;

    // Simplified battle prediction
    const probeStrength =
      probeForces * probeCombat * combatEffectiveness * (1 + probeSpeed * 0.2);
    const drifterStrength = drifterForces * this.DRIFTER_COMBAT;

    const probeWinChance = probeStrength / (probeStrength + drifterStrength);

    return {
      probeWinChance: Math.round(probeWinChance * 100),
      drifterWinChance: Math.round((1 - probeWinChance) * 100),
      recommendation:
        probeWinChance > 0.6
          ? "engage"
          : probeWinChance > 0.4
            ? "caution"
            : "avoid",
    };
  }
}

export default CombatSystem;
