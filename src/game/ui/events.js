/**
 * UI Event Handlers
 * Sets up all button clicks and user interactions
 */

import { gameState } from '../core/gameState.js';
import { productionSystem } from '../systems/production.js';
import { marketSystem } from '../systems/market.js';
import { uiRenderer } from './renderer.js';

export function setupEventHandlers() {
  // Make Paperclip button
  bindButton('btnMakePaperclip', () => {
    const made = productionSystem.makeClip();
    if (made) {
      uiRenderer.flashElement('clips', '#90EE90');
    }
  });

  // Lower Price button
  bindButton('btnLowerPrice', () => {
    marketSystem.adjustPrice('lower');
  });

  // Raise Price button
  bindButton('btnRaisePrice', () => {
    marketSystem.adjustPrice('raise');
  });

  // Buy Wire button
  bindButton('btnBuyWire', () => {
    const bought = marketSystem.buyWire(1000);
    if (bought) {
      uiRenderer.flashElement('wire', '#90EE90');
    }
  });

  // Buy Marketing button
  bindButton('btnMarketing', () => {
    const bought = marketSystem.buyMarketing();
    if (bought) {
      uiRenderer.flashElement('marketingLvl', '#90EE90');
    }
  });

  // Buy Auto-Clipper button
  bindButton('btnBuyAutoClipper', () => {
    const bought = productionSystem.buyAutoClipper();
    if (bought) {
      uiRenderer.flashElement('clipmakerLevel', '#90EE90');
    }
  });

  // Buy Mega-Clipper button
  bindButton('btnBuyMegaClipper', () => {
    const bought = productionSystem.buyMegaClipper();
    if (bought) {
      uiRenderer.flashElement('megaClipperLevel', '#90EE90');
    }
  });

  // Add Processor button
  bindButton('btnAddProc', () => {
    const trust = gameState.get('computing.trust');
    const processors = gameState.get('computing.processors');
    const memory = gameState.get('computing.memory');

    if (trust > processors + memory - 2) {
      gameState.increment('computing.processors');
      uiRenderer.flashElement('processors', '#90EE90');
    }
  });

  // Add Memory button
  bindButton('btnAddMem', () => {
    const trust = gameState.get('computing.trust');
    const processors = gameState.get('computing.processors');
    const memory = gameState.get('computing.memory');

    if (trust > processors + memory - 2) {
      gameState.increment('computing.memory');
      uiRenderer.flashElement('memory', '#90EE90');
    }
  });

  // Save Game button
  bindButton('btnSave', () => {
    const saved = gameState.save();
    if (saved) {
      uiRenderer.showNotification('Game saved!', 2000);
    } else {
      uiRenderer.showNotification('Save failed!', 2000);
    }
  });

  // Load Game button
  bindButton('btnLoad', () => {
    const loaded = gameState.load();
    if (loaded) {
      uiRenderer.showNotification('Game loaded!', 2000);
      location.reload(); // Refresh to update UI
    } else {
      uiRenderer.showNotification('No save found!', 2000);
    }
  });

  // Reset Game button
  bindButton('btnReset', () => {
    if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
      gameState.reset();
      location.reload();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      const saved = gameState.save();
      if (saved) {
        uiRenderer.showNotification('Game saved!', 1000);
      }
    }

    // Space to make paperclip (when button is visible)
    if (e.key === ' ' && !e.target.matches('input, textarea')) {
      e.preventDefault();
      const btn = document.getElementById('btnMakePaperclip');
      if (btn && !btn.disabled) {
        productionSystem.makeClip();
        uiRenderer.flashElement('clips', '#90EE90');
      }
    }
  });
}

/**
 * Helper function to bind click handlers to buttons
 */
function bindButton(buttonId, handler) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.addEventListener('click', handler);
  } else {
    // Button might not exist yet, try again later
    setTimeout(() => bindButton(buttonId, handler), 100);
  }
}
