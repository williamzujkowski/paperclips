/**
 * Tests for Computing System
 */

import { ComputingSystem } from '../../src/game/systems/computing.js';
import { gameState } from '../../src/game/core/gameState.js';

describe('ComputingSystem', () => {
  let computingSystem;

  beforeEach(() => {
    computingSystem = new ComputingSystem();
    gameState.reset();
  });

  describe('generateOperations', () => {
    it('should generate operations based on processors and memory', () => {
      gameState.set('computing.processors', 2);
      gameState.set('computing.memory', 3);
      gameState.set('computing.operations', 0);

      computingSystem.generateOperations(1000); // 1 second

      // 2 processors * 3 memory = 6 ops/second
      expect(gameState.get('computing.operations')).toBe(6);
    });

    it('should respect max operations limit', () => {
      gameState.set('computing.processors', 10);
      gameState.set('computing.memory', 2);
      gameState.set('computing.operations', 1999);

      computingSystem.generateOperations(1000);

      // Max ops = memory * 1000 = 2000
      expect(gameState.get('computing.operations')).toBe(2000);
    });
  });

  describe('addProcessor', () => {
    it('should add processor when trust allows', () => {
      gameState.set('computing.trust', 5);
      gameState.set('computing.processors', 2);
      gameState.set('computing.memory', 2);

      const result = computingSystem.addProcessor();

      expect(result).toBe(true);
      expect(gameState.get('computing.processors')).toBe(3);
    });

    it('should not add processor when at trust limit', () => {
      gameState.set('computing.trust', 4);
      gameState.set('computing.processors', 2);
      gameState.set('computing.memory', 2);

      const result = computingSystem.addProcessor();

      expect(result).toBe(false);
      expect(gameState.get('computing.processors')).toBe(2);
    });
  });

  describe('addMemory', () => {
    it('should add memory when trust allows', () => {
      gameState.set('computing.trust', 5);
      gameState.set('computing.processors', 2);
      gameState.set('computing.memory', 2);

      const result = computingSystem.addMemory();

      expect(result).toBe(true);
      expect(gameState.get('computing.memory')).toBe(3);
    });
  });

  describe('spendOperations', () => {
    it('should spend operations when available', () => {
      gameState.set('computing.operations', 1000);

      const result = computingSystem.spendOperations(500);

      expect(result).toBe(true);
      expect(gameState.get('computing.operations')).toBe(500);
    });

    it('should not spend when insufficient operations', () => {
      gameState.set('computing.operations', 100);

      const result = computingSystem.spendOperations(500);

      expect(result).toBe(false);
      expect(gameState.get('computing.operations')).toBe(100);
    });
  });

  describe('generateCreativity', () => {
    it('should generate creativity when enabled', () => {
      gameState.set('computing.processors', 5);
      gameState.set('flags.creativity', true);
      gameState.set('computing.creativity', 0);
      gameState.set('computing.creativitySpeed', 0.01);

      computingSystem.generateCreativity(1000);

      // 5 processors * 0.01 speed * 1 second = 0.05
      expect(gameState.get('computing.creativity')).toBeCloseTo(0.05);
    });

    it('should not generate creativity when disabled', () => {
      gameState.set('computing.processors', 5);
      gameState.set('flags.creativity', false);
      gameState.set('computing.creativity', 0);

      computingSystem.generateCreativity(1000);

      expect(gameState.get('computing.creativity')).toBe(0);
    });
  });

  describe('quantum computing', () => {
    it('should start quantum compute when operations available', () => {
      gameState.set('computing.operations', 15000);
      gameState.set('computing.qChipCost', 10000);

      const result = computingSystem.startQuantumCompute();

      expect(result).toBe(true);
      expect(gameState.get('computing.operations')).toBe(5000);
      expect(gameState.get('computing.nextQchip')).toBeGreaterThan(0);
    });

    it('should increase cost after quantum compute', () => {
      gameState.set('computing.operations', 15000);
      gameState.set('computing.qChipCost', 10000);

      computingSystem.startQuantumCompute();

      expect(gameState.get('computing.qChipCost')).toBe(15000);
    });
  });
});