/**
 * Events System for Universal Paperclips
 *
 * Handles user interactions and input events with proper delegation
 * and error boundaries.
 */

import { errorHandler } from "../core/errorHandler.js";
import { performanceMonitor } from "../core/performanceMonitor.js";

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
      keydown: this.handleKeyboard.bind(this),
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
    this.handlers.set("makeClip", this.makeClip.bind(this));
    this.handlers.set("makeClipBatch", this.makeClipBatch.bind(this));

    // Multi-purchase handlers for AutoClippers
    this.handlers.set("buyAutoClipper1", this.buyAutoClipperMulti.bind(this));
    this.handlers.set("buyAutoClipper10", this.buyAutoClipperMulti.bind(this));
    this.handlers.set("buyAutoClipper100", this.buyAutoClipperMulti.bind(this));

    // Multi-purchase handlers for MegaClippers
    this.handlers.set("buyMegaClipper1", this.buyMegaClipperMulti.bind(this));
    this.handlers.set("buyMegaClipper10", this.buyMegaClipperMulti.bind(this));
    this.handlers.set("buyMegaClipper100", this.buyMegaClipperMulti.bind(this));

    // Multi-purchase handlers for Factories
    this.handlers.set("buyFactory1", this.buyFactoryMulti.bind(this));
    this.handlers.set("buyFactory10", this.buyFactoryMulti.bind(this));
    this.handlers.set("buyFactory100", this.buyFactoryMulti.bind(this));

    this.handlers.set("toggleAutoClippers", this.toggleAutoClippers.bind(this));
    this.handlers.set("toggleMegaClippers", this.toggleMegaClippers.bind(this));

    // Market handlers
    this.handlers.set("raisePrice", this.raisePrice.bind(this));
    this.handlers.set("lowerPrice", this.lowerPrice.bind(this));
    this.handlers.set("buyAds", this.buyAds.bind(this));

    // Multi-purchase wire handlers
    this.handlers.set("buyWire1000", this.buyWireMulti.bind(this));
    this.handlers.set("buyWire10000", this.buyWireMulti.bind(this));
    this.handlers.set("buyWire100000", this.buyWireMulti.bind(this));

    this.handlers.set("toggleWireBuyer", this.toggleWireBuyer.bind(this));

    // Computing handlers
    this.handlers.set("buyProcessor1", this.buyProcessorMulti.bind(this));
    this.handlers.set("buyProcessor10", this.buyProcessorMulti.bind(this));
    this.handlers.set("buyProcessor100", this.buyProcessorMulti.bind(this));

    this.handlers.set("buyMemory1", this.buyMemoryMulti.bind(this));
    this.handlers.set("buyMemory10", this.buyMemoryMulti.bind(this));
    this.handlers.set("buyMemory100", this.buyMemoryMulti.bind(this));

    this.handlers.set("adjustThinking", this.adjustThinking.bind(this));
    this.handlers.set("quantumCompute", this.quantumCompute.bind(this));

    // Space handlers
    this.handlers.set("launchProbe1", this.launchProbeMulti.bind(this));
    this.handlers.set("launchProbe10", this.launchProbeMulti.bind(this));
    this.handlers.set("launchProbe100", this.launchProbeMulti.bind(this));
    this.handlers.set("launchProbe1000", this.launchProbeMulti.bind(this));

    this.handlers.set("buyHarvester1", this.buyHarvesterMulti.bind(this));
    this.handlers.set("buyHarvester10", this.buyHarvesterMulti.bind(this));
    this.handlers.set("buyHarvester100", this.buyHarvesterMulti.bind(this));

    this.handlers.set("buyWireDrone1", this.buyWireDroneMulti.bind(this));
    this.handlers.set("buyWireDrone10", this.buyWireDroneMulti.bind(this));
    this.handlers.set("buyWireDrone100", this.buyWireDroneMulti.bind(this));

    // Power handlers
    this.handlers.set("buySolarFarm1", this.buySolarFarmMulti.bind(this));
    this.handlers.set("buySolarFarm10", this.buySolarFarmMulti.bind(this));
    this.handlers.set("buySolarFarm100", this.buySolarFarmMulti.bind(this));

    this.handlers.set("buyBattery1", this.buyBatteryMulti.bind(this));
    this.handlers.set("buyBattery10", this.buyBatteryMulti.bind(this));
    this.handlers.set("buyBattery100", this.buyBatteryMulti.bind(this));

    // Probe design handlers
    this.handlers.set("increaseCombat", this.increaseProbeDesign.bind(this));
    this.handlers.set(
      "decreaseProbeCombat",
      this.decreaseProbeDesign.bind(this),
    );
    this.handlers.set("increaseSpeed", this.increaseProbeDesign.bind(this));
    this.handlers.set("decreaseSpeed", this.decreaseProbeDesign.bind(this));
    this.handlers.set(
      "increaseReplication",
      this.increaseProbeDesign.bind(this),
    );
    this.handlers.set(
      "decreaseReplication",
      this.decreaseProbeDesign.bind(this),
    );
    this.handlers.set("increaseSelfRep", this.increaseProbeDesign.bind(this));
    this.handlers.set("decreaseSelfRep", this.decreaseProbeDesign.bind(this));
    this.handlers.set("increaseHazard", this.increaseProbeDesign.bind(this));
    this.handlers.set("decreaseHazard", this.decreaseProbeDesign.bind(this));
    this.handlers.set("increaseFactory", this.increaseProbeDesign.bind(this));
    this.handlers.set("decreaseFactory", this.decreaseProbeDesign.bind(this));
    this.handlers.set("increaseWireDrone", this.increaseProbeDesign.bind(this));
    this.handlers.set("decreaseWireDrone", this.decreaseProbeDesign.bind(this));
    this.handlers.set(
      "increaseExploration",
      this.increaseProbeDesign.bind(this),
    );
    this.handlers.set(
      "decreaseExploration",
      this.decreaseProbeDesign.bind(this),
    );

    // Investment handlers
    this.handlers.set("invest1000", this.investMulti.bind(this));
    this.handlers.set("invest10000", this.investMulti.bind(this));
    this.handlers.set("invest100000", this.investMulti.bind(this));
    this.handlers.set("withdraw1000", this.withdrawMulti.bind(this));
    this.handlers.set("withdraw10000", this.withdrawMulti.bind(this));
    this.handlers.set("withdraw100000", this.withdrawMulti.bind(this));

    // Strategic modeling handlers
    this.handlers.set("adjustRisk", this.adjustRisk.bind(this));
    this.handlers.set("runTournament", this.runTournament.bind(this));
    this.handlers.set("strategyA", this.selectStrategy.bind(this));
    this.handlers.set("strategyB", this.selectStrategy.bind(this));
    this.handlers.set("strategyRandom", this.selectStrategy.bind(this));

    // Swarm handlers
    this.handlers.set("adjustSwarmWork", this.adjustSwarmWork.bind(this));
    this.handlers.set("synchronizeSwarm", this.synchronizeSwarm.bind(this));
    this.handlers.set("entertainSwarm", this.entertainSwarm.bind(this));

    // Combat handlers
    this.handlers.set("allocateProbeStats", this.allocateProbeStats.bind(this));
    this.handlers.set("toggleCombat", this.toggleCombat.bind(this));

    // Projects handlers
    this.handlers.set("completeProject", this.completeProject.bind(this));

    // Save/Load handlers
    this.handlers.set("saveGame", this.saveGame.bind(this));
    this.handlers.set("loadGame", this.loadGame.bind(this));
    this.handlers.set("resetGame", this.resetGame.bind(this));
    this.handlers.set("exportSave", this.exportSave.bind(this));
    this.handlers.set("importSave", this.importSave.bind(this));
    this.handlers.set("showAchievements", this.showAchievements.bind(this));

    // Advanced/End game handlers
    this.handlers.set("launchProbe", this.launchProbe.bind(this));
    this.handlers.set("feedSwarm", this.feedSwarm.bind(this));
    this.handlers.set("teachSwarm", this.teachSwarm.bind(this));
    this.handlers.set("harvestMatter", this.harvestMatter.bind(this));
    this.handlers.set("convertMatter", this.convertMatter.bind(this));
  }

  /**
   * Set up event delegation for better performance
   */
  setupEventDelegation() {
    document.addEventListener("click", this.boundHandlers.click);
    document.addEventListener("change", this.boundHandlers.change);
    document.addEventListener("input", this.boundHandlers.input);
    document.addEventListener("keydown", this.boundHandlers.keydown);
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
        errorHandler.handleError(error, `events.${action}`, {
          element: element.id,
        });
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
        errorHandler.handleError(error, `events.${action}`, {
          element: element.id,
        });
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
        errorHandler.handleError(error, `events.${action}`, {
          element: element.id,
        });
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

    const shortcutKey = `${ctrl ? "ctrl+" : ""}${alt ? "alt+" : ""}${shift ? "shift+" : ""}${key}`;

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
    this.shortcuts.set(" ", () => this.makeClip());

    // Number keys for quick actions
    this.shortcuts.set("1", () => this.buyAutoClipper());
    this.shortcuts.set("2", () => this.buyMegaClipper());
    this.shortcuts.set("3", () => this.buyWire());
    this.shortcuts.set("4", () => this.buyAds());

    // Arrow keys for price adjustment
    this.shortcuts.set("arrowup", () => this.raisePrice());
    this.shortcuts.set("arrowdown", () => this.lowerPrice());

    // Ctrl+S for save
    this.shortcuts.set("ctrl+s", () => this.saveGame());

    // Ctrl+L for load
    this.shortcuts.set("ctrl+l", () => this.loadGame());

    // Escape for reset (with confirmation)
    this.shortcuts.set("escape", () => this.confirmReset());
  }

  // ====== EVENT HANDLERS ======

  /**
   * Make paperclip(s)
   */
  makeClip(event, _element) {
    const amount = event?.shiftKey ? 10 : 1;
    if (this.systems.production) {
      this.systems.production.manualClip(amount);
    }
  }

  /**
   * Make batch of paperclips (quick buttons)
   */
  makeClipBatch(_event, element) {
    const amount = parseInt(element.dataset.amount, 10) || 10;
    if (this.systems.production) {
      this.systems.production.manualClip(amount);
      this.showFeedback(`Made ${amount} paperclips!`, "success");
    }
  }

  /**
   * Buy AutoClipper
   */
  buyAutoClipper(_event, _element) {
    if (this.systems.production) {
      const success = this.systems.production.buyAutoClipper();
      if (success) {
        this.showFeedback("AutoClipper purchased!", "success");
        this.gameState.emit("purchase", { item: "AutoClipper" });
      } else {
        this.showFeedback("Cannot afford AutoClipper", "error");
        this.gameState.emit("insufficient", {
          resource: "funds",
          action: "buy AutoClipper",
        });
      }
    }
  }

  /**
   * Buy MegaClipper
   */
  buyMegaClipper(_event, _element) {
    if (this.systems.production) {
      const success = this.systems.production.buyMegaClipper();
      if (success) {
        this.showFeedback("MegaClipper purchased!", "success");
      } else {
        this.showFeedback("Cannot afford MegaClipper", "error");
      }
    }
  }

  /**
   * Raise clip price
   */
  raisePrice(_event, _element) {
    if (this.systems.market) {
      this.systems.market.raisePrice();
    }
  }

  /**
   * Lower clip price
   */
  lowerPrice(_event, _element) {
    if (this.systems.market) {
      const success = this.systems.market.lowerPrice();
      if (!success) {
        this.showFeedback("Price cannot go lower", "warning");
      }
    }
  }

  /**
   * Buy advertising
   */
  buyAds(_event, _element) {
    if (this.systems.market) {
      const success = this.systems.market.buyMarketing();
      if (success) {
        this.showFeedback("Marketing purchased!", "success");
      } else {
        this.showFeedback("Cannot afford marketing", "error");
      }
    }
  }

  /**
   * Buy wire
   */
  buyWire(_event, _element) {
    if (this.systems.market) {
      const success = this.systems.market.buyWire();
      if (success) {
        this.showFeedback("Wire purchased!", "success");
      } else {
        this.showFeedback("Cannot afford wire", "error");
      }
    }
  }

  /**
   * Toggle wire buyer
   */
  toggleWireBuyer(_event, _element) {
    if (this.systems.market) {
      const enabled = this.systems.market.toggleWireBuyer();
      this.showFeedback(
        `Wire buyer ${enabled ? "enabled" : "disabled"}`,
        "info",
      );
    }
  }

  /**
   * Buy processor
   */
  buyProcessor(_event, _element) {
    if (this.systems.computing) {
      const success = this.systems.computing.buyProcessor();
      if (success) {
        this.showFeedback("Processor purchased!", "success");
      } else {
        this.showFeedback(
          "Cannot afford processor or trust limit reached",
          "error",
        );
      }
    }
  }

  /**
   * Buy memory
   */
  buyMemory(_event, _element) {
    if (this.systems.computing) {
      const success = this.systems.computing.buyMemory();
      if (success) {
        this.showFeedback("Memory purchased!", "success");
      } else {
        this.showFeedback(
          "Cannot afford memory or trust limit reached",
          "error",
        );
      }
    }
  }

  /**
   * Toggle creativity allocation
   */
  toggleCreativity(_event, _element) {
    if (this.systems.computing) {
      const enabled = !this.gameState.get("computing.creativity.enabled");
      this.systems.computing.setCreativity(enabled, 50);
      this.showFeedback(
        `Creativity ${enabled ? "enabled" : "disabled"}`,
        "info",
      );
    }
  }

  /**
   * Toggle AutoClippers on/off
   */
  toggleAutoClippers(_event, _element) {
    const enabled =
      this.gameState.get("production.autoClippersEnabled") !== false;
    this.gameState.set("production.autoClippersEnabled", !enabled);
    this.showFeedback(
      `AutoClippers ${!enabled ? "enabled" : "disabled"}`,
      "info",
    );
  }

  /**
   * Toggle MegaClippers on/off
   */
  toggleMegaClippers(_event, _element) {
    const enabled =
      this.gameState.get("production.megaClippersEnabled") !== false;
    this.gameState.set("production.megaClippersEnabled", !enabled);
    this.showFeedback(
      `MegaClippers ${!enabled ? "enabled" : "disabled"}`,
      "info",
    );
  }

  /**
   * Toggle Quantum Computing on/off
   */
  toggleQuantumComputing(_event, _element) {
    const enabled = this.gameState.get("computing.quantum.enabled");
    this.gameState.set("computing.quantum.enabled", !enabled);
    this.showFeedback(
      `Quantum Computing ${!enabled ? "enabled" : "disabled"}`,
      "info",
    );
  }

  /**
   * Toggle Strategic Modeling on/off
   */
  toggleStrategicModeling(_event, _element) {
    const enabled = this.gameState.get("computing.strategicModeling.enabled");
    this.gameState.set("computing.strategicModeling.enabled", !enabled);
    this.showFeedback(
      `Strategic Modeling ${!enabled ? "enabled" : "disabled"}`,
      "info",
    );
  }

  /**
   * Adjust creativity allocation
   */
  adjustCreativity(_event, element) {
    if (this.systems.computing) {
      const value = parseInt(element.value, 10);
      this.systems.computing.setCreativity(true, value);
    }
  }

  /**
   * Allocate probe statistics
   */
  allocateProbeStats(_event, _element) {
    if (this.systems.combat) {
      const combatEl = document.getElementById("probeCombat");
      const speedEl = document.getElementById("probeSpeed");
      const replicationEl = document.getElementById("probeReplication");

      const combat = combatEl ? parseInt(combatEl.value, 10) : 0;
      const speed = speedEl ? parseInt(speedEl.value, 10) : 0;
      const replication = replicationEl ? parseInt(replicationEl.value, 10) : 0;

      const success = this.systems.combat.allocateProbeStats(
        combat,
        speed,
        replication,
      );
      if (success) {
        this.showFeedback("Probe stats allocated", "success");
      } else {
        this.showFeedback("Stats must total 100%", "error");
      }
    }
  }

  /**
   * Toggle combat mode
   */
  toggleCombat(_event, _element) {
    if (this.systems.combat) {
      const enabled = !this.gameState.get("combat.battleEnabled");
      if (enabled) {
        this.systems.combat.enableCombat();
      } else {
        this.systems.combat.disableCombat();
      }
      this.showFeedback(`Combat ${enabled ? "enabled" : "disabled"}`, "info");
    }
  }

  /**
   * Complete project
   */
  completeProject(_event, element) {
    if (this.systems.projects) {
      const projectId = element.dataset.projectId;
      const success = this.systems.projects.completeProject(projectId);
      if (success) {
        this.showFeedback("Project completed!", "success");
      } else {
        this.showFeedback("Cannot complete project", "error");
      }
    }
  }

  /**
   * Save game
   */
  saveGame(_event, _element) {
    const success = this.gameState.save();
    if (success) {
      this.showFeedback("Game saved!", "success");
    } else {
      this.showFeedback("Save failed!", "error");
    }
  }

  /**
   * Load game
   */
  loadGame(_event, _element) {
    const success = this.gameState.load();
    if (success) {
      this.showFeedback("Game loaded!", "success");
    } else {
      this.showFeedback("Load failed!", "error");
    }
  }

  /**
   * Reset game with confirmation
   */
  resetGame(_event, _element) {
    if (
      confirm("Are you sure you want to reset the game? This cannot be undone.")
    ) {
      this.gameState.reset();
      this.showFeedback("Game reset!", "info");
    }
  }

  /**
   * Confirm reset (for keyboard shortcut)
   */
  confirmReset() {
    if (
      confirm("Reset game? Press OK to confirm, Cancel to continue playing.")
    ) {
      this.resetGame();
    }
  }

  /**
   * Export save data
   */
  exportSave(_event, _element) {
    try {
      const saveData = this.gameState.export();

      // Create download link
      const blob = new Blob([saveData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `paperclips-save-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      this.showFeedback("Save exported!", "success");
    } catch (error) {
      errorHandler.handleError(error, "events.exportSave");
      this.showFeedback("Export failed!", "error");
    }
  }

  /**
   * Import save data
   */
  importSave(_event, _element) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const success = this.gameState.import(e.target.result);
          if (success) {
            this.showFeedback("Save imported!", "success");
          } else {
            this.showFeedback("Import failed!", "error");
          }
        } catch (error) {
          errorHandler.handleError(error, "events.importSave");
          this.showFeedback("Invalid save file!", "error");
        }
      };
      reader.readAsText(file);
    };

    fileInput.click();
  }

  /**
   * Show achievements panel
   */
  showAchievements(_event, _element) {
    try {
      // Import at runtime to avoid circular dependencies
      import("./achievementUI.js").then(({ achievementUI }) => {
        achievementUI.showPanel();
      });
    } catch (error) {
      errorHandler.handleError(error, "events.showAchievements");
      this.showFeedback("Error opening achievements!", "error");
    }
  }

  /**
   * Launch a space probe
   */
  launchProbe(_event, _element) {
    if (this.systems.space) {
      const success = this.systems.space.launchProbe();
      if (success) {
        this.showFeedback("Probe launched!", "success");
      } else {
        this.showFeedback(
          "Cannot launch probe - insufficient resources",
          "error",
        );
      }
    } else {
      // Fallback if space system not yet implemented
      this.showFeedback("Space exploration not yet available", "warning");
    }
  }

  /**
   * Feed the swarm
   */
  feedSwarm(_event, _element) {
    if (this.systems.swarm) {
      const success = this.systems.swarm.feedSwarm();
      if (success) {
        this.showFeedback("Swarm fed successfully!", "success");
      } else {
        this.showFeedback(
          "Cannot feed swarm - insufficient resources",
          "error",
        );
      }
    } else {
      // Fallback if swarm system not yet implemented
      this.showFeedback("Swarm computing not yet available", "warning");
    }
  }

  /**
   * Teach the swarm
   */
  teachSwarm(_event, _element) {
    if (this.systems.swarm) {
      const success = this.systems.swarm.teachSwarm();
      if (success) {
        this.showFeedback("Swarm taught new patterns!", "success");
      } else {
        this.showFeedback(
          "Cannot teach swarm - insufficient resources",
          "error",
        );
      }
    } else {
      // Fallback if swarm system not yet implemented
      this.showFeedback("Swarm computing not yet available", "warning");
    }
  }

  /**
   * Harvest matter
   */
  harvestMatter(_event, _element) {
    if (this.systems.endGame) {
      const success = this.systems.endGame.harvestMatter();
      if (success) {
        this.showFeedback("Matter harvested!", "success");
      } else {
        this.showFeedback(
          "Cannot harvest matter - no available sources",
          "error",
        );
      }
    } else {
      // Fallback if end game system not yet implemented
      this.showFeedback("Matter harvesting not yet available", "warning");
    }
  }

  /**
   * Convert matter to paperclips
   */
  convertMatter(_event, _element) {
    if (this.systems.endGame) {
      const success = this.systems.endGame.convertMatter();
      if (success) {
        this.showFeedback("Matter converted to paperclips!", "success");
      } else {
        this.showFeedback(
          "Cannot convert matter - insufficient matter",
          "error",
        );
      }
    } else {
      // Fallback if end game system not yet implemented
      this.showFeedback("Matter conversion not yet available", "warning");
    }
  }

  /**
   * Show user feedback message
   */
  showFeedback(message, type = "info") {
    // Create or update feedback element
    let feedbackElement = document.getElementById("feedback");
    if (!feedbackElement) {
      feedbackElement = document.createElement("div");
      feedbackElement.id = "feedback";
      feedbackElement.className = "feedback";
      document.body.appendChild(feedbackElement);
    }

    feedbackElement.textContent = message;
    feedbackElement.className = `feedback ${type}`;
    feedbackElement.style.display = "block";

    // Auto-hide after 3 seconds
    setTimeout(() => {
      feedbackElement.style.display = "none";
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
      activeEvents: ["click", "change", "input", "keydown"].length,
    };
  }

  // ====== NEW MULTI-PURCHASE HANDLERS ======

  /**
   * Multi-purchase AutoClipper handler
   */
  buyAutoClipperMulti(_event, element) {
    const amount = this.getMultiPurchaseAmount(element.dataset.action);
    if (this.systems.production) {
      for (let i = 0; i < amount; i++) {
        const success = this.systems.production.buyAutoClipper();
        if (!success) break;
      }
      this.showFeedback(
        `${amount > 1 ? `${amount} ` : ""}AutoClipper${amount > 1 ? "s" : ""} purchased!`,
        "success",
      );
    }
  }

  /**
   * Multi-purchase MegaClipper handler
   */
  buyMegaClipperMulti(_event, element) {
    const amount = this.getMultiPurchaseAmount(element.dataset.action);
    if (this.systems.production) {
      for (let i = 0; i < amount; i++) {
        const success = this.systems.production.buyMegaClipper();
        if (!success) break;
      }
      this.showFeedback(
        `${amount > 1 ? `${amount} ` : ""}MegaClipper${amount > 1 ? "s" : ""} purchased!`,
        "success",
      );
    }
  }

  /**
   * Multi-purchase Factory handler
   */
  buyFactoryMulti(_event, element) {
    const amount = this.getMultiPurchaseAmount(element.dataset.action);
    if (this.systems.production) {
      for (let i = 0; i < amount; i++) {
        const success = this.systems.production.buyFactory();
        if (!success) break;
      }
      this.showFeedback(
        `${amount > 1 ? `${amount} ` : ""}Factor${amount > 1 ? "ies" : "y"} purchased!`,
        "success",
      );
    }
  }

  /**
   * Multi-purchase Wire handler
   */
  buyWireMulti(_event, element) {
    const amount = this.getWirePurchaseAmount(element.dataset.action);
    if (this.systems.market) {
      const success = this.systems.market.buyWire(amount);
      if (success) {
        this.showFeedback(`${amount} wire purchased!`, "success");
      } else {
        this.showFeedback("Cannot afford wire", "error");
      }
    }
  }

  /**
   * Multi-purchase Processor handler
   */
  buyProcessorMulti(_event, element) {
    const amount = this.getMultiPurchaseAmount(element.dataset.action);
    if (this.systems.computing) {
      for (let i = 0; i < amount; i++) {
        const success = this.systems.computing.buyProcessor();
        if (!success) break;
      }
      this.showFeedback(
        `${amount > 1 ? `${amount} ` : ""}Processor${amount > 1 ? "s" : ""} purchased!`,
        "success",
      );
    }
  }

  /**
   * Multi-purchase Memory handler
   */
  buyMemoryMulti(_event, element) {
    const amount = this.getMultiPurchaseAmount(element.dataset.action);
    if (this.systems.computing) {
      for (let i = 0; i < amount; i++) {
        const success = this.systems.computing.buyMemory();
        if (!success) break;
      }
      this.showFeedback(
        `${amount > 1 ? `${amount} ` : ""}Memory purchased!`,
        "success",
      );
    }
  }

  /**
   * Multi-purchase Probe launcher handler
   */
  launchProbeMulti(_event, element) {
    const amount = this.getLaunchPurchaseAmount(element.dataset.action);
    if (this.systems.space) {
      for (let i = 0; i < amount; i++) {
        const success = this.systems.space.launchProbe();
        if (!success) break;
      }
      this.showFeedback(
        `${amount} probe${amount > 1 ? "s" : ""} launched!`,
        "success",
      );
    }
  }

  /**
   * Multi-purchase Harvester handler
   */
  buyHarvesterMulti(_event, element) {
    const amount = this.getMultiPurchaseAmount(element.dataset.action);
    if (this.systems.space) {
      for (let i = 0; i < amount; i++) {
        const success = this.systems.space.buyHarvester();
        if (!success) break;
      }
      this.showFeedback(
        `${amount > 1 ? `${amount} ` : ""}Harvester${amount > 1 ? "s" : ""} purchased!`,
        "success",
      );
    }
  }

  /**
   * Multi-purchase Wire Drone handler
   */
  buyWireDroneMulti(_event, element) {
    const amount = this.getMultiPurchaseAmount(element.dataset.action);
    if (this.systems.space) {
      for (let i = 0; i < amount; i++) {
        const success = this.systems.space.buyWireDrone();
        if (!success) break;
      }
      this.showFeedback(
        `${amount > 1 ? `${amount} ` : ""}Wire Drone${amount > 1 ? "s" : ""} purchased!`,
        "success",
      );
    }
  }

  /**
   * Multi-purchase Solar Farm handler
   */
  buySolarFarmMulti(_event, element) {
    const amount = this.getMultiPurchaseAmount(element.dataset.action);
    if (this.systems.power) {
      for (let i = 0; i < amount; i++) {
        const success = this.systems.power.buySolarFarm();
        if (!success) break;
      }
      this.showFeedback(
        `${amount > 1 ? `${amount} ` : ""}Solar Farm${amount > 1 ? "s" : ""} purchased!`,
        "success",
      );
    }
  }

  /**
   * Multi-purchase Battery handler
   */
  buyBatteryMulti(_event, element) {
    const amount = this.getMultiPurchaseAmount(element.dataset.action);
    if (this.systems.power) {
      for (let i = 0; i < amount; i++) {
        const success = this.systems.power.buyBattery();
        if (!success) break;
      }
      this.showFeedback(
        `${amount > 1 ? `${amount} ` : ""}Batter${amount > 1 ? "ies" : "y"} purchased!`,
        "success",
      );
    }
  }

  // ====== PROBE DESIGN HANDLERS ======

  /**
   * Increase probe design stat handler
   */
  increaseProbeDesign(_event, element) {
    const stat = this.getProbeStatFromAction(element.dataset.action);
    if (this.systems.space) {
      const success = this.systems.space.increaseProbeDesign(stat);
      if (success) {
        this.showFeedback(`Increased probe ${stat}`, "success");
      } else {
        this.showFeedback("Cannot increase probe stat", "error");
      }
    }
  }

  /**
   * Decrease probe design stat handler
   */
  decreaseProbeDesign(_event, element) {
    const stat = this.getProbeStatFromAction(element.dataset.action);
    if (this.systems.space) {
      const success = this.systems.space.decreaseProbeDesign(stat);
      if (success) {
        this.showFeedback(`Decreased probe ${stat}`, "success");
      } else {
        this.showFeedback("Cannot decrease probe stat", "error");
      }
    }
  }

  // ====== INVESTMENT HANDLERS ======

  /**
   * Multi-investment handler
   */
  investMulti(_event, element) {
    const amount = this.getInvestmentAmount(element.dataset.action);
    if (this.systems.investment) {
      const success = this.systems.investment.invest(amount);
      if (success) {
        this.showFeedback(`Invested $${amount.toLocaleString()}`, "success");
      } else {
        this.showFeedback("Cannot afford investment", "error");
      }
    }
  }

  /**
   * Multi-withdrawal handler
   */
  withdrawMulti(_event, element) {
    const amount = this.getInvestmentAmount(element.dataset.action);
    if (this.systems.investment) {
      const success = this.systems.investment.withdraw(amount);
      if (success) {
        this.showFeedback(`Withdrew $${amount.toLocaleString()}`, "success");
      } else {
        this.showFeedback("Cannot withdraw that amount", "error");
      }
    }
  }

  // ====== STRATEGIC MODELING HANDLERS ======

  /**
   * Adjust risk slider handler
   */
  adjustRisk(_event, element) {
    const value = parseInt(element.value, 10);
    if (this.systems.strategy) {
      this.systems.strategy.setRisk(value);
    }
  }

  /**
   * Run tournament handler
   */
  runTournament(_event, _element) {
    if (this.systems.strategy) {
      const success = this.systems.strategy.runTournament();
      if (success) {
        this.showFeedback("Tournament started!", "success");
      } else {
        this.showFeedback("Cannot run tournament", "error");
      }
    }
  }

  /**
   * Select strategy handler
   */
  selectStrategy(_event, element) {
    const strategy = this.getStrategyFromAction(element.dataset.action);
    if (this.systems.strategy) {
      this.systems.strategy.selectStrategy(strategy);
      this.showFeedback(`Strategy set to ${strategy}`, "success");
    }
  }

  // ====== SWARM HANDLERS ======

  /**
   * Adjust swarm work allocation handler
   */
  adjustSwarmWork(_event, element) {
    const value = parseInt(element.value, 10);
    if (this.systems.swarm) {
      this.systems.swarm.setWorkAllocation(value);
    }
  }

  /**
   * Synchronize swarm handler
   */
  synchronizeSwarm(_event, _element) {
    if (this.systems.swarm) {
      const success = this.systems.swarm.synchronize();
      if (success) {
        this.showFeedback("Swarm synchronized!", "success");
      } else {
        this.showFeedback("Cannot synchronize swarm", "error");
      }
    }
  }

  /**
   * Entertain swarm handler
   */
  entertainSwarm(_event, _element) {
    if (this.systems.swarm) {
      const success = this.systems.swarm.entertain();
      if (success) {
        this.showFeedback("Swarm entertained!", "success");
      } else {
        this.showFeedback("Cannot entertain swarm", "error");
      }
    }
  }

  // ====== QUANTUM COMPUTING HANDLERS ======

  /**
   * Quantum compute handler
   */
  quantumCompute(_event, _element) {
    if (this.systems.computing) {
      const success = this.systems.computing.quantumCompute();
      if (success) {
        this.showFeedback("Quantum computation executed!", "success");
      } else {
        this.showFeedback("Cannot perform quantum computation", "error");
      }
    }
  }

  /**
   * Adjust thinking allocation handler
   */
  adjustThinking(_event, element) {
    const value = parseInt(element.value, 10);
    if (this.systems.computing) {
      this.systems.computing.setThinkingAllocation(value);
    }
  }

  // ====== UTILITY METHODS ======

  /**
   * Get multi-purchase amount from action
   */
  getMultiPurchaseAmount(action) {
    if (action.includes("1")) return 1;
    if (action.includes("10")) return 10;
    if (action.includes("100")) return 100;
    return 1;
  }

  /**
   * Get wire purchase amount from action
   */
  getWirePurchaseAmount(action) {
    if (action.includes("1000")) return 1000;
    if (action.includes("10000")) return 10000;
    if (action.includes("100000")) return 100000;
    return 1000;
  }

  /**
   * Get launch purchase amount from action
   */
  getLaunchPurchaseAmount(action) {
    if (action.includes("1000")) return 1000;
    if (action.includes("100")) return 100;
    if (action.includes("10")) return 10;
    if (action.includes("1")) return 1;
    return 1;
  }

  /**
   * Get investment amount from action
   */
  getInvestmentAmount(action) {
    if (action.includes("1000")) return 1000;
    if (action.includes("10000")) return 10000;
    if (action.includes("100000")) return 100000;
    return 1000;
  }

  /**
   * Get probe stat from action
   */
  getProbeStatFromAction(action) {
    if (action.includes("Combat")) return "combat";
    if (action.includes("Speed")) return "speed";
    if (action.includes("Replication")) return "replication";
    if (action.includes("SelfRep")) return "selfRep";
    if (action.includes("Hazard")) return "hazard";
    if (action.includes("Factory")) return "factory";
    if (action.includes("WireDrone")) return "wireDrone";
    if (action.includes("Exploration")) return "exploration";
    return "combat";
  }

  /**
   * Get strategy from action
   */
  getStrategyFromAction(action) {
    if (action.includes("A")) return "A";
    if (action.includes("B")) return "B";
    if (action.includes("Random")) return "Random";
    return "A";
  }

  /**
   * Cleanup event listeners
   */
  cleanup() {
    document.removeEventListener("click", this.boundHandlers.click);
    document.removeEventListener("change", this.boundHandlers.change);
    document.removeEventListener("input", this.boundHandlers.input);
    document.removeEventListener("keydown", this.boundHandlers.keydown);

    errorHandler.info("Events system cleaned up");
  }
}

export default EventsSystem;
