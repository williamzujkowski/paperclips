/**
 * Tests for Production System
 */

import ProductionSystem from '../../src/game/systems/production.js';
import { GameState } from '../../src/game/core/gameState.js';

describe('ProductionSystem', () => {
  let gameState;
  let production;

  beforeEach(() => {
    gameState = new GameState();
    production = new ProductionSystem(gameState);
  });

  describe('Manual Clip Production', () => {
    test('should produce clips when wire is available', () => {
      gameState.set('resources.wire', 100);
      
      const produced = production.manualClip(5);
      
      expect(produced).toBe(5);
      expect(gameState.get('resources.clips')).toBe(5);
      expect(gameState.get('resources.unsoldClips')).toBe(5);
      expect(gameState.get('resources.unusedClips')).toBe(5);
      expect(gameState.get('resources.wire')).toBe(95);
    });

    test('should be limited by available wire', () => {
      gameState.set('resources.wire', 3);
      
      const produced = production.manualClip(5);
      
      expect(produced).toBe(3);
      expect(gameState.get('resources.clips')).toBe(3);
      expect(gameState.get('resources.wire')).toBe(0);
    });

    test('should not produce clips without wire', () => {
      gameState.set('resources.wire', 0);
      
      const produced = production.manualClip(5);
      
      expect(produced).toBe(0);
      expect(gameState.get('resources.clips')).toBe(0);
    });

    test('should stop production during endgame', () => {
      gameState.set('resources.wire', 100);
      gameState.set('endGame.dismantle', 5); // Endgame condition
      
      const produced = production.manualClip(10);
      
      expect(produced).toBe(0);
      expect(gameState.get('resources.clips')).toBe(0);
    });
  });

  describe('AutoClipper Production', () => {
    test('should produce clips based on level and boost', () => {
      gameState.set('resources.wire', 100);
      gameState.set('manufacturing.clipmakers.level', 10);
      gameState.set('production.boosts.clipper', 1.5);
      
      const produced = production.updateAutoClippers();
      
      // Rate = boost * (level / 100) = 1.5 * (10 / 100) = 0.15
      expect(produced).toBeCloseTo(0.15);
      expect(gameState.get('resources.clips')).toBeCloseTo(0.15);
    });

    test('should not produce without AutoClippers', () => {
      gameState.set('resources.wire', 100);
      gameState.set('manufacturing.clipmakers.level', 0);
      
      const produced = production.updateAutoClippers();
      
      expect(produced).toBe(0);
    });
  });

  describe('MegaClipper Production', () => {
    test('should produce clips based on level and boost', () => {
      gameState.set('resources.wire', 100);
      gameState.set('manufacturing.megaClippers.level', 2);
      gameState.set('production.boosts.megaClipper', 1.25);
      
      const produced = production.updateMegaClippers();
      
      // Rate = boost * (level * 5) = 1.25 * (2 * 5) = 12.5
      expect(produced).toBe(12.5);
      expect(gameState.get('resources.clips')).toBe(12.5);
    });
  });

  describe('Factory Production', () => {
    test('should produce clips based on level, boost, and power', () => {
      gameState.set('resources.wire', 1000000000000); // Lots of wire
      gameState.set('manufacturing.factories.level', 1);
      gameState.set('production.boosts.factory', 1.0);
      gameState.set('power.modifier', 0.5); // Half power
      
      const produced = production.updateFactories();
      
      // Rate = powMod * boost * (level * factoryRate) = 0.5 * 1.0 * (1 * 1000000000)
      expect(produced).toBe(500000000);
    });
  });

  describe('AutoClipper Purchase', () => {
    test('should purchase AutoClipper with sufficient funds', () => {
      gameState.set('resources.funds', 100);
      gameState.set('manufacturing.clipmakers.level', 0);
      
      const success = production.buyAutoClipper();
      
      expect(success).toBe(true);
      expect(gameState.get('manufacturing.clipmakers.level')).toBe(1);
      expect(gameState.get('resources.funds')).toBeCloseTo(94, 0); // 100 - 6 (initial cost) = 94
    });

    test('should not purchase without sufficient funds', () => {
      gameState.set('resources.funds', 3);
      gameState.set('manufacturing.clipmakers.level', 0);
      
      const success = production.buyAutoClipper();
      
      expect(success).toBe(false);
      expect(gameState.get('manufacturing.clipmakers.level')).toBe(0);
      expect(gameState.get('resources.funds')).toBe(3);
    });

    test('should increase cost with each purchase', () => {
      gameState.set('resources.funds', 1000);
      
      // First purchase
      production.buyAutoClipper();
      const firstCost = gameState.get('manufacturing.clipmakers.cost');
      
      // Second purchase
      production.buyAutoClipper();
      const secondCost = gameState.get('manufacturing.clipmakers.cost');
      
      expect(secondCost).toBeGreaterThan(firstCost);
    });
  });

  describe('Cost Calculations', () => {
    test('should calculate AutoClipper cost correctly', () => {
      const cost0 = production.calculateAutoClipperCost(0);
      const cost1 = production.calculateAutoClipperCost(1);
      const cost5 = production.calculateAutoClipperCost(5);
      
      expect(cost0).toBe(6); // Math.pow(1.1, 0) + 5 = 1 + 5 = 6
      expect(cost1).toBeCloseTo(6.1); // Math.pow(1.1, 1) + 5 = 1.1 + 5 = 6.1
      expect(cost5).toBeCloseTo(6.61051); // Math.pow(1.1, 5) + 5
    });

    test('should calculate MegaClipper cost correctly', () => {
      const cost0 = production.calculateMegaClipperCost(0);
      const cost1 = production.calculateMegaClipperCost(1);
      
      expect(cost0).toBe(500); // Math.pow(1.2, 0) * 500 = 500
      expect(cost1).toBe(600); // Math.pow(1.2, 1) * 500 = 600
    });

    test('should calculate Factory cost with complex formula', () => {
      const cost0 = production.calculateFactoryCost(0);
      const cost1 = production.calculateFactoryCost(1);
      const cost2 = production.calculateFactoryCost(2);
      
      expect(cost0).toBe(100000000); // Base cost
      expect(cost1).toBeGreaterThan(cost0);
      expect(cost2).toBeGreaterThan(cost1);
    });
  });

  describe('Production Tracking', () => {
    test('should track production rate', () => {
      gameState.set('resources.wire', 1000);
      
      // Produce some clips
      production.trackProduction(10);
      production.trackProduction(15);
      production.trackProduction(5);
      
      const rate = gameState.get('production.clipRate');
      expect(rate).toBe(10); // Average of [10, 15, 5] = 10
    });

    test('should limit tracker size', () => {
      gameState.set('resources.wire', 1000);
      
      // Add more than max tracker size
      for (let i = 0; i < 150; i++) {
        production.trackProduction(1);
      }
      
      expect(production.clipRateTracker.length).toBeLessThanOrEqual(production.maxTrackerSize);
    });
  });

  describe('Production Statistics', () => {
    test('should calculate production rates', () => {
      gameState.set('manufacturing.clipmakers.level', 10);
      gameState.set('manufacturing.megaClippers.level', 2);
      gameState.set('manufacturing.factories.level', 1);
      gameState.set('production.boosts.clipper', 1.5);
      gameState.set('production.boosts.megaClipper', 1.25);
      gameState.set('production.boosts.factory', 1.0);
      gameState.set('power.modifier', 0.8);
      
      const rates = production.getProductionRates();
      
      expect(rates.autoClippers).toBeCloseTo(0.15); // 1.5 * (10 / 100)
      expect(rates.megaClippers).toBe(12.5); // 1.25 * (2 * 5)
      expect(rates.factories).toBe(800000000); // 0.8 * 1.0 * (1 * 1000000000)
    });

    test('should calculate wire efficiency', () => {
      gameState.set('resources.clips', 500);
      gameState.set('resources.wire', 500); // Started with 1000, used 500
      
      const efficiency = production.calculateWireEfficiency();
      
      expect(efficiency).toBe(1); // 500 clips / 500 wire used = 1
    });
  });

  describe('Production Conditions', () => {
    test('should check if production is possible', () => {
      gameState.set('resources.wire', 100);
      gameState.set('endGame.dismantle', 0);
      
      expect(production.canProduce()).toBe(true);
    });

    test('should prevent production without wire', () => {
      gameState.set('resources.wire', 0);
      gameState.set('endGame.dismantle', 0);
      
      expect(production.canProduce()).toBe(false);
    });

    test('should prevent production during endgame', () => {
      gameState.set('resources.wire', 100);
      gameState.set('endGame.dismantle', 5);
      
      expect(production.canProduce()).toBe(false);
    });
  });

  describe('Time Estimation', () => {
    test('should estimate production time', () => {
      gameState.set('production.clipRate', 100); // 100 clips per second
      
      const timeFor1000 = production.estimateProductionTime(1000);
      
      expect(timeFor1000).toBe(10); // 1000 / 100 = 10 seconds
    });

    test('should return infinity for zero rate', () => {
      gameState.set('production.clipRate', 0);
      
      const time = production.estimateProductionTime(1000);
      
      expect(time).toBe(Infinity);
    });
  });

  describe('System Update', () => {
    test('should update all production systems', () => {
      gameState.set('resources.wire', 10000);
      gameState.set('manufacturing.clipmakers.level', 5);
      gameState.set('manufacturing.megaClippers.level', 1);
      
      const initialClips = gameState.get('resources.clips');
      
      production.update();
      
      const finalClips = gameState.get('resources.clips');
      expect(finalClips).toBeGreaterThan(initialClips);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset production system', () => {
      production.trackProduction(100);
      production.lastClipCount = 500;
      
      production.reset();
      
      expect(production.clipRateTracker).toEqual([]);
      expect(production.lastClipCount).toBe(0);
    });
  });
});