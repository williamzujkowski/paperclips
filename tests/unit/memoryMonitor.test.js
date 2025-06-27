import { MemoryMonitor } from '../../src/game/core/memoryMonitor.js';

describe('MemoryMonitor', () => {
  let memoryMonitor;

  beforeEach(() => {
    memoryMonitor = new MemoryMonitor();
    memoryMonitor.reset();
  });

  afterEach(() => {
    memoryMonitor.stop();
  });

  describe('start/stop', () => {
    it('should start and stop monitoring', () => {
      expect(memoryMonitor.enabled).toBe(false);
      
      memoryMonitor.start();
      expect(memoryMonitor.enabled).toBe(true);
      expect(memoryMonitor.intervalId).not.toBeNull();
      
      memoryMonitor.stop();
      expect(memoryMonitor.enabled).toBe(false);
      expect(memoryMonitor.intervalId).toBeNull();
    });

    it('should handle multiple start calls', () => {
      memoryMonitor.start();
      const firstIntervalId = memoryMonitor.intervalId;
      
      memoryMonitor.start();
      expect(memoryMonitor.intervalId).toBe(firstIntervalId);
    });
  });

  describe('object tracking', () => {
    it('should track objects', () => {
      const obj1 = { type: 'test' };
      const obj2 = { type: 'test' };
      
      memoryMonitor.trackObject('obj1', obj1);
      memoryMonitor.trackObject('obj2', obj2);
      
      expect(memoryMonitor.trackedObjects.size).toBe(2);
    });

    it('should untrack objects', () => {
      const obj = { type: 'test' };
      
      memoryMonitor.trackObject('obj1', obj);
      expect(memoryMonitor.trackedObjects.size).toBe(1);
      
      memoryMonitor.untrackObject('obj1');
      expect(memoryMonitor.trackedObjects.size).toBe(0);
    });

    it('should increment allocation counts', () => {
      class TestClass {}
      const obj = new TestClass();
      
      memoryMonitor.trackObject('test', obj);
      
      const stats = memoryMonitor.getStats();
      expect(stats.allocations.TestClass).toBe(1);
    });
  });

  describe('memory samples', () => {
    it('should take memory samples', () => {
      // Mock performance.memory
      const originalMemory = performance.memory;
      Object.defineProperty(performance, 'memory', {
        value: {
          totalJSHeapSize: 100 * 1024 * 1024,
          usedJSHeapSize: 50 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024,
        },
        configurable: true,
      });

      memoryMonitor.takeSample();
      
      expect(memoryMonitor.samples.length).toBe(1);
      expect(memoryMonitor.samples[0].usedMB).toBeCloseTo(50, 1);
      
      // Restore
      if (originalMemory) {
        Object.defineProperty(performance, 'memory', {
          value: originalMemory,
          configurable: true,
        });
      }
    });

    it('should limit number of samples', () => {
      memoryMonitor.maxSamples = 5;
      
      for (let i = 0; i < 10; i++) {
        memoryMonitor.takeSample();
      }
      
      expect(memoryMonitor.samples.length).toBe(5);
    });
  });

  describe('memory trends', () => {
    it('should detect stable memory', () => {
      // Add samples with stable memory
      for (let i = 0; i < 5; i++) {
        memoryMonitor.samples.push({
          timestamp: Date.now() + i * 1000,
          usedMB: 50 + Math.random() * 0.5,
        });
      }
      
      expect(memoryMonitor.getTrend()).toBe('stable');
    });

    it('should detect growing memory', () => {
      // Add samples with growing memory
      for (let i = 0; i < 5; i++) {
        memoryMonitor.samples.push({
          timestamp: Date.now() + i * 1000,
          usedMB: 50 + i * 2,
        });
      }
      
      expect(memoryMonitor.getTrend()).toBe('growing');
    });

    it('should detect shrinking memory', () => {
      // Add samples with shrinking memory
      for (let i = 0; i < 5; i++) {
        memoryMonitor.samples.push({
          timestamp: Date.now() + i * 1000,
          usedMB: 60 - i * 2,
        });
      }
      
      expect(memoryMonitor.getTrend()).toBe('shrinking');
    });
  });

  describe('issue reporting', () => {
    it('should report memory growth issues', () => {
      memoryMonitor.growthThreshold = 10;
      
      memoryMonitor.samples.push({
        timestamp: Date.now(),
        usedMB: 50,
      });
      
      memoryMonitor.samples.push({
        timestamp: Date.now() + 60000,
        usedMB: 65,
      });
      
      memoryMonitor.analyzeMemory();
      
      expect(memoryMonitor.issues.length).toBe(1);
      expect(memoryMonitor.issues[0].type).toBe('memory-growth');
    });

    it('should report high memory usage', () => {
      // Mock performance.memory
      const originalMemory = performance.memory;
      
      // First sample - baseline (low memory)
      Object.defineProperty(performance, 'memory', {
        value: {
          totalJSHeapSize: 100 * 1024 * 1024,
          usedJSHeapSize: 50 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024,
        },
        configurable: true,
      });
      memoryMonitor.takeSample();
      
      // Second sample - high memory usage
      Object.defineProperty(performance, 'memory', {
        value: {
          totalJSHeapSize: 190 * 1024 * 1024,
          usedJSHeapSize: 180 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024,
        },
        configurable: true,
      });
      memoryMonitor.takeSample();
      memoryMonitor.analyzeMemory();
      
      const highMemoryIssue = memoryMonitor.issues.find(i => i.type === 'high-memory');
      expect(highMemoryIssue).toBeDefined();
      
      // Restore
      if (originalMemory) {
        Object.defineProperty(performance, 'memory', {
          value: originalMemory,
          configurable: true,
        });
      }
    });
  });

  describe('report generation', () => {
    it('should generate memory report', () => {
      const report = memoryMonitor.generateReport();
      
      expect(report).toContain('Memory Report');
      expect(report).toContain('Status:');
      expect(report).toContain('Trend:');
    });
  });
});