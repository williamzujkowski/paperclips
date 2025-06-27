/**
 * Tests for GameState class
 */

import { GameState } from '../../src/game/core/gameState.js';

describe('GameState', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(gameState.resources.clips).toBe(0);
      expect(gameState.resources.funds).toBe(0);
      expect(gameState.resources.wire).toBe(1000);
      expect(gameState.computing.trust).toBe(2);
      expect(gameState.computing.processors).toBe(1);
      expect(gameState.computing.memory).toBe(1);
    });

    it('should have all required state categories', () => {
      expect(gameState.resources).toBeDefined();
      expect(gameState.production).toBeDefined();
      expect(gameState.market).toBeDefined();
      expect(gameState.computing).toBeDefined();
      expect(gameState.infrastructure).toBeDefined();
      expect(gameState.combat).toBeDefined();
      expect(gameState.flags).toBeDefined();
      expect(gameState.swarm).toBeDefined();
      expect(gameState.ui).toBeDefined();
      expect(gameState.meta).toBeDefined();
    });
  });

  describe('get/set methods', () => {
    it('should get values by path', () => {
      expect(gameState.get('resources.clips')).toBe(0);
      expect(gameState.get('computing.trust')).toBe(2);
      expect(gameState.get('flags.human')).toBe(true);
    });

    it('should set values by path', () => {
      gameState.set('resources.clips', 100);
      expect(gameState.resources.clips).toBe(100);

      gameState.set('market.demand', 50);
      expect(gameState.market.demand).toBe(50);
    });

    it('should return undefined for invalid paths', () => {
      expect(gameState.get('invalid.path')).toBeUndefined();
      expect(gameState.get('resources.invalid')).toBeUndefined();
    });

    it('should create nested objects when setting', () => {
      gameState.set('new.nested.value', 42);
      expect(gameState.new.nested.value).toBe(42);
    });
  });

  describe('increment/decrement methods', () => {
    it('should increment values', () => {
      gameState.set('resources.clips', 10);
      gameState.increment('resources.clips');
      expect(gameState.resources.clips).toBe(11);

      gameState.increment('resources.clips', 5);
      expect(gameState.resources.clips).toBe(16);
    });

    it('should decrement values', () => {
      gameState.set('resources.wire', 100);
      gameState.decrement('resources.wire');
      expect(gameState.resources.wire).toBe(99);

      gameState.decrement('resources.wire', 10);
      expect(gameState.resources.wire).toBe(89);
    });

    it('should not decrement below zero', () => {
      gameState.set('resources.funds', 5);
      gameState.decrement('resources.funds', 10);
      expect(gameState.resources.funds).toBe(0);
    });

    it('should handle undefined values', () => {
      gameState.increment('new.value');
      expect(gameState.get('new.value')).toBe(1);

      gameState.decrement('another.value');
      expect(gameState.get('another.value')).toBe(0);
    });
  });

  describe('save/load functionality', () => {
    it('should save state to localStorage', () => {
      gameState.set('resources.clips', 1000);
      gameState.set('market.demand', 25);
      
      const result = gameState.save();
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalled();

      const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
      expect(savedData.version).toBe('2.0.0');
      expect(savedData.timestamp).toBeDefined();
      expect(savedData.state.resources.clips).toBe(1000);
      expect(savedData.state.market.demand).toBe(25);
    });

    it('should load state from localStorage', () => {
      const saveData = {
        version: '2.0.0',
        timestamp: Date.now(),
        state: {
          resources: { clips: 5000, funds: 100 },
          market: { demand: 50 },
          computing: { trust: 10 },
        },
      };

      localStorage.getItem.mockReturnValue(JSON.stringify(saveData));
      
      const result = gameState.load();
      expect(result).toBe(true);
      expect(gameState.resources.clips).toBe(5000);
      expect(gameState.resources.funds).toBe(100);
      expect(gameState.market.demand).toBe(50);
      expect(gameState.computing.trust).toBe(10);
    });

    it('should handle missing save data', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = gameState.load();
      expect(result).toBe(false);
    });

    it('should handle corrupted save data', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      const result = gameState.load();
      expect(result).toBe(false);
    });

    it('should validate save data format', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({ invalid: 'data' }));
      
      const result = gameState.load();
      expect(result).toBe(false);
    });
  });

  describe('reset functionality', () => {
    it('should reset to initial state', () => {
      gameState.set('resources.clips', 1000);
      gameState.set('computing.trust', 50);
      gameState.set('flags.space', true);

      gameState.reset();

      expect(gameState.resources.clips).toBe(0);
      expect(gameState.computing.trust).toBe(2);
      expect(gameState.flags.space).toBe(false);
    });

    it('should save after reset', () => {
      gameState.reset();
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('import/export functionality', () => {
    it('should export save data as base64 string', () => {
      const saveData = JSON.stringify({ test: 'data' });
      localStorage.getItem.mockReturnValue(saveData);

      const exported = gameState.exportSave();
      expect(exported).toBe(btoa(saveData));
    });

    it('should return null if no save exists', () => {
      localStorage.getItem.mockReturnValue(null);

      const exported = gameState.exportSave();
      expect(exported).toBeNull();
    });

    it('should import save data from base64 string', () => {
      const saveData = {
        version: '2.0.0',
        timestamp: Date.now(),
        state: {
          resources: { clips: 9999 },
        },
      };
      const encoded = btoa(JSON.stringify(saveData));

      const result = gameState.importSave(encoded);
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'universalPaperclipsSave',
        JSON.stringify(saveData)
      );
    });

    it('should handle invalid import data', () => {
      const result = gameState.importSave('invalid base64');
      expect(result).toBe(false);
    });
  });
});