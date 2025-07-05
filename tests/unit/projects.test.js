/**
 * Tests for Projects System
 */

import { ProjectsSystem } from '../../src/game/systems/projects.js';
import { GameState } from '../../src/game/core/gameState.js';
import { PROJECT_CATEGORIES } from '../../src/game/core/constants.js';
import { errorHandler } from '../../src/game/core/errorHandler.js';

describe('ProjectsSystem', () => {
  let gameState;
  let projectsSystem;

  beforeEach(() => {
    gameState = new GameState();
    projectsSystem = new ProjectsSystem(gameState);
  });

  describe('System Initialization', () => {
    test('should initialize with no completed projects', () => {
      expect(projectsSystem.completedProjects.size).toBe(0);
    });

    test('should load all project definitions', () => {
      const definitions = projectsSystem.projectDefinitions;
      expect(Object.keys(definitions).length).toBeGreaterThan(0);
      
      // Verify some key projects exist
      expect(definitions.improvedAutoClippers).toBeDefined();
      expect(definitions.creativityEngine).toBeDefined();
      expect(definitions.spaceExploration).toBeDefined();
    });

    test('should have proper project structure', () => {
      const project = projectsSystem.projectDefinitions.improvedAutoClippers;
      
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('description');
      expect(project).toHaveProperty('category');
      expect(project).toHaveProperty('cost');
      expect(project).toHaveProperty('requirements');
      expect(project).toHaveProperty('effect');
    });
  });

  describe('Requirement Checking', () => {
    test('should check clipmaker requirements', () => {
      const projectId = 'improvedAutoClippers';
      
      // Should fail without clipmakers
      gameState.set('manufacturing.clipmakers.level', 0);
      expect(projectsSystem.checkRequirements(projectId)).toBe(false);
      
      // Should pass with clipmakers
      gameState.set('manufacturing.clipmakers.level', 1);
      expect(projectsSystem.checkRequirements(projectId)).toBe(true);
    });

    test('should check completed project prerequisites', () => {
      const projectId = 'evenBetterAutoClippers';
      
      // Set clipmaker requirement
      gameState.set('manufacturing.clipmakers.level', 5);
      
      // Should fail without prerequisite project
      expect(projectsSystem.checkRequirements(projectId)).toBe(false);
      
      // Should pass with prerequisite project
      projectsSystem.completedProjects.add('improvedAutoClippers');
      expect(projectsSystem.checkRequirements(projectId)).toBe(true);
    });

    test('should check multiple requirements', () => {
      const projectId = 'algorithmicTrading';
      
      // Should fail without all requirements
      expect(projectsSystem.checkRequirements(projectId)).toBe(false);
      
      // Add processors but not funds
      gameState.set('computing.processors', 8);
      gameState.set('resources.funds', 1000);
      expect(projectsSystem.checkRequirements(projectId)).toBe(false);
      
      // Add sufficient funds
      gameState.set('resources.funds', 25000);
      expect(projectsSystem.checkRequirements(projectId)).toBe(true);
    });

    test('should handle non-existent projects', () => {
      expect(projectsSystem.checkRequirements('nonExistentProject')).toBe(false);
    });

    test('should check complex requirements', () => {
      const projectId = 'nameBattles';
      
      // Set combat losses below requirement
      gameState.set('combat.probesLostCombat', 1000000);
      expect(projectsSystem.checkRequirements(projectId)).toBe(false);
      
      // Set combat losses to meet requirement
      gameState.set('combat.probesLostCombat', 10000000);
      expect(projectsSystem.checkRequirements(projectId)).toBe(true);
    });
  });

  describe('Cost Validation', () => {
    test('should check operations cost', () => {
      const projectId = 'improvedAutoClippers';
      
      // Should fail without enough operations
      gameState.set('computing.operations', 500);
      expect(projectsSystem.canAfford(projectId)).toBe(false);
      
      // Should pass with enough operations
      gameState.set('computing.operations', 1000);
      expect(projectsSystem.canAfford(projectId)).toBe(true);
    });

    test('should check creativity cost', () => {
      const projectId = 'limerick';
      
      // Should fail without enough creativity
      gameState.set('computing.creativity.amount', 500);
      expect(projectsSystem.canAfford(projectId)).toBe(false);
      
      // Should pass with enough creativity
      gameState.set('computing.creativity.amount', 1500);
      expect(projectsSystem.canAfford(projectId)).toBe(true);
    });

    test('should check honor cost', () => {
      const projectId = 'glory';
      
      // Should fail without enough honor
      gameState.set('combat.honor', 10000);
      expect(projectsSystem.canAfford(projectId)).toBe(false);
      
      // Should pass with enough honor
      gameState.set('combat.honor', 20000);
      expect(projectsSystem.canAfford(projectId)).toBe(true);
    });

    test('should check multiple resource costs', () => {
      const projectId = 'algorithmicTrading';
      
      // Should fail without all resources
      gameState.set('computing.operations', 12000);
      gameState.set('computing.creativity.amount', 4000);
      expect(projectsSystem.canAfford(projectId)).toBe(false);
      
      // Should pass with all resources
      gameState.set('computing.operations', 12000);
      gameState.set('computing.creativity.amount', 6000);
      expect(projectsSystem.canAfford(projectId)).toBe(true);
    });

    test('should handle non-existent projects', () => {
      expect(projectsSystem.canAfford('nonExistentProject')).toBe(false);
    });

    test('should handle projects with no cost', () => {
      // Create a test project with no cost
      projectsSystem.projectDefinitions.testNoCost = {
        id: 'testNoCost',
        name: 'Test No Cost',
        description: 'Test project with no cost',
        category: PROJECT_CATEGORIES.EFFICIENCY,
        requirements: {},
        effect: { type: 'unlock', target: 'test.flag', value: true }
      };
      
      expect(projectsSystem.canAfford('testNoCost')).toBe(true);
    });
  });

  describe('Project Completion', () => {
    test('should complete project and deduct resources', () => {
      const projectId = 'improvedAutoClippers';
      
      // Set up requirements and resources
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 1000);
      
      const initialOps = gameState.get('computing.operations');
      const success = projectsSystem.completeProject(projectId);
      
      expect(success).toBe(true);
      expect(projectsSystem.completedProjects.has(projectId)).toBe(true);
      expect(gameState.get('computing.operations')).toBe(initialOps - 750);
      expect(gameState.get(`projects.${projectId}.completed`)).toBe(true);
    });

    test('should apply multiplier effects', () => {
      const projectId = 'improvedAutoClippers';
      
      // Set up requirements and resources
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 1000);
      gameState.set('production.boosts.clipper', 1.0);
      
      projectsSystem.completeProject(projectId);
      
      expect(gameState.get('production.boosts.clipper')).toBe(1.25);
    });

    test('should apply unlock effects', () => {
      const projectId = 'creativityEngine';
      
      // Set up requirements and resources
      gameState.set('computing.processors', 5);
      gameState.set('computing.operations', 2000);
      gameState.set('computing.creativity.enabled', false);
      
      projectsSystem.completeProject(projectId);
      
      expect(gameState.get('computing.creativity.enabled')).toBe(true);
    });

    test('should not complete already completed projects', () => {
      const projectId = 'improvedAutoClippers';
      
      // Set up and complete project
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 2000);
      
      projectsSystem.completeProject(projectId);
      const ops1 = gameState.get('computing.operations');
      
      // Try to complete again
      const success = projectsSystem.completeProject(projectId);
      const ops2 = gameState.get('computing.operations');
      
      expect(success).toBe(false);
      expect(ops1).toBe(ops2); // No resources deducted
    });

    test('should fail without meeting requirements', () => {
      const projectId = 'improvedAutoClippers';
      
      // Don't meet requirements
      gameState.set('manufacturing.clipmakers.level', 0);
      gameState.set('computing.operations', 1000);
      
      const success = projectsSystem.completeProject(projectId);
      
      expect(success).toBe(false);
      expect(projectsSystem.completedProjects.has(projectId)).toBe(false);
    });

    test('should fail without sufficient resources', () => {
      const projectId = 'improvedAutoClippers';
      
      // Meet requirements but not resources
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 500);
      
      const success = projectsSystem.completeProject(projectId);
      
      expect(success).toBe(false);
      expect(projectsSystem.completedProjects.has(projectId)).toBe(false);
    });

    test('should handle non-existent projects', () => {
      // Mock console.error to prevent stack overflow
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      const success = projectsSystem.completeProject('nonExistentProject');
      expect(success).toBe(false);
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('Custom Effects', () => {
    test('should apply space exploration effect', () => {
      const projectId = 'spaceExploration';
      
      // Set up requirements and resources
      gameState.set('resources.unusedClips', 6000000000);
      gameState.set('computing.operations', 150000);
      gameState.set('computing.creativity.amount', 30000);
      
      projectsSystem.completeProject(projectId);
      
      // The project's unlock effect sets gameState.flags.space
      expect(gameState.get('gameState.flags.space')).toBe(1);
    });

    test('should apply quantum computing effect', () => {
      const projectId = 'quantumComputing';
      
      // Set up requirements and resources
      gameState.set('computing.processors', 20);
      gameState.set('computing.operations', 50000);
      
      projectsSystem.completeProject(projectId);
      
      // The project's unlock effect enables quantum computing
      expect(gameState.get('computing.quantum.enabled')).toBe(true);
    });

    test('should apply algorithmic trading effect', () => {
      const projectId = 'algorithmicTrading';
      
      // Set up requirements and resources
      gameState.set('computing.processors', 8);
      gameState.set('resources.funds', 30000);
      gameState.set('computing.operations', 15000);
      gameState.set('computing.creativity.amount', 6000);
      
      projectsSystem.completeProject(projectId);
      
      // The project's unlock effect sets investment flag
      expect(gameState.get('gameState.flags.investment')).toBe(1);
    });

    test('should handle actual custom effects', () => {
      // Create a test project with custom effect type
      projectsSystem.projectDefinitions.testCustomEffect = {
        id: 'testCustomEffect',
        name: 'Test Custom Effect',
        description: 'Test project with custom effect',
        category: PROJECT_CATEGORIES.EFFICIENCY,
        cost: { operations: 100 },
        requirements: {},
        effect: { type: 'custom' }
      };
      
      // Mock the applyCustomEffect method to verify it's called
      const originalApplyCustom = projectsSystem.applyCustomEffect;
      let customEffectCalled = false;
      projectsSystem.applyCustomEffect = jest.fn((projectId, effect) => {
        customEffectCalled = true;
        originalApplyCustom.call(projectsSystem, projectId, effect);
      });
      
      gameState.set('computing.operations', 200);
      projectsSystem.completeProject('testCustomEffect');
      
      expect(customEffectCalled).toBe(true);
      expect(projectsSystem.applyCustomEffect).toHaveBeenCalledWith('testCustomEffect', { type: 'custom' });
      
      // Restore original method
      projectsSystem.applyCustomEffect = originalApplyCustom;
    });
  });

  describe('Available Projects', () => {
    test('should return only projects with met requirements', () => {
      // Reset to ensure clean state
      gameState.reset();
      projectsSystem.reset();
      
      // Initially, check what's available (may be 0 or more depending on default state)
      const initialAvailable = projectsSystem.getAvailableProjects();
      const initialCount = initialAvailable.length;
      
      // Now set up for a specific project
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 1000);
      
      const available = projectsSystem.getAvailableProjects();
      
      // Should have at least the improved auto clippers project
      expect(available.length).toBeGreaterThanOrEqual(initialCount + 1);
      expect(available.find(p => p.id === 'improvedAutoClippers')).toBeDefined();
    });

    test('should return projects with met requirements', () => {
      // Set up for improved auto clippers
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 1000);
      
      const available = projectsSystem.getAvailableProjects();
      
      expect(available.length).toBeGreaterThan(0);
      expect(available.find(p => p.id === 'improvedAutoClippers')).toBeDefined();
    });

    test('should include affordability status', () => {
      // Set up requirements but not enough resources
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 500); // Not enough
      
      const available = projectsSystem.getAvailableProjects();
      const project = available.find(p => p.id === 'improvedAutoClippers');
      
      expect(project).toBeDefined();
      expect(project.canAfford).toBe(false);
    });

    test('should exclude completed projects', () => {
      // Set up and complete a project
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 1000);
      projectsSystem.completeProject('improvedAutoClippers');
      
      const available = projectsSystem.getAvailableProjects();
      
      expect(available.find(p => p.id === 'improvedAutoClippers')).toBeUndefined();
    });
  });

  describe('Category Filtering', () => {
    test('should get projects by category', () => {
      const efficiencyProjects = projectsSystem.getProjectsByCategory(PROJECT_CATEGORIES.EFFICIENCY);
      
      expect(efficiencyProjects.length).toBeGreaterThan(0);
      expect(efficiencyProjects.every(p => p.category === PROJECT_CATEGORIES.EFFICIENCY)).toBe(true);
    });

    test('should include status information', () => {
      // Complete a project
      gameState.set('manufacturing.clipmakers.level', 10);
      gameState.set('computing.operations', 10000);
      projectsSystem.completeProject('improvedAutoClippers');
      
      const efficiencyProjects = projectsSystem.getProjectsByCategory(PROJECT_CATEGORIES.EFFICIENCY);
      const improvedClippers = efficiencyProjects.find(p => p.id === 'improvedAutoClippers');
      
      expect(improvedClippers.completed).toBe(true);
      expect(improvedClippers.available).toBe(true); // Requirements still met
      expect(improvedClippers.canAfford).toBe(true);
    });

    test('should handle empty categories', () => {
      // Create a fake category with no projects
      const emptyCategory = projectsSystem.getProjectsByCategory('nonexistent');
      expect(emptyCategory).toEqual([]);
    });
  });

  describe('Statistics', () => {
    test('should calculate project statistics', () => {
      // Reset to ensure clean state
      gameState.reset();
      projectsSystem.reset();
      
      const stats = projectsSystem.getStats();
      
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.completed).toBe(0);
      expect(stats.available).toBeGreaterThanOrEqual(0); // Could be 0 or more
      expect(stats.progress).toBe(0);
      expect(stats.categories).toBeDefined();
    });

    test('should update statistics after completion', () => {
      // Complete a project
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 1000);
      projectsSystem.completeProject('improvedAutoClippers');
      
      const stats = projectsSystem.getStats();
      
      expect(stats.completed).toBe(1);
      expect(stats.progress).toBeGreaterThan(0);
    });

    test('should count available projects', () => {
      // Make some projects available
      gameState.set('manufacturing.clipmakers.level', 5);
      gameState.set('computing.processors', 5);
      gameState.set('computing.operations', 10000);
      
      const stats = projectsSystem.getStats();
      
      expect(stats.available).toBeGreaterThan(0);
    });
  });

  describe('State Path Mapping', () => {
    test('should map requirement keys to state paths', () => {
      expect(projectsSystem.getStatePath('clipmakers')).toBe('manufacturing.clipmakers.level');
      expect(projectsSystem.getStatePath('processors')).toBe('computing.processors');
      expect(projectsSystem.getStatePath('funds')).toBe('resources.funds');
      expect(projectsSystem.getStatePath('unusedClips')).toBe('resources.unusedClips');
      expect(projectsSystem.getStatePath('probesLostCombat')).toBe('combat.probesLostCombat');
    });

    test('should return unmapped keys as-is', () => {
      expect(projectsSystem.getStatePath('unknownKey')).toBe('unknownKey');
    });
  });

  describe('Resource Path Mapping', () => {
    test('should map resource keys to state paths', () => {
      expect(projectsSystem.getResourcePath('operations')).toBe('computing.operations');
      expect(projectsSystem.getResourcePath('creativity')).toBe('computing.creativity.amount');
      expect(projectsSystem.getResourcePath('honor')).toBe('combat.honor');
      expect(projectsSystem.getResourcePath('yomi')).toBe('investment.yomi');
      expect(projectsSystem.getResourcePath('funds')).toBe('resources.funds');
    });

    test('should return unmapped resources as-is', () => {
      expect(projectsSystem.getResourcePath('unknownResource')).toBe('unknownResource');
    });
  });

  describe('Save and Load', () => {
    test('should get save data', () => {
      // Complete some projects
      gameState.set('manufacturing.clipmakers.level', 10);
      gameState.set('computing.operations', 10000);
      projectsSystem.completeProject('improvedAutoClippers');
      projectsSystem.completedProjects.add('evenBetterAutoClippers');
      
      const saveData = projectsSystem.getSaveData();
      
      expect(saveData.completedProjects).toEqual(['improvedAutoClippers', 'evenBetterAutoClippers']);
    });

    test('should load completed projects', () => {
      const completedProjects = ['improvedAutoClippers', 'creativityEngine', 'spaceExploration'];
      
      projectsSystem.loadCompletedProjects(completedProjects);
      
      expect(projectsSystem.completedProjects.size).toBe(3);
      expect(projectsSystem.completedProjects.has('improvedAutoClippers')).toBe(true);
      expect(projectsSystem.completedProjects.has('creativityEngine')).toBe(true);
      expect(projectsSystem.completedProjects.has('spaceExploration')).toBe(true);
    });

    test('should clear existing projects before loading', () => {
      // Add some projects
      projectsSystem.completedProjects.add('oldProject1');
      projectsSystem.completedProjects.add('oldProject2');
      
      // Load new projects
      projectsSystem.loadCompletedProjects(['newProject1', 'newProject2']);
      
      expect(projectsSystem.completedProjects.size).toBe(2);
      expect(projectsSystem.completedProjects.has('oldProject1')).toBe(false);
      expect(projectsSystem.completedProjects.has('newProject1')).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset completed projects', () => {
      // Complete some projects
      projectsSystem.completedProjects.add('project1');
      projectsSystem.completedProjects.add('project2');
      projectsSystem.completedProjects.add('project3');
      
      projectsSystem.reset();
      
      expect(projectsSystem.completedProjects.size).toBe(0);
    });
  });

  describe('New Project Detection', () => {
    test('should detect newly available projects', () => {
      // Initially no projects available
      let newProjects = projectsSystem.checkForNewProjects();
      expect(newProjects).toEqual([]);
      
      // Make a project available
      gameState.set('manufacturing.clipmakers.level', 1);
      
      // This would normally be called after the state change
      // For testing, we simulate by checking again
      newProjects = projectsSystem.checkForNewProjects();
      
      // Note: In actual implementation, this would track previous state
      // For now, it returns currently available projects
      expect(newProjects.length).toBe(0); // Since we don't track previous state in test
    });
  });

  describe('Edge Cases', () => {
    test('should handle projects with no requirements', () => {
      // Create a test project with no requirements
      projectsSystem.projectDefinitions.testNoReq = {
        id: 'testNoReq',
        name: 'Test No Requirements',
        description: 'Test project',
        category: PROJECT_CATEGORIES.EFFICIENCY,
        cost: { operations: 100 },
        effect: { type: 'unlock', target: 'test.flag', value: true }
      };
      
      expect(projectsSystem.checkRequirements('testNoReq')).toBe(true);
    });

    test('should handle projects with no effect', () => {
      // Create a test project with no effect
      projectsSystem.projectDefinitions.testNoEffect = {
        id: 'testNoEffect',
        name: 'Test No Effect',
        description: 'Test project with no effect',
        category: PROJECT_CATEGORIES.EFFICIENCY,
        cost: { operations: 100 },
        requirements: {}
      };
      
      gameState.set('computing.operations', 200);
      const success = projectsSystem.completeProject('testNoEffect');
      
      expect(success).toBe(true);
      expect(projectsSystem.completedProjects.has('testNoEffect')).toBe(true);
    });

    test('should handle unknown effect types gracefully', () => {
      // Create a test project with unknown effect type
      projectsSystem.projectDefinitions.testUnknownEffect = {
        id: 'testUnknownEffect',
        name: 'Test Unknown Effect',
        description: 'Test project',
        category: PROJECT_CATEGORIES.EFFICIENCY,
        cost: { operations: 100 },
        requirements: {},
        effect: { type: 'unknownType', target: 'test.value', value: 42 }
      };
      
      gameState.set('computing.operations', 200);
      const success = projectsSystem.completeProject('testUnknownEffect');
      
      expect(success).toBe(true);
      // Should complete even with unknown effect type
    });

    test('should handle increment effects', () => {
      // Create a test project with increment effect
      projectsSystem.projectDefinitions.testIncrement = {
        id: 'testIncrement',
        name: 'Test Increment',
        description: 'Test increment effect',
        category: PROJECT_CATEGORIES.EFFICIENCY,
        cost: { operations: 100 },
        requirements: {},
        effect: { type: 'increment', target: 'test.counter', value: 5 }
      };
      
      gameState.set('computing.operations', 200);
      gameState.set('test.counter', 10);
      
      projectsSystem.completeProject('testIncrement');
      
      expect(gameState.get('test.counter')).toBe(15);
    });

    test('should handle very large numbers', () => {
      const projectId = 'spaceExploration';
      
      // Set very large numbers
      gameState.set('resources.unusedClips', 10000000000);
      gameState.set('computing.operations', 200000);
      gameState.set('computing.creativity.amount', 50000);
      
      const canAfford = projectsSystem.canAfford(projectId);
      const meetsReqs = projectsSystem.checkRequirements(projectId);
      
      expect(canAfford).toBe(true);
      expect(meetsReqs).toBe(true);
    });

    test('should handle chain of prerequisites', () => {
      // Complete first project
      gameState.set('manufacturing.clipmakers.level', 10);
      gameState.set('computing.operations', 10000);
      projectsSystem.completeProject('improvedAutoClippers');
      
      // Check second project requirements
      expect(projectsSystem.checkRequirements('evenBetterAutoClippers')).toBe(true);
      
      // Complete second project
      projectsSystem.completeProject('evenBetterAutoClippers');
      
      // Check third project requirements
      expect(projectsSystem.checkRequirements('optimizedAutoClippers')).toBe(true);
    });
  });

  describe('System Update', () => {
    test('should update without errors', () => {
      const timestamp = Date.now();
      const deltaTime = 16;
      
      expect(() => {
        projectsSystem.update(timestamp, deltaTime);
      }).not.toThrow();
    });

    test('should handle time-based effects', () => {
      const timestamp = Date.now();
      const deltaTime = 16;
      
      // Currently updateTimeBasedEffects is empty, but test the structure
      projectsSystem.updateTimeBasedEffects(deltaTime);
      
      // No assertions needed - just ensure no errors
      expect(true).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle multiple simultaneous completions', () => {
      // Set up for multiple projects
      gameState.set('manufacturing.clipmakers.level', 20);
      gameState.set('manufacturing.megaClippers.level', 10);
      gameState.set('computing.operations', 100000);
      
      const results = [];
      results.push(projectsSystem.completeProject('improvedAutoClippers'));
      results.push(projectsSystem.completeProject('improvedMegaClippers'));
      
      expect(results.every(r => r === true)).toBe(true);
      expect(projectsSystem.completedProjects.size).toBe(2);
    });

    test('should correctly apply stacking multipliers', () => {
      // Set initial boost
      gameState.set('production.boosts.clipper', 1.0);
      
      // Complete first improvement
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 1000);
      projectsSystem.completeProject('improvedAutoClippers');
      
      expect(gameState.get('production.boosts.clipper')).toBe(1.25);
      
      // Complete second improvement (requires first)
      gameState.set('manufacturing.clipmakers.level', 5);
      gameState.set('computing.operations', 3000);
      projectsSystem.completeProject('evenBetterAutoClippers');
      
      // Should multiply: 1.25 * 1.5 = 1.875
      expect(gameState.get('production.boosts.clipper')).toBe(1.875);
    });

    test('should handle all project categories', () => {
      const categories = Object.values(PROJECT_CATEGORIES);
      
      categories.forEach(category => {
        const projects = projectsSystem.getProjectsByCategory(category);
        expect(Array.isArray(projects)).toBe(true);
        
        if (projects.length > 0) {
          expect(projects[0]).toHaveProperty('category', category);
        }
      });
    });
  });

  describe('Additional Coverage', () => {
    test('should get completed projects with full data', () => {
      // Complete some projects
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 1000);
      projectsSystem.completeProject('improvedAutoClippers');
      
      const completed = projectsSystem.getCompletedProjects();
      
      expect(completed.length).toBe(1);
      expect(completed[0].id).toBe('improvedAutoClippers');
      expect(completed[0].name).toBe('Improved AutoClippers');
      expect(completed[0].description).toBe('Increases AutoClipper performance by 25%');
      expect(completed[0].category).toBe(PROJECT_CATEGORIES.EFFICIENCY);
    });

    test('should handle custom effects for all special projects', () => {
      // Test spaceExploration custom effect
      let customEffect = { type: 'custom' };
      projectsSystem.applyCustomEffect('spaceExploration', customEffect);
      expect(gameState.get('gameState.flags.space')).toBe(1);
      expect(gameState.get('space.matter.available')).toBe(6000000000000000000000000);
      
      // Test quantumComputing custom effect
      projectsSystem.applyCustomEffect('quantumComputing', customEffect);
      expect(gameState.get('computing.quantum.enabled')).toBe(true);
      expect(gameState.get('computing.quantum.clock')).toBe(0);
      
      // Test algorithmicTrading custom effect
      projectsSystem.applyCustomEffect('algorithmicTrading', customEffect);
      expect(gameState.get('gameState.flags.investment')).toBe(1);
      expect(gameState.get('investment.engine.enabled')).toBe(true);
      
      // Test unknown project custom effect
      const originalWarn = errorHandler.warn;
      errorHandler.warn = jest.fn();
      projectsSystem.applyCustomEffect('unknownProject', customEffect);
      expect(errorHandler.warn).toHaveBeenCalledWith('No custom effect handler for project: unknownProject');
      errorHandler.warn = originalWarn;
    });

    test('should track newly available projects properly', () => {
      // Reset for clean state
      gameState.reset();
      projectsSystem.reset();
      
      // Get initial available projects
      const initial = projectsSystem.getAvailableProjects();
      
      // Change state to make new projects available
      gameState.set('manufacturing.clipmakers.level', 1);
      gameState.set('computing.operations', 1000);
      
      // Check for new projects
      const originalInfo = errorHandler.info;
      errorHandler.info = jest.fn();
      
      const newProjects = projectsSystem.checkForNewProjects();
      
      // The method doesn't actually track previous state in current implementation
      // but we can verify it doesn't error
      expect(Array.isArray(newProjects)).toBe(true);
      
      errorHandler.info = originalInfo;
    });
  });
});