/**
 * Tests for Combat System
 */

import CombatSystem from '../../src/game/systems/combat.js';
import { GameState } from '../../src/game/core/gameState.js';

describe('CombatSystem', () => {
  let gameState;
  let combat;

  beforeEach(() => {
    gameState = new GameState();
    combat = new CombatSystem(gameState);
  });

  describe('System Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(combat.COMBAT_BASE_RATE).toBe(0.15);
      expect(combat.DRIFTER_COMBAT).toBe(1.75);
      expect(combat.BATTLE_SPEED).toBe(0.2);
      expect(combat.DEATH_THRESHOLD).toBe(0.5);
      expect(combat.WAR_TRIGGER).toBe(1000000);
      expect(combat.MAX_BATTLES).toBe(1);
      expect(combat.battles).toEqual([]);
      expect(combat.battleIdCounter).toBe(0);
      expect(combat.visualizationEnabled).toBe(false);
    });
  });

  describe('Battle Creation and Management', () => {
    test('should create battle when conditions are met', () => {
      gameState.set('space.probes.count', 10000);
      gameState.set('combat.drifterCount', 2000000);
      gameState.set('combat.battleEnabled', true);
      
      // Mock Math.random to ensure battle creation
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.3); // 30% < 50% threshold
      
      combat.checkForBattles();
      
      expect(combat.battles.length).toBe(1);
      const battle = combat.battles[0];
      expect(battle.id).toBe(0);
      expect(battle.active).toBe(true);
      expect(battle.victor).toBe(null);
      
      Math.random = originalRandom;
    });

    test('should not create battle without probes', () => {
      gameState.set('space.probes.count', 0);
      gameState.set('combat.drifterCount', 2000000);
      gameState.set('combat.battleEnabled', true);
      
      combat.checkForBattles();
      
      expect(combat.battles.length).toBe(0);
    });

    test('should not create battle when combat is disabled', () => {
      gameState.set('space.probes.count', 10000);
      gameState.set('combat.drifterCount', 2000000);
      gameState.set('combat.battleEnabled', false);
      
      combat.checkForBattles();
      
      expect(combat.battles.length).toBe(0);
    });

    test('should not create battle below war trigger threshold', () => {
      gameState.set('space.probes.count', 10000);
      gameState.set('combat.drifterCount', 500000); // Below WAR_TRIGGER
      gameState.set('combat.battleEnabled', true);
      
      combat.checkForBattles();
      
      expect(combat.battles.length).toBe(0);
    });

    test('should respect MAX_BATTLES limit', () => {
      gameState.set('space.probes.count', 10000);
      gameState.set('combat.drifterCount', 2000000);
      gameState.set('combat.battleEnabled', true);
      
      // Create first battle
      combat.createBattle();
      expect(combat.battles.length).toBe(1);
      
      // Try to create more battles
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1); // Always pass random check
      
      combat.checkForBattles();
      
      // Should still have only 1 battle due to MAX_BATTLES
      expect(combat.battles.length).toBe(1);
      
      Math.random = originalRandom;
    });
  });

  describe('Battle Force Calculations', () => {
    test('should calculate unit size correctly when drifters outnumber probes', () => {
      const unitSize = combat.calculateUnitSize(5000, 10000);
      expect(unitSize).toBe(50); // 5000 / 100
    });

    test('should calculate unit size correctly when probes outnumber drifters', () => {
      const unitSize = combat.calculateUnitSize(20000, 8000);
      expect(unitSize).toBe(80); // 8000 / 100
    });

    test('should have minimum unit size of 1', () => {
      const unitSize = combat.calculateUnitSize(50, 30);
      expect(unitSize).toBe(1); // Min value
    });

    test('should cap battle forces at 200', () => {
      gameState.set('space.probes.count', 50000);
      gameState.set('combat.drifterCount', 50000);
      
      const battle = combat.createBattle();
      
      expect(battle.probeShips).toBeLessThanOrEqual(200);
      expect(battle.drifterShips).toBeLessThanOrEqual(200);
    });
  });

  describe('Combat Resolution', () => {
    test('should resolve combat with drifter casualties', () => {
      gameState.set('space.probes.count', 10000);
      gameState.set('combat.drifterCount', 10000);
      gameState.set('combat.probeCombat', 0.5);
      gameState.set('combat.probeSpeed', 0.3);
      
      const battle = combat.createBattle();
      const initialDrifters = battle.drifterShips;
      
      // Mock random to ensure probes attack
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1); // < BATTLE_SPEED, so probes attack
      
      combat.resolveCombat(battle);
      
      expect(battle.drifterShips).toBeLessThan(initialDrifters);
      expect(gameState.get('combat.drifterCount')).toBeLessThan(10000);
      
      Math.random = originalRandom;
    });

    test('should resolve combat with probe casualties', () => {
      gameState.set('space.probes.count', 10000);
      gameState.set('combat.drifterCount', 10000);
      
      const battle = combat.createBattle();
      const initialProbes = battle.probeShips;
      
      // Mock random to ensure drifters attack
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.9); // > BATTLE_SPEED, so drifters attack
      
      combat.resolveCombat(battle);
      
      expect(battle.probeShips).toBeLessThan(initialProbes);
      expect(gameState.get('space.probes.count')).toBeLessThan(10000);
      
      Math.random = originalRandom;
    });
  });

  describe('Battle Tick Processing', () => {
    test('should process battle tick and update duration', () => {
      const battle = combat.createBattle();
      battle.duration = 0;
      
      combat.processBattleTick(battle);
      
      expect(battle.duration).toBe(1);
    });

    test('should declare probes as victor when drifters reach 0', () => {
      const battle = combat.createBattle();
      battle.drifterShips = 0;
      battle.probeShips = 10; // Ensure probes are still alive
      
      combat.processBattleTick(battle);
      
      expect(battle.victor).toBe('probes');
      expect(battle.active).toBe(false);
    });

    test('should declare drifters as victor when probes reach 0', () => {
      const battle = combat.createBattle();
      battle.probeShips = 0;
      battle.drifterShips = 10; // Ensure drifters are still alive
      
      combat.processBattleTick(battle);
      
      expect(battle.victor).toBe('drifters');
      expect(battle.active).toBe(false);
    });
  });

  describe('Combat Effectiveness', () => {
    test('should calculate base combat effectiveness', () => {
      const effectiveness = combat.getCombatEffectiveness();
      expect(effectiveness).toBe(1.0);
    });

    test('should double effectiveness with nameBattles project', () => {
      gameState.set('projects.nameBattles.completed', true);
      
      const effectiveness = combat.getCombatEffectiveness();
      expect(effectiveness).toBe(2.0);
    });

    test('should add 10% bonus with attack speed flag', () => {
      gameState.set('combat.attackSpeedFlag', true);
      
      const effectiveness = combat.getCombatEffectiveness();
      expect(effectiveness).toBeCloseTo(1.1);
    });

    test('should stack bonuses multiplicatively', () => {
      gameState.set('projects.nameBattles.completed', true);
      gameState.set('combat.attackSpeedFlag', true);
      
      const effectiveness = combat.getCombatEffectiveness();
      expect(effectiveness).toBeCloseTo(2.2); // 2.0 * 1.1
    });
  });

  describe('Battle Outcomes and Honor', () => {
    test('should gain honor on victory', () => {
      gameState.set('combat.honor', 100);
      const initialMatter = gameState.get('space.matter.available');
      
      const battle = {
        victor: 'probes',
        originalDrifterShips: 50,
        originalProbeShips: 60,
        probeShips: 40,
        drifterShips: 0,
        unitSize: 10,
        territory: 5000
      };
      
      combat.handleBattleOutcome(battle);
      
      expect(gameState.get('combat.honor')).toBe(150); // 100 + 50
      expect(gameState.get('space.matter.available')).toBe(initialMatter + 5000);
    });

    test('should gain bonus honor with Glory project', () => {
      gameState.set('combat.honor', 100);
      gameState.set('projects.glory.completed', true);
      gameState.set('combat.consecutiveWins', 2);
      
      const battle = {
        victor: 'probes',
        originalDrifterShips: 50,
        originalProbeShips: 60,
        probeShips: 40,
        drifterShips: 0,
        unitSize: 10,
        territory: 5000
      };
      
      combat.handleBattleOutcome(battle);
      
      // Base honor: 50 + consecutive wins bonus: 2 * 10 = 20
      expect(gameState.get('combat.honor')).toBe(170); // 100 + 50 + 20
      expect(gameState.get('combat.consecutiveWins')).toBe(3);
    });

    test('should lose honor on defeat', () => {
      gameState.set('combat.honor', 200);
      gameState.set('space.matter.available', 10000);
      gameState.set('combat.consecutiveWins', 5);
      
      const battle = {
        victor: 'drifters',
        originalDrifterShips: 50,
        originalProbeShips: 60,
        probeShips: 0,
        drifterShips: 30,
        unitSize: 10,
        territory: 5000
      };
      
      combat.handleBattleOutcome(battle);
      
      expect(gameState.get('combat.honor')).toBe(140); // 200 - 60
      expect(gameState.get('space.matter.available')).toBe(5000); // 10000 - 5000
      expect(gameState.get('combat.consecutiveWins')).toBe(0); // Reset
    });

    test('should not let honor go below 0', () => {
      gameState.set('combat.honor', 20);
      
      const battle = {
        victor: 'drifters',
        originalProbeShips: 100,
        probeShips: 0,
        territory: 1000
      };
      
      combat.handleBattleOutcome(battle);
      
      expect(gameState.get('combat.honor')).toBe(0);
    });
  });

  describe('Battle Statistics', () => {
    test('should track battle statistics correctly', () => {
      const battle = {
        victor: 'probes',
        originalProbeShips: 100,
        probeShips: 80,
        originalDrifterShips: 100,
        drifterShips: 0,
        unitSize: 10
      };
      
      combat.updateBattleStats(battle);
      
      const stats = gameState.get('combat.battleStats');
      expect(stats.totalBattles).toBe(1);
      expect(stats.victories).toBe(1);
      expect(stats.defeats).toBe(0);
      expect(stats.probesLost).toBe(200); // (100-80) * 10
      expect(stats.driftersDestroyed).toBe(1000); // (100-0) * 10
    });

    test('should accumulate statistics over multiple battles', () => {
      // First battle - victory
      combat.updateBattleStats({
        victor: 'probes',
        originalProbeShips: 100,
        probeShips: 90,
        originalDrifterShips: 50,
        drifterShips: 0,
        unitSize: 5
      });
      
      // Second battle - defeat
      combat.updateBattleStats({
        victor: 'drifters',
        originalProbeShips: 80,
        probeShips: 0,
        originalDrifterShips: 100,
        drifterShips: 70,
        unitSize: 10
      });
      
      const stats = gameState.get('combat.battleStats');
      expect(stats.totalBattles).toBe(2);
      expect(stats.victories).toBe(1);
      expect(stats.defeats).toBe(1);
      expect(stats.probesLost).toBe(850); // (10*5) + (80*10)
      expect(stats.driftersDestroyed).toBe(550); // (50*5) + (30*10)
    });
  });

  describe('Probe Allocation', () => {
    test('should allocate probe stats correctly', () => {
      const success = combat.allocateProbeStats(40, 30, 30);
      
      expect(success).toBe(true);
      expect(gameState.get('combat.probeCombat')).toBe(0.4);
      expect(gameState.get('combat.probeSpeed')).toBe(0.3);
      expect(gameState.get('combat.probeReplication')).toBe(0.3);
    });

    test('should reject allocation not totaling 100%', () => {
      const success = combat.allocateProbeStats(40, 30, 20);
      
      expect(success).toBe(false);
      // Values should not be updated
      expect(gameState.get('combat.probeCombat')).toBeUndefined();
    });

    test('should reject allocation over 100%', () => {
      const success = combat.allocateProbeStats(50, 40, 30);
      
      expect(success).toBe(false);
    });
  });

  describe('Combat Enable/Disable', () => {
    test('should enable combat mode', () => {
      combat.enableCombat();
      
      expect(gameState.get('combat.battleEnabled')).toBe(true);
    });

    test('should disable combat and clear battles', () => {
      // Create a battle first
      combat.battles.push({
        id: 1,
        active: true
      });
      
      combat.disableCombat();
      
      expect(gameState.get('combat.battleEnabled')).toBe(false);
      expect(combat.battles).toEqual([]);
    });
  });

  describe('Combat Statistics and Status', () => {
    test('should return comprehensive stats', () => {
      gameState.set('combat.honor', 500);
      gameState.set('combat.probeCombat', 0.4);
      gameState.set('combat.probeSpeed', 0.3);
      gameState.set('combat.probeReplication', 0.3);
      gameState.set('combat.battleStats', {
        totalBattles: 10,
        victories: 7,
        defeats: 3,
        probesLost: 1000,
        driftersDestroyed: 2000
      });
      gameState.set('combat.consecutiveWins', 3);
      
      // Add an active battle
      combat.battles.push({ id: 1, active: true });
      
      const stats = combat.getStats();
      
      expect(stats.honor).toBe(500);
      expect(stats.activeBattles).toBe(1);
      expect(stats.combatEffectiveness).toBe(1.0);
      expect(stats.probeStats.combat).toBe(40);
      expect(stats.probeStats.speed).toBe(30);
      expect(stats.probeStats.replication).toBe(30);
      expect(stats.battleHistory.totalBattles).toBe(10);
      expect(stats.battleHistory.victories).toBe(7);
      expect(stats.battleHistory.defeats).toBe(3);
      expect(stats.battleHistory.winRate).toBe(70);
      expect(stats.battleHistory.probesLost).toBe(1000);
      expect(stats.battleHistory.driftersDestroyed).toBe(2000);
      expect(stats.consecutiveWins).toBe(3);
    });

    test('should handle empty battle stats', () => {
      const stats = combat.getStats();
      
      expect(stats.battleHistory.totalBattles).toBe(0);
      expect(stats.battleHistory.winRate).toBe(0);
    });

    test('should return battle status', () => {
      combat.battles = [
        {
          id: 1,
          probeShips: 80,
          drifterShips: 60,
          territory: 10000,
          duration: 5,
          victor: null
        },
        {
          id: 2,
          probeShips: 0,
          drifterShips: 20,
          territory: 5000,
          duration: 10,
          victor: 'drifters'
        }
      ];
      
      const status = combat.getBattleStatus();
      
      expect(status.length).toBe(2);
      expect(status[0].id).toBe(1);
      expect(status[0].probeShips).toBe(80);
      expect(status[0].victor).toBe(null);
      expect(status[1].victor).toBe('drifters');
    });
  });

  describe('Optimal Allocation', () => {
    test('should recommend replication focus when no enemies', () => {
      gameState.set('combat.drifterCount', 0);
      gameState.set('space.probes.count', 1000);
      
      const allocation = combat.getOptimalAllocation();
      
      expect(allocation.combat).toBe(10);
      expect(allocation.speed).toBe(10);
      expect(allocation.replication).toBe(80);
    });

    test('should recommend combat focus when outnumbered', () => {
      gameState.set('combat.drifterCount', 10000);
      gameState.set('space.probes.count', 2000);
      
      const allocation = combat.getOptimalAllocation();
      
      expect(allocation.combat).toBe(50);
      expect(allocation.speed).toBe(30);
      expect(allocation.replication).toBe(20);
    });

    test('should recommend replication when overwhelming', () => {
      gameState.set('combat.drifterCount', 1000);
      gameState.set('space.probes.count', 5000);
      
      const allocation = combat.getOptimalAllocation();
      
      expect(allocation.combat).toBe(20);
      expect(allocation.speed).toBe(20);
      expect(allocation.replication).toBe(60);
    });

    test('should recommend balanced allocation for even forces', () => {
      gameState.set('combat.drifterCount', 5000);
      gameState.set('space.probes.count', 4000);
      
      const allocation = combat.getOptimalAllocation();
      
      expect(allocation.combat).toBe(35);
      expect(allocation.speed).toBe(25);
      expect(allocation.replication).toBe(40);
    });
  });

  describe('Battle Prediction', () => {
    test('should predict battle outcome', () => {
      gameState.set('combat.probeCombat', 0.5);
      gameState.set('combat.probeSpeed', 0.3);
      
      const prediction = combat.predictBattleOutcome(100, 100);
      
      expect(prediction.probeWinChance).toBeDefined();
      expect(prediction.drifterWinChance).toBeDefined();
      expect(prediction.probeWinChance + prediction.drifterWinChance).toBe(100);
      expect(prediction.recommendation).toBeDefined();
    });

    test('should recommend engage when high win chance', () => {
      gameState.set('combat.probeCombat', 1.0);
      gameState.set('combat.probeSpeed', 0.5);
      
      const prediction = combat.predictBattleOutcome(200, 50);
      
      expect(prediction.recommendation).toBe('engage');
      expect(prediction.probeWinChance).toBeGreaterThan(60);
    });

    test('should recommend avoid when low win chance', () => {
      gameState.set('combat.probeCombat', 0.1);
      gameState.set('combat.probeSpeed', 0.1);
      
      const prediction = combat.predictBattleOutcome(50, 200);
      
      expect(prediction.recommendation).toBe('avoid');
      expect(prediction.probeWinChance).toBeLessThan(40);
    });
  });

  describe('Battle Visualization', () => {
    test('should initialize visualization with valid canvas', () => {
      // Mock DOM elements
      const mockCanvas = {
        getContext: jest.fn(() => ({}))
      };
      document.getElementById = jest.fn(() => mockCanvas);
      
      const success = combat.initializeBattleVisualization('battleCanvas');
      
      expect(success).toBe(true);
      expect(combat.visualizationEnabled).toBe(true);
      expect(combat.battleCanvas).toBe(mockCanvas);
      expect(combat.battleContext).toBeDefined();
    });

    test('should handle missing canvas gracefully', () => {
      document.getElementById = jest.fn(() => null);
      
      const success = combat.initializeBattleVisualization('missingCanvas');
      
      expect(success).toBe(false);
      expect(combat.visualizationEnabled).toBe(false);
    });
  });

  describe('System Update', () => {
    test('should check for battles and update existing ones', () => {
      gameState.set('space.probes.count', 10000);
      gameState.set('combat.drifterCount', 2000000);
      gameState.set('combat.battleEnabled', true);
      
      // Create a battle
      const battle = combat.createBattle();
      
      // Mock random for predictable behavior
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.7) // No new battle
        .mockReturnValueOnce(0.3); // Process combat tick
      
      combat.update(Date.now(), 16);
      
      expect(battle.duration).toBeGreaterThan(0);
      
      Math.random = originalRandom;
    });

    test('should remove completed battles', () => {
      // Create a battle that will end
      const battle = combat.createBattle();
      battle.probeShips = 0;
      battle.victor = 'drifters';
      battle.active = false;
      
      combat.update(Date.now(), 16);
      
      expect(combat.battles.length).toBe(0);
    });
  });

  describe('System Reset', () => {
    test('should reset combat system completely', () => {
      // Set up some state
      combat.battles = [{ id: 1 }, { id: 2 }];
      combat.battleIdCounter = 5;
      combat.visualizationEnabled = true;
      
      combat.reset();
      
      expect(combat.battles).toEqual([]);
      expect(combat.battleIdCounter).toBe(0);
      expect(combat.visualizationEnabled).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle battles with zero unit size', () => {
      gameState.set('space.probes.count', 10);
      gameState.set('combat.drifterCount', 5);
      
      const battle = combat.createBattle();
      
      expect(battle.unitSize).toBe(1); // Minimum value
    });

    test('should handle large casualty calculations correctly', () => {
      gameState.set('space.probes.count', 10000);
      gameState.set('combat.drifterCount', 10000);
      
      const battle = {
        probeShips: 50,
        drifterShips: 100,
        unitSize: 10
      };
      
      // Mock to ensure drifters attack
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.9);
      
      const initialProbeCount = gameState.get('space.probes.count');
      const initialBattleProbes = battle.probeShips;
      
      combat.resolveCombat(battle);
      
      // Check that casualties were applied to battle
      expect(battle.probeShips).toBeLessThan(initialBattleProbes);
      expect(battle.probeShips).toBeGreaterThanOrEqual(0);
      
      // Check that global probe count was reduced
      const finalProbeCount = gameState.get('space.probes.count');
      expect(finalProbeCount).toBeLessThan(initialProbeCount);
      
      // Calculate expected casualties based on formula
      // casualties = battle.drifterShips * DRIFTER_COMBAT * (1 - BATTLE_SPEED)
      // casualties = 100 * 1.75 * (1 - 0.2) = 100 * 1.75 * 0.8 = 140
      const expectedCasualties = Math.floor(100 * 1.75 * 0.8);
      const globalCasualties = expectedCasualties * battle.unitSize;
      
      expect(initialProbeCount - finalProbeCount).toBe(globalCasualties);
      
      Math.random = originalRandom;
    });

    test('should handle undefined combat stats gracefully', () => {
      // Don't set any combat stats
      const stats = combat.getStats();
      
      expect(stats.probeStats.combat).toBe(0);
      expect(stats.probeStats.speed).toBe(0);
      expect(stats.probeStats.replication).toBe(0);
    });

    test('should calculate effectiveness without any upgrades', () => {
      // Ensure no projects or flags are set
      gameState.set('projects.nameBattles.completed', false);
      gameState.set('combat.attackSpeedFlag', false);
      
      const effectiveness = combat.getCombatEffectiveness();
      
      expect(effectiveness).toBe(1.0);
    });
  });
});