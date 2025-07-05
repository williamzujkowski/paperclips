/**
 * Tests for GameState class
 */

import { GameState } from '../../src/game/core/gameState.js';

describe('GameState', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('Basic Operations', () => {
    test('should initialize with default values', () => {
      expect(gameState.get('resources.clips')).toBe(0);
      expect(gameState.get('resources.wire')).toBe(1000);
      expect(gameState.get('resources.funds')).toBe(0);
      expect(gameState.get('computing.processors')).toBe(1);
      expect(gameState.get('computing.memory')).toBe(1);
    });

    test('should set and get values using dot notation', () => {
      gameState.set('resources.clips', 100);
      expect(gameState.get('resources.clips')).toBe(100);

      gameState.set('computing.operations', 5000);
      expect(gameState.get('computing.operations')).toBe(5000);
    });

    test('should handle nested object creation', () => {
      gameState.set('test.nested.value', 42);
      expect(gameState.get('test.nested.value')).toBe(42);
    });

    test('should return undefined for non-existent paths', () => {
      expect(gameState.get('nonexistent.path')).toBeUndefined();
    });
  });

  describe('Increment/Decrement Operations', () => {
    test('should increment values', () => {
      gameState.set('resources.clips', 10);
      gameState.increment('resources.clips', 5);
      expect(gameState.get('resources.clips')).toBe(15);
    });

    test('should decrement values', () => {
      gameState.set('resources.clips', 10);
      gameState.decrement('resources.clips', 3);
      expect(gameState.get('resources.clips')).toBe(7);
    });

    test('should handle incrementing undefined values', () => {
      gameState.increment('test.newValue', 5);
      expect(gameState.get('test.newValue')).toBe(5);
    });

    test('should handle default increment amount', () => {
      gameState.set('resources.clips', 10);
      gameState.increment('resources.clips');
      expect(gameState.get('resources.clips')).toBe(11);
    });
  });

  describe('Change Listeners', () => {
    test('should notify listeners of changes', () => {
      const listener = jest.fn();
      gameState.addChangeListener(listener);

      gameState.set('resources.clips', 100);

      expect(listener).toHaveBeenCalledWith('resources.clips', 0, 100);
    });

    test('should not notify if value unchanged', () => {
      const listener = jest.fn();
      gameState.addChangeListener(listener);

      gameState.set('resources.clips', 0); // Same as initial value

      expect(listener).not.toHaveBeenCalled();
    });

    test('should remove listeners', () => {
      const listener = jest.fn();
      gameState.addChangeListener(listener);
      gameState.removeChangeListener(listener);

      gameState.set('resources.clips', 100);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Save/Load Operations', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    test('should save to localStorage', () => {
      gameState.set('resources.clips', 1000);
      gameState.set('resources.funds', 500);

      const success = gameState.save();

      expect(success).toBe(true);
      expect(localStorage.getItem('paperclips-save')).toBeTruthy();
    });

    test('should load from localStorage', () => {
      // Set up initial state
      gameState.set('resources.clips', 1000);
      gameState.set('resources.funds', 500);
      gameState.save();

      // Create new state and load
      const newGameState = new GameState();
      const success = newGameState.load();

      expect(success).toBe(true);
      expect(newGameState.get('resources.clips')).toBe(1000);
      expect(newGameState.get('resources.funds')).toBe(500);
    });

    test('should handle missing save data', () => {
      const success = gameState.load();
      expect(success).toBe(false);
    });

    test('should handle corrupted save data', () => {
      localStorage.setItem('paperclips-save', 'invalid-json');
      const success = gameState.load();
      expect(success).toBe(false);
    });
  });

  describe('Export/Import Operations', () => {
    test('should export state as JSON string', () => {
      gameState.set('resources.clips', 1000);
      gameState.set('resources.funds', 500);

      const exported = gameState.export();

      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed.resources.clips).toBe(1000);
      expect(parsed.resources.funds).toBe(500);
    });

    test('should import state from JSON string', () => {
      const importData = {
        resources: { clips: 2000, funds: 1000 },
        computing: { processors: 5, memory: 3 }
      };

      const success = gameState.import(JSON.stringify(importData));

      expect(success).toBe(true);
      expect(gameState.get('resources.clips')).toBe(2000);
      expect(gameState.get('resources.funds')).toBe(1000);
      expect(gameState.get('computing.processors')).toBe(5);
      expect(gameState.get('computing.memory')).toBe(3);
    });

    test('should handle invalid import data', () => {
      const success = gameState.import('invalid-json');
      expect(success).toBe(false);
    });
  });

  describe('Reset Operation', () => {
    test('should reset to initial state', () => {
      gameState.set('resources.clips', 1000);
      gameState.set('resources.funds', 500);
      gameState.set('computing.processors', 10);

      gameState.reset();

      expect(gameState.get('resources.clips')).toBe(0);
      expect(gameState.get('resources.funds')).toBe(0);
      expect(gameState.get('computing.processors')).toBe(1);
    });

    test('should notify listeners of reset', () => {
      const listener = jest.fn();
      gameState.addChangeListener(listener);

      gameState.reset();

      expect(listener).toHaveBeenCalledWith('*', null, 'reset');
    });
  });

  describe('Snapshot Operation', () => {
    test('should create deep copy of state', () => {
      gameState.set('resources.clips', 1000);
      gameState.set('test.nested.value', 42);

      const snapshot = gameState.getSnapshot();

      // Modify original
      gameState.set('resources.clips', 2000);

      // Snapshot should be unchanged
      expect(snapshot.resources.clips).toBe(1000);
      expect(snapshot.test.nested.value).toBe(42);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty path', () => {
      const result = gameState.get('');
      expect(result).toBe(gameState);
    });

    test('should handle null/undefined paths', () => {
      expect(gameState.get(null)).toBe(gameState);
      expect(gameState.get(undefined)).toBe(gameState);
    });

    test('should handle setting empty path', () => {
      gameState.set('', 'value');
      // Should not crash
    });

    test('should handle deep null paths', () => {
      gameState.set('a.b.c', 'value');
      expect(gameState.get('a.b.nonexistent.deep')).toBeUndefined();
    });
  });

  describe('State Structure Validation', () => {
    test('should have all required initial state properties', () => {
      expect(gameState.get('resources')).toBeDefined();
      expect(gameState.get('production')).toBeDefined();
      expect(gameState.get('manufacturing')).toBeDefined();
      expect(gameState.get('market')).toBeDefined();
      expect(gameState.get('computing')).toBeDefined();
      expect(gameState.get('space')).toBeDefined();
      expect(gameState.get('power')).toBeDefined();
      expect(gameState.get('combat')).toBeDefined();
      expect(gameState.get('swarm')).toBeDefined();
      expect(gameState.get('prestige')).toBeDefined();
      expect(gameState.get('gameState')).toBeDefined();
      expect(gameState.get('ui')).toBeDefined();
      expect(gameState.get('endGame')).toBeDefined();
      expect(gameState.get('legacy')).toBeDefined();
    });

    test('should have proper initial values for key game variables', () => {
      expect(gameState.get('resources.wire')).toBe(1000);
      expect(gameState.get('computing.trust.current')).toBe(2);
      expect(gameState.get('computing.trust.nextThreshold')).toBe(3000);
      expect(gameState.get('market.pricing.margin')).toBe(0.25);
      expect(gameState.get('market.demand')).toBe(5);
      expect(gameState.get('gameState.flags.human')).toBe(1);
    });
  });
});