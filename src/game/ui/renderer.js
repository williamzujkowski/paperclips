/**
 * UI Renderer - handles all display updates and DOM manipulation
 * @module UIRenderer
 */

import { formatNumber } from '../utils/formatting.js';
import { domBatcher } from './domBatcher.js';
import { errorHandler } from '../core/errorHandler.js';

/**
 * @class UIRenderer
 * @description Manages UI updates with efficient DOM batching and caching.
 */
export class UIRenderer {
  /**
   * Creates a new UIRenderer instance
   * @constructor
   */
  constructor() {
    /** @type {Object} Cached DOM elements */
    this.elements = {};
    /** @type {Object} Last rendered values for change detection */
    this.lastValues = {};
    /** @type {boolean} Whether renderer is initialized */
    this.initialized = false;
    /** @type {number} Update counter for debugging */
    this.updateCount = 0;
  }

  /**
   * Initialize UI elements cache
   */
  init() {
    // Cache commonly used DOM elements
    this.cacheElements();
    this.initialized = true;
  }

  /**
   * Cache DOM element references
   */
  cacheElements() {
    // Resource displays
    this.elements.clips = document.getElementById('clips');
    this.elements.funds = document.getElementById('funds');
    this.elements.wire = document.getElementById('wire');
    this.elements.unsoldClips = document.getElementById('unsoldClips');

    // Production displays
    this.elements.clipRate = document.getElementById('clipRate');
    this.elements.clipmakerLevel = document.getElementById('clipmakerLevel');
    this.elements.megaClipperLevel = document.getElementById('megaClipperLevel');

    // Market displays
    this.elements.demand = document.getElementById('demand');
    this.elements.margin = document.getElementById('margin');
    this.elements.marketingLvl = document.getElementById('marketingLvl');
    this.elements.wireCost = document.getElementById('wireCost');

    // Computing displays
    this.elements.operations = document.getElementById('operations');
    this.elements.trust = document.getElementById('trust');
    this.elements.processors = document.getElementById('processors');
    this.elements.memory = document.getElementById('memory');
    this.elements.creativity = document.getElementById('creativity');

    // Infrastructure displays
    this.elements.factoryLevel = document.getElementById('factoryLevel');
    this.elements.harvesterLevel = document.getElementById('harvesterLevel');
    this.elements.wireDroneLevel = document.getElementById('wireDroneLevel');

    // Display sections
    this.elements.businessDisplay = document.getElementById('businessDisplay');
    this.elements.manufacturingDisplay = document.getElementById('manufacturingDisplay');
    this.elements.computationalDisplay = document.getElementById('computationalDisplay');
    this.elements.projectsDisplay = document.getElementById('projectsDisplay');
    this.elements.spaceDisplay = document.getElementById('spaceDisplay');
  }

  /**
   * Main render function - updates all UI elements
   * @param {Object} state - Current game state
   * @returns {void}
   */
  render(state) {
    if (!this.initialized) {
      this.init();
    }

    // Batch all DOM updates together
    domBatcher.batch(() => {
      try {
        // Update resources
        this.updateResources(state);

        // Update production
        this.updateProduction(state);

        // Update market
        this.updateMarket(state);

        // Update computing
        this.updateComputing(state);

        // Update infrastructure
        this.updateInfrastructure(state);

        // Update display visibility
        this.updateDisplayVisibility(state);
      } catch (error) {
        errorHandler.handleError(error, 'uiRenderer.render');
      }
    });
  }

  /**
   * Update resource displays
   */
  updateResources(state) {
    this.updateElement('clips', state.resources.clips);
    this.updateElement('funds', state.resources.funds, true);
    this.updateElement('wire', state.resources.wire);
    this.updateElement('unsoldClips', state.resources.unsoldClips);
  }

  /**
   * Update production displays
   */
  updateProduction(state) {
    this.updateElement('clipRate', state.production.clipRate);
    this.updateElement('clipmakerLevel', state.production.clipmakerLevel);
    this.updateElement('megaClipperLevel', state.production.megaClipperLevel);
  }

  /**
   * Update market displays
   */
  updateMarket(state) {
    this.updateElement('demand', state.market.demand, false, 1);
    this.updateElement('margin', state.market.margin, true);
    this.updateElement('marketingLvl', state.market.marketingLvl);
    this.updateElement('wireCost', state.market.wireCost, true);
  }

  /**
   * Update computing displays
   */
  updateComputing(state) {
    this.updateElement('operations', state.computing.operations);
    this.updateElement('trust', state.computing.trust);
    this.updateElement('processors', state.computing.processors);
    this.updateElement('memory', state.computing.memory);
    this.updateElement('creativity', state.computing.creativity);
  }

