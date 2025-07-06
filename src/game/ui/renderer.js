/**
 * Renderer for Universal Paperclips
 *
 * Handles DOM updates and UI rendering with efficient batching
 * to maintain 60 FPS performance.
 */

import {
  formatRate,
  formatPercentage,
  formatNumberCached,
  formatCurrencyCached,
} from "../../utils/formatting.js";
import { errorHandler } from "../core/errorHandler.js";
import { performanceMonitor } from "../core/performanceMonitor.js";
import { PERFORMANCE } from "../core/constants.js";

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

    // Console message queue
    this.consoleMessages = [];
    this.maxConsoleMessages = 100;
    this.consoleElement = null;

    // Terminal readout tracking
    this.readoutIndex = 0;
    this.readoutElements = [];

    // Stock market update tracking
    this.stockUpdateCounter = 0;
    this.stockUpdateInterval = 10; // Update every 10 frames

    // Quantum chip visualization
    this.quantumChips = [];
    this.quantumAnimationFrame = 0;

    // Bind methods
    this.render = errorHandler.createErrorBoundary(
      this.render.bind(this),
      "renderer.render",
    );
  }

  /**
   * Initialize element updaters mapping
   */
  initializeElementUpdaters() {
    return {
      // Resource displays
      clips: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      fundsDisplay: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },
      funds: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },
      wire: (element, value) => {
        element.textContent = formatNumberCached(Math.floor(value));
      },
      unsoldClips: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      matter: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      nanoWire: (element, value) => {
        element.textContent = formatNumberCached(value);
      },

      // Production displays
      clipRate: (element, value) => {
        element.textContent = formatRate(value, "clips");
      },
      autoClippers: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      megaClippers: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      factories: (element, value) => {
        element.textContent = formatNumberCached(value);
      },

      // Market displays
      margin: (element, value) => {
        element.textContent = formatCurrencyCached(value, true);
      },
      demand: (element, value) => {
        element.textContent = formatPercentage(value / 100, 2);
      },
      marketing: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      avgRev: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },

      // Computing displays
      operations: (element, value) => {
        element.textContent = formatNumberCached(Math.floor(value));
      },
      qOps: (element, value) => {
        element.textContent = formatNumberCached(Math.floor(value));
      },
      creativity: (element, value) => {
        element.textContent = formatNumberCached(Math.floor(value));
      },
      processors: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      memory: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      trust: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      usedTrust: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      nextTrust: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      yomi: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      yomiRate: (element, value) => {
        element.textContent = formatRate(value, "yomi");
      },

      // Space displays
      probes: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      probesLaunched: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      probesLost: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      harvesters: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      wireDrones: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      exploration: (element, value) => {
        element.textContent = formatPercentage(value / 100, 2);
      },

      // Combat displays
      honor: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      battles: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      losses: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      damage: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      drifters: (element, value) => {
        element.textContent = formatNumberCached(value);
      },

      // Power displays
      power: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      maxPower: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      solarFarms: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      batteries: (element, value) => {
        element.textContent = formatNumberCached(value);
      },

      // Investment displays
      investmentValue: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },
      investmentReturn: (element, value) => {
        element.textContent = formatPercentage(value / 100, 2);
      },

      // Strategic modeling displays
      currentStrategy: (element, value) => {
        element.textContent = value || "None";
      },
      tournamentStatus: (element, value) => {
        element.textContent = value || "Ready";
      },

      // Swarm displays
      swarmSize: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      swarmGifts: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      swarmStatus: (element, value) => {
        element.textContent = value || "Active";
      },

      // Universe displays
      universe: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      simLevel: (element, value) => {
        element.textContent = formatNumberCached(value);
      },

      // Probe design displays
      probeTrust: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      probeCombat: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      probeSpeed: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      probeReplication: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      probeSelfRep: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      probeHazard: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      probeFactory: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      probeWireDrone: (element, value) => {
        element.textContent = formatNumberCached(value);
      },
      probeExploration: (element, value) => {
        element.textContent = formatNumberCached(value);
      },

      // Cost displays
      autoClipperCost: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },
      megaClipperCost: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },
      factoryCost: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },
      wireCost1000: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },
      adCost: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },
      processorCost: (element, value) => {
        element.textContent = `${formatNumberCached(value)} ops`;
      },
      memoryCost: (element, value) => {
        element.textContent = `${formatNumberCached(value)} ops`;
      },
      harvesterCost: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },
      wireDroneCost: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },
      solarFarmCost: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },
      batteryCost: (element, value) => {
        element.textContent = formatCurrencyCached(value);
      },

      // Performance displays
      fps: (element, value) => {
        element.textContent = `${value} FPS`;
      },
      renderTime: (element, value) => {
        element.textContent = `${value.toFixed(2)}ms`;
      },
      updateTime: (element, value) => {
        element.textContent = `${value.toFixed(2)}ms`;
      },

      // Slider value displays
      thinkValue: (element, value) => {
        element.textContent = `${value}%`;
      },
      riskValue: (element, value) => {
        element.textContent = `${value}%`;
      },
      swarmWork: (element, value) => {
        element.textContent = `${value}%`;
      },

      // Payoff matrix displays
      payoffAA: (element, value) => {
        element.textContent = value || "0";
      },
      payoffAB: (element, value) => {
        element.textContent = value || "0";
      },
      payoffBA: (element, value) => {
        element.textContent = value || "0";
      },
      payoffBB: (element, value) => {
        element.textContent = value || "0";
      },

      // Achievement displays
      achievementCount: (element, value) => {
        element.textContent = `(${value.unlocked}/${value.total})`;
      },
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
      errorHandler.handleError(error, `renderer.updateElement.${elementId}`, {
        value,
      });
    }
  }

  /**
   * Update resource displays
   */
  updateResources() {
    this.queueUpdate("clips", this.gameState.get("resources.clips"));
    this.queueUpdate("funds", this.gameState.get("resources.funds"));
    this.queueUpdate("wire", this.gameState.get("resources.wire"));
    this.queueUpdate(
      "unsoldClips",
      this.gameState.get("resources.unsoldClips"),
    );
  }

  /**
   * Update production displays
   */
  updateProduction() {
    this.queueUpdate("clipRate", this.gameState.get("production.clipRate"));
    this.queueUpdate(
      "autoClippers",
      this.gameState.get("manufacturing.clipmakers.level"),
    );
    this.queueUpdate(
      "megaClippers",
      this.gameState.get("manufacturing.megaClippers.level"),
    );
    this.queueUpdate(
      "factories",
      this.gameState.get("manufacturing.factories.level"),
    );
  }

  /**
   * Update market displays
   */
  updateMarket() {
    this.queueUpdate("margin", this.gameState.get("market.pricing.margin"));
    this.queueUpdate("demand", this.gameState.get("market.demand"));
    this.queueUpdate("marketing", this.gameState.get("market.marketing.level"));
    this.queueUpdate("avgRev", this.gameState.get("market.sales.avgRevenue"));
    this.queueUpdate("wireCost", this.gameState.get("market.pricing.wireCost"));
  }

  /**
   * Update computing displays
   */
  updateComputing() {
    this.queueUpdate("operations", this.gameState.get("computing.operations"));
    this.queueUpdate(
      "creativity",
      this.gameState.get("computing.creativity.amount"),
    );
    this.queueUpdate("processors", this.gameState.get("computing.processors"));
    this.queueUpdate("memory", this.gameState.get("computing.memory"));
    this.queueUpdate("trust", this.gameState.get("computing.trust.current"));
  }

  /**
   * Update combat displays
   */
  updateCombat() {
    this.queueUpdate("honor", this.gameState.get("combat.honor"));
    this.queueUpdate("probes", this.gameState.get("space.probes.count"));
    this.queueUpdate("battles", this.gameState.get("combat.battles") || 0);
    this.queueUpdate("losses", this.gameState.get("combat.losses") || 0);
    this.queueUpdate("damage", this.gameState.get("combat.damage") || 0);
    this.queueUpdate("drifters", this.gameState.get("combat.drifters") || 0);
  }

  /**
   * Update cost displays
   */
  updateCosts() {
    this.queueUpdate(
      "autoClipperCost",
      this.gameState.get("manufacturing.clipmakers.cost"),
    );
    this.queueUpdate(
      "megaClipperCost",
      this.gameState.get("manufacturing.megaClippers.cost"),
    );
    this.queueUpdate(
      "factoryCost",
      this.gameState.get("manufacturing.factories.cost"),
    );
    this.queueUpdate("adCost", this.gameState.get("market.pricing.adCost"));
    this.queueUpdate(
      "wireCost1000",
      this.gameState.get("market.pricing.wireCost") * 1000,
    );
    this.queueUpdate(
      "harvesterCost",
      this.gameState.get("space.harvesters.cost"),
    );
    this.queueUpdate(
      "wireDroneCost",
      this.gameState.get("space.wireDrones.cost"),
    );
    this.queueUpdate(
      "solarFarmCost",
      this.gameState.get("power.solarFarms.cost"),
    );
    this.queueUpdate("batteryCost", this.gameState.get("power.batteries.cost"));

    // Calculate dynamic costs
    const processors = this.gameState.get("computing.processors");
    const memory = this.gameState.get("computing.memory");

    this.queueUpdate("processorCost", Math.pow(2, processors) * 1000);
    this.queueUpdate("memoryCost", Math.pow(2, memory) * 1000);
  }

  /**
   * Update button states (enabled/disabled)
   */
  updateButtonStates() {
    this.updateButtonState("buyAutoClipper", this.canAffordAutoClipper());
    this.updateButtonState("buyMegaClipper", this.canAffordMegaClipper());
    this.updateButtonState("buyWire", this.canAffordWire());
    this.updateButtonState("buyAds", this.canAffordAds());
    this.updateButtonState("buyProcessor", this.canAffordProcessor());
    this.updateButtonState("buyMemory", this.canAffordMemory());

    // Update dynamic button visibility
    this.updateDynamicButtons();

    // Update toggle button states
    this.updateToggleButtons();
  }

  /**
   * Update individual button state
   */
  updateButtonState(buttonId, canAfford) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = !canAfford;
      button.className = canAfford ? "button" : "button disabled";
    }
  }

  /**
   * Check if player can afford AutoClipper
   */
  canAffordAutoClipper() {
    const funds = this.gameState.get("resources.funds");
    const cost = this.gameState.get("manufacturing.clipmakers.cost");
    return funds >= cost;
  }

  /**
   * Check if player can afford MegaClipper
   */
  canAffordMegaClipper() {
    const funds = this.gameState.get("resources.funds");
    const cost = this.gameState.get("manufacturing.megaClippers.cost");
    return funds >= cost;
  }

  /**
   * Check if player can afford wire
   */
  canAffordWire() {
    const funds = this.gameState.get("resources.funds");
    const cost = this.gameState.get("market.pricing.wireCost");
    return funds >= cost;
  }

  /**
   * Check if player can afford advertising
   */
  canAffordAds() {
    const funds = this.gameState.get("resources.funds");
    const cost = this.gameState.get("market.pricing.adCost");
    return funds >= cost;
  }

  /**
   * Check if player can afford processor
   */
  canAffordProcessor() {
    const operations = this.gameState.get("computing.operations");
    const processors = this.gameState.get("computing.processors");
    const trust = this.gameState.get("computing.trust.current");
    const cost = Math.pow(2, processors) * 1000;

    return operations >= cost && processors < trust;
  }

  /**
   * Check if player can afford memory
   */
  canAffordMemory() {
    const operations = this.gameState.get("computing.operations");
    const memory = this.gameState.get("computing.memory");
    const trust = this.gameState.get("computing.trust.current");
    const cost = Math.pow(2, memory) * 1000;

    return operations >= cost && memory < trust;
  }

  /**
   * Update dynamic buttons visibility based on game state
   */
  updateDynamicButtons() {
    const clips = this.gameState.get("resources.clips");
    const flags = this.gameState.get("gameState.flags");
    const projects = this.gameState.get("projects.completed") || [];

    // Quick buttons
    this.toggleButton("quickButton10", clips > 50);
    this.toggleButton("quickButton100", clips > 500);
    this.toggleButton("quickButton1K", clips > 5000);

    // Advanced buttons - Space stage
    const spaceEnabled = flags.space >= 1;
    this.toggleButton(
      "launchProbeButton",
      spaceEnabled && this.canLaunchProbe(),
    );

    // Swarm computing buttons
    const swarmEnabled =
      projects.includes("swarmComputing") || flags.swarmComputing >= 1;
    this.toggleButton("feedSwarmButton", swarmEnabled);
    this.toggleButton("teachSwarmButton", swarmEnabled);

    // End game buttons
    const endGameEnabled =
      projects.includes("harvestMatter") || flags.endGame >= 1;
    this.toggleButton("harvestMatterButton", endGameEnabled);
    this.toggleButton("convertMatterButton", endGameEnabled);

    // Toggle button visibility
    this.toggleButton("toggleAutoClippers", flags.autoClipper >= 1);
    this.toggleButton("toggleMegaClippers", flags.megaClipper >= 1);
    this.toggleButton(
      "toggleQuantumComputing",
      projects.includes("quantumComputing") || flags.quantum >= 1,
    );
    this.toggleButton(
      "toggleStrategicModeling",
      projects.includes("strategicModeling") || flags.strategicModeling >= 1,
    );
  }

  /**
   * Update toggle button states (on/off)
   */
  updateToggleButtons() {
    // Wire buyer toggle
    const wireBuyerEnabled = this.gameState.get("market.wireBuyer.enabled");
    this.setToggleButtonState("toggleWireBuyer", wireBuyerEnabled);

    // Creativity toggle
    const creativityEnabled = this.gameState.get(
      "computing.creativity.enabled",
    );
    this.setToggleButtonState("toggleCreativity", creativityEnabled);

    // Combat toggle
    const combatEnabled = this.gameState.get("combat.battleEnabled");
    this.setToggleButtonState("toggleCombat", combatEnabled);

    // AutoClippers toggle
    const autoClippersEnabled =
      this.gameState.get("production.autoClippersEnabled") !== false;
    this.setToggleButtonState("toggleAutoClippers", autoClippersEnabled);

    // MegaClippers toggle
    const megaClippersEnabled =
      this.gameState.get("production.megaClippersEnabled") !== false;
    this.setToggleButtonState("toggleMegaClippers", megaClippersEnabled);

    // Quantum Computing toggle
    const quantumEnabled = this.gameState.get("computing.quantum.enabled");
    this.setToggleButtonState("toggleQuantumComputing", quantumEnabled);

    // Strategic Modeling toggle
    const strategicEnabled = this.gameState.get(
      "computing.strategicModeling.enabled",
    );
    this.setToggleButtonState("toggleStrategicModeling", strategicEnabled);
  }

  /**
   * Set toggle button state (on/off)
   */
  setToggleButtonState(buttonId, isOn) {
    const button = document.getElementById(buttonId);
    if (button) {
      if (isOn) {
        button.classList.add("on");
      } else {
        button.classList.remove("on");
      }
    }
  }

  /**
   * Toggle button visibility
   */
  toggleButton(buttonId, visible) {
    const button = document.getElementById(buttonId);
    if (button) {
      if (visible) {
        button.classList.remove("hidden");
      } else {
        button.classList.add("hidden");
      }
    }
  }

  /**
   * Check if player can launch probe
   */
  canLaunchProbe() {
    // This would check resources and conditions for launching a probe
    // For now, return true if in space stage
    return true;
  }

  /**
   * Update UI sections based on game flags
   */
  updateSectionVisibility() {
    const flags = this.gameState.get("gameState.flags");
    const projects = this.gameState.get("projects.completed") || [];

    // Core sections
    this.toggleSection("businessDiv", flags.autoClipper >= 1);
    this.toggleSection("projectsDiv", flags.projects >= 1);
    this.toggleSection("manufactureDiv", flags.megaClipper >= 1);
    this.toggleSection("computeDiv", flags.comp >= 1);
    this.toggleSection("investmentDiv", flags.investment >= 1);

    // Space sections
    this.toggleSection("spaceDiv", flags.space >= 1);
    this.toggleSection(
      "combatDiv",
      flags.space >= 1 && this.gameState.get("combat.battleEnabled"),
    );
    this.toggleSection(
      "probeDesignDiv",
      flags.space >= 1 && this.gameState.get("space.probes.count") > 0,
    );

    // Power section
    this.toggleSection("powerDiv", flags.space >= 1 || flags.factory >= 1);

    // Advanced sections
    this.toggleSection(
      "quantumDiv",
      projects.includes("quantumComputing") || flags.quantum >= 1,
    );
    this.toggleSection(
      "strategyDiv",
      projects.includes("strategicModeling") || flags.strategy >= 1,
    );
    this.toggleSection(
      "swarmDiv",
      projects.includes("swarmComputing") ||
        this.gameState.get("swarm.enabled"),
    );

    // Wire production section
    this.toggleSection("wireDiv", flags.wireProduction >= 1);
  }

  /**
   * Toggle section visibility
   */
  toggleSection(sectionId, visible) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = visible ? "block" : "none";
    }
  }

  /**
   * Update projects display
   */
  updateProjects() {
    const projectsContainer = document.getElementById("projectList");
    if (!projectsContainer) return;

    // This would be implemented to show available projects
    // For now, just clear the container
    projectsContainer.innerHTML = "";
  }

  /**
   * Update achievements display
   */
  updateAchievements() {
    // Update achievement count in the button
    const achievements = this.gameState.get("achievements");
    if (achievements) {
      const stats = achievements.stats || { totalUnlocked: 0 };
      const totalAchievements = Object.keys(
        window.achievementSystem?.achievements || {},
      ).length;

      this.queueUpdate("achievementCount", {
        unlocked: stats.totalUnlocked,
        total: totalAchievements,
      });
    }
  }

  /**
   * Create performance display
   */
  updatePerformanceDisplay() {
    const perfElement = document.getElementById("performanceDisplay");
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
   * Update space displays
   */
  updateSpace() {
    this.queueUpdate("probes", this.gameState.get("space.probes.count"));
    this.queueUpdate(
      "probesLaunched",
      this.gameState.get("space.probes.launched") || 0,
    );
    this.queueUpdate(
      "probesLost",
      this.gameState.get("space.probes.lost") || 0,
    );
    this.queueUpdate(
      "harvesters",
      this.gameState.get("space.harvesters.level"),
    );
    this.queueUpdate(
      "wireDrones",
      this.gameState.get("space.wireDrones.level"),
    );
    this.queueUpdate("matter", this.gameState.get("space.matter.available"));
    this.queueUpdate(
      "exploration",
      this.gameState.get("space.exploration.percentage") || 0,
    );
  }

  /**
   * Update power displays
   */
  updatePower() {
    this.queueUpdate("power", this.gameState.get("power.stored"));
    this.queueUpdate("maxPower", this.gameState.get("power.maxCapacity") || 0);
    this.queueUpdate(
      "solarFarms",
      this.gameState.get("power.solarFarms.level"),
    );
    this.queueUpdate("batteries", this.gameState.get("power.batteries.level"));
  }

  /**
   * Update investment displays
   */
  updateInvestment() {
    this.queueUpdate(
      "investmentValue",
      this.gameState.get("investment.value") || 0,
    );
    this.queueUpdate(
      "investmentReturn",
      this.gameState.get("investment.return") || 0,
    );
  }

  /**
   * Update strategic modeling displays
   */
  updateStrategicModeling() {
    this.queueUpdate(
      "currentStrategy",
      this.gameState.get("strategy.current") || "None",
    );
    this.queueUpdate(
      "tournamentStatus",
      this.gameState.get("strategy.tournament.status") || "Ready",
    );
    this.queueUpdate("yomi", this.gameState.get("strategy.yomi") || 0);
    this.queueUpdate("yomiRate", this.gameState.get("strategy.yomiRate") || 0);

    // Update payoff matrix
    const payoffs = this.gameState.get("strategy.payoffs") || {};
    this.queueUpdate("payoffAA", payoffs.AA || 0);
    this.queueUpdate("payoffAB", payoffs.AB || 0);
    this.queueUpdate("payoffBA", payoffs.BA || 0);
    this.queueUpdate("payoffBB", payoffs.BB || 0);
  }

  /**
   * Update swarm displays
   */
  updateSwarm() {
    this.queueUpdate("swarmSize", this.gameState.get("swarm.size") || 0);
    this.queueUpdate(
      "swarmGifts",
      this.gameState.get("swarm.gifts.received") || 0,
    );
    this.queueUpdate(
      "swarmStatus",
      this.gameState.get("swarm.status") || "Active",
    );
  }

  /**
   * Update universe displays
   */
  updateUniverse() {
    this.queueUpdate("universe", this.gameState.get("universe.level") || 0);
    this.queueUpdate("simLevel", this.gameState.get("universe.simLevel") || 0);
  }

  /**
   * Update probe design displays
   */
  updateProbeDesign() {
    this.queueUpdate(
      "probeTrust",
      this.gameState.get("probes.design.trust") || 0,
    );
    this.queueUpdate(
      "probeCombat",
      this.gameState.get("probes.design.combat") || 0,
    );
    this.queueUpdate(
      "probeSpeed",
      this.gameState.get("probes.design.speed") || 0,
    );
    this.queueUpdate(
      "probeReplication",
      this.gameState.get("probes.design.replication") || 0,
    );
    this.queueUpdate(
      "probeSelfRep",
      this.gameState.get("probes.design.selfRep") || 0,
    );
    this.queueUpdate(
      "probeHazard",
      this.gameState.get("probes.design.hazard") || 0,
    );
    this.queueUpdate(
      "probeFactory",
      this.gameState.get("probes.design.factory") || 0,
    );
    this.queueUpdate(
      "probeWireDrone",
      this.gameState.get("probes.design.wireDrone") || 0,
    );
    this.queueUpdate(
      "probeExploration",
      this.gameState.get("probes.design.exploration") || 0,
    );
  }

  /**
   * Update slider value displays
   */
  updateSliders() {
    // Update thinking slider
    const thinkSlider = document.getElementById("thinkSlider");
    if (thinkSlider) {
      this.queueUpdate("thinkValue", thinkSlider.value);
    }

    // Update risk slider
    const riskSlider = document.getElementById("riskSlider");
    if (riskSlider) {
      this.queueUpdate("riskValue", riskSlider.value);
    }

    // Update swarm work slider
    const swarmSlider = document.getElementById("swarmSlider");
    if (swarmSlider) {
      this.queueUpdate("swarmWork", swarmSlider.value);
    }
  }

  /**
   * Update terminal readout
   */
  updateTerminalReadout() {
    // Cycle through readout1-5 elements with status messages
    this.readoutIndex = (this.readoutIndex + 1) % 5;
    const readoutId = `readout${this.readoutIndex + 1}`;
    const readoutElement = document.getElementById(readoutId);

    if (readoutElement) {
      // Get relevant status message based on game state
      const message = this.getStatusMessage(this.readoutIndex);
      readoutElement.textContent = message;
    }
  }

  /**
   * Get status message for terminal readout
   */
  getStatusMessage(index) {
    const messages = [
      `CLIPS: ${formatNumberCached(this.gameState.get("resources.clips"))}`,
      `FUNDS: ${formatCurrencyCached(this.gameState.get("resources.funds"))}`,
      `WIRE: ${formatNumberCached(this.gameState.get("resources.wire"))}`,
      `RATE: ${formatRate(this.gameState.get("production.clipRate"), "clips")}`,
      `OPS: ${formatNumberCached(this.gameState.get("computing.operations"))}`,
    ];
    return messages[index] || "";
  }

  /**
   * Update quantum chip visualization
   */
  updateQuantumChips() {
    const quantumEnabled = this.gameState.get("computing.quantum.enabled");
    if (!quantumEnabled) return;

    // Update quantum chip visual states
    for (let i = 0; i < 10; i++) {
      const chip = document.getElementById(`qChip${i}`);
      if (chip) {
        // Animate chips based on quantum operations
        const animationPhase = (this.quantumAnimationFrame + i * 36) % 360;
        const brightness =
          Math.sin((animationPhase * Math.PI) / 180) * 0.5 + 0.5;
        chip.style.opacity = 0.3 + brightness * 0.7;
      }
    }
    this.quantumAnimationFrame++;
  }

  /**
   * Update stock market table
   */
  updateStockMarket() {
    const stockTableBody = document.getElementById("stockTableBody");
    if (!stockTableBody) return;

    // Update stock market data (this would be populated by investment system)
    const stocks = this.gameState.get("investment.stocks") || [];

    stockTableBody.innerHTML = "";
    stocks.forEach((stock) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${stock.symbol}</td>
        <td>${formatCurrencyCached(stock.price)}</td>
        <td class="${stock.change >= 0 ? "positive" : "negative"}">
          ${stock.change >= 0 ? "+" : ""}${formatPercentage(stock.change / 100)}
        </td>
        <td>${formatNumberCached(stock.volume)}</td>
      `;
      stockTableBody.appendChild(row);
    });
  }

  /**
   * Main render method
   */
  render(timestamp, _deltaTime) {
    performanceMonitor.measure(() => {
      // Update all display sections
      this.updateResources();
      this.updateProduction();
      this.updateMarket();
      this.updateComputing();
      this.updateCombat();
      this.updateSpace();
      this.updatePower();
      this.updateInvestment();
      this.updateStrategicModeling();
      this.updateSwarm();
      this.updateUniverse();
      this.updateProbeDesign();
      this.updateSliders();
      this.updateCosts();
      this.updateButtonStates();
      this.updateDynamicButtons();
      this.updateToggleButtons();
      this.updateSectionVisibility();
      this.updateProjects();
      this.updateAchievements();
      this.updateTerminalReadout();
      this.updateQuantumChips();

      // Update stock market less frequently
      if (this.stockUpdateCounter % this.stockUpdateInterval === 0) {
        this.updateStockMarket();
      }
      this.stockUpdateCounter++;

      // Process batched DOM updates
      const hasMoreUpdates = this.processBatchedUpdates();

      // Update performance display (less frequently)
      if (timestamp % 1000 < 16) {
        // Roughly once per second
        this.updatePerformanceDisplay();
      }

      // Log if we have a backlog of updates
      if (hasMoreUpdates && this.pendingUpdates.size > 50) {
        errorHandler.warn(
          `Renderer backlog: ${this.pendingUpdates.size} pending updates`,
        );
      }
    }, "renderer.render");
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
    this.updateSpace();
    this.updatePower();
    this.updateInvestment();
    this.updateStrategicModeling();
    this.updateSwarm();
    this.updateUniverse();
    this.updateProbeDesign();
    this.updateSliders();
    this.updateCosts();
    this.updateButtonStates();
    this.updateDynamicButtons();
    this.updateToggleButtons();
    this.updateSectionVisibility();
    this.updateTerminalReadout();
    this.updateQuantumChips();
    this.updateStockMarket();

    // Process all updates without batching
    const allUpdates = Array.from(this.pendingUpdates.entries());
    for (const [elementId, value] of allUpdates) {
      this.updateElement(elementId, value);
    }

    this.pendingUpdates.clear();

    errorHandler.debug("Forced complete UI update");
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
      availableUpdaters: Object.keys(this.elementUpdaters).length,
    };
  }

  /**
   * Reset renderer
   */
  reset() {
    this.pendingUpdates.clear();
    this.refreshCache();
    this.consoleMessages = [];

    errorHandler.info("Renderer reset");
  }

  /**
   * Initialize console element
   */
  initializeConsole() {
    this.consoleElement = document.getElementById("statusConsole");
    if (!this.consoleElement) {
      errorHandler.warn("Status console not found");
      return false;
    }
    return true;
  }

  /**
   * Add a message to the console
   * @param {string} message - The message to display
   * @param {string} type - Message type (achievement, milestone, warning, error, info)
   * @param {Object} options - Additional options (icon, timestamp, etc.)
   */
  addConsoleMessage(message, type = "info", options = {}) {
    const timestamp = new Date().toLocaleTimeString();
    const messageData = {
      message,
      type,
      timestamp,
      icon: options.icon || this.getIconForType(type),
      id: Date.now() + Math.random(),
    };

    // Add to queue
    this.consoleMessages.push(messageData);

    // Trim old messages
    if (this.consoleMessages.length > this.maxConsoleMessages) {
      this.consoleMessages = this.consoleMessages.slice(
        -this.maxConsoleMessages,
      );
    }

    // Render immediately if console is available
    if (this.consoleElement) {
      this.renderConsoleMessage(messageData);
    }
  }

  /**
   * Get appropriate icon for message type
   */
  getIconForType(type) {
    const icons = {
      achievement: "🏆",
      milestone: "🎯",
      warning: "⚠️",
      error: "❌",
      info: "ℹ️",
      project: "🔬",
      combat: "⚔️",
      space: "🚀",
      quantum: "🔮",
    };
    return icons[type] || "";
  }

  /**
   * Render a single console message
   */
  renderConsoleMessage(messageData) {
    if (!this.consoleElement) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `status-message ${messageData.type}-message`;
    messageDiv.dataset.messageId = messageData.id;

    // Build message HTML
    const iconSpan = messageData.icon
      ? `<span class="message-icon">${messageData.icon}</span> `
      : "";
    const timestampSpan = `<span class="message-timestamp">[${messageData.timestamp}]</span> `;
    const messageSpan = `<span class="message-text">${messageData.message}</span>`;

    messageDiv.innerHTML = `${timestampSpan}${iconSpan}${messageSpan}`;

    // Add to console
    this.consoleElement.appendChild(messageDiv);

    // Auto-scroll to bottom
    this.consoleElement.scrollTop = this.consoleElement.scrollHeight;

    // Remove old messages if over limit
    const messages = this.consoleElement.querySelectorAll(".status-message");
    if (messages.length > this.maxConsoleMessages) {
      const toRemove = messages.length - this.maxConsoleMessages;
      for (let i = 0; i < toRemove; i++) {
        messages[i].remove();
      }
    }
  }

  /**
   * Clear all console messages
   */
  clearConsole() {
    this.consoleMessages = [];
    if (this.consoleElement) {
      // Keep only the welcome message if it exists
      const welcomeMessage = this.consoleElement.querySelector(
        ".status-message:first-child",
      );
      this.consoleElement.innerHTML = "";
      if (welcomeMessage && welcomeMessage.textContent.includes("Welcome")) {
        this.consoleElement.appendChild(welcomeMessage);
      }
    }
  }

  /**
   * Log achievement unlock
   */
  logAchievement(achievement) {
    this.addConsoleMessage(
      `Achievement Unlocked: ${achievement.name} - ${achievement.description}`,
      "achievement",
      { icon: achievement.icon },
    );
  }

  /**
   * Log project completion
   */
  logProjectComplete(project) {
    this.addConsoleMessage(`Project Completed: ${project.name}`, "project", {
      icon: "🔬",
    });
  }

  /**
   * Log milestone event
   */
  logMilestone(message, icon = "🎯") {
    this.addConsoleMessage(message, "milestone", { icon });
  }

  /**
   * Log combat event
   */
  logCombatEvent(message, victory = true) {
    this.addConsoleMessage(message, "combat", { icon: victory ? "⚔️" : "💀" });
  }

  /**
   * Log space event
   */
  logSpaceEvent(message) {
    this.addConsoleMessage(message, "space", { icon: "🚀" });
  }

  /**
   * Log quantum event
   */
  logQuantumEvent(message) {
    this.addConsoleMessage(message, "quantum", { icon: "🔮" });
  }

  /**
   * Re-render all console messages (e.g., after page reload)
   */
  refreshConsole() {
    if (!this.consoleElement) return;

    // Keep the welcome message if it exists
    const welcomeMessage = this.consoleElement.querySelector(
      ".status-message:first-child",
    );
    this.consoleElement.innerHTML = "";

    if (welcomeMessage && welcomeMessage.textContent.includes("Welcome")) {
      this.consoleElement.appendChild(welcomeMessage);
    }

    this.consoleMessages.forEach((msg) => this.renderConsoleMessage(msg));
  }
}

export default Renderer;
