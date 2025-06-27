/**
 * DOM Batching system for efficient updates
 * @module DOMBatcher
 */

import { errorHandler } from '../core/errorHandler.js';

/**
 * @class DOMBatcher
 * @description Batches DOM updates to minimize reflows and repaints.
 * Uses requestAnimationFrame to schedule updates at optimal times.
 */
export class DOMBatcher {
  /**
   * Creates a new DOMBatcher instance
   * @constructor
   */
  constructor() {
    /** @type {Map<string, Function>} Pending DOM updates */
    this.pendingUpdates = new Map();
    /** @type {Map<string, Function>} Pending style updates */
    this.pendingStyles = new Map();
    /** @type {Map<string, Function>} Pending class updates */
    this.pendingClasses = new Map();
    /** @type {Set<string>} Elements to show/hide */
    this.pendingVisibility = new Set();
    /** @type {number|null} Current animation frame ID */
    this.frameId = null;
    /** @type {boolean} Whether batching is enabled */
    this.enabled = true;
    /** @type {Map<string, HTMLElement>} Element cache */
    this.elementCache = new Map();
    /** @type {number} Cache hit/miss statistics */
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Get element by ID with caching
   * @param {string} elementId - Element ID
   * @returns {HTMLElement|null} The element or null
   * @private
   */
  getElement(elementId) {
    let element = this.elementCache.get(elementId);

    if (!element || !document.body.contains(element)) {
      element = document.getElementById(elementId);
      if (element) {
        this.elementCache.set(elementId, element);
        this.cacheMisses++;
      }
    } else {
      this.cacheHits++;
    }

    return element;
  }

  /**
   * Queue a text content update
   * @param {string} elementId - Element ID
   * @param {string} text - New text content
   * @returns {void}
   */
  updateText(elementId, text) {
    if (!this.enabled) {
      const element = this.getElement(elementId);
      if (element && element.textContent !== text) {
        element.textContent = text;
      }
      return;
    }

    this.pendingUpdates.set(elementId, () => {
      const element = this.getElement(elementId);
      if (element && element.textContent !== text) {
        element.textContent = text;
      }
    });

    this.scheduleUpdate();
  }

  /**
   * Queue an innerHTML update
   * @param {string} elementId - Element ID
   * @param {string} html - New HTML content
   * @returns {void}
   */
  updateHTML(elementId, html) {
    if (!this.enabled) {
      const element = this.getElement(elementId);
      if (element && element.innerHTML !== html) {
        element.innerHTML = html;
      }
      return;
    }

    this.pendingUpdates.set(elementId, () => {
      const element = this.getElement(elementId);
      if (element && element.innerHTML !== html) {
        element.innerHTML = html;
      }
    });

    this.scheduleUpdate();
  }

  /**
   * Queue a style update
   * @param {string} elementId - Element ID
   * @param {Object} styles - Style properties to update
   * @returns {void}
   */
  updateStyles(elementId, styles) {
    if (!this.enabled) {
      const element = this.getElement(elementId);
      if (element) {
        Object.assign(element.style, styles);
      }
      return;
    }

    this.pendingStyles.set(elementId, () => {
      const element = this.getElement(elementId);
      if (element) {
        Object.assign(element.style, styles);
      }
    });

    this.scheduleUpdate();
  }

  /**
   * Queue a class list update
   * @param {string} elementId - Element ID
   * @param {Object} classes - Classes to add/remove {add: [], remove: []}
   * @returns {void}
   */
  updateClasses(elementId, classes) {
    if (!this.enabled) {
      const element = this.getElement(elementId);
      if (element) {
        if (classes.add) {
          element.classList.add(...classes.add);
        }
        if (classes.remove) {
          element.classList.remove(...classes.remove);
        }
      }
      return;
    }

    this.pendingClasses.set(elementId, () => {
      const element = this.getElement(elementId);
      if (element) {
        if (classes.add) {
          element.classList.add(...classes.add);
        }
        if (classes.remove) {
          element.classList.remove(...classes.remove);
        }
      }
    });

    this.scheduleUpdate();
  }

  /**
   * Queue visibility update
   * @param {string} elementId - Element ID
   * @param {boolean} visible - Whether element should be visible
   * @returns {void}
   */
  updateVisibility(elementId, visible) {
    if (!this.enabled) {
      const element = this.getElement(elementId);
      if (element) {
        element.style.display = visible ? '' : 'none';
      }
      return;
    }

    this.pendingVisibility.add(JSON.stringify({ elementId, visible }));
    this.scheduleUpdate();
  }

  /**
   * Schedule a batch update
   * @private
   */
  scheduleUpdate() {
    if (this.frameId !== null) {
      return; // Update already scheduled
    }

    this.frameId = requestAnimationFrame(() => {
      this.flush();
    });
  }

  /**
   * Flush all pending updates
   * @returns {void}
   */
  flush() {
    try {
      // Clear frame ID first
      this.frameId = null;

      // Batch read operations first (measure)
      const measurements = new Map();

      // Then batch write operations (mutate)

      // 1. Update visibility first (can affect layout)
      for (const data of this.pendingVisibility) {
        const { elementId, visible } = JSON.parse(data);
        const element = this.getElement(elementId);
        if (element) {
          element.style.display = visible ? '' : 'none';
        }
      }
      this.pendingVisibility.clear();

      // 2. Update styles (can affect layout)
      for (const [elementId, updateFn] of this.pendingStyles) {
        updateFn();
      }
      this.pendingStyles.clear();

      // 3. Update classes (can affect layout)
      for (const [elementId, updateFn] of this.pendingClasses) {
        updateFn();
      }
      this.pendingClasses.clear();

      // 4. Update content last (least likely to affect other elements)
      for (const [elementId, updateFn] of this.pendingUpdates) {
        updateFn();
      }
      this.pendingUpdates.clear();
    } catch (error) {
      errorHandler.handleError(error, 'domBatcher.flush');
    }
  }

  /**
   * Enable or disable batching
   * @param {boolean} enabled - Whether to enable batching
   * @returns {void}
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.flush(); // Flush any pending updates
    }
  }

  /**
   * Clear element cache
   * @returns {void}
   */
  clearCache() {
    this.elementCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: total > 0 ? ((this.cacheHits / total) * 100).toFixed(2) + '%' : '0%',
      size: this.elementCache.size,
    };
  }