  /**
   * Update infrastructure displays
   */
  updateInfrastructure(state) {
    if (state.flags.factory) {
      this.updateElement('factoryLevel', state.infrastructure.factoryLevel);
    }
    if (state.flags.harvester) {
      this.updateElement('harvesterLevel', state.infrastructure.harvesterLevel);
    }
    if (state.flags.wireDrone) {
      this.updateElement('wireDroneLevel', state.infrastructure.wireDroneLevel);
    }
  }

  /**
   * Update a single element if value changed
   */
  updateElement(elementId, value, isCurrency = false, decimals = 0) {
    // Check if value has changed
    if (this.lastValues[elementId] === value) {
      return;
    }

    const element = this.elements[elementId];
    if (!element) {
      return;
    }

    // Format value
    let displayValue;
    if (isCurrency) {
      displayValue = '$' + formatNumber(value, decimals);
    } else {
      displayValue = formatNumber(value, decimals);
    }

    // Update element using DOM batcher
    domBatcher.updateText(elementId, displayValue);
    this.lastValues[elementId] = value;
    this.updateCount++;
  }

  /**
   * Update display section visibility
   */
  updateDisplayVisibility(state) {
    // Business display (always visible)
    this.setDisplayVisible('businessDisplay', true);

    // Manufacturing display (when auto-clippers available)
    this.setDisplayVisible('manufacturingDisplay', state.flags.autoClipper);

    // Computational display (when trust unlocked)
    this.setDisplayVisible('computationalDisplay', state.flags.trust);

    // Projects display (when projects available)
    this.setDisplayVisible('projectsDisplay', state.flags.projects);

    // Space display (when space exploration unlocked)
    this.setDisplayVisible('spaceDisplay', state.flags.space);
  }

  /**
   * Set display visibility
   */
  setDisplayVisible(displayId, visible) {
    // Update visibility through DOM batcher
    // Note: Using inline update for display blocks since they need 'block' not ''
    const element = this.elements[displayId];
    if (element) {
      domBatcher.updateStyles(displayId, { display: visible ? 'block' : 'none' });
    }
  }

  /**
   * Show notification message
   */
  showNotification(message, duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => {
      notification.classList.add('visible');
    }, 10);

    // Remove after duration
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, duration);
  }

  /**
   * Update button states (enabled/disabled)
   */
  updateButtonStates(state) {
    // Make Paperclip button
    const makeClipBtn = document.getElementById('btnMakePaperclip');
    if (makeClipBtn) {
      makeClipBtn.disabled = state.resources.wire < 1;
    }

    // Buy Wire button
    const buyWireBtn = document.getElementById('btnBuyWire');
    if (buyWireBtn) {
      const wireCost = state.market.wireCost;
      buyWireBtn.disabled = state.resources.funds < wireCost;
    }

    // Buy Auto-Clipper button
    const buyClipperBtn = document.getElementById('btnBuyAutoClipper');
    if (buyClipperBtn) {
      const clipperCost = state.market.clipperCost;
      buyClipperBtn.disabled = state.resources.funds < clipperCost;
    }
  }

  /**
   * Flash an element to draw attention
   */
  /**
   * Flash element with color animation
   * @param {string} elementId - Element to flash
   * @param {string} [color='#ffff00'] - Flash color
   * @returns {void}
   */
  flashElement(elementId, color = '#ffff00') {
    const element = this.elements[elementId] || document.getElementById(elementId);
    if (!element) {
      return;
    }

    const originalColor = element.style.backgroundColor;

    // Use DOM batcher for style updates
    domBatcher.updateStyles(elementId, {
      backgroundColor: color,
      transition: 'background-color 0.3s',
    });

    setTimeout(() => {
      domBatcher.updateStyles(elementId, {
        backgroundColor: originalColor,
      });
    }, 300);
  }

  /**
   * Clean up cached elements that are no longer in DOM
   * @returns {number} Number of cleaned elements
   */
  cleanupStaleElements() {
    let cleaned = 0;
    
    for (const [key, element] of Object.entries(this.elements)) {
      if (element && !document.body.contains(element)) {
        this.elements[key] = null;
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * Clear all cached data
   */
  reset() {
    this.elements = {};
    this.lastValues = {};
    this.updateCount = 0;
    this.initialized = false;
  }
}

// Create singleton instance
export const uiRenderer = new UIRenderer();

// Export for debugging
if (typeof window !== 'undefined') {
  window.UniversalPaperclipsRenderer = uiRenderer;
}
