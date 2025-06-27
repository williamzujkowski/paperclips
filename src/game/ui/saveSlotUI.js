/**
 * Save Slot UI Component
 * Handles the display and interaction for save slot management
 */

import { gameState } from '../core/gameState.js';
import { uiRenderer } from './renderer.js';

class SaveSlotUI {
  constructor() {
    this.modalId = 'saveSlotModal';
    this.isVisible = false;
  }

  /**
   * Initialize save slot UI
   */
  initialize() {
    // Add save slots button to UI
    this.addSaveSlotsButton();

    // Add keyboard shortcut (Ctrl+Shift+S)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Add save slots button to the game UI
   */
  addSaveSlotsButton() {
    // Try to add the button, retry if save button doesn't exist yet
    const tryAddButton = () => {
      const saveButton = document.getElementById('btnSave');
      if (saveButton && saveButton.parentElement) {
        // Check if we already added it
        if (document.getElementById('btnSaveSlots')) {
          return;
        }

        const slotsButton = document.createElement('button');
        slotsButton.id = 'btnSaveSlots';
        slotsButton.className = saveButton.className || 'button';
        slotsButton.textContent = 'Save Slots';
        slotsButton.style.marginLeft = '5px';
        slotsButton.onclick = () => this.toggle();

        // Insert after save button
        saveButton.parentElement.insertBefore(slotsButton, saveButton.nextSibling);
      } else {
        // Retry after a short delay
        setTimeout(tryAddButton, 500);
      }
    };

    tryAddButton();
  }

  /**
   * Toggle save slot modal visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Show save slot modal
   */
  show() {
    if (this.isVisible) {
      return;
    }

    this.createModal();
    this.updateSlotDisplay();
    this.isVisible = true;
  }

  /**
   * Hide save slot modal
   */
  hide() {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.remove();
    }

    const backdrop = document.getElementById('saveSlotBackdrop');
    if (backdrop) {
      backdrop.remove();
    }

    this.isVisible = false;
  }

  /**
   * Create the save slot modal
   */
  createModal() {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'saveSlotBackdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9998;
    `;
    backdrop.onclick = () => this.hide();

    // Create modal
    const modal = document.createElement('div');
    modal.id = this.modalId;
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 20px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 9999;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    modal.innerHTML = `
      <h2 style="margin-top: 0;">Save Slots</h2>
      <p style="color: #666; font-size: 0.9em;">Manage multiple save games. Current slot: <strong id="currentSlotNum">1</strong></p>
      <div id="saveSlotList" style="margin: 20px 0;"></div>
      <div style="text-align: right; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
        <button class="button" onclick="saveSlotUI.hide()">Close</button>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
  }

  /**
   * Update the display of save slots
   */
  updateSlotDisplay() {
    const slots = gameState.getAllSlots();
    const currentSlot = gameState.getCurrentSlot();
    const container = document.getElementById('saveSlotList');

    if (!container) {
      return;
    }

    // Update current slot display
    const currentSlotNum = document.getElementById('currentSlotNum');
    if (currentSlotNum) {
      currentSlotNum.textContent = currentSlot;
    }

    container.innerHTML = '';

    slots.forEach((slot) => {
      const slotDiv = document.createElement('div');
      slotDiv.style.cssText = `
        border: 2px solid ${slot.active ? '#4CAF50' : '#ddd'};
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        background: ${slot.active ? '#f0f8f0' : '#f9f9f9'};
        position: relative;
      `;

      if (slot.empty) {
        slotDiv.innerHTML = `
          <h4 style="margin: 0;">Slot ${slot.slot} - Empty</h4>
          <p style="color: #999; margin: 5px 0;">No save data</p>
          <div style="margin-top: 10px;">
            ${
              slot.active
                ? '<span style="color: #4CAF50; font-weight: bold;">✓ Current Slot</span>'
                : `<button class="button small" onclick="saveSlotUI.switchToSlot(${slot.slot})">Switch to Slot</button>`
            }
          </div>
        `;
      } else {
        const info = slot.info;
        const date = new Date(info.lastPlayed);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        slotDiv.innerHTML = `
          <h4 style="margin: 0;">Slot ${slot.slot}</h4>
          <p style="margin: 5px 0;">
            <strong>${this.formatNumber(info.clips)}</strong> paperclips<br>
            <span style="color: #666; font-size: 0.9em;">Last played: ${dateStr}</span>
          </p>
          <div style="margin-top: 10px;">
            ${
              slot.active
                ? '<span style="color: #4CAF50; font-weight: bold;">✓ Current Slot</span>'
                : `<button class="button small" onclick="saveSlotUI.switchToSlot(${slot.slot})">Load Slot</button>`
            }
            <button class="button small" onclick="saveSlotUI.copySlot(${slot.slot})" style="margin-left: 5px;">Copy</button>
            <button class="button small danger" onclick="saveSlotUI.deleteSlot(${slot.slot})" style="margin-left: 5px;">Delete</button>
            <button class="button small" onclick="saveSlotUI.exportSlot(${slot.slot})" style="margin-left: 5px;">Export</button>
          </div>
        `;
      }

      container.appendChild(slotDiv);
    });

    // Add import button
    const importDiv = document.createElement('div');
    importDiv.style.cssText = 'margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;';
    importDiv.innerHTML = `
      <h4>Import Save</h4>
      <p style="color: #666; font-size: 0.9em;">Import a save file to the current slot</p>
      <textarea id="importSaveData" placeholder="Paste save data here..." style="width: 100%; height: 60px; margin-bottom: 10px;"></textarea>
      <button class="button" onclick="saveSlotUI.importSave()">Import to Current Slot</button>
    `;
    container.appendChild(importDiv);
  }

