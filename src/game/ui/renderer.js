/**
 * Renderer for Universal Paperclips
 *
 * Handles DOM updates and UI rendering with efficient batching
 * to maintain 60 FPS performance.
 */

import {
  formatNumber,
  formatCurrency,
  formatRate,
  formatDuration
} from '../../utils/formatting.js';
import { errorHandler } from '../core/errorHandler.js';
import { performanceMonitor } from '../core/performanceMonitor.js';
import { PERFORMANCE } from '../core/constants.js';

export class Renderer {
  constructor(gameState) {
    this.gameState = gameState;

    // DOM element cache
    this.elements = new Map();

    // Update batching
    this.pendingUpdates = new Map();
    this.maxUpdatesPerFrame = PERFORMANCE.MAX_DOM_UPDATES_PER_FRAME;

    // Element selectors and their update functions
    this.elementUpdaters = this.initializeElementUpdaters();

    // Cache frequently accessed elements
    this.cacheElements();

    // Bind methods
    this.render = errorHandler.createErrorBoundary(this.render.bind(this), 'renderer.render');
  }

  /**
   * Initialize element updaters mapping
   */
  initializeElementUpdaters() {
    return {
      // Resource displays
      clips: (element, value) => {
        element.textContent = formatNumber(value);
      },
      funds: (element, value) => {
        element.textContent = formatCurrency(value);
      },
      wire: (element, value) => {
        element.textContent = formatNumber(Math.floor(value));
      },
      unsoldClips: (element, value) => {
        element.textContent = formatNumber(value);
      },

      // Production displays
      clipRate: (element, value) => {
        element.textContent = formatRate(value, 'clips');
      },
      autoClippers: (element, value) => {
        element.textContent = formatNumber(value);
      },
      megaClippers: (element, value) => {
        element.textContent = formatNumber(value);
      },
      factories: (element, value) => {
        element.textContent = formatNumber(value);
      },

      // Market displays
      margin: (element, value) => {
        element.textContent = formatCurrency(value, true);
      },
      demand: (element, value) => {
        element.textContent = value.toFixed(2) + '%';
      },
      marketing: (element, value) => {
        element.textContent = formatNumber(value);
      },
      avgRev: (element, value) => {
        element.textContent = formatCurrency(value);
      },

      // Computing displays
      operations: (element, value) => {
        element.textContent = formatNumber(Math.floor(value));
      },
      creativity: (element, value) => {
        element.textContent = formatNumber(Math.floor(value));
      },
      processors: (element, value) => {
        element.textContent = formatNumber(value);
      },
      memory: (element, value) => {
        element.textContent = formatNumber(value);
      },
      trust: (element, value) => {
        element.textContent = formatNumber(value);
      },

      // Combat displays
      honor: (element, value) => {
        element.textContent = formatNumber(value);
      },
      probes: (element, value) => {
        element.textContent = formatNumber(value);
      },

      // Cost displays
      autoClipperCost: (element, value) => {
        element.textContent = formatCurrency(value);
      },
      megaClipperCost: (element, value) => {
        element.textContent = formatCurrency(value);
      },
      wireCost: (element, value) => {
        element.textContent = formatCurrency(value);
      },
      adCost: (element, value) => {
        element.textContent = formatCurrency(value);
      },
      processorCost: (element, value) => {
        element.textContent = formatNumber(value) + ' ops';
      },
      memoryCost: (element, value) => {
        element.textContent = formatNumber(value) + ' ops';
      },
      achievementCount: (element, value) => {
        element.textContent = `(${value.unlocked}/${value.total})`;
      }
    };
  }

  /**
   * Cache frequently accessed DOM elements
   */
  cacheElements() {
    const elementIds = Object.keys(this.elementUpdaters);

    for (const id of elementIds) {
      const element = document.getElementById(id);
      if (element) {
        this.elements.set(id, element);
      }
    }

    errorHandler.debug(`Cached ${this.elements.size} DOM elements`);
  }

  /**
   * Queue an element update for batching
   */
  queueUpdate(elementId, value) {
    this.pendingUpdates.set(elementId, value);
  }

  /**
   * Process batched DOM updates
   */
  processBatchedUpdates() {
    const updates = Array.from(this.pendingUpdates.entries());
    const maxUpdates = Math.min(updates.length, this.maxUpdatesPerFrame);

    for (let i = 0; i < maxUpdates; i++) {
      const [elementId, value] = updates[i];
      this.updateElement(elementId, value);
      this.pendingUpdates.delete(elementId);
    }

    // Return true if there are more updates pending
    return this.pendingUpdates.size > 0;
  }

