/**
 * Tests for Save Slot Management System
 */

import { SaveSlotManager } from '../../src/game/core/saveSlots.js';
import { GameState } from '../../src/game/core/gameState.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('SaveSlotManager', () => {
  let saveManager;

  beforeEach(() => {
    localStorage.clear();
    saveManager = new SaveSlotManager();
    saveManager.initialize();
  });

  describe('initialization', () => {
    it('should initialize with default metadata', () => {
      const meta = saveManager.getMetadata();
      expect(meta).toBeTruthy();
      expect(meta.currentSlot).toBe(1);
      expect(meta.slots).toEqual({});
    });

    it('should preserve existing metadata', () => {
      const existingMeta = {
        currentSlot: 3,
        slots: { 1: { clips: 100 } },
      };
      localStorage.setItem(saveManager.metaKey, JSON.stringify(existingMeta));

      const newManager = new SaveSlotManager();
      newManager.initialize();

      const meta = newManager.getMetadata();
      expect(meta.currentSlot).toBe(3);
      expect(meta.slots[1]).toEqual({ clips: 100 });
    });
  });

  describe('slot management', () => {
    it('should get all slots with correct status', () => {
      const slots = saveManager.getAllSlots();
      expect(slots).toHaveLength(5);
      expect(slots[0]).toEqual({
        slot: 1,
        active: true,
        empty: true,
        info: null,
      });
    });

    it('should set current slot', () => {
      const success = saveManager.setCurrentSlot(3);
      expect(success).toBe(true);
      expect(saveManager.currentSlot).toBe(3);

      const meta = saveManager.getMetadata();
      expect(meta.currentSlot).toBe(3);
    });

    it('should reject invalid slot numbers', () => {
      expect(saveManager.setCurrentSlot(0)).toBe(false);
      expect(saveManager.setCurrentSlot(6)).toBe(false);
      expect(saveManager.currentSlot).toBe(1);
    });
  });

  describe('save/load operations', () => {
    const mockSaveData = {
      version: '2.0.0',
      timestamp: Date.now(),
      state: {
        resources: { clips: 1000, wire: 500 },
        flags: { autoClipper: true },
      },
    };

    it('should save data to slot', () => {
      const success = saveManager.saveToSlot(mockSaveData);
      expect(success).toBe(true);

      const savedData = localStorage.getItem(saveManager.getSlotKey(1));
      expect(savedData).toBeTruthy();
      expect(JSON.parse(savedData)).toEqual(mockSaveData);

      const meta = saveManager.getMetadata();
      expect(meta.slots[1]).toBeTruthy();
      expect(meta.slots[1].clips).toBe(1000);
    });

    it('should load data from slot', () => {
      saveManager.saveToSlot(mockSaveData);
      const loaded = saveManager.loadFromSlot(1);

      expect(loaded).toEqual(mockSaveData);
      expect(saveManager.currentSlot).toBe(1);
    });

    it('should return null for empty slot', () => {
      const loaded = saveManager.loadFromSlot(2);
      expect(loaded).toBeNull();
    });
  });

  describe('slot operations', () => {
    const mockSaveData = {
      version: '2.0.0',
      timestamp: Date.now(),
      state: {
        resources: { clips: 1000 },
      },
    };

    beforeEach(() => {
      saveManager.saveToSlot(mockSaveData);
    });

    it('should delete a slot', () => {
      const success = saveManager.deleteSlot(1);
      expect(success).toBe(true);

      const loaded = saveManager.loadFromSlot(1);
      expect(loaded).toBeNull();

      const meta = saveManager.getMetadata();
      expect(meta.slots[1]).toBeUndefined();
    });

    it('should copy a slot', () => {
      const success = saveManager.copySlot(1, 3);
      expect(success).toBe(true);

      const loaded = saveManager.loadFromSlot(3);
      expect(loaded.state.resources.clips).toBe(1000);
    });

    it('should fail to copy non-existent slot', () => {
      const success = saveManager.copySlot(2, 3);
      expect(success).toBe(false);
    });
  });

  describe('import/export', () => {
    const mockSaveData = {
      version: '2.0.0',
      state: {
        resources: { clips: 5000 },
      },
    };

    it('should export slot as base64', () => {
      saveManager.saveToSlot(mockSaveData);
      const exported = saveManager.exportSlot(1);

      expect(exported).toBeTruthy();
      expect(typeof exported).toBe('string');

      const decoded = JSON.parse(atob(exported));
      expect(decoded.state.resources.clips).toBe(5000);
    });

    it('should import base64 save data', () => {
      const encoded = btoa(JSON.stringify(mockSaveData));
      const success = saveManager.importToSlot(2, encoded);

      expect(success).toBe(true);

      const loaded = saveManager.loadFromSlot(2);
      expect(loaded.state.resources.clips).toBe(5000);
    });

    it('should reject invalid import data', () => {
      const success = saveManager.importToSlot(2, 'invalid-data');
      expect(success).toBe(false);
    });
  });

  describe('migration', () => {
    it('should migrate old save format', () => {
      const oldSave = {
        version: '2.0.0',
        timestamp: Date.now(),
        state: {
          resources: { clips: 2000 },
        },
      };
      localStorage.setItem('universalPaperclipsSave', JSON.stringify(oldSave));

      const success = saveManager.migrateOldSave();
      expect(success).toBe(true);

      const loaded = saveManager.loadFromSlot(1);
      expect(loaded.state.resources.clips).toBe(2000);

      // Old save should be removed
      expect(localStorage.getItem('universalPaperclipsSave')).toBeNull();
    });
  });
});

describe('GameState with SaveSlots', () => {
  let gameState;

  beforeEach(() => {
    localStorage.clear();
    gameState = new GameState();
  });

  describe('slot switching', () => {
    it('should switch between slots', () => {
      // Save initial state
      gameState.set('resources.clips', 1000);
      gameState.save();

      // Switch to slot 2 (empty)
      const success = gameState.switchSlot(2);
      expect(success).toBe(true);
      expect(gameState.getCurrentSlot()).toBe(2);
      expect(gameState.get('resources.clips')).toBe(0); // Reset state

      // Switch back to slot 1
      gameState.switchSlot(1);
      expect(gameState.get('resources.clips')).toBe(1000);
    });

    it('should save before switching', () => {
      gameState.set('resources.clips', 500);
      gameState.switchSlot(2);

      // Switch back and verify save
      gameState.switchSlot(1);
      expect(gameState.get('resources.clips')).toBe(500);
    });
  });

  describe('getAllSlots', () => {
    it('should return all slot information', () => {
      gameState.set('resources.clips', 1500);
      gameState.save();

      const slots = gameState.getAllSlots();
      expect(slots).toHaveLength(5);
      expect(slots[0].active).toBe(true);
      expect(slots[0].empty).toBe(false);
      expect(slots[0].info.clips).toBe(1500);
    });
  });

  describe('import/export with slots', () => {
    it('should export from specific slot', () => {
      gameState.set('resources.clips', 3000);
      gameState.save();

      const exported = gameState.exportSave(1);
      expect(exported).toBeTruthy();

      // Import to different slot
      const success = gameState.importSave(exported, 3);
      expect(success).toBe(true);

      gameState.switchSlot(3);
      expect(gameState.get('resources.clips')).toBe(3000);
    });
  });
});
