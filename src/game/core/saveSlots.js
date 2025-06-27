/**
 * Save Slot Management System
 * Handles multiple save slots for the game
 */

export class SaveSlotManager {
  constructor() {
    this.maxSlots = 5;
    this.currentSlot = 1;
    this.slotPrefix = 'universalPaperclipsSave_slot_';
    this.metaKey = 'universalPaperclips_saveMeta';
  }

  /**
   * Initialize save slot metadata
   */
  initialize() {
    const meta = this.getMetadata();
    if (!meta) {
      this.saveMetadata({
        currentSlot: 1,
        slots: {},
      });
    }
  }

  /**
   * Get metadata about all save slots
   */
  getMetadata() {
    try {
      const data = localStorage.getItem(this.metaKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load save metadata:', error);
      return null;
    }
  }

  /**
   * Save metadata
   */
  saveMetadata(meta) {
    try {
      localStorage.setItem(this.metaKey, JSON.stringify(meta));
      return true;
    } catch (error) {
      console.error('Failed to save metadata:', error);
      return false;
    }
  }

  /**
   * Get information about all save slots
   */
  getAllSlots() {
    const meta = this.getMetadata() || { slots: {} };
    const slots = [];

    for (let i = 1; i <= this.maxSlots; i++) {
      const slotInfo = meta.slots[i] || null;
      slots.push({
        slot: i,
        active: i === this.currentSlot,
        empty: !slotInfo,
        info: slotInfo,
      });
    }

    return slots;
  }

  /**
   * Get the storage key for a specific slot
   */
  getSlotKey(slot) {
    return `${this.slotPrefix}${slot}`;
  }

  /**
   * Set the current active slot
   */
  setCurrentSlot(slot) {
    if (slot < 1 || slot > this.maxSlots) {
      return false;
    }

    this.currentSlot = slot;
    const meta = this.getMetadata() || { slots: {} };
    meta.currentSlot = slot;
    this.saveMetadata(meta);
    return true;
  }

  /**
   * Save game data to the current slot
   */
  saveToSlot(saveData) {
    try {
      const slot = this.currentSlot;
      const key = this.getSlotKey(slot);

      // Save the actual game data
      localStorage.setItem(key, JSON.stringify(saveData));

      // Update metadata
      const meta = this.getMetadata() || { slots: {} };
      meta.slots[slot] = {
        timestamp: Date.now(),
        clips: saveData.state?.resources?.clips || 0,
        lastPlayed: new Date().toISOString(),
        version: saveData.version,
      };
      meta.currentSlot = slot;
      this.saveMetadata(meta);

      return true;
    } catch (error) {
      console.error('Failed to save to slot:', error);
      return false;
    }
  }

  /**
   * Load game data from a specific slot
   */
  loadFromSlot(slot) {
    try {
      const key = this.getSlotKey(slot);
      const data = localStorage.getItem(key);

      if (!data) {
        return null;
      }

      // Update current slot
      this.setCurrentSlot(slot);

      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load from slot:', error);
      return null;
    }
  }

  /**
   * Delete a save slot
   */
  deleteSlot(slot) {
    try {
      const key = this.getSlotKey(slot);
      localStorage.removeItem(key);

      // Update metadata
      const meta = this.getMetadata() || { slots: {} };
      delete meta.slots[slot];
      this.saveMetadata(meta);

      return true;
    } catch (error) {
      console.error('Failed to delete slot:', error);
      return false;
    }
  }

  /**
   * Copy a save slot to another slot
   */
  copySlot(fromSlot, toSlot) {
    try {
      const fromKey = this.getSlotKey(fromSlot);
      const toKey = this.getSlotKey(toSlot);

      const data = localStorage.getItem(fromKey);
      if (!data) {
        return false;
      }

      // Copy the save data
      localStorage.setItem(toKey, data);

      // Update metadata for the new slot
      const meta = this.getMetadata() || { slots: {} };
      if (meta.slots[fromSlot]) {
        meta.slots[toSlot] = {
          ...meta.slots[fromSlot],
          timestamp: Date.now(),
          lastPlayed: new Date().toISOString(),
        };
        this.saveMetadata(meta);
      }

      return true;
    } catch (error) {
      console.error('Failed to copy slot:', error);
      return false;
    }
  }

  /**
   * Export a specific slot as base64
   */
  exportSlot(slot) {
    try {
      const key = this.getSlotKey(slot);
      const data = localStorage.getItem(key);
      return data ? btoa(data) : null;
    } catch (error) {
      console.error('Failed to export slot:', error);
      return null;
    }
  }

  /**
   * Import save data to a specific slot
   */
  importToSlot(slot, encodedSave) {
    try {
      const saveData = atob(encodedSave);
      const parsed = JSON.parse(saveData); // Validate it's valid JSON

      const key = this.getSlotKey(slot);
      localStorage.setItem(key, saveData);

      // Update metadata
      const meta = this.getMetadata() || { slots: {} };
      meta.slots[slot] = {
        timestamp: Date.now(),
        clips: parsed.state?.resources?.clips || 0,
        lastPlayed: new Date().toISOString(),
        version: parsed.version,
      };
      this.saveMetadata(meta);

      return true;
    } catch (error) {
      console.error('Failed to import to slot:', error);
      return false;
    }
  }

  /**
   * Migrate old single save to slot system
   */
  migrateOldSave() {
    try {
      const oldSave = localStorage.getItem('universalPaperclipsSave');
      if (!oldSave) {
        return false;
      }

      // Save old data to slot 1
      const key = this.getSlotKey(1);
      localStorage.setItem(key, oldSave);

      // Update metadata
      const parsed = JSON.parse(oldSave);
      const meta = {
        currentSlot: 1,
        slots: {
          1: {
            timestamp: parsed.timestamp || Date.now(),
            clips: parsed.state?.resources?.clips || 0,
            lastPlayed: new Date().toISOString(),
            version: parsed.version || '2.0.0',
          },
        },
      };
      this.saveMetadata(meta);

      // Remove old save key
      localStorage.removeItem('universalPaperclipsSave');

      return true;
    } catch (error) {
      console.error('Failed to migrate old save:', error);
      return false;
    }
  }
}

// Create singleton instance
export const saveSlotManager = new SaveSlotManager();
