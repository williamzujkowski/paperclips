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
    this.handlers.set("buyAutoClipper", this.buyAutoClipper.bind(this));
    this.handlers.set("buyMegaClipper", this.buyMegaClipper.bind(this));
    this.handlers.set("toggleAutoClippers", this.toggleAutoClippers.bind(this));
    this.handlers.set("toggleMegaClippers", this.toggleMegaClippers.bind(this));

    // Market handlers
    this.handlers.set("raisePrice", this.raisePrice.bind(this));
    this.handlers.set("lowerPrice", this.lowerPrice.bind(this));
    this.handlers.set("buyAds", this.buyAds.bind(this));
    this.handlers.set("buyWire", this.buyWire.bind(this));
    this.handlers.set("toggleWireBuyer", this.toggleWireBuyer.bind(this));

    // Computing handlers
    this.handlers.set("buyProcessor", this.buyProcessor.bind(this));
    this.handlers.set("buyMemory", this.buyMemory.bind(this));
    this.handlers.set("toggleCreativity", this.toggleCreativity.bind(this));
    this.handlers.set("adjustCreativity", this.adjustCreativity.bind(this));
    this.handlers.set(
      "toggleQuantumComputing",
      this.toggleQuantumComputing.bind(this),
    );
    this.handlers.set(
      "toggleStrategicModeling",
      this.toggleStrategicModeling.bind(this),
    );

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
