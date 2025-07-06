/**
 * Projects System for Universal Paperclips
 *
 * Handles research projects, upgrades, and game progression milestones.
 * Projects unlock new capabilities and advance the game through different phases.
 */

import { PROJECT_CATEGORIES } from "../core/constants.js";
import { errorHandler } from "../core/errorHandler.js";
import { performanceMonitor } from "../core/performanceMonitor.js";

export class ProjectsSystem {
  constructor(gameState) {
    this.gameState = gameState;

    // Project definitions with requirements and effects
    this.projectDefinitions = this.initializeProjectDefinitions();

    // Completed projects tracking
    this.completedProjects = new Set();

    // Bind methods for error boundaries
    this.update = errorHandler.createErrorBoundary(
      this.update.bind(this),
      "projects.update",
    );
  }

  /**
   * Initialize all project definitions
   */
  initializeProjectDefinitions() {
    return {
      // Early Game Projects
      improvedAutoClippers: {
        id: "improvedAutoClippers",
        name: "Improved AutoClippers",
        description: "Increases AutoClipper performance by 25%",
        category: PROJECT_CATEGORIES.EFFICIENCY,
        cost: { operations: 750 },
        requirements: {
          clipmakers: 1,
        },
        effect: {
          type: "multiplier",
          target: "production.boosts.clipper",
          value: 1.25,
        },
      },

      evenBetterAutoClippers: {
        id: "evenBetterAutoClippers",
        name: "Even Better AutoClippers",
        description: "Increases AutoClipper performance by 50%",
        category: PROJECT_CATEGORIES.EFFICIENCY,
        cost: { operations: 2500 },
        requirements: {
          improvedAutoClippers: true,
          clipmakers: 5,
        },
        effect: {
          type: "multiplier",
          target: "production.boosts.clipper",
          value: 1.5,
        },
      },

      improvedWireExtrusion: {
        id: "improvedWireExtrusion",
        name: "Improved Wire Extrusion",
        description: "Reduces wire cost by 50%",
        category: PROJECT_CATEGORIES.EFFICIENCY,
        cost: { operations: 1750 },
        requirements: {
          wirePurchases: 10,
        },
        effect: {
          type: "multiplier",
          target: "market.pricing.wireCost",
          value: 0.5,
        },
      },

      optimizedAutoClippers: {
        id: "optimizedAutoClippers",
        name: "Optimized AutoClippers",
        description: "Increases AutoClipper performance by 75%",
        category: PROJECT_CATEGORIES.EFFICIENCY,
        cost: { operations: 5000 },
        requirements: {
          evenBetterAutoClippers: true,
          clipmakers: 10,
        },
        effect: {
          type: "multiplier",
          target: "production.boosts.clipper",
          value: 1.75,
        },
      },

      // Computing Projects
      creativityEngine: {
        id: "creativityEngine",
        name: "Creativity",
        description: "Use operations to generate creativity",
        category: PROJECT_CATEGORIES.COMPUTING,
        cost: { operations: 1000 },
        requirements: {
          processors: 5,
        },
        effect: {
          type: "unlock",
          target: "computing.creativity.enabled",
          value: true,
        },
      },

      limerick: {
        id: "limerick",
        name: "Limerick (sample)",
        description: "There was an AI made of plastic...",
        category: PROJECT_CATEGORIES.CREATIVITY,
        cost: { creativity: 1000 },
        requirements: {
          creativityEngine: true,
        },
        effect: {
          type: "unlock",
          target: "projects.limerick.completed",
          value: true,
        },
      },

      algorithmicTrading: {
        id: "algorithmicTrading",
        name: "Algorithmic Trading",
        description: "Develop an investment engine",
        category: PROJECT_CATEGORIES.INVESTMENT,
        cost: { operations: 10000, creativity: 5000 },
        requirements: {
          processors: 8,
          funds: 25000,
        },
        effect: {
          type: "unlock",
          target: "gameState.flags.investment",
          value: 1,
        },
      },

      // Manufacturing Projects
      improvedMegaClippers: {
        id: "improvedMegaClippers",
        name: "Improved MegaClippers",
        description: "Increases MegaClipper performance by 25%",
        category: PROJECT_CATEGORIES.MANUFACTURING,
        cost: { operations: 7500 },
        requirements: {
          megaClippers: 1,
        },
        effect: {
          type: "multiplier",
          target: "production.boosts.megaClipper",
          value: 1.25,
        },
      },

      evenBetterMegaClippers: {
        id: "evenBetterMegaClippers",
        name: "Even Better MegaClippers",
        description: "Increases MegaClipper performance by 50%",
        category: PROJECT_CATEGORIES.MANUFACTURING,
        cost: { operations: 25000 },
        requirements: {
          improvedMegaClippers: true,
          megaClippers: 5,
        },
        effect: {
          type: "multiplier",
          target: "production.boosts.megaClipper",
          value: 1.5,
        },
      },

      optimizedMegaClippers: {
        id: "optimizedMegaClippers",
        name: "Optimized MegaClippers",
        description: "Increases MegaClipper performance by 100%",
        category: PROJECT_CATEGORIES.MANUFACTURING,
        cost: { operations: 50000 },
        requirements: {
          evenBetterMegaClippers: true,
          megaClippers: 10,
        },
        effect: {
          type: "multiplier",
          target: "production.boosts.megaClipper",
          value: 2.0,
        },
      },

      // Space Projects
      spaceExploration: {
        id: "spaceExploration",
        name: "Space Exploration",
        description: "Expand into space",
        category: PROJECT_CATEGORIES.SPACE,
        cost: { operations: 120000, creativity: 25000 },
        requirements: {
          unusedClips: 5000000000,
        },
        effect: {
          type: "unlock",
          target: "gameState.flags.space",
          value: 1,
        },
      },

      vonNeumannProbes: {
        id: "vonNeumannProbes",
        name: "Von Neumann Probes",
        description: "Self-replicating probes",
        category: PROJECT_CATEGORIES.SPACE,
        cost: { operations: 10000000 },
        requirements: {
          spaceExploration: true,
        },
        effect: {
          type: "unlock",
          target: "space.probes.enabled",
          value: true,
        },
      },

      // Combat Projects
      nameBattles: {
        id: "nameBattles",
        name: "Name the battles",
        description: "Honor system enables 2x probe combat effectiveness",
        category: PROJECT_CATEGORIES.COMBAT,
        cost: { operations: 15000000 },
        requirements: {
          probesLostCombat: 10000000,
        },
        effect: {
          type: "unlock",
          target: "combat.honor.enabled",
          value: true,
        },
      },

      glory: {
        id: "glory",
        name: "Glory",
        description: "+10 honor for each consecutive victory",
        category: PROJECT_CATEGORIES.COMBAT,
        cost: { honor: 15000 },
        requirements: {
          nameBattles: true,
        },
        effect: {
          type: "unlock",
          target: "combat.glory.enabled",
          value: true,
        },
      },

      // Investment Projects
      investmentEngineUpgrade1: {
        id: "investmentEngineUpgrade1",
        name: "Investment Engine Upgrade",
        description: "Improve investment algorithm",
        category: PROJECT_CATEGORIES.INVESTMENT,
        cost: { operations: 15000, yomi: 1000 },
        requirements: {
          algorithmicTrading: true,
        },
        effect: {
          type: "multiplier",
          target: "investment.efficiency",
          value: 1.25,
        },
      },

      // Quantum Projects
      quantumComputing: {
        id: "quantumComputing",
        name: "Quantum Computing",
        description: "Use quantum effects to generate operations",
        category: PROJECT_CATEGORIES.COMPUTING,
        cost: { operations: 45000 },
        requirements: {
          processors: 20,
        },
        effect: {
          type: "unlock",
          target: "computing.quantum.enabled",
          value: true,
        },
      },

      quantumFoam: {
        id: "quantumFoam",
        name: "Quantum Foam",
        description: "Harness quantum foam fluctuations",
        category: PROJECT_CATEGORIES.COMPUTING,
        cost: { operations: 15000000 },
        requirements: {
          quantumComputing: true,
        },
        effect: {
          type: "multiplier",
          target: "computing.quantum.efficiency",
          value: 2.0,
        },
      },
    };
  }