  /**
   * Update a single DOM element
   */
  updateElement(elementId, value) {
    const element = this.elements.get(elementId);
    const updater = this.elementUpdaters[elementId];

    if (!element || !updater) {
      return;
    }

    try {
      updater(element, value);
    } catch (error) {
      errorHandler.handleError(error, `renderer.updateElement.${elementId}`, { value });
    }
  }

  /**
   * Update resource displays
   */
  updateResources() {
    this.queueUpdate('clips', this.gameState.get('resources.clips'));
    this.queueUpdate('funds', this.gameState.get('resources.funds'));
    this.queueUpdate('wire', this.gameState.get('resources.wire'));
    this.queueUpdate('unsoldClips', this.gameState.get('resources.unsoldClips'));
  }

  /**
   * Update production displays
   */
  updateProduction() {
    this.queueUpdate('clipRate', this.gameState.get('production.clipRate'));
    this.queueUpdate('autoClippers', this.gameState.get('manufacturing.clipmakers.level'));
    this.queueUpdate('megaClippers', this.gameState.get('manufacturing.megaClippers.level'));
    this.queueUpdate('factories', this.gameState.get('manufacturing.factories.level'));
  }

  /**
   * Update market displays
   */
  updateMarket() {
    this.queueUpdate('margin', this.gameState.get('market.pricing.margin'));
    this.queueUpdate('demand', this.gameState.get('market.demand'));
    this.queueUpdate('marketing', this.gameState.get('market.marketing.level'));
    this.queueUpdate('avgRev', this.gameState.get('market.sales.avgRevenue'));
    this.queueUpdate('wireCost', this.gameState.get('market.pricing.wireCost'));
  }

  /**
   * Update computing displays
   */
  updateComputing() {
    this.queueUpdate('operations', this.gameState.get('computing.operations'));
    this.queueUpdate('creativity', this.gameState.get('computing.creativity.amount'));
    this.queueUpdate('processors', this.gameState.get('computing.processors'));
    this.queueUpdate('memory', this.gameState.get('computing.memory'));
    this.queueUpdate('trust', this.gameState.get('computing.trust.current'));
  }

  /**
   * Update combat displays
   */
  updateCombat() {
    this.queueUpdate('honor', this.gameState.get('combat.honor'));
    this.queueUpdate('probes', this.gameState.get('space.probes.count'));
  }

  /**
   * Update cost displays
   */
  updateCosts() {
    this.queueUpdate('autoClipperCost', this.gameState.get('manufacturing.clipmakers.cost'));
    this.queueUpdate('megaClipperCost', this.gameState.get('manufacturing.megaClippers.cost'));
    this.queueUpdate('adCost', this.gameState.get('market.pricing.adCost'));

    // Calculate dynamic costs
    const processors = this.gameState.get('computing.processors');
    const memory = this.gameState.get('computing.memory');

    this.queueUpdate('processorCost', Math.pow(2, processors) * 1000);
    this.queueUpdate('memoryCost', Math.pow(2, memory) * 1000);
  }

  /**
   * Update button states (enabled/disabled)
   */
  updateButtonStates() {
    this.updateButtonState('buyAutoClipper', this.canAffordAutoClipper());
    this.updateButtonState('buyMegaClipper', this.canAffordMegaClipper());
    this.updateButtonState('buyWire', this.canAffordWire());
    this.updateButtonState('buyAds', this.canAffordAds());
    this.updateButtonState('buyProcessor', this.canAffordProcessor());
    this.updateButtonState('buyMemory', this.canAffordMemory());
  }