  /**
   * Batch multiple updates together
   * @param {Function} updateFn - Function containing multiple updates
   * @returns {void}
   */
  batch(updateFn) {
    const wasEnabled = this.enabled;
    this.enabled = true;

    try {
      updateFn();
    } catch (error) {
      errorHandler.handleError(error, 'domBatcher.batch');
    } finally {
      if (!wasEnabled) {
        this.flush();
        this.enabled = false;
      }
    }
  }

  /**
   * Read layout property safely
   * @param {string} elementId - Element ID
   * @param {string} property - Property to read
   * @returns {*} Property value
   */
  read(elementId, property) {
    const element = this.getElement(elementId);
    if (!element) {
      return null;
    }

    // Common layout properties that trigger reflow
    const layoutProperties = [
      'offsetWidth',
      'offsetHeight',
      'offsetTop',
      'offsetLeft',
      'clientWidth',
      'clientHeight',
      'clientTop',
      'clientLeft',
      'scrollWidth',
      'scrollHeight',
      'scrollTop',
      'scrollLeft',
      'getBoundingClientRect',
    ];

    if (layoutProperties.includes(property)) {
      // These properties trigger reflow, so flush pending updates first
      this.flush();
    }

    if (property === 'getBoundingClientRect') {
      return element.getBoundingClientRect();
    }

    return element[property];
  }
}

// Create singleton instance
export const domBatcher = new DOMBatcher();

// Export for debugging
if (typeof window !== 'undefined') {
  window.UniversalPaperclipsDOMBatcher = domBatcher;
}
