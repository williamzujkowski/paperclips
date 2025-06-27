/**
 * Combat system - handles space battles between probes and drifters
 */

import { gameState } from '../core/gameState.js';
import { memoryMonitor } from '../core/memoryMonitor.js';
import { memoryProfiler } from '../utils/memoryProfiler.js';

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
    const drifterCasualties = Math.min(Math.ceil((probeAttack * deltaTime) / 1000), this.drifters);
    const probeCasualties = Math.min(Math.ceil((drifterAttack * deltaTime) / 1000), this.probes);

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
      status: this.status,
    };
  }
}

export class CombatSystem {
  constructor() {
    this.battles = new Map();
    this.nextBattleId = 1;
    this.battleUpdateInterval = 100; // Update battles every 100ms
    this.lastBattleUpdate = 0;

    // Create object pool for Battle objects
    this.battlePool = memoryProfiler.createObjectPool(
      'Battle',
      () => new Battle(0, 0, 0), // Factory
      (battle) => {
        // Reset function
        battle.id = 0;
        battle.probes = 0;
        battle.drifters = 0;
        battle.probeLosses = 0;
        battle.drifterLosses = 0;
        battle.duration = 0;
        battle.status = 'active';
      },
      50, // Max pool size
    );
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

    // Get battle from pool instead of creating new
    const battle = this.battlePool.get();
    battle.id = battleId;
    battle.probes = probeCount;
    battle.drifters = drifterCount;
    battle.probeLosses = 0;
    battle.drifterLosses = 0;
    battle.duration = 0;
    battle.status = 'active';

    this.battles.set(battleId, battle);
    gameState.set('combat.battleID', battleId);

    // Track battle object for memory monitoring
    memoryMonitor.trackObject(`battle-${battleId}`, battle);

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

    // Remove finished battles and return to pool
    for (const id of finishedBattles) {
      const battle = this.battles.get(id);
      if (battle) {
        // Return battle to pool
        this.battlePool.release(battle);
      }
      this.battles.delete(id);
      // Untrack battle object
      memoryMonitor.untrackObject(`battle-${id}`);
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
    return Array.from(this.battles.values()).map((b) => b.getSummary());
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
      attackSpeed: gameState.get('combat.attackSpeed'),
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
export const combatSystem = new CombatSystem();