  /**
   * Update individual button state
   */
  updateButtonState(buttonId, canAfford) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = !canAfford;
      button.className = canAfford ? 'button' : 'button disabled';
    }
  }

  /**
   * Check if player can afford AutoClipper
   */
  canAffordAutoClipper() {
    const funds = this.gameState.get('resources.funds');
    const cost = this.gameState.get('manufacturing.clipmakers.cost');
    return funds >= cost;
  }

  /**
   * Check if player can afford MegaClipper
   */
  canAffordMegaClipper() {
    const funds = this.gameState.get('resources.funds');
    const cost = this.gameState.get('manufacturing.megaClippers.cost');
    return funds >= cost;
  }

  /**
   * Check if player can afford wire
   */
  canAffordWire() {
    const funds = this.gameState.get('resources.funds');
    const cost = this.gameState.get('market.pricing.wireCost');
    return funds >= cost;
  }

  /**
   * Check if player can afford advertising
   */
  canAffordAds() {
    const funds = this.gameState.get('resources.funds');
    const cost = this.gameState.get('market.pricing.adCost');
    return funds >= cost;
  }

  /**
   * Check if player can afford processor
   */
  canAffordProcessor() {
    const operations = this.gameState.get('computing.operations');
    const processors = this.gameState.get('computing.processors');
    const trust = this.gameState.get('computing.trust.current');
    const cost = Math.pow(2, processors) * 1000;

    return operations >= cost && processors < trust;
  }

  /**
   * Check if player can afford memory
   */
  canAffordMemory() {
    const operations = this.gameState.get('computing.operations');
    const memory = this.gameState.get('computing.memory');
    const trust = this.gameState.get('computing.trust.current');
    const cost = Math.pow(2, memory) * 1000;

    return operations >= cost && memory < trust;
  }

  /**
   * Update UI sections based on game flags
   */
  updateSectionVisibility() {
    const flags = this.gameState.get('gameState.flags');

    this.toggleSection('businessDiv', flags.autoClipper >= 1);
    this.toggleSection('projectsDiv', flags.projects >= 1);
    this.toggleSection('manufactureDiv', flags.megaClipper >= 1);
    this.toggleSection('computeDiv', flags.comp >= 1);
    this.toggleSection('investmentDiv', flags.investment >= 1);
    this.toggleSection('spaceDiv', flags.space >= 1);
    this.toggleSection('combatDiv', flags.space >= 1 && this.gameState.get('combat.battleEnabled'));
  }

  /**
   * Toggle section visibility
   */
  toggleSection(sectionId, visible) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Update projects display
   */
  updateProjects() {
    const projectsContainer = document.getElementById('projectList');
    if (!projectsContainer) return;

    // This would be implemented to show available projects
    // For now, just clear the container
    projectsContainer.innerHTML = '';
  }

  /**
   * Update achievements display
   */
  updateAchievements() {
    // Update achievement count in the button
    const achievements = this.gameState.get('achievements');
    if (achievements) {
      const stats = achievements.stats || { totalUnlocked: 0 };
      const totalAchievements = Object.keys(window.achievementSystem?.achievements || {}).length;

      this.queueUpdate('achievementCount', {
        unlocked: stats.totalUnlocked,
        total: totalAchievements
      });
    }
  }

  /**
   * Create performance display
   */
  updatePerformanceDisplay() {
    const perfElement = document.getElementById('performanceDisplay');
    if (!perfElement) return;

    const report = performanceMonitor.getReport();

    perfElement.innerHTML = `
      <div class="performance-stats">
        <div>FPS: ${report.fps.current}</div>
        <div>Memory: ${report.memory.usedMB}MB</div>
        <div>Frame Time: ${report.gameLoop.totalTime}ms</div>
      </div>
    `;
  }

  /**
   * Main render method
   */
  render(timestamp, deltaTime) {
    performanceMonitor.measure(() => {
      // Update all display sections
      this.updateResources();
      this.updateProduction();
      this.updateMarket();
      this.updateComputing();
      this.updateCombat();
      this.updateCosts();
      this.updateButtonStates();
      this.updateSectionVisibility();
      this.updateProjects();
      this.updateAchievements();

      // Process batched DOM updates
      const hasMoreUpdates = this.processBatchedUpdates();

      // Update performance display (less frequently)
      if (timestamp % 1000 < 16) {
        // Roughly once per second
        this.updatePerformanceDisplay();
      }

      // Log if we have a backlog of updates
      if (hasMoreUpdates && this.pendingUpdates.size > 50) {
        errorHandler.warn(`Renderer backlog: ${this.pendingUpdates.size} pending updates`);
      }
    }, 'renderer.render');
  }

  /**
   * Force update all elements immediately
   */
  forceUpdate() {
    // Clear pending updates and update everything immediately
    this.pendingUpdates.clear();

    this.updateResources();
    this.updateProduction();
    this.updateMarket();
    this.updateComputing();
    this.updateCombat();
    this.updateCosts();
    this.updateButtonStates();
    this.updateSectionVisibility();

    // Process all updates without batching
    const allUpdates = Array.from(this.pendingUpdates.entries());
    for (const [elementId, value] of allUpdates) {
      this.updateElement(elementId, value);
    }

    this.pendingUpdates.clear();

    errorHandler.debug('Forced complete UI update');
  }

  /**
   * Refresh element cache
   */
  refreshCache() {
    this.elements.clear();
    this.cacheElements();
  }

  /**
   * Get renderer statistics
   */
  getStats() {
    return {
      cachedElements: this.elements.size,
      pendingUpdates: this.pendingUpdates.size,
      maxUpdatesPerFrame: this.maxUpdatesPerFrame,
      availableUpdaters: Object.keys(this.elementUpdaters).length
    };
  }

  /**
   * Reset renderer
   */
  reset() {
    this.pendingUpdates.clear();
    this.refreshCache();

    errorHandler.info('Renderer reset');
  }
}

export default Renderer;
