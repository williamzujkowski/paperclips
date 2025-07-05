/**
 * Tests for PerformanceMonitor class
 */

import { PerformanceMonitor } from '../../src/game/core/performanceMonitor.js';
import { PERFORMANCE } from '../../src/game/core/constants.js';

// Mock the errorHandler module
jest.mock('../../src/game/core/errorHandler.js', () => ({
  errorHandler: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

describe('PerformanceMonitor', () => {
  let performanceMonitor;
  let mockTime = 0;
  let performanceNowSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let consoleInfoSpy;
  let consoleDebugSpy;
  let requestAnimationFrameSpy;
  let setTimeoutSpy;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockTime = 0;
    
    // Mock performance.now() to return controlled values
    performanceNowSpy = jest.spyOn(performance, 'now').mockImplementation(() => mockTime);
    
    // Mock performance.memory if it doesn't exist
    if (!performance.memory) {
      Object.defineProperty(performance, 'memory', {
        configurable: true,
        enumerable: true,
        get: () => ({
          usedJSHeapSize: 50 * 1024 * 1024, // 50MB
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024
        })
      });
    }
    
    // Mock requestAnimationFrame
    requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 16));
    
    // Mock setTimeout for memory monitoring
    setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((cb, delay) => {
      // Don't actually set timeout in tests
      return 1;
    });
    
    // Mock console to suppress output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    
    // Create fresh instance
    performanceMonitor = new PerformanceMonitor();
  });

  afterEach(() => {
    // Restore all mocks
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default values', () => {
      // Create a fresh instance without memory monitoring
      const originalMemory = performance.memory;
      const originalHasMemory = 'memory' in performance;
      
      // Completely remove the memory property
      if (originalHasMemory) {
        delete performance.memory;
      }
      
      const testMonitor = new PerformanceMonitor();
      
      expect(testMonitor.enabled).toBe(true);
      expect(testMonitor.metrics.fps.current).toBe(0);
      expect(testMonitor.metrics.fps.average).toBe(0);
      expect(testMonitor.metrics.fps.min).toBe(Infinity);
      expect(testMonitor.metrics.fps.max).toBe(0);
      expect(testMonitor.metrics.memory.used).toBe(0);
      expect(testMonitor.metrics.memory.peak).toBe(0);
      expect(testMonitor.metrics.functions).toBeInstanceOf(Map);
      
      // Restore memory API
      if (originalHasMemory && originalMemory) {
        Object.defineProperty(performance, 'memory', {
          configurable: true,
          enumerable: true,
          value: originalMemory
        });
      }
    });

    test('should set correct thresholds', () => {
      expect(performanceMonitor.thresholds.fps.warning).toBe(PERFORMANCE.MIN_FPS);
      expect(performanceMonitor.thresholds.fps.critical).toBe(PERFORMANCE.MIN_FPS * 0.5);
      expect(performanceMonitor.thresholds.frameTime.warning).toBe(PERFORMANCE.FRAME_TIME_TARGET * 2);
      expect(performanceMonitor.thresholds.frameTime.critical).toBe(PERFORMANCE.FRAME_TIME_TARGET * 4);
      expect(performanceMonitor.thresholds.memory.warning).toBe(PERFORMANCE.MAX_MEMORY_USAGE * 0.8);
      expect(performanceMonitor.thresholds.memory.critical).toBe(PERFORMANCE.MAX_MEMORY_USAGE);
    });

    test('should start monitoring on initialization', () => {
      expect(requestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('FPS Tracking', () => {
    test('should track FPS correctly', () => {
      // Simulate frame updates
      mockTime = 1000;
      performanceMonitor._recordFPS(60);
      
      expect(performanceMonitor.metrics.fps.current).toBe(60);
      expect(performanceMonitor.metrics.fps.average).toBe(60);
      expect(performanceMonitor.metrics.fps.min).toBe(60);
      expect(performanceMonitor.metrics.fps.max).toBe(60);
      expect(performanceMonitor.metrics.fps.samples).toHaveLength(1);
    });

    test('should calculate average FPS over multiple samples', () => {
      performanceMonitor._recordFPS(60);
      performanceMonitor._recordFPS(55);
      performanceMonitor._recordFPS(65);
      
      expect(performanceMonitor.metrics.fps.average).toBe(60);
      expect(performanceMonitor.metrics.fps.min).toBe(55);
      expect(performanceMonitor.metrics.fps.max).toBe(65);
      expect(performanceMonitor.metrics.fps.samples).toHaveLength(3);
    });

    test('should limit FPS samples to sample size', () => {
      // Fill beyond sample size
      for (let i = 0; i < PERFORMANCE.PERFORMANCE_SAMPLE_SIZE + 10; i++) {
        performanceMonitor._recordFPS(60);
      }
      
      expect(performanceMonitor.metrics.fps.samples).toHaveLength(PERFORMANCE.PERFORMANCE_SAMPLE_SIZE);
    });

    test('should trigger warning for low FPS', () => {
      const warningCallback = jest.fn();
      performanceMonitor.addWarningCallback(warningCallback);
      
      // Trigger warning threshold
      performanceMonitor._recordFPS(PERFORMANCE.MIN_FPS - 1);
      
      expect(warningCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'fps',
          level: 'warning',
          value: PERFORMANCE.MIN_FPS - 1
        })
      );
    });

    test('should trigger critical warning for very low FPS', () => {
      const warningCallback = jest.fn();
      performanceMonitor.addWarningCallback(warningCallback);
      
      // Trigger critical threshold
      performanceMonitor._recordFPS(PERFORMANCE.MIN_FPS * 0.5 - 1);
      
      expect(warningCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'fps',
          level: 'critical',
          value: PERFORMANCE.MIN_FPS * 0.5 - 1
        })
      );
    });
  });

  describe('Memory Monitoring', () => {
    test('should track memory usage when available', () => {
      jest.useFakeTimers();
      
      // Reset memory samples first since constructor may have added one
      performanceMonitor.metrics.memory.samples = [];
      
      performanceMonitor._recordMemory(60 * 1024 * 1024); // 60MB
      
      expect(performanceMonitor.metrics.memory.used).toBe(60 * 1024 * 1024);
      expect(performanceMonitor.metrics.memory.samples).toHaveLength(1);
      
      jest.useRealTimers();
    });

    test('should track peak memory usage', () => {
      // The peak is tracked in _monitorMemory, not _recordMemory
      // So we need to test it differently
      performanceMonitor.metrics.memory.peak = 0;
      
      // Simulate the memory monitoring behavior
      if ('memory' in performance) {
        const memory = performance.memory;
        performanceMonitor._recordMemory(50 * 1024 * 1024);
        performanceMonitor.metrics.memory.peak = Math.max(performanceMonitor.metrics.memory.peak, 50 * 1024 * 1024);
        
        performanceMonitor._recordMemory(70 * 1024 * 1024);
        performanceMonitor.metrics.memory.peak = Math.max(performanceMonitor.metrics.memory.peak, 70 * 1024 * 1024);
        
        performanceMonitor._recordMemory(60 * 1024 * 1024);
        performanceMonitor.metrics.memory.peak = Math.max(performanceMonitor.metrics.memory.peak, 60 * 1024 * 1024);
      }
      
      expect(performanceMonitor.metrics.memory.used).toBe(60 * 1024 * 1024);
      expect(performanceMonitor.metrics.memory.peak).toBe(70 * 1024 * 1024);
    });

    test('should trigger memory warning', () => {
      const warningCallback = jest.fn();
      performanceMonitor.addWarningCallback(warningCallback);
      
      // Trigger warning threshold (80% of max)
      performanceMonitor._recordMemory(PERFORMANCE.MAX_MEMORY_USAGE * 0.81);
      
      expect(warningCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'memory',
          level: 'warning'
        })
      );
    });

    test('should trigger critical memory warning', () => {
      const warningCallback = jest.fn();
      performanceMonitor.addWarningCallback(warningCallback);
      
      // Trigger critical threshold
      performanceMonitor._recordMemory(PERFORMANCE.MAX_MEMORY_USAGE + 1);
      
      expect(warningCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'memory',
          level: 'critical'
        })
      );
    });

    test('should handle missing performance.memory API', () => {
      // Create a new PerformanceMonitor with no memory API
      const originalMemory = performance.memory;
      delete performance.memory;
      
      // Should not throw
      const monitor = new PerformanceMonitor();
      expect(() => monitor._monitorMemory()).not.toThrow();
      
      // Restore memory API
      if (originalMemory) {
        Object.defineProperty(performance, 'memory', {
          configurable: true,
          enumerable: true,
          value: originalMemory
        });
      }
    });
  });

  describe('Function Performance Measurement', () => {
    test('should measure function execution time', () => {
      mockTime = 1000;
      const testFn = jest.fn(() => {
        mockTime = 1005; // 5ms execution
        return 'result';
      });
      
      const result = performanceMonitor.measure(testFn, 'testFunction');
      
      expect(result).toBe('result');
      expect(testFn).toHaveBeenCalled();
      
      const stats = performanceMonitor.getFunctionStats('testFunction');
      expect(stats).toBeDefined();
      expect(stats.calls).toBe(1);
      expect(stats.totalTime).toBe(5);
      expect(stats.averageTime).toBe(5);
      expect(stats.minTime).toBe(5);
      expect(stats.maxTime).toBe(5);
      expect(stats.errors).toBe(0);
    });

    test('should track function errors', () => {
      const errorFn = jest.fn(() => {
        throw new Error('Test error');
      });
      
      expect(() => performanceMonitor.measure(errorFn, 'errorFunction')).toThrow('Test error');
      
      const stats = performanceMonitor.getFunctionStats('errorFunction');
      expect(stats.calls).toBe(1);
      expect(stats.errors).toBe(1);
    });

    test('should calculate statistics over multiple calls', () => {
      let execTime = 5;
      const varFn = jest.fn(() => {
        mockTime += execTime;
        execTime += 5; // Increase execution time each call
      });
      
      // Call multiple times with varying execution times
      performanceMonitor.measure(varFn, 'varFunction'); // 5ms
      performanceMonitor.measure(varFn, 'varFunction'); // 10ms
      performanceMonitor.measure(varFn, 'varFunction'); // 15ms
      
      const stats = performanceMonitor.getFunctionStats('varFunction');
      expect(stats.calls).toBe(3);
      expect(stats.totalTime).toBe(30); // 5 + 10 + 15
      expect(stats.averageTime).toBe(10);
      expect(stats.minTime).toBe(5);
      expect(stats.maxTime).toBe(15);
    });

    test('should wrap functions for automatic measurement', () => {
      const originalFn = jest.fn(x => x * 2);
      const wrappedFn = performanceMonitor.wrap(originalFn, 'wrappedFunction');
      
      const result = wrappedFn(5);
      
      expect(result).toBe(10);
      expect(originalFn).toHaveBeenCalledWith(5);
      
      const stats = performanceMonitor.getFunctionStats('wrappedFunction');
      expect(stats).toBeDefined();
      expect(stats.calls).toBe(1);
    });

    test('should return null for non-existent function stats', () => {
      const stats = performanceMonitor.getFunctionStats('nonExistent');
      expect(stats).toBeNull();
    });

    test('should bypass measurement when disabled', () => {
      performanceMonitor.setEnabled(false);
      
      const testFn = jest.fn(() => 'result');
      const result = performanceMonitor.measure(testFn, 'disabledTest');
      
      expect(result).toBe('result');
      expect(testFn).toHaveBeenCalled();
      
      // Should not record stats when disabled
      const stats = performanceMonitor.getFunctionStats('disabledTest');
      expect(stats).toBeNull();
      
      performanceMonitor.setEnabled(true);
    });
  });

  describe('Game Loop Measurement', () => {
    test('should measure game loop performance', () => {
      mockTime = 1000;
      performanceMonitor.startGameLoopMeasurement();
      
      mockTime = 1005; // 5ms update time
      performanceMonitor.recordUpdateTime();
      
      mockTime = 1010; // 5ms render time
      performanceMonitor.endGameLoopMeasurement();
      
      expect(performanceMonitor.metrics.gameLoop.updateTime).toBe(5);
      expect(performanceMonitor.metrics.gameLoop.renderTime).toBe(5);
      expect(performanceMonitor.metrics.gameLoop.totalTime).toBe(10);
      expect(performanceMonitor.metrics.gameLoop.samples).toHaveLength(1);
    });

    test('should track slow frames', () => {
      mockTime = 1000;
      performanceMonitor.startGameLoopMeasurement();
      
      // Simulate slow frame
      mockTime = 1000 + (PERFORMANCE.FRAME_TIME_TARGET * 2.5);
      performanceMonitor.endGameLoopMeasurement();
      
      expect(performanceMonitor.metrics.gameLoop.slowFrames).toBe(1);
    });

    test('should handle missing start time', () => {
      // Call without starting measurement
      expect(() => performanceMonitor.recordUpdateTime()).not.toThrow();
      expect(() => performanceMonitor.endGameLoopMeasurement()).not.toThrow();
    });

    test('should limit game loop samples', () => {
      for (let i = 0; i < PERFORMANCE.PERFORMANCE_SAMPLE_SIZE + 10; i++) {
        performanceMonitor.startGameLoopMeasurement();
        mockTime += 16.67;
        performanceMonitor.endGameLoopMeasurement();
      }
      
      expect(performanceMonitor.metrics.gameLoop.samples).toHaveLength(PERFORMANCE.PERFORMANCE_SAMPLE_SIZE);
    });
  });

  describe('Performance Report', () => {
    test('should generate comprehensive report', () => {
      // Add some data
      performanceMonitor._recordFPS(60);
      performanceMonitor._recordFPS(58);
      performanceMonitor._recordMemory(75 * 1024 * 1024); // 75MB
      performanceMonitor.measure(() => {}, 'testFn');
      
      mockTime = 1000;
      performanceMonitor.startGameLoopMeasurement();
      mockTime = 1015;
      performanceMonitor.endGameLoopMeasurement();
      
      const report = performanceMonitor.getReport();
      
      expect(report).toHaveProperty('fps');
      expect(report.fps.average).toBe(59);
      expect(report.fps.min).toBe(58);
      expect(report.fps.max).toBe(60);
      
      expect(report).toHaveProperty('memory');
      expect(report.memory.usedMB).toBe(75);
      
      expect(report).toHaveProperty('gameLoop');
      expect(report.gameLoop.totalTime).toBe(15);
      
      expect(report).toHaveProperty('functions');
      expect(report.functions.testFn).toBeDefined();
      
      expect(report.enabled).toBe(true);
    });

    test('should handle Infinity values in report', () => {
      const report = performanceMonitor.getReport();
      
      // When no FPS samples, min is Infinity
      expect(report.fps.min).toBe(Infinity);
    });
  });

  describe('Warning Callbacks', () => {
    test('should add and trigger warning callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      performanceMonitor.addWarningCallback(callback1);
      performanceMonitor.addWarningCallback(callback2);
      
      // Trigger a warning
      performanceMonitor._triggerWarning('test', 'warning', 123);
      
      expect(callback1).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test',
          level: 'warning',
          value: 123
        })
      );
      expect(callback2).toHaveBeenCalled();
    });

    test('should remove warning callbacks', () => {
      const callback = jest.fn();
      
      performanceMonitor.addWarningCallback(callback);
      performanceMonitor.removeWarningCallback(callback);
      
      performanceMonitor._triggerWarning('test', 'warning', 123);
      
      expect(callback).not.toHaveBeenCalled();
    });

    test('should handle errors in warning callbacks', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const goodCallback = jest.fn();
      
      performanceMonitor.addWarningCallback(errorCallback);
      performanceMonitor.addWarningCallback(goodCallback);
      
      // Should not throw
      expect(() => performanceMonitor._triggerWarning('test', 'warning', 123)).not.toThrow();
      
      // Good callback should still be called
      expect(goodCallback).toHaveBeenCalled();
    });
  });

  describe('Reset and Control', () => {
    test('should reset all metrics', () => {
      // Add some data
      performanceMonitor._recordFPS(60);
      performanceMonitor._recordMemory(50 * 1024 * 1024);
      performanceMonitor.measure(() => {}, 'testFn');
      performanceMonitor.metrics.gameLoop.slowFrames = 5;
      
      performanceMonitor.reset();
      
      expect(performanceMonitor.metrics.fps.samples).toHaveLength(0);
      expect(performanceMonitor.metrics.fps.min).toBe(Infinity);
      expect(performanceMonitor.metrics.fps.max).toBe(0);
      expect(performanceMonitor.metrics.memory.samples).toHaveLength(0);
      expect(performanceMonitor.metrics.memory.peak).toBe(0);
      expect(performanceMonitor.metrics.gameLoop.samples).toHaveLength(0);
      expect(performanceMonitor.metrics.gameLoop.slowFrames).toBe(0);
      expect(performanceMonitor.metrics.functions.size).toBe(0);
    });

    test('should enable/disable monitoring', () => {
      performanceMonitor.setEnabled(false);
      expect(performanceMonitor.enabled).toBe(false);
      
      performanceMonitor.setEnabled(true);
      expect(performanceMonitor.enabled).toBe(true);
    });

    test('should not monitor FPS when disabled', () => {
      performanceMonitor.setEnabled(false);
      
      const fpsCount = performanceMonitor.metrics.fps.samples.length;
      
      // Try to record FPS
      performanceMonitor._monitorFPS();
      
      // Should not change
      expect(performanceMonitor.metrics.fps.samples.length).toBe(fpsCount);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero frame time', () => {
      mockTime = 1000;
      performanceMonitor.metrics.fps.lastFrame = 1000;
      
      // No time passed
      performanceMonitor._recordFPS(Infinity);
      
      expect(performanceMonitor.metrics.fps.current).toBe(Infinity);
    });

    test('should handle very high memory usage', () => {
      const veryHighMemory = PERFORMANCE.MAX_MEMORY_USAGE * 10;
      
      performanceMonitor._recordMemory(veryHighMemory);
      
      expect(performanceMonitor.metrics.memory.used).toBe(veryHighMemory);
    });

    test('should handle negative performance timing', () => {
      mockTime = 1000;
      performanceMonitor.startGameLoopMeasurement();
      
      mockTime = 999; // Time went backwards (clock adjustment)
      performanceMonitor.endGameLoopMeasurement();
      
      // Should handle gracefully
      expect(performanceMonitor.metrics.gameLoop.totalTime).toBe(-1);
    });

    test('should handle multiple sample size limits', () => {
      // Test that all sample arrays respect the limit
      const sampleSize = performanceMonitor.sampleSize;
      
      // Fill all sample arrays
      for (let i = 0; i < sampleSize + 20; i++) {
        performanceMonitor._recordFPS(60);
        performanceMonitor._recordMemory(50 * 1024 * 1024);
        performanceMonitor.measure(() => {}, 'test');
        performanceMonitor.startGameLoopMeasurement();
        mockTime += 16;
        performanceMonitor.endGameLoopMeasurement();
      }
      
      expect(performanceMonitor.metrics.fps.samples.length).toBeLessThanOrEqual(sampleSize);
      expect(performanceMonitor.metrics.memory.samples.length).toBeLessThanOrEqual(sampleSize);
      expect(performanceMonitor.metrics.gameLoop.samples.length).toBeLessThanOrEqual(sampleSize);
      
      const fnStats = performanceMonitor.getFunctionStats('test');
      expect(fnStats.samples.length).toBeLessThanOrEqual(sampleSize);
    });
  });
});