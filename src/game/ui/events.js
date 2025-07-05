/**
 * Events System for Universal Paperclips
 *
 * Handles user interactions and input events with proper delegation
 * and error boundaries.
 */

import { errorHandler } from '../core/errorHandler.js';
import { performanceMonitor } from '../core/performanceMonitor.js';

export class EventsSystem {
  constructor(gameState, systems) {
    this.gameState = gameState;
    this.systems = systems;

    // Event handlers map
    this.handlers = new Map();

    // Bound event methods for cleanup
    this.boundHandlers = {
      click: this.handleClick.bind(this),
      change: this.handleChange.bind(this),
      input: this.handleInput.bind(this),
      keydown: this.handleKeyboard.bind(this)
    };

    // Initialize event handlers
    this.initializeHandlers();

    // Set up event delegation
    this.setupEventDelegation();

    // Keyboard shortcuts
    this.shortcuts = new Map();
    this.setupKeyboardShortcuts();
  }

  /**
   * Initialize all event handlers
   */
  initializeHandlers() {
    // Production handlers
    this.handlers.set('makeClip', this.makeClip.bind(this));
    this.handlers.set('buyAutoClipper', this.buyAutoClipper.bind(this));
    this.handlers.set('buyMegaClipper', this.buyMegaClipper.bind(this));

    // Market handlers
    this.handlers.set('raisePrice', this.raisePrice.bind(this));
    this.handlers.set('lowerPrice', this.lowerPrice.bind(this));
    this.handlers.set('buyAds', this.buyAds.bind(this));
    this.handlers.set('buyWire', this.buyWire.bind(this));
    this.handlers.set('toggleWireBuyer', this.toggleWireBuyer.bind(this));

    // Computing handlers
    this.handlers.set('buyProcessor', this.buyProcessor.bind(this));
    this.handlers.set('buyMemory', this.buyMemory.bind(this));
    this.handlers.set('toggleCreativity', this.toggleCreativity.bind(this));
    this.handlers.set('adjustCreativity', this.adjustCreativity.bind(this));

    // Combat handlers
    this.handlers.set('allocateProbeStats', this.allocateProbeStats.bind(this));
    this.handlers.set('toggleCombat', this.toggleCombat.bind(this));

    // Projects handlers
    this.handlers.set('completeProject', this.completeProject.bind(this));

    // Save/Load handlers
    this.handlers.set('saveGame', this.saveGame.bind(this));
    this.handlers.set('loadGame', this.loadGame.bind(this));
    this.handlers.set('resetGame', this.resetGame.bind(this));
    this.handlers.set('exportSave', this.exportSave.bind(this));
    this.handlers.set('importSave', this.importSave.bind(this));
    this.handlers.set('showAchievements', this.showAchievements.bind(this));
  }

  /**
   * Set up event delegation for better performance
   */
  setupEventDelegation() {
    document.addEventListener('click', this.boundHandlers.click);
    document.addEventListener('change', this.boundHandlers.change);
    document.addEventListener('input', this.boundHandlers.input);
    document.addEventListener('keydown', this.boundHandlers.keydown);
  }

  /**
   * Handle click events
   */
  handleClick(event) {
    const element = event.target;
    const action = element.dataset.action;

    if (!action) return;

    event.preventDefault();

    const handler = this.handlers.get(action);
    if (handler) {
      try {
        performanceMonitor.measure(() => {
          handler(event, element);
        }, `event.${action}`);
      } catch (error) {
        errorHandler.handleError(error, `events.${action}`, { element: element.id });
      }
    } else {
      errorHandler.warn(`No handler found for action: ${action}`);
    }
  }

  /**
   * Handle change events
   */
  handleChange(event) {
    const element = event.target;
    const action = element.dataset.action;

    if (!action) return;

    const handler = this.handlers.get(action);
    if (handler) {
      try {
        handler(event, element);
      } catch (error) {
        errorHandler.handleError(error, `events.${action}`, { element: element.id });
      }
    }
  }

  /**
   * Handle input events
   */
  handleInput(event) {
    const element = event.target;
    const action = element.dataset.action;

    if (!action) return;

    const handler = this.handlers.get(action);
    if (handler) {
      try {
        handler(event, element);
      } catch (error) {
        errorHandler.handleError(error, `events.${action}`, { element: element.id });
      }
    }
  }

  /**
   * Handle keyboard events
   */
  handleKeyboard(event) {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey;
    const alt = event.altKey;
    const shift = event.shiftKey;

    const shortcutKey = `${ctrl ? 'ctrl+' : ''}${alt ? 'alt+' : ''}${shift ? 'shift+' : ''}${key}`;

    const handler = this.shortcuts.get(shortcutKey);
    if (handler) {
      event.preventDefault();
      try {
        handler(event);
      } catch (error) {
        errorHandler.handleError(error, `events.shortcut.${shortcutKey}`);
      }
    }
  }

