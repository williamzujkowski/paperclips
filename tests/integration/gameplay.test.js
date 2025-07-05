/**
 * Integration Tests for Universal Paperclips Gameplay
 * 
 * These tests verify that different game systems work together correctly
 * to create the expected gameplay experience.
 */

import { GameState } from '../../src/game/core/gameState.js';
import ProductionSystem from '../../src/game/systems/production.js';
import { MarketSystem } from '../../src/game/systems/market.js';
import { ComputingSystem } from '../../src/game/systems/computing.js';
import { ProjectsSystem } from '../../src/game/systems/projects.js';

describe('Universal Paperclips Integration Tests', () => {
  let gameState;
  let production;
  let market;
  let computing;
  let projects;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Initialize fresh game state and systems
    gameState = new GameState();
    production = new ProductionSystem(gameState);
    market = new MarketSystem(gameState);
    computing = new ComputingSystem(gameState);
    projects = new ProjectsSystem(gameState);
    
    // Enable human mode for market operations
    gameState.set('gameState.flags.human', 1);
  });

  describe('Basic Gameplay Flow', () => {
    test('should produce clips manually and consume wire', () => {
      // Start with some wire
      gameState.set('resources.wire', 100);
      
      // Produce 10 clips manually
      const produced = production.manualClip(10);
      expect(produced).toBe(10);
      expect(gameState.get('resources.clips')).toBe(10);
      expect(gameState.get('resources.unsoldClips')).toBe(10);
      expect(gameState.get('resources.wire')).toBe(90);
    });

    test('should handle wire shortage gracefully', () => {
      // Start with limited wire
      gameState.set('resources.wire', 5);
      
      // Try to produce more clips than we have wire for
      const produced = production.manualClip(10);
      expect(produced).toBe(5);
      expect(gameState.get('resources.clips')).toBe(5);
      expect(gameState.get('resources.wire')).toBe(0);
      
      // Try to produce more - should fail
      const moreProduced = production.manualClip(5);
      expect(moreProduced).toBe(0);
      expect(gameState.get('resources.clips')).toBe(5);
    });

    test('should buy wire when funds are available', () => {
      // Set up initial state
      gameState.set('resources.funds', 100);
      gameState.set('resources.wire', 0);
      gameState.set('market.pricing.wireCost', 20);
      
      // Buy wire
      const bought = market.buyWire();
      expect(bought).toBe(true);
      expect(gameState.get('resources.wire')).toBeGreaterThan(0);
      expect(gameState.get('resources.funds')).toBeLessThan(100);
    });

    test('should sell clips at market price', () => {
      // Create clips to sell
      gameState.set('resources.unsoldClips', 100);
      gameState.set('market.pricing.margin', 0.25);
      gameState.set('market.demand', 10);
      
      // Process a single sale
      const result = market.sellClips(10);
      
      expect(result.clipsSold).toBeGreaterThan(0);
      expect(result.revenue).toBeGreaterThan(0);
      expect(gameState.get('resources.unsoldClips')).toBeLessThan(100);
      expect(gameState.get('resources.funds')).toBeGreaterThan(0);
    });
  });

  describe('AutoClipper Progression', () => {
    test('should buy AutoClippers when affordable', () => {
      // Set up initial funds
      gameState.set('resources.funds', 100);
      gameState.set('manufacturing.clipmakers.cost', 5);
      
      // Buy an AutoClipper
      const bought = production.buyAutoClipper();
      expect(bought).toBe(true);
      expect(gameState.get('manufacturing.clipmakers.level')).toBe(1);
      expect(gameState.get('resources.funds')).toBeLessThan(100);
    });

    test('should increase AutoClipper cost after purchase', () => {
      gameState.set('resources.funds', 1000);
      gameState.set('manufacturing.clipmakers.cost', 5);
      
      // Buy first AutoClipper
      production.buyAutoClipper();
      expect(gameState.get('manufacturing.clipmakers.cost')).toBeGreaterThan(5);
      
      // Buy second AutoClipper
      const secondCost = gameState.get('manufacturing.clipmakers.cost');
      production.buyAutoClipper();
      expect(gameState.get('manufacturing.clipmakers.cost')).toBeGreaterThan(secondCost);
    });

    test('should produce clips automatically with AutoClippers', () => {
      // Set up AutoClippers
      gameState.set('resources.wire', 1000);
      gameState.set('manufacturing.clipmakers.level', 5);
      gameState.set('production.boosts.clipper', 1);
      
      // Measure initial clips
      const initialClips = gameState.get('resources.clips');
      
      // Run production update
      production.updateAutoClippers();
      
      // Should have produced some clips
      const clipsProduced = gameState.get('resources.clips') - initialClips;
      expect(clipsProduced).toBeGreaterThan(0);
    });

    test('should boost AutoClipper performance with upgrades', () => {
      // Set up AutoClippers with boost
      gameState.set('resources.wire', 10000);
      gameState.set('manufacturing.clipmakers.level', 5);
      gameState.set('production.boosts.clipper', 1); // Base boost
      
      // Measure production for 1 second
      const initialClips = gameState.get('resources.clips');
      production.update(Date.now(), 1000);
      const baseProduction = gameState.get('resources.clips') - initialClips;
      
      // Apply boost and measure again
      gameState.set('resources.clips', 0);
      gameState.set('production.boosts.clipper', 2); // Double boost
      production.update(Date.now(), 1000);
      const boostedProduction = gameState.get('resources.clips');
      
      // Boosted production should be approximately double
      expect(boostedProduction).toBeCloseTo(baseProduction * 2, -1);
    });
  });

  describe('Marketing and Demand', () => {
    test('should increase demand with marketing investment', () => {
      // Set initial state
      gameState.set('market.marketing.level', 1);
      gameState.set('market.pricing.margin', 0.25);
      
      // Calculate base demand
      const baseDemand = market.calculateDemand();
      
      // Increase marketing level
      gameState.set('resources.funds', 100);
      gameState.set('market.pricing.adCost', 10);
      const bought = market.buyMarketing();
      expect(bought).toBe(true);
      expect(gameState.get('market.marketing.level')).toBe(2);
      
      // Calculate new demand
      const newDemand = market.calculateDemand();
      expect(newDemand).toBeGreaterThan(baseDemand);
    });

    test('should adjust price to affect demand', () => {
      // Set up initial state
      gameState.set('market.marketing.level', 5);
      gameState.set('market.marketing.effectiveness', 1);
      gameState.set('market.demandBoost', 1);
      
      // Test demand at different prices
      gameState.set('market.pricing.margin', 0.10);
      const lowPriceDemand = market.calculateDemand();
      
      gameState.set('market.pricing.margin', 0.50);
      const highPriceDemand = market.calculateDemand();
      
      // Lower price should result in higher demand
      expect(lowPriceDemand).toBeGreaterThan(highPriceDemand);
    });

    test('should raise and lower prices', () => {
      gameState.set('market.pricing.margin', 0.25);
      
      // Raise price
      market.raisePrice(0.05);
      expect(gameState.get('market.pricing.margin')).toBeCloseTo(0.30);
      
      // Lower price
      market.lowerPrice(0.10);
      expect(gameState.get('market.pricing.margin')).toBeCloseTo(0.20);
      
      // Should not go below 0.01
      market.lowerPrice(0.50);
      expect(gameState.get('market.pricing.margin')).toBeGreaterThanOrEqual(0.01);
    });
  });

  describe('Save/Load Functionality', () => {
    test('should save game state to localStorage', () => {
      // Set up game state
      gameState.set('resources.clips', 12345);
      gameState.set('resources.wire', 5678);
      gameState.set('resources.funds', 999.99);
      
      // Save the game
      const saved = gameState.save();
      expect(saved).toBe(true);
      
      // Check localStorage
      const savedData = localStorage.getItem('paperclips-save');
      expect(savedData).toBeTruthy();
      
      // Parse and verify
      const parsed = JSON.parse(savedData);
      expect(parsed.resources.clips).toBe(12345);
      expect(parsed.resources.wire).toBe(5678);
      expect(parsed.resources.funds).toBe(999.99);
    });

    test('should load game state from localStorage', () => {
      // Set up initial state and save
      gameState.set('resources.clips', 12345);
      gameState.set('manufacturing.clipmakers.level', 10);
      gameState.set('market.marketing.level', 5);
      gameState.save();
      
      // Create new game state and load
      const newGameState = new GameState();
      const loaded = newGameState.load();
      expect(loaded).toBe(true);
      
      // Verify state was restored
      expect(newGameState.get('resources.clips')).toBe(12345);
      expect(newGameState.get('manufacturing.clipmakers.level')).toBe(10);
      expect(newGameState.get('market.marketing.level')).toBe(5);
    });

    test('should handle save/load with active production', () => {
      // Set up production state
      gameState.set('resources.wire', 10000);
      gameState.set('manufacturing.clipmakers.level', 5);
      gameState.set('production.clipRate', 2.5);
      
      // Run production for a bit
      production.update(Date.now(), 500);
      const clipsBeforeSave = gameState.get('resources.clips');
      
      // Save and load
      gameState.save();
      const newGameState = new GameState();
      newGameState.load();
      
      // Create new production system with loaded state
      const newProduction = new ProductionSystem(newGameState);
      
      // Continue production
      newProduction.update(Date.now(), 500);
      const clipsAfterLoad = newGameState.get('resources.clips');
      
      // Should have continued producing
      expect(clipsAfterLoad).toBeGreaterThan(clipsBeforeSave);
    });

    test('should export and import game state', () => {
      // Set up complex game state
      gameState.set('resources.clips', 99999);
      gameState.set('manufacturing.factories.level', 5);
      gameState.set('computing.trust.current', 15);
      
      // Export state
      const exportData = gameState.export();
      expect(typeof exportData).toBe('string'); // JSON string format
      expect(exportData).toContain('"resources"');
      expect(exportData).toContain('"clips"');
      
      // Import into new state
      const newGameState = new GameState();
      const imported = newGameState.import(exportData);
      expect(imported).toBe(true);
      
      // Verify state
      expect(newGameState.get('resources.clips')).toBe(99999);
      expect(newGameState.get('manufacturing.factories.level')).toBe(5);
      expect(newGameState.get('computing.trust.current')).toBe(15);
    });

    test('should handle corrupted save data gracefully', () => {
      // Set corrupted data in localStorage
      localStorage.setItem('paperclips-save', 'invalid_json_data{}[]');
      
      // Try to load
      const newGameState = new GameState();
      const loaded = newGameState.load();
      expect(loaded).toBe(false);
      
      // Game state should remain at defaults
      expect(newGameState.get('resources.clips')).toBe(0);
      expect(newGameState.get('resources.wire')).toBe(1000);
    });

    test('should handle extremely large numbers', () => {
      // Test with large values
      gameState.set('resources.clips', 1e15); // 1 quadrillion
      gameState.set('resources.funds', 1e12); // 1 trillion
      gameState.set('manufacturing.clipmakers.level', 1000000);
      
      // Save and load
      gameState.save();
      const newGameState = new GameState();
      newGameState.load();
      
      expect(newGameState.get('resources.clips')).toBe(1e15);
      expect(newGameState.get('resources.funds')).toBe(1e12);
      expect(newGameState.get('manufacturing.clipmakers.level')).toBe(1000000);
    });
  });

  describe('Project Completion Flow', () => {
    test('should generate operations with processors', () => {
      // Set up computing resources
      gameState.set('computing.processors', 2);
      gameState.set('computing.memory', 3);
      gameState.set('computing.operations', 0);
      
      // Calculate expected operations per second
      const expectedOpsPerSec = 2 * 1; // 2 processors * 1 operation per processor per second
      
      // Update computing to generate operations
      computing.generateOperations(1000); // 1 second worth
      
      // Should have generated operations
      const operations = gameState.get('computing.operations');
      expect(operations).toBeGreaterThan(0);
      expect(operations).toBeCloseTo(expectedOpsPerSec, -1);
    });

    test('should check project availability', () => {
      // Set up for improved AutoClippers project
      gameState.set('computing.operations', 1000);
      gameState.set('manufacturing.clipmakers.level', 2);
      
      // Check if project requirements are met
      const requirementsMet = projects.checkRequirements('improvedAutoClippers');
      expect(requirementsMet).toBe(true);
      
      // Check if project is affordable
      const canAfford = projects.canAfford('improvedAutoClippers');
      expect(canAfford).toBe(true);
      
      // Check with insufficient operations
      gameState.set('computing.operations', 100);
      const notAffordable = projects.canAfford('improvedAutoClippers');
      expect(notAffordable).toBe(false);
    });

    test('should complete projects and apply effects', () => {
      // Set up for improved AutoClippers project
      gameState.set('computing.operations', 1000);
      gameState.set('manufacturing.clipmakers.level', 2);
      
      // Complete the project
      const completed = projects.completeProject('improvedAutoClippers');
      expect(completed).toBe(true);
      expect(gameState.get('computing.operations')).toBe(250); // 1000 - 750
      expect(gameState.get('production.boosts.clipper')).toBe(1.25);
      
      // Should not be able to complete again
      const duplicate = projects.completeProject('improvedAutoClippers');
      expect(duplicate).toBe(false);
    });

    test('should unlock new projects after prerequisites', () => {
      // Complete initial project
      gameState.set('computing.operations', 2000);
      gameState.set('manufacturing.clipmakers.level', 1);
      projects.completeProject('improvedAutoClippers');
      
      // Update to check for new available projects
      projects.update();
      
      // Should have new projects available
      const availableProjects = projects.getAvailableProjects();
      expect(availableProjects.length).toBeGreaterThan(0);
    });
  });

  describe('System Interactions', () => {
    test('should coordinate basic production and sales', () => {
      // Set up initial state
      gameState.set('resources.wire', 1000);
      gameState.set('manufacturing.clipmakers.level', 3);
      gameState.set('market.pricing.margin', 0.15);
      gameState.set('market.demand', 5);
      
      // Track initial values
      const initialClips = gameState.get('resources.clips');
      const initialFunds = gameState.get('resources.funds');
      
      // Run production
      production.updateAutoClippers();
      
      // Verify clips were produced
      expect(gameState.get('resources.clips')).toBeGreaterThan(initialClips);
      
      // Sell some clips
      const unsoldClips = gameState.get('resources.unsoldClips');
      if (unsoldClips > 0) {
        const result = market.sellClips(Math.min(unsoldClips, 10));
        expect(result.clipsSold).toBeGreaterThan(0);
        expect(result.revenue).toBeGreaterThan(0);
        expect(gameState.get('resources.funds')).toBeGreaterThan(initialFunds);
      }
    });

    test('should handle resource constraints', () => {
      // Set up resource-constrained scenario
      gameState.set('resources.wire', 10);
      gameState.set('resources.funds', 5);
      gameState.set('manufacturing.clipmakers.level', 10); // High production capacity
      
      // Run production - should be limited by wire
      const initialClips = gameState.get('resources.clips');
      production.updateAutoClippers();
      const clipsProduced = gameState.get('resources.clips') - initialClips;
      
      // Should have consumed available wire
      expect(gameState.get('resources.wire')).toBeLessThanOrEqual(10);
      expect(clipsProduced).toBeLessThanOrEqual(10);
    });

    test('should progress through early game', () => {
      // Simulate early game progression
      gameState.set('resources.wire', 2000);
      
      // Phase 1: Manual production
      production.manualClip(100);
      expect(gameState.get('resources.clips')).toBe(100);
      
      // Phase 2: Earn money
      gameState.set('resources.unsoldClips', 100);
      gameState.set('market.pricing.margin', 0.25);
      const result = market.sellClips(50);
      expect(result.clipsSold).toBeGreaterThan(0);
      expect(result.revenue).toBeGreaterThan(0);
      expect(gameState.get('resources.funds')).toBeGreaterThan(0);
      
      // Phase 3: Buy first AutoClipper
      gameState.set('resources.funds', 10);
      gameState.set('manufacturing.clipmakers.cost', 5);
      production.buyAutoClipper();
      expect(gameState.get('manufacturing.clipmakers.level')).toBe(1);
      
      // Verify game has progressed
      expect(gameState.get('resources.clips')).toBeGreaterThanOrEqual(50);
      expect(gameState.get('manufacturing.clipmakers.level')).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle rapid clicking without breaking', () => {
      gameState.set('resources.wire', 1000);
      
      // Simulate rapid clicking
      let totalProduced = 0;
      for (let i = 0; i < 100; i++) {
        totalProduced += production.manualClip(1);
      }
      
      expect(totalProduced).toBe(100);
      expect(gameState.get('resources.clips')).toBe(100);
      expect(gameState.get('resources.wire')).toBe(900);
    });

    test('should handle negative funds gracefully', () => {
      // This shouldn't happen in normal gameplay, but test defense
      gameState.set('resources.funds', -10);
      gameState.set('manufacturing.clipmakers.cost', 5);
      
      const bought = production.buyAutoClipper();
      expect(bought).toBe(false);
      expect(gameState.get('manufacturing.clipmakers.level')).toBe(0);
    });

    test('should prevent invalid price changes', () => {
      gameState.set('market.pricing.margin', 0.05);
      
      // Try to lower price below minimum
      market.lowerPrice(0.10);
      expect(gameState.get('market.pricing.margin')).toBeGreaterThanOrEqual(0.01);
      
      // Try to set negative price - demand calculation should handle it gracefully
      gameState.set('market.pricing.margin', -1);
      const demand = market.calculateDemand();
      // Demand should never be negative due to safety measures
      expect(demand).toBeGreaterThanOrEqual(0);
    });
  });
});