  /**
   * Switch to a different save slot
   */
  switchToSlot(slot) {
    if (confirm(`Switch to slot ${slot}? Your current game will be saved first.`)) {
      const success = gameState.switchSlot(slot);
      if (success) {
        uiRenderer.showNotification(`Switched to slot ${slot}`, 2000);
        location.reload(); // Reload to refresh UI
      } else {
        uiRenderer.showNotification('Failed to switch slots', 2000);
      }
    }
  }

  /**
   * Delete a save slot
   */
  deleteSlot(slot) {
    if (slot === gameState.getCurrentSlot()) {
      alert('Cannot delete the current active slot!');
      return;
    }

    if (confirm(`Delete save in slot ${slot}? This cannot be undone.`)) {
      const success = gameState.deleteSlot(slot);
      if (success) {
        uiRenderer.showNotification(`Deleted slot ${slot}`, 2000);
        this.updateSlotDisplay();
      }
    }
  }

  /**
   * Copy a slot
   */
  copySlot(fromSlot) {
    const toSlot = prompt(`Copy slot ${fromSlot} to which slot? (1-5)`);
    if (toSlot) {
      const slotNum = parseInt(toSlot);
      if (slotNum >= 1 && slotNum <= 5 && slotNum !== fromSlot) {
        const success = gameState.copyToSlot(slotNum);
        if (success) {
          uiRenderer.showNotification(`Copied to slot ${slotNum}`, 2000);
          this.updateSlotDisplay();
        }
      } else {
        alert('Invalid slot number');
      }
    }
  }

  /**
   * Export a save slot
   */
  exportSlot(slot) {
    const saveData = gameState.exportSave(slot);
    if (saveData) {
      // Create a textarea to show the export data
      const textarea = document.createElement('textarea');
      textarea.value = saveData;
      textarea.style.cssText = 'width: 100%; height: 100px; margin-top: 10px;';
      textarea.readOnly = true;

      const exportDiv = document.createElement('div');
      exportDiv.innerHTML =
        '<h4>Exported Save Data</h4><p style="color: #666; font-size: 0.9em;">Copy this text to share your save:</p>';
      exportDiv.appendChild(textarea);

      // Show in a simple alert-like div
      const alertDiv = document.createElement('div');
      alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #333;
        padding: 20px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 500px;
        width: 90%;
      `;
      alertDiv.appendChild(exportDiv);

      const closeBtn = document.createElement('button');
      closeBtn.className = 'button';
      closeBtn.textContent = 'Close';
      closeBtn.onclick = () => alertDiv.remove();
      alertDiv.appendChild(closeBtn);

      document.body.appendChild(alertDiv);

      // Select the text
      textarea.select();
      textarea.setSelectionRange(0, 99999);
    }
  }

  /**
   * Import save data
   */
  importSave() {
    const textarea = document.getElementById('importSaveData');
    if (!textarea || !textarea.value.trim()) {
      alert('Please paste save data to import');
      return;
    }

    const success = gameState.importSave(textarea.value.trim());
    if (success) {
      uiRenderer.showNotification('Save imported successfully!', 2000);
      location.reload(); // Reload to refresh game state
    } else {
      alert('Failed to import save data. Please check the format.');
    }
  }

  /**
   * Format large numbers
   */
  formatNumber(num) {
    if (num >= 1e12) {
      return (num / 1e12).toFixed(1) + 'T';
    }
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B';
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }
}

// Add some basic button styles
const style = document.createElement('style');
style.textContent = `
  .button {
    padding: 8px 16px;
    border: 1px solid #333;
    background: white;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
  }
  .button:hover {
    background: #f0f0f0;
  }
  .button.small {
    padding: 4px 8px;
    font-size: 12px;
  }
  .button.danger {
    color: #d32f2f;
    border-color: #d32f2f;
  }
  .button.danger:hover {
    background: #ffebee;
  }
`;
document.head.appendChild(style);

// Create singleton instance
export const saveSlotUI = new SaveSlotUI();

// Make it globally accessible for onclick handlers
window.saveSlotUI = saveSlotUI;