  /**
   * Set up keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    // Space bar for making clips
    this.shortcuts.set(' ', () => this.makeClip());

    // Number keys for quick actions
    this.shortcuts.set('1', () => this.buyAutoClipper());
    this.shortcuts.set('2', () => this.buyMegaClipper());
    this.shortcuts.set('3', () => this.buyWire());
    this.shortcuts.set('4', () => this.buyAds());

    // Arrow keys for price adjustment
    this.shortcuts.set('arrowup', () => this.raisePrice());
    this.shortcuts.set('arrowdown', () => this.lowerPrice());

    // Ctrl+S for save
    this.shortcuts.set('ctrl+s', () => this.saveGame());

    // Ctrl+L for load
    this.shortcuts.set('ctrl+l', () => this.loadGame());

    // Escape for reset (with confirmation)
    this.shortcuts.set('escape', () => this.confirmReset());
  }

  // ====== EVENT HANDLERS ======

  /**
   * Make paperclip(s)
   */
  makeClip(event, element) {
    const amount = event?.shiftKey ? 10 : 1;
    if (this.systems.production) {
      this.systems.production.manualClip(amount);
    }
  }

  /**
   * Buy AutoClipper
   */
  buyAutoClipper(event, element) {
    if (this.systems.production) {
      const success = this.systems.production.buyAutoClipper();
      if (success) {
        this.showFeedback('AutoClipper purchased!', 'success');
        this.gameState.emit('purchase', { item: 'AutoClipper' });
      } else {
        this.showFeedback('Cannot afford AutoClipper', 'error');
        this.gameState.emit('insufficient', { resource: 'funds', action: 'buy AutoClipper' });
      }
    }
  }

  /**
   * Buy MegaClipper
   */
  buyMegaClipper(event, element) {
    if (this.systems.production) {
      const success = this.systems.production.buyMegaClipper();
      if (success) {
        this.showFeedback('MegaClipper purchased!', 'success');
      } else {
        this.showFeedback('Cannot afford MegaClipper', 'error');
      }
    }
  }

  /**
   * Raise clip price
   */
  raisePrice(event, element) {
    if (this.systems.market) {
      this.systems.market.raisePrice();
    }
  }

  /**
   * Lower clip price
   */
  lowerPrice(event, element) {
    if (this.systems.market) {
      const success = this.systems.market.lowerPrice();
      if (!success) {
        this.showFeedback('Price cannot go lower', 'warning');
      }
    }
  }

  /**
   * Buy advertising
   */
  buyAds(event, element) {
    if (this.systems.market) {
      const success = this.systems.market.buyMarketing();
      if (success) {
        this.showFeedback('Marketing purchased!', 'success');
      } else {
        this.showFeedback('Cannot afford marketing', 'error');
      }
    }
  }

  /**
   * Buy wire
   */
  buyWire(event, element) {
    if (this.systems.market) {
      const success = this.systems.market.buyWire();
      if (success) {
        this.showFeedback('Wire purchased!', 'success');
      } else {
        this.showFeedback('Cannot afford wire', 'error');
      }
    }
  }

