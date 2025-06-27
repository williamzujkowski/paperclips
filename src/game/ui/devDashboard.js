/**
 * Development Dashboard for debugging and monitoring
 * @module DevDashboard
 */

import { gameState } from '../core/gameState.js';
import { errorHandler } from '../core/errorHandler.js';
import { performanceMonitor } from '../core/performanceMonitor.js';
import { memoryMonitor } from '../core/memoryMonitor.js';
import { memoryProfiler } from '../utils/memoryProfiler.js';
import { domBatcher } from './domBatcher.js';
import { formatNumber } from '../utils/formatting.js';

/**
 * @class DevDashboard
 * @description Development dashboard for monitoring game state, performance, and debugging.
 */
export class DevDashboard {
  /**
   * Creates a new DevDashboard instance
   * @constructor
   */
  constructor() {
    /** @type {boolean} Whether dashboard is visible */
    this.visible = false;
    /** @type {HTMLElement|null} Dashboard container */
    this.container = null;
    /** @type {number} Update interval ID */
    this.updateInterval = null;
    /** @type {Object} Dashboard panels */
    this.panels = {};
    /** @type {boolean} Whether dashboard is initialized */
    this.initialized = false;
  }

  /**
   * Initialize the dashboard
   * @returns {void}
   */
  init() {
    if (this.initialized) {
      return;
    }

    // Create dashboard HTML
    this.createDashboard();

    // Set up keyboard shortcut (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });

    this.initialized = true;
    errorHandler.info('Dev dashboard initialized (Ctrl+Shift+D to toggle)');
  }

  /**
   * Create dashboard HTML structure
   * @private
   */
  createDashboard() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'devDashboard';
    this.container.className = 'dev-dashboard';
    this.container.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      max-height: 90vh;
      background: rgba(0, 0, 0, 0.9);
      color: #0f0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      border: 2px solid #0f0;
      border-radius: 5px;
      padding: 10px;
      overflow-y: auto;
      z-index: 10000;
      display: none;
    `;

    // Create header
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #0f0; padding-bottom: 5px;">
        <h3 style="margin: 0; color: #0f0;">DEV DASHBOARD</h3>
        <button id="devDashboardClose" style="background: none; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 2px 8px;">X</button>
      </div>
    `;
    this.container.appendChild(header);

    // Create panels
    this.createPerformancePanel();
    this.createStatePanel();
    this.createErrorPanel();
    this.createDOMPanel();
    this.createMemoryPanel();
    this.createProfilerPanel();
    this.createControlsPanel();

    // Add to document
    document.body.appendChild(this.container);

