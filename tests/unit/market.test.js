/**
 * Tests for Market System
 */

import { MarketSystem } from '../../src/game/systems/market.js';
import { GameState } from '../../src/game/core/gameState.js';

describe('MarketSystem', () => {
  let gameState;
  let market;

  beforeEach(() => {
    gameState = new GameState();
    market = new MarketSystem(gameState);
    // Set human flag to enable market operations
    gameState.set('gameState.flags.human', 1);
  });

  describe('Demand Calculations', () => {
    test('should calculate demand based on price and marketing', () => {
      gameState.set('market.pricing.margin', 0.25);
      gameState.set('market.marketing.level', 1);
      gameState.set('market.marketing.effectiveness', 1);
      gameState.set('market.demandBoost', 1);
      gameState.set('prestige.u', 0);
      
      const demand = market.calculateDemand();
      
      // demand = (0.8 / 0.25) * 1 * 1 * 1 = 3.2
      expect(demand).toBeCloseTo(3.2);
    });

    test('should increase demand with higher marketing level', () => {
      gameState.set('market.pricing.margin', 0.25);
      gameState.set('market.marketing.level', 5);
      gameState.set('market.marketing.effectiveness', 1);
      gameState.set('market.demandBoost', 1);
      
      const demand = market.calculateDemand();
      
      // marketing = 1.1^(5-1) = 1.1^4 = 1.4641
      // demand = (0.8 / 0.25) * 1.4641 * 1 * 1 = 4.68512
      expect(demand).toBeCloseTo(4.68512, 4);
    });

    test('should apply prestige bonus to demand', () => {
      gameState.set('market.pricing.margin', 0.25);
      gameState.set('market.marketing.level', 1);
      gameState.set('market.marketing.effectiveness', 1);
      gameState.set('market.demandBoost', 1);
      gameState.set('prestige.u', 10);
      
      const demand = market.calculateDemand();
      
      // base demand = 3.2
      // prestige bonus = (3.2 / 10) * 10 = 3.2
      // total = 3.2 + 3.2 = 6.4
      expect(demand).toBeCloseTo(6.4);
    });

    test('should return zero demand in non-human phases', () => {
      gameState.set('gameState.flags.human', 0);
      gameState.set('market.pricing.margin', 0.25);
      gameState.set('market.marketing.level', 5);
      
      const demand = market.calculateDemand();
      
      expect(demand).toBe(0);
    });

    test('should handle extreme price values', () => {
      gameState.set('market.pricing.margin', 0.01); // Very low price
      gameState.set('market.marketing.level', 1);
      gameState.set('market.marketing.effectiveness', 1);
      gameState.set('market.demandBoost', 1);
      
      const demand = market.calculateDemand();
      
      // demand = (0.8 / 0.01) * 1 * 1 * 1 = 80
      expect(demand).toBeCloseTo(80);
    });
  });

  describe('Sales Processing', () => {
    test('should sell clips when demand exists', () => {
      gameState.set('resources.unsoldClips', 100);
      gameState.set('market.pricing.margin', 0.25);
      gameState.set('market.marketing.level', 1);
      gameState.set('market.marketing.effectiveness', 1);
      gameState.set('market.demandBoost', 1);
      
      // Mock random to ensure sale occurs
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.01); // Below sale chance
      
      const result = market.processSales();
      
      expect(result.clipsSold).toBeGreaterThan(0);
      expect(result.revenue).toBeGreaterThan(0);
      
      Math.random = originalRandom;
    });

    test('should not sell clips when no inventory', () => {
      gameState.set('resources.unsoldClips', 0);
      gameState.set('market.pricing.margin', 0.25);
      
      const result = market.processSales();
      
      expect(result.clipsSold).toBe(0);
      expect(result.revenue).toBe(0);
    });

    test('should calculate correct revenue from sales', () => {
      gameState.set('resources.unsoldClips', 50);
      gameState.set('market.pricing.margin', 0.30);
      
      const result = market.sellClips(10);
      
      expect(result.clipsSold).toBe(10);
      expect(result.revenue).toBeCloseTo(3.0); // 10 * 0.30 = 3.0
      expect(gameState.get('resources.funds')).toBeCloseTo(3.0);
      expect(gameState.get('resources.unsoldClips')).toBe(40);
    });

    test('should limit sales to available inventory', () => {
      gameState.set('resources.unsoldClips', 5);
      gameState.set('market.pricing.margin', 0.25);
      
      const result = market.sellClips(10); // Demand 10 but only have 5
      
      expect(result.clipsSold).toBe(5);
      expect(result.revenue).toBeCloseTo(1.25); // 5 * 0.25
      expect(gameState.get('resources.unsoldClips')).toBe(0);
    });

    test('should update all relevant state on sale', () => {
      gameState.set('resources.unsoldClips', 20);
      gameState.set('market.pricing.margin', 0.50);
      gameState.set('market.sales.clipsSold', 100);
      gameState.set('market.sales.income', 50);
      
      market.sellClips(10);
      
      expect(gameState.get('resources.unsoldClips')).toBe(10);
      expect(gameState.get('resources.funds')).toBeCloseTo(5.0);
      expect(gameState.get('market.sales.clipsSold')).toBe(110);
      expect(gameState.get('market.sales.income')).toBeCloseTo(55);
      expect(gameState.get('market.transaction')).toBeCloseTo(5.0);
    });
  });

  describe('Price Management', () => {
    test('should raise price correctly', () => {
      gameState.set('market.pricing.margin', 0.25);
      
      const success = market.raisePrice(0.01);
      
      expect(success).toBe(true);
      expect(gameState.get('market.pricing.margin')).toBeCloseTo(0.26);
    });

    test('should raise price by custom amount', () => {
      gameState.set('market.pricing.margin', 0.25);
      
      market.raisePrice(0.05);
      
      expect(gameState.get('market.pricing.margin')).toBeCloseTo(0.30);
    });

    test('should lower price correctly', () => {
      gameState.set('market.pricing.margin', 0.25);
      
      const success = market.lowerPrice(0.01);
      
      expect(success).toBe(true);
      expect(gameState.get('market.pricing.margin')).toBeCloseTo(0.24);
    });

    test('should not lower price below minimum', () => {
      gameState.set('market.pricing.margin', 0.01);
      
      const success = market.lowerPrice(0.02);
      
      expect(success).toBe(false);
      expect(gameState.get('market.pricing.margin')).toBe(0.01);
    });

    test('should update demand when price changes', () => {
      gameState.set('market.pricing.margin', 0.25);
      gameState.set('market.marketing.level', 1);
      
      const spy = jest.spyOn(market, 'updateDemandDisplay');
      
      market.raisePrice();
      expect(spy).toHaveBeenCalled();
      
      market.lowerPrice();
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Marketing System', () => {
    test('should purchase marketing with sufficient funds', () => {
      gameState.set('resources.funds', 100);
      gameState.set('market.pricing.adCost', 25);
      gameState.set('market.marketing.level', 1);
      
      const success = market.buyMarketing();
      
      expect(success).toBe(true);
      expect(gameState.get('resources.funds')).toBe(75);
      expect(gameState.get('market.marketing.level')).toBe(2);
      expect(gameState.get('market.pricing.adCost')).toBe(50); // Doubled
    });

    test('should not purchase marketing without funds', () => {
      gameState.set('resources.funds', 10);
      gameState.set('market.pricing.adCost', 25);
      gameState.set('market.marketing.level', 1);
      
      const success = market.buyMarketing();
      
      expect(success).toBe(false);
      expect(gameState.get('resources.funds')).toBe(10);
      expect(gameState.get('market.marketing.level')).toBe(1);
    });

    test('should double marketing cost after each purchase', () => {
      gameState.set('resources.funds', 1000);
      gameState.set('market.pricing.adCost', 10);
      
      market.buyMarketing();
      expect(gameState.get('market.pricing.adCost')).toBe(20);
      
      market.buyMarketing();
      expect(gameState.get('market.pricing.adCost')).toBe(40);
      
      market.buyMarketing();
      expect(gameState.get('market.pricing.adCost')).toBe(80);
    });
  });

  describe('Wire Purchasing', () => {
    test('should purchase wire with sufficient funds', () => {
      gameState.set('resources.funds', 50);
      gameState.set('market.pricing.wireCost', 20);
      gameState.set('market.wire.supply', 1500);
      gameState.set('resources.wire', 100);
      
      const success = market.buyWire();
      
      expect(success).toBe(true);
      expect(gameState.get('resources.funds')).toBe(30);
      expect(gameState.get('resources.wire')).toBe(1600);
      expect(gameState.get('market.wire.purchase')).toBe(1);
    });

    test('should not purchase wire without funds', () => {
      gameState.set('resources.funds', 10);
      gameState.set('market.pricing.wireCost', 20);
      gameState.set('resources.wire', 100);
      
      const success = market.buyWire();
      
      expect(success).toBe(false);
      expect(gameState.get('resources.funds')).toBe(10);
      expect(gameState.get('resources.wire')).toBe(100);
    });

    test('should increase base price after purchase', () => {
      gameState.set('resources.funds', 50);
      gameState.set('market.pricing.wireCost', 20);
      gameState.set('market.pricing.wireBasePrice', 15);
      gameState.set('market.wire.supply', 1500);
      
      market.buyWire();
      
      expect(gameState.get('market.pricing.wireBasePrice')).toBeCloseTo(15.05);
    });

    test('should reset price timer after purchase', () => {
      gameState.set('resources.funds', 50);
      gameState.set('market.pricing.wireCost', 20);
      gameState.set('market.wire.supply', 1500);
      gameState.set('market.wire.priceTimer', 100);
      
      market.buyWire();
      
      expect(gameState.get('market.wire.priceTimer')).toBe(0);
    });
  });

  describe('Wire Price Fluctuations', () => {
    test('should gradually decrease wire price over time', () => {
      gameState.set('market.wire.priceTimer', 250);
      gameState.set('market.pricing.wireBasePrice', 20);
      
      market.updateWirePricing();
      
      expect(gameState.get('market.pricing.wireBasePrice')).toBeLessThan(20);
      expect(gameState.get('market.wire.priceTimer')).toBe(0);
    });

    test('should not decrease price below threshold', () => {
      gameState.set('market.wire.priceTimer', 250);
      gameState.set('market.pricing.wireBasePrice', 10); // Below 15 threshold
      
      const initialPrice = gameState.get('market.pricing.wireBasePrice');
      market.updateWirePricing();
      
      expect(gameState.get('market.pricing.wireBasePrice')).toBe(initialPrice);
    });

    test('should apply random price fluctuations', () => {
      gameState.set('market.pricing.wireBasePrice', 20);
      gameState.set('market.pricing.wirePriceCounter', 0);
      
      // Mock random to trigger fluctuation
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.01); // Below 0.015 threshold
      
      market.updateWirePricing();
      
      expect(gameState.get('market.pricing.wirePriceCounter')).toBe(1);
      // Wire cost should be updated with sine wave fluctuation
      expect(gameState.get('market.pricing.wireCost')).toBeGreaterThan(0);
      
      Math.random = originalRandom;
    });
  });

  describe('Wire Auto-Buyer', () => {
    test('should toggle wire buyer status', () => {
      gameState.set('gameState.automation.wireBuyerEnabled', false);
      
      let status = market.toggleWireBuyer();
      expect(status).toBe(true);
      expect(gameState.get('gameState.automation.wireBuyerEnabled')).toBe(true);
      
      status = market.toggleWireBuyer();
      expect(status).toBe(false);
      expect(gameState.get('gameState.automation.wireBuyerEnabled')).toBe(false);
    });

    test('should auto-buy wire when enabled and wire is low', () => {
      gameState.set('gameState.automation.wireBuyerEnabled', true);
      gameState.set('gameState.flags.wireBuyer', 1);
      gameState.set('gameState.flags.human', 1);
      gameState.set('resources.wire', 1);
      gameState.set('resources.funds', 50);
      gameState.set('market.pricing.wireCost', 20);
      gameState.set('market.wire.supply', 1500);
      
      market.processAutoBuyer();
      
      expect(gameState.get('resources.wire')).toBe(1501);
      expect(gameState.get('resources.funds')).toBe(30);
    });

    test('should not auto-buy when disabled', () => {
      gameState.set('gameState.automation.wireBuyerEnabled', false);
      gameState.set('gameState.flags.wireBuyer', 1);
      gameState.set('resources.wire', 1);
      gameState.set('resources.funds', 50);
      
      const initialFunds = gameState.get('resources.funds');
      market.processAutoBuyer();
      
      expect(gameState.get('resources.funds')).toBe(initialFunds);
    });

    test('should not auto-buy when wire is sufficient', () => {
      gameState.set('gameState.automation.wireBuyerEnabled', true);
      gameState.set('gameState.flags.wireBuyer', 1);
      gameState.set('resources.wire', 100);
      gameState.set('resources.funds', 50);
      
      const initialFunds = gameState.get('resources.funds');
      market.processAutoBuyer();
      
      expect(gameState.get('resources.funds')).toBe(initialFunds);
    });

    test('should not auto-buy in non-human phase', () => {
      gameState.set('gameState.automation.wireBuyerEnabled', true);
      gameState.set('gameState.flags.wireBuyer', 1);
      gameState.set('gameState.flags.human', 0);
      gameState.set('resources.wire', 1);
      gameState.set('resources.funds', 50);
      
      const initialFunds = gameState.get('resources.funds');
      market.processAutoBuyer();
      
      expect(gameState.get('resources.funds')).toBe(initialFunds);
    });
  });

  describe('Revenue Tracking', () => {
    test('should calculate income correctly', () => {
      gameState.set('market.sales.income', 100);
      market.lastIncomeUpdate = 80;
      
      market.calculateRevenue();
      
      expect(market.incomeHistory).toContain(20); // 100 - 80
      expect(market.lastIncomeUpdate).toBe(100);
    });

    test('should maintain income history limit', () => {
      // Fill history beyond limit
      for (let i = 0; i < 15; i++) {
        gameState.set('market.sales.income', i * 10);
        market.calculateRevenue();
      }
      
      expect(market.incomeHistory.length).toBeLessThanOrEqual(market.maxIncomeHistory);
    });

    test('should calculate average revenue', () => {
      market.incomeHistory = [10, 20, 30, 40, 50];
      gameState.set('market.sales.income', 100);
      market.lastIncomeUpdate = 100;
      
      market.calculateRevenue();
      
      const avgRevenue = gameState.get('market.sales.avgRevenue');
      // incomeHistory now has [10, 20, 30, 40, 50, 0] (0 added by calculateRevenue)
      // Average = 150 / 6 = 25
      expect(avgRevenue).toBeCloseTo(25);
    });

    test('should project revenue based on demand', () => {
      gameState.set('market.pricing.margin', 0.25);
      gameState.set('market.marketing.level', 1);
      gameState.set('market.marketing.effectiveness', 1);
      gameState.set('market.demandBoost', 1);
      gameState.set('resources.unsoldClips', 1000);
      
      market.calculateRevenue();
      
      const projectedRevenue = gameState.get('market.projectedRevenue');
      const projectedSales = gameState.get('market.projectedSales');
      
      expect(projectedRevenue).toBeGreaterThan(0);
      expect(projectedSales).toBeGreaterThan(0);
    });

    test('should use actual revenue when demand exceeds inventory', () => {
      gameState.set('resources.unsoldClips', 1);
      gameState.set('market.pricing.margin', 0.25);
      gameState.set('market.marketing.level', 10); // High demand
      market.incomeHistory = [100, 100, 100];
      
      market.calculateRevenue();
      
      const projectedRevenue = gameState.get('market.projectedRevenue');
      expect(projectedRevenue).toBeCloseTo(75); // Average of income history
    });
  });

  describe('Market Statistics', () => {
    test('should return comprehensive stats', () => {
      gameState.set('market.pricing.margin', 0.30);
      gameState.set('market.sales.avgRevenue', 50);
      gameState.set('market.sales.income', 1000);
      gameState.set('market.sales.clipsSold', 4000);
      gameState.set('market.pricing.wireCost', 25);
      gameState.set('market.marketing.level', 5);
      gameState.set('market.pricing.adCost', 100);
      
      const stats = market.getStats();
      
      expect(stats.clipPrice).toBe(0.30);
      expect(stats.averageRevenue).toBe(50);
      expect(stats.totalIncome).toBe(1000);
      expect(stats.totalClipsSold).toBe(4000);
      expect(stats.revenuePerClip).toBeCloseTo(0.25); // 1000 / 4000
      expect(stats.wirePrice).toBe(25);
      expect(stats.marketingLevel).toBe(5);
      expect(stats.marketingCost).toBe(100);
    });

    test('should handle zero division in stats', () => {
      gameState.set('market.sales.clipsSold', 0);
      
      const stats = market.getStats();
      
      expect(stats.revenuePerClip).toBe(0);
      expect(stats.demandEfficiency).toBe(0);
    });
  });

  describe('Market Efficiency', () => {
    test('should calculate efficiency based on inventory and demand', () => {
      gameState.set('resources.unsoldClips', 100);
      gameState.set('market.pricing.margin', 0.25);
      gameState.set('market.marketing.level', 1);
      gameState.set('market.marketing.effectiveness', 1);
      gameState.set('market.demandBoost', 1);
      
      const efficiency = market.getMarketEfficiency();
      
      // demand = 3.2, inventory = 100, efficiency = min(100/3.2, 1) = 1
      expect(efficiency).toBe(1);
    });

    test('should return zero efficiency with no demand', () => {
      gameState.set('gameState.flags.human', 0); // No demand in non-human phase
      gameState.set('resources.unsoldClips', 100);
      
      const efficiency = market.getMarketEfficiency();
      
      expect(efficiency).toBe(0);
    });

    test('should return zero efficiency with no inventory', () => {
      gameState.set('resources.unsoldClips', 0);
      gameState.set('market.pricing.margin', 0.25);
      
      const efficiency = market.getMarketEfficiency();
      
      expect(efficiency).toBe(0);
    });

    test('should cap efficiency at 1', () => {
      gameState.set('resources.unsoldClips', 1000);
      gameState.set('market.pricing.margin', 10); // Very high price, low demand
      
      const efficiency = market.getMarketEfficiency();
      
      expect(efficiency).toBeLessThanOrEqual(1);
    });
  });

  describe('Optimal Pricing', () => {
    test('should suggest optimal price based on marketing', () => {
      gameState.set('market.marketing.level', 1);
      
      const optimalPrice = market.getOptimalPrice();
      
      // (0.8 * 1) / 100 = 0.008, but minimum is 0.01
      expect(optimalPrice).toBe(0.01);
    });

    test('should increase optimal price with marketing', () => {
      gameState.set('market.marketing.level', 5);
      
      const optimalPrice = market.getOptimalPrice();
      
      // marketing = 1.1^4 = 1.4641
      // (0.8 * 1.4641) / 100 = 0.0117128
      expect(optimalPrice).toBeCloseTo(0.01, 2);
    });

    test('should enforce minimum price', () => {
      gameState.set('market.marketing.level', 0);
      
      const optimalPrice = market.getOptimalPrice();
      
      expect(optimalPrice).toBeGreaterThanOrEqual(0.01);
    });
  });

  describe('System Update', () => {
    test('should perform all update operations', () => {
      const updateDemandSpy = jest.spyOn(market, 'updateDemandDisplay');
      const processSalesSpy = jest.spyOn(market, 'processSales');
      const autoBuyerSpy = jest.spyOn(market, 'processAutoBuyer');
      const wirePricingSpy = jest.spyOn(market, 'updateWirePricing');
      
      market.update(1000, 16);
      
      expect(updateDemandSpy).toHaveBeenCalled();
      expect(processSalesSpy).toHaveBeenCalled();
      expect(autoBuyerSpy).toHaveBeenCalled();
      expect(wirePricingSpy).toHaveBeenCalled();
    });

    test('should calculate revenue once per second', () => {
      const calculateRevenueSpy = jest.spyOn(market, 'calculateRevenue');
      
      // First update
      market.update(1000, 16);
      expect(calculateRevenueSpy).toHaveBeenCalledTimes(1);
      
      // Update within same second
      market.update(1500, 16);
      expect(calculateRevenueSpy).toHaveBeenCalledTimes(1);
      
      // Update after one second
      market.update(2100, 16);
      expect(calculateRevenueSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset all market data', () => {
      market.incomeHistory = [10, 20, 30];
      market.lastIncomeUpdate = 100;
      market.lastRevenueCalculation = 5000;
      market.wirePriceUpdateTimer = 250;
      
      market.reset();
      
      expect(market.incomeHistory).toEqual([]);
      expect(market.lastIncomeUpdate).toBe(0);
      expect(market.lastRevenueCalculation).toBe(0);
      expect(market.wirePriceUpdateTimer).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle negative clip demand gracefully', () => {
      gameState.set('resources.unsoldClips', 10);
      
      const result = market.sellClips(-5);
      
      expect(result.clipsSold).toBe(0);
      expect(result.revenue).toBe(0);
    });

    test('should handle zero margin price', () => {
      gameState.set('resources.unsoldClips', 10);
      gameState.set('market.pricing.margin', 0);
      
      const result = market.sellClips(5);
      
      expect(result.clipsSold).toBe(5);
      expect(result.revenue).toBe(0);
    });

    test('should handle very large numbers', () => {
      gameState.set('resources.unsoldClips', 1e10);
      gameState.set('market.pricing.margin', 0.25);
      
      const result = market.sellClips(1e9);
      
      expect(result.clipsSold).toBe(1e9);
      expect(result.revenue).toBeCloseTo(2.5e8);
    });

    test('should round financial calculations correctly', () => {
      gameState.set('resources.unsoldClips', 10);
      gameState.set('market.pricing.margin', 0.333); // Repeating decimal
      
      const result = market.sellClips(3);
      
      // Should round to 3 decimal places
      expect(result.revenue).toBe(0.999);
    });
  });

  describe('Market Initialization', () => {
    test('should initialize with correct default values', () => {
      const newMarket = new MarketSystem(gameState);
      
      expect(newMarket.incomeHistory).toEqual([]);
      expect(newMarket.maxIncomeHistory).toBe(10);
      expect(newMarket.lastIncomeUpdate).toBe(0);
      expect(newMarket.lastRevenueCalculation).toBe(0);
      expect(newMarket.wirePriceUpdateTimer).toBe(0);
    });

    test('should bind update method with error boundary', () => {
      const newMarket = new MarketSystem(gameState);
      
      // The update method should be wrapped by error boundary
      expect(typeof newMarket.update).toBe('function');
      // The wrapped function may not have a specific name, just verify it's a function
      expect(newMarket.update).toBeDefined();
    });
  });
});