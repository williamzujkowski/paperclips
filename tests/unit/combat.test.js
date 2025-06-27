/**
 * Tests for Combat System
 */

import { CombatSystem } from '../../src/game/systems/combat.js';
import { gameState } from '../../src/game/core/gameState.js';

describe('CombatSystem', () => {
  let combatSystem;

  beforeEach(() => {
    combatSystem = new CombatSystem();
    gameState.reset();
    gameState.set('flags.battle', true);
  });

  describe('startBattle', () => {
    it('should start a new battle', () => {
      const battleId = combatSystem.startBattle(50, 30);

      expect(battleId).toBe(1);
      expect(combatSystem.battles.size).toBe(1);
      expect(gameState.get('combat.battleID')).toBe(1);
    });

    it('should respect max battles limit', () => {
      gameState.set('combat.maxBattles', 2);

      combatSystem.startBattle(50, 30);
      combatSystem.startBattle(40, 20);
      const third = combatSystem.startBattle(30, 10);

      expect(combatSystem.battles.size).toBe(2);
      expect(third).toBeNull();
    });
  });

  describe('battle updates', () => {
    it('should process battle combat', () => {
      gameState.set('combat.probeCombat', 2);
      gameState.set('combat.drifterCombat', 1);
      gameState.set('combat.attackSpeed', 1);

      combatSystem.startBattle(100, 50);
      combatSystem.updateBattles(1000); // 1 second

      const battles = combatSystem.getActiveBattles();
      expect(battles[0].drifters).toBeLessThan(50);
      expect(battles[0].probes).toBeLessThan(100);
    });

    it('should end battle when one side is defeated', () => {
      gameState.set('combat.probeCombat', 10);
      gameState.set('combat.drifterCombat', 1);
      gameState.set('combat.attackSpeed', 10);

      combatSystem.startBattle(100, 10);
      combatSystem.updateBattles(2000); // 2 seconds

      const battles = combatSystem.getActiveBattles();
      expect(battles[0].status).toBe('victory');
    });
  });

  describe('battle results', () => {
    it('should award honor for victories', () => {
      gameState.set('combat.honor', 0);
      gameState.set('combat.probeCombat', 100);
      gameState.set('combat.drifterCombat', 1);

      combatSystem.startBattle(100, 50);
      
      // Force quick victory
      for (let i = 0; i < 50; i++) {
        combatSystem.updateBattles(100);
      }
      combatSystem.cleanupBattles();

      expect(gameState.get('combat.honor')).toBeGreaterThan(0);
      expect(gameState.get('combat.driftersKilled')).toBeGreaterThan(0);
    });

    it('should give bonus honor for flawless victory', () => {
      gameState.set('combat.honor', 0);
      gameState.set('combat.bonusHonor', 0);
      
      // Create a battle that ends immediately with no probe losses
      const battle = combatSystem.battles.get(
        combatSystem.startBattle(100, 0)
      );
      battle.status = 'victory';
      battle.drifterLosses = 10;
      battle.probeLosses = 0;

      combatSystem.cleanupBattles();

      expect(gameState.get('combat.bonusHonor')).toBe(1);
    });
  });

  describe('spendHonor', () => {
    it('should spend honor when available', () => {
      gameState.set('combat.honor', 50);

      const result = combatSystem.spendHonor(30);

      expect(result).toBe(true);
      expect(gameState.get('combat.honor')).toBe(20);
    });

    it('should not spend when insufficient honor', () => {
      gameState.set('combat.honor', 10);

      const result = combatSystem.spendHonor(30);

      expect(result).toBe(false);
      expect(gameState.get('combat.honor')).toBe(10);
    });
  });

  describe('combat upgrades', () => {
    it('should upgrade probe combat', () => {
      gameState.set('combat.probeCombat', 5);

      combatSystem.upgradeProbes(3);

      expect(gameState.get('combat.probeCombat')).toBe(8);
    });

    it('should set attack speed', () => {
      combatSystem.setAttackSpeed(2.5);

      expect(gameState.get('combat.attackSpeed')).toBe(2.5);
    });

    it('should set max battles', () => {
      combatSystem.setMaxBattles(5);

      expect(gameState.get('combat.maxBattles')).toBe(5);
    });
  });
});