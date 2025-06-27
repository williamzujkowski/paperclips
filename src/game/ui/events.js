/**
 * UI Event Handlers
 * Sets up all button clicks and user interactions
 */

import { gameState } from '../core/gameState.js';
import { productionSystem } from '../systems/production.js';
import { marketSystem } from '../systems/market.js';
import { computingSystem } from '../systems/computing.js';
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
    if (computingSystem.addProcessor()) {
      uiRenderer.flashElement('processors', '#90EE90');
    }
  });

  // Add Memory button
  bindButton('btnAddMem', () => {
    if (computingSystem.addMemory()) {
      uiRenderer.flashElement('memory', '#90EE90');
    }
  });

  // Quantum Compute button
  bindButton('btnQuantumCompute', () => {
    if (computingSystem.startQuantumCompute()) {
      uiRenderer.flashElement('operations', '#673AB7');
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

    // Ignore if user is typing in an input field
    if (e.target.matches('input, textarea')) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case ' ': {
        // Spacebar - Make paperclip
        e.preventDefault();
        const btnMake = document.getElementById('btnMakePaperclip');
        if (btnMake && !btnMake.disabled) {
          productionSystem.makeClip();
          uiRenderer.flashElement('clips', '#90EE90');
        }
        break;
      }

      case 'w': {
        // W - Buy wire
        e.preventDefault();
        const btnWire = document.getElementById('btnBuyWire');
        if (btnWire && !btnWire.disabled) {
          const bought = marketSystem.buyWire(1000);
          if (bought) {
            uiRenderer.flashElement('wire', '#90EE90');
          }
        }
        break;
      }

      case 'a': {
        // A - Buy auto-clipper
        e.preventDefault();
        const btnAuto = document.getElementById('btnBuyAutoClipper');
        if (btnAuto && !btnAuto.disabled) {
          const bought = productionSystem.buyAutoClipper();
          if (bought) {
            uiRenderer.flashElement('clipmakerLevel', '#90EE90');
          }
        }
        break;
      }

      case 'm': {
        // M - Buy marketing
        e.preventDefault();
        const btnMarketing = document.getElementById('btnMarketing');
        if (btnMarketing && !btnMarketing.disabled) {
          const bought = marketSystem.buyMarketing();
          if (bought) {
            uiRenderer.flashElement('marketingLvl', '#90EE90');
          }
        }
        break;
      }

      case '[': {
        // [ - Lower price
        e.preventDefault();
        const btnLower = document.getElementById('btnLowerPrice');
        if (btnLower && !btnLower.disabled) {
          marketSystem.adjustPrice('lower');
        }
        break;
      }

      case ']': {
        // ] - Raise price
        e.preventDefault();
        const btnRaise = document.getElementById('btnRaisePrice');
        if (btnRaise && !btnRaise.disabled) {
          marketSystem.adjustPrice('raise');
        }
        break;
      }

      case 'q': {
        // Q - Quantum compute
        e.preventDefault();
        const btnQuantum = document.getElementById('btnQuantumCompute');
        if (btnQuantum && !btnQuantum.disabled) {
          if (computingSystem.startQuantumCompute()) {
            uiRenderer.flashElement('operations', '#673AB7');
          }
        }
        break;
      }

      case '?':
        // ? - Show keyboard shortcuts help
        e.preventDefault();
        showKeyboardShortcuts();
        break;
    }
  });
}

/**
 * Show keyboard shortcuts help dialog
 */
function showKeyboardShortcuts() {
  // Check if dialog already exists
  let dialog = document.getElementById('keyboardShortcutsDialog');
  if (dialog) {
    dialog.remove();
    return;
  }

  const shortcuts = [
    { key: 'Space', action: 'Make paperclip' },
    { key: 'W', action: 'Buy wire' },
    { key: 'A', action: 'Buy auto-clipper' },
    { key: 'M', action: 'Buy marketing' },
    { key: '[', action: 'Lower price' },
    { key: ']', action: 'Raise price' },
    { key: 'Q', action: 'Quantum compute' },
    { key: 'Ctrl+S', action: 'Save game' },
    { key: 'Ctrl+Shift+D', action: 'Dev dashboard' },
    { key: '?', action: 'Show this help' },
  ];

  // Create dialog
  dialog = document.createElement('div');
  dialog.id = 'keyboardShortcutsDialog';
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #333;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    z-index: 10000;
    max-width: 400px;
  `;

  dialog.innerHTML = `
    <h3 style="margin-top: 0; color: #fff;">Keyboard Shortcuts</h3>
    <table style="width: 100%; color: #fff; border-collapse: collapse;">
      ${shortcuts
        .map(
          (s) => `
        <tr>
          <td style="padding: 8px 12px; font-family: monospace; background: #444; border-radius: 4px; font-size: 14px;">${s.key}</td>
          <td style="padding: 8px 12px; font-size: 14px;">${s.action}</td>
        </tr>
      `,
        )
        .join('')}
    </table>
    <p style="margin-top: 15px; font-size: 0.9em; opacity: 0.8; color: #ccc;">Press ESC or click outside to close</p>
  `;

  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
  `;

  // Close handlers
  const closeDialog = () => {
    dialog.remove();
    backdrop.remove();
  };

  backdrop.onclick = closeDialog;

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeDialog();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Add to page
  document.body.appendChild(backdrop);
  document.body.appendChild(dialog);
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