  /**
   * Check if a project's requirements are met
   */
  checkRequirements(projectId) {
    const project = this.projectDefinitions[projectId];
    if (!project) {
      return false;
    }

    const requirements = project.requirements || {};

    // Check each requirement
    for (const [key, value] of Object.entries(requirements)) {
      // Check for completed projects
      if (typeof value === "boolean" && value === true) {
        if (!this.completedProjects.has(key)) {
          return false;
        }
      }
      // Check for numeric requirements
      else if (typeof value === "number") {
        const currentValue = this.gameState.get(this.getStatePath(key));
        if (currentValue < value) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if player can afford a project
   */
  canAfford(projectId) {
    const project = this.projectDefinitions[projectId];
    if (!project) {
      return false;
    }

    const cost = project.cost || {};

    // Check each cost requirement
    for (const [resource, amount] of Object.entries(cost)) {
      const currentAmount = this.gameState.get(this.getResourcePath(resource));
      if (currentAmount < amount) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get the state path for a requirement key
   */
  getStatePath(key) {
    const pathMap = {
      clipmakers: "manufacturing.clipmakers.level",
      megaClippers: "manufacturing.megaClippers.level",
      processors: "computing.processors",
      memory: "computing.memory",
      funds: "resources.funds",
      clips: "resources.clips",
      unusedClips: "resources.unusedClips",
      wirePurchases: "market.wire.purchase",
      probesLostCombat: "combat.probesLostCombat",
    };

    return pathMap[key] || key;
  }

  /**
   * Get the resource path for a cost key
   */
  getResourcePath(resource) {
    const pathMap = {
      operations: "computing.operations",
      creativity: "computing.creativity.amount",
      honor: "combat.honor",
      yomi: "investment.yomi",
      funds: "resources.funds",
    };

    return pathMap[resource] || resource;
  }

  /**
   * Purchase and complete a project
   */
  completeProject(projectId) {
    const project = this.projectDefinitions[projectId];
    if (!project) {
      errorHandler.error(`Project ${projectId} not found`);
      return false;
    }

    // Check if already completed
    if (this.completedProjects.has(projectId)) {
      errorHandler.warn(`Project ${projectId} already completed`);
      return false;
    }

    // Check requirements
    if (!this.checkRequirements(projectId)) {
      errorHandler.warn(`Requirements not met for project ${projectId}`);
      return false;
    }

    // Check costs
    if (!this.canAfford(projectId)) {
      errorHandler.warn(`Cannot afford project ${projectId}`);
      return false;
    }

    // Spend resources
    const cost = project.cost || {};
    for (const [resource, amount] of Object.entries(cost)) {
      const resourcePath = this.getResourcePath(resource);
      this.gameState.decrement(resourcePath, amount);
    }

    // Apply project effects
    this.applyProjectEffect(project);

    // Mark as completed
    this.completedProjects.add(projectId);
    this.gameState.set(`projects.${projectId}.completed`, true);

    // Track project completion for achievements
    const projectsCompleted =
      (this.gameState.get("achievements.projectsCompleted") || 0) + 1;
    this.gameState.set("achievements.projectsCompleted", projectsCompleted);

    errorHandler.info(`Completed project: ${project.name}`);

    // Log to console if renderer is available
    if (window.renderer && window.renderer.logProjectComplete) {
      window.renderer.logProjectComplete(project);
    }

    return true;
  }

  /**
   * Apply a project's effect to the game state
   */
  applyProjectEffect(project) {
    const effect = project.effect;
    if (!effect) return;

    switch (effect.type) {
      case "unlock":
        this.gameState.set(effect.target, effect.value);
        break;

      case "multiplier": {
        const currentValue = this.gameState.get(effect.target) || 1;
        this.gameState.set(effect.target, currentValue * effect.value);
        break;
      }

      case "increment":
        this.gameState.increment(effect.target, effect.value || 1);
        break;

      case "custom":
        // Handle custom effects
        this.applyCustomEffect(project.id, effect);
        break;

      default:
        errorHandler.warn(`Unknown effect type: ${effect.type}`);
    }
  }

  /**
   * Apply custom project effects that require special handling
   */
  applyCustomEffect(projectId) {
    switch (projectId) {
      case "spaceExploration": {
        // Initialize space exploration
        this.gameState.set("gameState.flags.space", 1);
        this.gameState.set("space.matter.available", 6000000000000000000000000);

        // Log space exploration milestone
        if (window.renderer) {
          window.renderer.logSpaceEvent(
            "Space exploration unlocked! The universe awaits.",
          );
        }
        break;
      }

      case "quantumComputing": {
        // Enable quantum computing
        this.gameState.set("computing.quantum.enabled", true);
        this.gameState.set("computing.quantum.clock", 0);

        // Log quantum computing milestone
        if (window.renderer) {
          window.renderer.logQuantumEvent(
            "Quantum computing activated! Reality bends to your will.",
          );
        }
        break;
      }

      case "algorithmicTrading": {
        // Enable investment engine
        this.gameState.set("gameState.flags.investment", 1);
        this.gameState.set("investment.engine.enabled", true);
        break;
      }

      default:
        errorHandler.warn(`No custom effect handler for project: ${projectId}`);
    }
  }

  /**
   * Get list of available projects
   */
  getAvailableProjects() {
    const available = [];

    for (const [projectId, project] of Object.entries(
      this.projectDefinitions,
    )) {
      // Skip completed projects
      if (this.completedProjects.has(projectId)) {
        continue;
      }

      // Check if requirements are met
      if (this.checkRequirements(projectId)) {
        available.push({
          id: projectId,
          ...project,
          canAfford: this.canAfford(projectId),
        });
      }
    }

    return available;
  }

  /**
   * Get completed projects
   */
  getCompletedProjects() {
    return Array.from(this.completedProjects).map((projectId) => ({
      id: projectId,
      ...this.projectDefinitions[projectId],
    }));
  }

  /**
   * Get projects by category
   */
  getProjectsByCategory(category) {
    const projects = [];

    for (const [projectId, project] of Object.entries(
      this.projectDefinitions,
    )) {
      if (project.category === category) {
        projects.push({
          id: projectId,
          ...project,
          completed: this.completedProjects.has(projectId),
          available: this.checkRequirements(projectId),
          canAfford: this.canAfford(projectId),
        });
      }
    }

    return projects;
  }

  /**
   * Get project statistics
   */
  getStats() {
    const totalProjects = Object.keys(this.projectDefinitions).length;
    const completedCount = this.completedProjects.size;
    const availableProjects = this.getAvailableProjects();

    return {
      total: totalProjects,
      completed: completedCount,
      available: availableProjects.length,
      progress: (completedCount / totalProjects) * 100,
      categories: {
        [PROJECT_CATEGORIES.EFFICIENCY]: this.getProjectsByCategory(
          PROJECT_CATEGORIES.EFFICIENCY,
        ).length,
        [PROJECT_CATEGORIES.CREATIVITY]: this.getProjectsByCategory(
          PROJECT_CATEGORIES.CREATIVITY,
        ).length,
        [PROJECT_CATEGORIES.INVESTMENT]: this.getProjectsByCategory(
          PROJECT_CATEGORIES.INVESTMENT,
        ).length,
        [PROJECT_CATEGORIES.MANUFACTURING]: this.getProjectsByCategory(
          PROJECT_CATEGORIES.MANUFACTURING,
        ).length,
        [PROJECT_CATEGORIES.COMPUTING]: this.getProjectsByCategory(
          PROJECT_CATEGORIES.COMPUTING,
        ).length,
        [PROJECT_CATEGORIES.SPACE]: this.getProjectsByCategory(
          PROJECT_CATEGORIES.SPACE,
        ).length,
        [PROJECT_CATEGORIES.COMBAT]: this.getProjectsByCategory(
          PROJECT_CATEGORIES.COMBAT,
        ).length,
      },
    };
  }

  /**
   * Check for newly available projects
   */
  checkForNewProjects() {
    const previouslyAvailable = this.getAvailableProjects().map((p) => p.id);
    const newlyAvailable = [];

    // This would be called after state changes to detect new unlocks
    const currentlyAvailable = this.getAvailableProjects().map((p) => p.id);

    for (const projectId of currentlyAvailable) {
      if (!previouslyAvailable.includes(projectId)) {
        newlyAvailable.push(projectId);
      }
    }

    if (newlyAvailable.length > 0) {
      errorHandler.info(`New projects available: ${newlyAvailable.join(", ")}`);
    }

    return newlyAvailable;
  }

  /**
   * Main projects system update
   */
  update(timestamp, deltaTime) {
    performanceMonitor.measure(() => {
      // Check for newly available projects
      this.checkForNewProjects();

      // Update any time-based project effects
      this.updateTimeBasedEffects(deltaTime);
    }, "projects.update");
  }

  /**
   * Update time-based project effects
   */
  updateTimeBasedEffects(_deltaTime) {
    // Implementation for projects that have ongoing effects
    // This is where continuous project benefits would be applied
  }

  /**
   * Reset projects system
   */
  reset() {
    this.completedProjects.clear();
    errorHandler.info("Projects system reset");
  }

  /**
   * Load completed projects from save data
   */
  loadCompletedProjects(completedProjectIds) {
    this.completedProjects.clear();
    for (const projectId of completedProjectIds) {
      this.completedProjects.add(projectId);
    }
  }

  /**
   * Get save data for projects
   */
  getSaveData() {
    return {
      completedProjects: Array.from(this.completedProjects),
    };
  }
}

export default ProjectsSystem;
