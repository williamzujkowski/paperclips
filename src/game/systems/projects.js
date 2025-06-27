/**
 * Projects system - handles upgrades, research, and special abilities
 */

import { gameState } from '../core/gameState.js';

/**
 * Represents a single project/upgrade
 */
class Project {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.cost = config.cost || {}; // { operations: 100, creativity: 50 }
    this.requirement = config.requirement || (() => true);
    this.effect = config.effect || (() => {});
    this.oneTime = config.oneTime !== false; // Default to one-time use
    this.purchased = false;
    this.visible = false;
  }

  /**
   * Check if project requirements are met
   */
  isAvailable() {
    if (this.purchased && this.oneTime) {
      return false;
    }
    return this.requirement(gameState);
  }

  /**
   * Check if player can afford the project
   */
  canAfford() {
    for (const [resource, amount] of Object.entries(this.cost)) {
      const path = this.getResourcePath(resource);
      const current = gameState.get(path) || 0;
      if (current < amount) {
        return false;
      }
    }
    return true;
  }

  /**
   * Purchase the project
   */
  purchase() {
    if (!this.canAfford() || !this.isAvailable()) {
      return false;
    }

    // Deduct costs
    for (const [resource, amount] of Object.entries(this.cost)) {
      const path = this.getResourcePath(resource);
      gameState.decrement(path, amount);
    }

    // Apply effect
    this.effect(gameState);

    // Mark as purchased
    this.purchased = true;

    return true;
  }

  /**
   * Get resource path for cost checking
   */
  getResourcePath(resource) {
    const resourceMap = {
      operations: 'computing.operations',
      creativity: 'computing.creativity',
      funds: 'resources.funds',
      clips: 'resources.clips',
      trust: 'computing.trust',
      honor: 'combat.honor',
    };
    return resourceMap[resource] || resource;
  }
}

export class ProjectsSystem {
  constructor() {
    this.projects = new Map();
    this.initializeProjects();
  }