  /**
   * Toggle wire buyer
   */
  toggleWireBuyer(event, element) {
    if (this.systems.market) {
      const enabled = this.systems.market.toggleWireBuyer();
      this.showFeedback(`Wire buyer ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }
  }

  /**
   * Buy processor
   */
  buyProcessor(event, element) {
    if (this.systems.computing) {
      const success = this.systems.computing.buyProcessor();
      if (success) {
        this.showFeedback('Processor purchased!', 'success');
      } else {
        this.showFeedback('Cannot afford processor or trust limit reached', 'error');
      }
    }
  }

  /**
   * Buy memory
   */
  buyMemory(event, element) {
    if (this.systems.computing) {
      const success = this.systems.computing.buyMemory();
      if (success) {
        this.showFeedback('Memory purchased!', 'success');
      } else {
        this.showFeedback('Cannot afford memory or trust limit reached', 'error');
      }
    }
  }

  /**
   * Toggle creativity allocation
   */
  toggleCreativity(event, element) {
    if (this.systems.computing) {
      const enabled = !this.gameState.get('computing.creativity.enabled');
      this.systems.computing.setCreativity(enabled, 50);
      this.showFeedback(`Creativity ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }
  }

  /**
   * Adjust creativity allocation
   */
  adjustCreativity(event, element) {
    if (this.systems.computing) {
      const value = parseInt(element.value, 10);
      this.systems.computing.setCreativity(true, value);
    }
  }

  /**
   * Allocate probe statistics
   */
  allocateProbeStats(event, element) {
    if (this.systems.combat) {
      const combatEl = document.getElementById('probeCombat');
      const speedEl = document.getElementById('probeSpeed');
      const replicationEl = document.getElementById('probeReplication');

      const combat = combatEl ? parseInt(combatEl.value, 10) : 0;
      const speed = speedEl ? parseInt(speedEl.value, 10) : 0;
      const replication = replicationEl ? parseInt(replicationEl.value, 10) : 0;

      const success = this.systems.combat.allocateProbeStats(combat, speed, replication);
      if (success) {
        this.showFeedback('Probe stats allocated', 'success');
      } else {
        this.showFeedback('Stats must total 100%', 'error');
      }
    }
  }

  /**
   * Toggle combat mode
   */
  toggleCombat(event, element) {
    if (this.systems.combat) {
      const enabled = !this.gameState.get('combat.battleEnabled');
      if (enabled) {
        this.systems.combat.enableCombat();
      } else {
        this.systems.combat.disableCombat();
      }
      this.showFeedback(`Combat ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }
  }

  /**
   * Complete project
   */
  completeProject(event, element) {
    if (this.systems.projects) {
      const projectId = element.dataset.projectId;
      const success = this.systems.projects.completeProject(projectId);
      if (success) {
        this.showFeedback('Project completed!', 'success');
      } else {
        this.showFeedback('Cannot complete project', 'error');
      }
    }
  }

  /**
   * Save game
   */
  saveGame(event, element) {
    const success = this.gameState.save();
    if (success) {
      this.showFeedback('Game saved!', 'success');
    } else {
      this.showFeedback('Save failed!', 'error');
    }
  }

  /**
   * Load game
   */
  loadGame(event, element) {
    const success = this.gameState.load();
    if (success) {
      this.showFeedback('Game loaded!', 'success');
    } else {
      this.showFeedback('Load failed!', 'error');
    }
  }

  /**
   * Reset game with confirmation
   */
  resetGame(event, element) {
    if (confirm('Are you sure you want to reset the game? This cannot be undone.')) {
      this.gameState.reset();
      this.showFeedback('Game reset!', 'info');
    }
  }

  /**
   * Confirm reset (for keyboard shortcut)
   */
  confirmReset() {
    if (confirm('Reset game? Press OK to confirm, Cancel to continue playing.')) {
      this.resetGame();
    }
  }

  /**
   * Export save data
   */
  exportSave(event, element) {
    try {
      const saveData = this.gameState.export();

      // Create download link
      const blob = new Blob([saveData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paperclips-save-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      this.showFeedback('Save exported!', 'success');
    } catch (error) {
      errorHandler.handleError(error, 'events.exportSave');
      this.showFeedback('Export failed!', 'error');
    }
  }

  /**
   * Import save data
   */
  importSave(event, element) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const success = this.gameState.import(e.target.result);
          if (success) {
            this.showFeedback('Save imported!', 'success');
          } else {
            this.showFeedback('Import failed!', 'error');
          }
        } catch (error) {
          errorHandler.handleError(error, 'events.importSave');
          this.showFeedback('Invalid save file!', 'error');
        }
      };
      reader.readAsText(file);
    };

    fileInput.click();
  }

  /**
   * Show achievements panel
   */
  showAchievements(event, element) {
    try {
      // Import at runtime to avoid circular dependencies
      import('./achievementUI.js').then(({ achievementUI }) => {
        achievementUI.showPanel();
      });
    } catch (error) {
      errorHandler.handleError(error, 'events.showAchievements');
      this.showFeedback('Error opening achievements!', 'error');
    }
  }

  /**
   * Show user feedback message
   */
  showFeedback(message, type = 'info') {
    // Create or update feedback element
    let feedbackElement = document.getElementById('feedback');
    if (!feedbackElement) {
      feedbackElement = document.createElement('div');
      feedbackElement.id = 'feedback';
      feedbackElement.className = 'feedback';
      document.body.appendChild(feedbackElement);
    }

    feedbackElement.textContent = message;
    feedbackElement.className = `feedback ${type}`;
    feedbackElement.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
      feedbackElement.style.display = 'none';
    }, 3000);
  }

  /**
   * Add custom event handler
   */
  addHandler(action, handler) {
    this.handlers.set(action, handler);
  }

  /**
   * Remove event handler
   */
  removeHandler(action) {
    this.handlers.delete(action);
  }

  /**
   * Add keyboard shortcut
   */
  addShortcut(key, handler) {
    this.shortcuts.set(key, handler);
  }

  /**
   * Remove keyboard shortcut
   */
  removeShortcut(key) {
    this.shortcuts.delete(key);
  }

  /**
   * Get event system statistics
   */
  getStats() {
    return {
      handlers: this.handlers.size,
      shortcuts: this.shortcuts.size,
      activeEvents: ['click', 'change', 'input', 'keydown'].length
    };
  }

  /**
   * Cleanup event listeners
   */
  cleanup() {
    document.removeEventListener('click', this.boundHandlers.click);
    document.removeEventListener('change', this.boundHandlers.change);
    document.removeEventListener('input', this.boundHandlers.input);
    document.removeEventListener('keydown', this.boundHandlers.keydown);

    errorHandler.info('Events system cleaned up');
  }
}

export default EventsSystem;
