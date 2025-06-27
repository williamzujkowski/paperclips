/**
 * Tests for Production System
 */

import { ProductionSystem } from '../../src/game/systems/production.js';
import { gameState } from '../../src/game/core/gameState.js';

describe('ProductionSystem', () => {
  let productionSystem;

  beforeEach(() => {
    productionSystem = new ProductionSystem();
    gameState.reset();
  });

  describe('makeClip', () => {
    it('should make a clip when wire is available', () => {
      gameState.set('resources.wire', 10);
      
      const result = productionSystem.makeClip();
      
      expect(result).toBe(true);
      expect(gameState.get('resources.clips')).toBe(1);
      expect(gameState.get('resources.unusedClips')).toBe(1);
      expect(gameState.get('resources.wire')).toBe(9);
    });

    it('should not make a clip when no wire available', () => {
      gameState.set('resources.wire', 0);
      
      const result = productionSystem.makeClip();
      
      expect(result).toBe(false);
      expect(gameState.get('resources.clips')).toBe(0);
    });

    it('should track manual clips', () => {
      gameState.set('resources.wire', 5);
      
      productionSystem.makeClip();
      productionSystem.makeClip();
      
      expect(gameState.get('meta.manualClips')).toBe(2);
    });
  });

  describe('buyAutoClipper', () => {
    it('should buy auto-clipper when funds available', () => {
      gameState.set('resources.funds', 100);
      gameState.set('market.clipperCost', 5);
      
      const result = productionSystem.buyAutoClipper();
      
      expect(result).toBe(true);
      expect(gameState.get('resources.funds')).toBe(95);
      expect(gameState.get('production.clipmakerLevel')).toBe(1);
      expect(gameState.get('market.clipperCost')).toBe(6); // 5 * 1.1 rounded up
    });

    it('should not buy when insufficient funds', () => {
      gameState.set('resources.funds', 4);
      gameState.set('market.clipperCost', 5);
      
      const result = productionSystem.buyAutoClipper();
      
      expect(result).toBe(false);
      expect(gameState.get('production.clipmakerLevel')).toBe(0);
    });

    it('should update clip rate after purchase', () => {
      gameState.set('resources.funds', 100);
      gameState.set('market.clipperCost', 5);
      
      productionSystem.buyAutoClipper();
      
      expect(gameState.get('production.clipRate')).toBeGreaterThan(0);
    });
  });

  describe('buyMegaClipper', () => {
    it('should buy mega-clipper when funds available', () => {
      gameState.set('resources.funds', 1000);
      gameState.set('market.megaClipperCost', 500);
      
      const result = productionSystem.buyMegaClipper();
      
      expect(result).toBe(true);
      expect(gameState.get('resources.funds')).toBe(500);
      expect(gameState.get('production.megaClipperLevel')).toBe(1);
      expect(gameState.get('market.megaClipperCost')).toBe(560); // 500 * 1.12
    });
  });

  describe('updateClipRate', () => {
    it('should calculate correct clip rate', () => {
      gameState.set('production.clipmakerLevel', 5);
      gameState.set('production.clipperBoost', 2);
      gameState.set('production.megaClipperLevel', 1);
      gameState.set('production.megaClipperBoost', 1);
      
      productionSystem.updateClipRate();
      
      // 5 clippers * 2 boost + 1 megaclipper * 1 boost * 500
      expect(gameState.get('production.clipRate')).toBe(510);
    });

    it('should handle zero production', () => {
      gameState.set('production.clipmakerLevel', 0);
      gameState.set('production.megaClipperLevel', 0);
      
      productionSystem.updateClipRate();
      
      expect(gameState.get('production.clipRate')).toBe(0);
    });
  });

  describe('processAutomatedProduction', () => {
    it('should produce clips based on rate', () => {
      gameState.set('production.clipRate', 100); // 100 clips/second
      gameState.set('resources.wire', 1000);
      
      productionSystem.processAutomatedProduction(100); // 100ms
      
      // Should produce 10 clips (100 clips/s * 0.1s)
      expect(gameState.get('resources.clips')).toBe(10);
      expect(gameState.get('resources.wire')).toBe(990);
    });

    it('should handle insufficient wire', () => {
      gameState.set('production.clipRate', 100);
      gameState.set('resources.wire', 5);
      
      productionSystem.processAutomatedProduction(100);
      
      expect(gameState.get('resources.clips')).toBe(5);
      expect(gameState.get('resources.wire')).toBe(0);
    });

    it('should not produce with zero rate', () => {
      gameState.set('production.clipRate', 0);
      gameState.set('resources.wire', 100);
      
      productionSystem.processAutomatedProduction(100);
      
      expect(gameState.get('resources.clips')).toBe(0);
      expect(gameState.get('resources.wire')).toBe(100);
    });
  });

  describe('applyProductionBoost', () => {
    it('should apply clipper boost', () => {
      productionSystem.applyProductionBoost('clipper', 3);
      
      expect(gameState.get('production.clipperBoost')).toBe(3);
    });

    it('should apply megaClipper boost', () => {
      productionSystem.applyProductionBoost('megaClipper', 2.5);
      
      expect(gameState.get('production.megaClipperBoost')).toBe(2.5);
    });

    it('should apply factory boost', () => {
      productionSystem.applyProductionBoost('factory', 1.5);
      
      expect(gameState.get('production.factoryBoost')).toBe(1.5);
    });

    it('should recalculate rates after applying boost', () => {
      gameState.set('production.clipmakerLevel', 10);
      
      productionSystem.applyProductionBoost('clipper', 2);
      
      expect(gameState.get('production.clipRate')).toBe(20);
    });
  });

  describe('updateFactoryProduction', () => {
    it('should process matter into wire', () => {
      gameState.set('flags.factory', true);
      gameState.set('infrastructure.factoryLevel', 5);
      gameState.set('production.factoryBoost', 1);
      gameState.set('resources.availableMatter', 10);
      
      productionSystem.updateFactoryProduction(1000); // 1 second
      
      // 5 factories * 1 boost * 1 second = 5 matter processed
      expect(gameState.get('resources.availableMatter')).toBe(5);
      expect(gameState.get('resources.processedMatter')).toBe(5);
      expect(gameState.get('resources.wire')).toBe(6000); // Initial 1000 + 5 * 1000
    });

    it('should handle insufficient matter', () => {
      gameState.set('flags.factory', true);
      gameState.set('infrastructure.factoryLevel', 10);
      gameState.set('resources.availableMatter', 2);
      
      productionSystem.updateFactoryProduction(1000);
      
      expect(gameState.get('resources.availableMatter')).toBe(0);
      expect(gameState.get('resources.processedMatter')).toBe(2);
      expect(gameState.get('resources.wire')).toBe(3000); // Initial 1000 + 2 * 1000
    });
  });

  describe('getProductionStats', () => {
    it('should return current production statistics', () => {
      gameState.set('production.clipRate', 100);
      gameState.set('production.clipmakerLevel', 10);
      gameState.set('production.megaClipperLevel', 2);
      gameState.set('infrastructure.factoryLevel', 5);
      
      const stats = productionSystem.getProductionStats();
      
      expect(stats.clipRate).toBe(100);
      expect(stats.clipmakerLevel).toBe(10);
      expect(stats.megaClipperLevel).toBe(2);
      expect(stats.factoryLevel).toBe(5);
      expect(stats.wireConsumptionRate).toBeDefined();
    });
  });
});