  /**
   * Initialize all game projects
   */
  initializeProjects() {
    // Basic Projects
    this.addProject({
      id: 'improvedAutoclippers',
      name: 'Improved AutoClippers',
      description: 'Increases AutoClipper performance by 25%',
      cost: { operations: 750 },
      requirement: (state) => state.get('production.clipmakerLevel') >= 1,
      effect: (state) => {
        const current = state.get('production.clipperBoost');
        state.set('production.clipperBoost', current * 1.25);
      },
    });

    this.addProject({
      id: 'evenBetterAutoclippers',
      name: 'Even Better AutoClippers',
      description: 'Increases AutoClipper performance by another 50%',
      cost: { operations: 2500 },
      requirement: (_state) => this.isPurchased('improvedAutoclippers'),
      effect: (state) => {
        const current = state.get('production.clipperBoost');
        state.set('production.clipperBoost', current * 1.5);
      },
    });

    this.addProject({
      id: 'optimizedAutoclippers',
      name: 'Optimized AutoClippers',
      description: 'Increases AutoClipper performance by another 75%',
      cost: { operations: 5000 },
      requirement: (_state) => this.isPurchased('evenBetterAutoclippers'),
      effect: (state) => {
        const current = state.get('production.clipperBoost');
        state.set('production.clipperBoost', current * 1.75);
      },
    });

    // Trust Projects
    this.addProject({
      id: 'creativity',
      name: 'Creativity',
      description: 'Use idle operations to generate new problems and new solutions',
      cost: { operations: 1000 },
      requirement: (state) => state.get('computing.memory') >= 2,
      effect: (state) => {
        state.set('flags.creativity', true);
      },
    });

    this.addProject({
      id: 'limerick',
      name: 'Limerick',
      description: 'Algorithmically-generated poem (+1 Trust)',
      cost: { creativity: 10 },
      requirement: (state) => state.get('flags.creativity'),
      effect: (state) => {
        state.increment('computing.trust');
      },
      oneTime: false, // Can be purchased multiple times
    });

    // Marketing Projects
    this.addProject({
      id: 'newSlogan',
      name: 'New Slogan',
      description: 'Improve marketing effectiveness by 50%',
      cost: { creativity: 25, operations: 2500 },
      requirement: (state) => state.get('market.marketingLvl') >= 1,
      effect: (state) => {
        const current = state.get('market.marketingEffectiveness');
        state.set('market.marketingEffectiveness', current * 1.5);
      },
    });

    this.addProject({
      id: 'catchy',
      name: 'Catchy Jingle',
      description: 'Double marketing effectiveness',
      cost: { creativity: 45, operations: 4500 },
      requirement: (_state) => this.isPurchased('newSlogan'),
      effect: (state) => {
        const current = state.get('market.marketingEffectiveness');
        state.set('market.marketingEffectiveness', current * 2);
      },
    });

    // Quantum Computing
    this.addProject({
      id: 'quantumComputing',
      name: 'Quantum Computing',
      description: 'Convert operations into quantum computing cycles',
      cost: { operations: 10000 },
      requirement: (state) => state.get('computing.processors') >= 5,
      effect: (state) => {
        state.set('flags.quantum', true);
      },
    });

    // Mega Projects
    this.addProject({
      id: 'megaClippers',
      name: 'MegaClippers',
      description: 'Build MegaClippers (500x more powerful than AutoClippers)',
      cost: { operations: 12000 },
      requirement: (state) => state.get('production.clipmakerLevel') >= 75,
      effect: (state) => {
        state.set('flags.megaClipper', true);
      },
    });

    // Space Projects
    this.addProject({
      id: 'spaceExploration',
      name: 'Space Exploration',
      description: 'Dismantle terrestrial facilities and explore the universe',
      cost: { operations: 120000, funds: 1000000 },
      requirement: (state) => 
        state.get('resources.clips') >= 1000000000 &&
        state.get('production.clipmakerLevel') >= 100,
      effect: (state) => {
        state.set('flags.space', true);
        state.set('flags.human', false);
      },
    });

    // Combat Projects
    this.addProject({
      id: 'combatAlgorithms',
      name: 'Combat Algorithms',
      description: 'Upgrade probe combat capabilities (+1 Combat)',
      cost: { honor: 15 },
      requirement: (state) => state.get('flags.battle'),
      effect: (state) => {
        state.increment('combat.probeCombat');
      },
      oneTime: false,
    });

    this.addProject({
      id: 'strategyModeling',
      name: 'Strategic Modeling',
      description: 'Analyze battle data to improve tactics',
      cost: { operations: 50000 },
      requirement: (state) => 
        state.get('flags.battle') && 
        state.get('combat.driftersKilled') >= 100,
      effect: (state) => {
        state.set('flags.strategyEngine', true);
      },
    });
  }

  /**
   * Add a project to the system
   */
  addProject(config) {
    const project = new Project(config);
    this.projects.set(config.id, project);
  }

  /**
   * Get all available projects
   */
  getAvailableProjects() {
    const available = [];
    
    for (const project of this.projects.values()) {
      if (project.isAvailable()) {
        available.push({
          id: project.id,
          name: project.name,
          description: project.description,
          cost: project.cost,
          canAfford: project.canAfford(),
        });
      }
    }
    
    return available;
  }

  /**
   * Purchase a project
   */
  purchaseProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return false;
    }
    
    return project.purchase();
  }

  /**
   * Check if a project has been purchased
   */
  isPurchased(projectId) {
    const project = this.projects.get(projectId);
    return project ? project.purchased : false;
  }

  /**
   * Get project details
   */
  getProject(projectId) {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      cost: project.cost,
      purchased: project.purchased,
      available: project.isAvailable(),
      canAfford: project.canAfford(),
    };
  }

  /**
   * Reset all projects (for game reset)
   */
  reset() {
    for (const project of this.projects.values()) {
      project.purchased = false;
      project.visible = false;
    }
  }
}

// Create singleton instance
export const projectsSystem = new ProjectsSystem();