    // Set up close button
    document.getElementById('devDashboardClose').addEventListener('click', () => {
      this.hide();
    });
  }

  /**
   * Create performance monitoring panel
   * @private
   */
  createPerformancePanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">PERFORMANCE</h4>
      <div id="devPerfContent" style="font-size: 11px;"></div>
    `;
    this.container.appendChild(panel);
    this.panels.performance = panel;
  }

  /**
   * Create game state panel
   * @private
   */
  createStatePanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">GAME STATE</h4>
      <div id="devStateContent" style="font-size: 11px; max-height: 200px; overflow-y: auto;"></div>
    `;
    this.container.appendChild(panel);
    this.panels.state = panel;
  }

  /**
   * Create error log panel
   * @private
   */
  createErrorPanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">ERROR LOG</h4>
      <div id="devErrorContent" style="font-size: 11px; max-height: 150px; overflow-y: auto;"></div>
    `;
    this.container.appendChild(panel);
    this.panels.errors = panel;
  }

  /**
   * Create DOM batching panel
   * @private
   */
  createDOMPanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">DOM BATCHING</h4>
      <div id="devDOMContent" style="font-size: 11px;"></div>
    `;
    this.container.appendChild(panel);
    this.panels.dom = panel;
  }

  /**
   * Create memory monitoring panel
   * @private
   */
  createMemoryPanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">MEMORY</h4>
      <div id="devMemoryContent" style="font-size: 11px;">
        <div id="devMemoryStats"></div>
        <div style="margin-top: 5px;">
          <button id="devStartMemory" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 3px;">Start Monitor</button>
          <button id="devStopMemory" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 3px;">Stop Monitor</button>
          <button id="devForceGC" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 3px;">Force GC</button>
        </div>
      </div>
    `;
    this.container.appendChild(panel);
    this.panels.memory = panel;
  }

  /**
   * Create memory profiler panel
   * @private
   */
  createProfilerPanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">PROFILER</h4>
      <div id="devProfilerContent" style="font-size: 11px;">
        <div id="devProfilerStats"></div>
        <div style="margin-top: 5px;">
          <button id="devAnalyzeProfile" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 3px;">Analyze</button>
          <button id="devResetProfile" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 3px;">Reset</button>
          <button id="devExportProfile" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 3px;">Export</button>
        </div>
      </div>
    `;
    this.container.appendChild(panel);
    this.panels.profiler = panel;
  }

  /**
   * Create controls panel
   * @private
   */
  createControlsPanel() {
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.style.cssText = 'margin-bottom: 10px; padding: 5px; border: 1px solid #0f0;';
    panel.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #0f0;">CONTROLS</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
        <button id="devAddClips" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">+10K Clips</button>
        <button id="devAddFunds" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">+$1000</button>
        <button id="devAddWire" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">+10K Wire</button>
        <button id="devAddOps" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">+10K Ops</button>
        <button id="devUnlockAll" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">Unlock All</button>
        <button id="devResetPerf" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">Reset Perf</button>
        <button id="devClearErrors" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">Clear Errors</button>
        <button id="devExportState" style="background: #001; border: 1px solid #0f0; color: #0f0; cursor: pointer; padding: 5px;">Export State</button>
      </div>
    `;
    this.container.appendChild(panel);
    this.panels.controls = panel;

    // Set up control buttons
    this.setupControls();
  }

  /**
   * Set up control button handlers
   * @private
   */
  setupControls() {
    // Add resources
    document.getElementById('devAddClips').addEventListener('click', () => {
      gameState.increment('resources.clips', 10000);
      errorHandler.debug('Added 10,000 clips');
    });

    document.getElementById('devAddFunds').addEventListener('click', () => {
      gameState.increment('resources.funds', 1000);
      errorHandler.debug('Added $1,000');
    });

    document.getElementById('devAddWire').addEventListener('click', () => {
      gameState.increment('resources.wire', 10000);
      errorHandler.debug('Added 10,000 wire');
    });

    document.getElementById('devAddOps').addEventListener('click', () => {
      gameState.increment('computing.operations', 10000);
      errorHandler.debug('Added 10,000 operations');
    });

    // Unlock all features
    document.getElementById('devUnlockAll').addEventListener('click', () => {
      Object.keys(gameState.flags).forEach((flag) => {
        gameState.set(`flags.${flag}`, true);
      });
      errorHandler.debug('Unlocked all features');
    });

    // Reset performance
    document.getElementById('devResetPerf').addEventListener('click', () => {
      performanceMonitor.reset();
      errorHandler.debug('Performance metrics reset');
    });

    // Clear errors
    document.getElementById('devClearErrors').addEventListener('click', () => {
      errorHandler.clearErrorLog();
      this.updateErrorPanel();
    });

    // Export state
    document.getElementById('devExportState').addEventListener('click', () => {
      const state = JSON.stringify(gameState, null, 2);
      const blob = new Blob([state], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gamestate.json';
      a.click();
      URL.revokeObjectURL(url);
      errorHandler.debug('Game state exported');
    });

    // Memory monitoring controls
    document.getElementById('devStartMemory').addEventListener('click', () => {
      memoryMonitor.start();
      errorHandler.debug('Memory monitoring started');
    });

    document.getElementById('devStopMemory').addEventListener('click', () => {
      memoryMonitor.stop();
      errorHandler.debug('Memory monitoring stopped');
    });

    document.getElementById('devForceGC').addEventListener('click', () => {
      if (memoryMonitor.forceGC()) {
        errorHandler.debug('Garbage collection triggered');
      } else {
        errorHandler.warn('GC not available - run Chrome with --expose-gc flag');
      }
    });

    // Profiler controls
    document.getElementById('devAnalyzeProfile').addEventListener('click', () => {
      const analysis = memoryProfiler.analyzePatterns();
      console.log('Memory Analysis:', analysis);
      errorHandler.debug('Memory analysis logged to console');
    });

    document.getElementById('devResetProfile').addEventListener('click', () => {
      memoryProfiler.reset();
      errorHandler.debug('Profiler data reset');
    });

    document.getElementById('devExportProfile').addEventListener('click', () => {
      const report = memoryProfiler.generateReport();
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'memory-profile.txt';
      a.click();
      URL.revokeObjectURL(url);
      errorHandler.debug('Profile report exported');
    });
  }

  /**
   * Update dashboard content
   * @private
   */
  update() {
    if (!this.visible) {
      return;
    }

    this.updatePerformancePanel();
    this.updateStatePanel();
    this.updateErrorPanel();
    this.updateDOMPanel();
    this.updateMemoryPanel();
    this.updateProfilerPanel();
  }

  /**
   * Update performance panel
   * @private
   */
  updatePerformancePanel() {
    const metrics = performanceMonitor.getMetrics();
    const content = document.getElementById('devPerfContent');

    content.innerHTML = `
      <div>FPS: <span style="color: ${metrics.fps < 30 ? '#f00' : '#0f0'}">${metrics.fps.toFixed(1)}</span> (min: ${metrics.minFps.toFixed(1)})</div>
      <div>Frame Time: ${metrics.avgFrameTime.toFixed(2)}ms (max: ${metrics.maxFrameTime.toFixed(2)}ms)</div>
      <div>Update: ${metrics.updateTime.toFixed(2)}ms | Render: ${metrics.renderTime.toFixed(2)}ms</div>
      <div>Memory: ${metrics.memoryUsage.toFixed(1)}MB</div>
    `;
  }

  /**
   * Update game state panel
   * @private
   */
  updateStatePanel() {
    const content = document.getElementById('devStateContent');
    const state = gameState;

    const stateInfo = `
      <div style="color: #ff0;">RESOURCES</div>
      <div>Clips: ${formatNumber(state.resources.clips)}</div>
      <div>Funds: $${formatNumber(state.resources.funds)}</div>
      <div>Wire: ${formatNumber(state.resources.wire)}</div>
      <div style="margin-top: 5px; color: #ff0;">PRODUCTION</div>
      <div>Rate: ${formatNumber(state.production.clipRate)}/sec</div>
      <div>Auto-Clippers: ${state.production.clipmakerLevel}</div>
      <div>Mega-Clippers: ${state.production.megaClipperLevel}</div>
      <div style="margin-top: 5px; color: #ff0;">COMPUTING</div>
      <div>Processors: ${state.computing.processors} | Memory: ${state.computing.memory}</div>
      <div>Operations: ${formatNumber(state.computing.operations)}</div>
      <div>Trust: ${state.computing.trust}/${state.computing.maxTrust}</div>
    `;

    content.innerHTML = stateInfo;
  }

  /**
   * Update error panel
   * @private
   */
  updateErrorPanel() {
    const content = document.getElementById('devErrorContent');
    const errors = errorHandler.getErrorLog(10); // Last 10 errors

    if (errors.length === 0) {
      content.innerHTML = '<div style="color: #666;">No errors logged</div>';
      return;
    }

    const errorHtml = errors
      .reverse()
      .map((err) => {
        const time = new Date(err.timestamp).toLocaleTimeString();
        const color = err.level === 'error' ? '#f00' : err.level === 'warn' ? '#fa0' : '#999';
        return `<div style="color: ${color}; margin-bottom: 2px;">[${time}] ${err.message}</div>`;
      })
      .join('');

    content.innerHTML = errorHtml;
  }

  /**
   * Update DOM batching panel
   * @private
   */
  updateDOMPanel() {
    const content = document.getElementById('devDOMContent');
    const cacheStats = domBatcher.getCacheStats();
    const renderer = window.UniversalPaperclipsRenderer;

    content.innerHTML = `
      <div>Cache Hits: ${cacheStats.hits} | Misses: ${cacheStats.misses}</div>
      <div>Hit Rate: ${cacheStats.hitRate} | Size: ${cacheStats.size}</div>
      <div>Render Updates: ${renderer ? renderer.updateCount : 0}</div>
      <div>Batching: ${domBatcher.enabled ? 'Enabled' : 'Disabled'}</div>
    `;
  }

  /**
   * Update memory panel
   * @private
   */
  updateMemoryPanel() {
    const content = document.getElementById('devMemoryStats');
    const stats = memoryMonitor.getStats();

    if (!stats.current) {
      content.innerHTML = '<div style="color: #999;">Memory API not available</div>';
      return;
    }

    const trend = memoryMonitor.getTrend();
    const trendColor = trend === 'growing' ? '#fa0' : trend === 'shrinking' ? '#0f0' : '#999';

    let html = `
      <div>Used: ${stats.current.usedMB} MB (${stats.current.usagePercent}%)</div>
      <div>Total: ${stats.current.totalMB} MB | Limit: ${stats.current.limitMB} MB</div>
      <div>Trend: <span style="color: ${trendColor}">${trend}</span></div>
      <div>Tracked Objects: ${stats.trackedObjects}</div>
    `;

    if (stats.issues.length > 0) {
      html += '<div style="margin-top: 5px; color: #fa0;">Recent Issues:</div>';
      stats.issues.slice(-3).forEach((issue) => {
        html += `<div style="font-size: 10px; color: #fa0;">- ${issue.type}: ${JSON.stringify(issue.details)}</div>`;
      });
    }

    content.innerHTML = html;
  }

  /**
   * Update profiler panel
   * @private
   */
  updateProfilerPanel() {
    const content = document.getElementById('devProfilerStats');
    const analysis = memoryProfiler.analyzePatterns();

    let html = '<div style="font-size: 10px;">';

    // Object pools
    if (Object.keys(analysis.pools).length > 0) {
      html += '<div style="margin-bottom: 5px;">Object Pools:</div>';
      for (const [type, stats] of Object.entries(analysis.pools)) {
        html += `<div style="margin-left: 10px;">${type}: ${stats.reuseRate} reuse (${stats.inUse}/${stats.poolSize})</div>`;
      }
    }

    // Hotspots
    if (analysis.hotspots.length > 0) {
      html += '<div style="margin: 5px 0;">Allocation Hotspots:</div>';
      analysis.hotspots.slice(0, 3).forEach((hotspot) => {
        html += `<div style="margin-left: 10px;">${hotspot.site}: ${hotspot.percentage.toFixed(1)}%</div>`;
      });
    }

    // Recommendations
    if (analysis.recommendations.length > 0) {
      html += '<div style="margin: 5px 0; color: #fa0;">Recommendations:</div>';
      analysis.recommendations.slice(0, 3).forEach((rec) => {
        html += `<div style="margin-left: 10px; font-size: 9px; color: #fa0;">• ${rec.message}</div>`;
      });
    }

    html += '</div>';
    content.innerHTML = html;
  }

  /**
   * Show the dashboard
   * @returns {void}
   */
  show() {
    if (!this.initialized) {
      this.init();
    }

    this.container.style.display = 'block';
    this.visible = true;

    // Start update interval
    this.updateInterval = setInterval(() => this.update(), 100);

    // Initial update
    this.update();

    errorHandler.debug('Dev dashboard shown');
  }

  /**
   * Hide the dashboard
   * @returns {void}
   */
  hide() {
    this.container.style.display = 'none';
    this.visible = false;

    // Stop update interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    errorHandler.debug('Dev dashboard hidden');
  }

  /**
   * Toggle dashboard visibility
   * @returns {void}
   */
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if dashboard is visible
   * @returns {boolean} True if visible
   */
  isVisible() {
    return this.visible;
  }
}

// Create singleton instance
export const devDashboard = new DevDashboard();

// Export for debugging
if (typeof window !== 'undefined') {
  window.UniversalPaperclipsDevDashboard = devDashboard;
}
