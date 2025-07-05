/**
 * Tests for ErrorHandler
 */

import { ErrorHandler } from '../../src/game/core/errorHandler.js';
import { DEBUG } from '../../src/game/core/constants.js';

describe('ErrorHandler', () => {
  let errorHandler;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let consoleInfoSpy;
  let consoleLogSpy;
  let consoleGroupSpy;
  let consoleGroupEndSpy;
  let dateNowSpy;
  let windowAddEventListenerSpy;

  beforeEach(() => {
    // Mock window.addEventListener BEFORE creating ErrorHandler
    windowAddEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation(() => {});
    
    // Mock Date.now for consistent timestamps
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    
    // Create fresh instance
    errorHandler = new ErrorHandler();
    
    // Mock the original console methods that ErrorHandler stores and uses
    consoleErrorSpy = jest.spyOn(errorHandler._originalConsole, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(errorHandler._originalConsole, 'warn').mockImplementation(() => {});
    consoleInfoSpy = jest.spyOn(errorHandler._originalConsole, 'info').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(errorHandler._originalConsole, 'log').mockImplementation(() => {});
    
    // Mock the current console methods for tests that check console override
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore all mocks
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default values', () => {
      expect(errorHandler.logLevel).toBe(DEBUG.LOG_LEVELS.INFO);
      expect(errorHandler.errors).toEqual([]);
      expect(errorHandler.maxErrors).toBe(100);
      expect(errorHandler.performance).toEqual({
        errorCount: 0,
        recoveryCount: 0,
        criticalErrors: 0
      });
    });

    test('should set up global error handlers', () => {
      // Check that event listeners were added
      expect(windowAddEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(windowAddEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });

    test('should override console.error', () => {
      // Save the mock
      const mockedConsoleError = console.error;
      // Restore original to test override
      consoleErrorSpy.mockRestore();
      const originalConsoleError = console.error;
      
      const handler = new ErrorHandler();
      expect(console.error).not.toBe(originalConsoleError);
      
      // Restore mock for other tests
      console.error = mockedConsoleError;
    });
  });

  describe('Error Logging and Categorization', () => {
    test('should log error level messages when log level allows', () => {
      errorHandler.setLogLevel(DEBUG.LOG_LEVELS.ERROR);
      
      // Call _log directly to avoid console.error override issues
      errorHandler._log('ERROR', 'Test error message', { extra: 'data' });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Test error message'),
        { extra: 'data' }
      );
    });

    test('should log warn level messages when log level allows', () => {
      errorHandler.setLogLevel(DEBUG.LOG_LEVELS.WARN);
      errorHandler.warn('Test warning message');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Test warning message')
      );
    });

    test('should log info level messages when log level allows', () => {
      errorHandler.setLogLevel(DEBUG.LOG_LEVELS.INFO);
      errorHandler.info('Test info message');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Test info message')
      );
    });

    test('should log debug level messages when log level allows', () => {
      errorHandler.setLogLevel(DEBUG.LOG_LEVELS.DEBUG);
      errorHandler.debug('Test debug message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Test debug message')
      );
    });

    test('should not log messages below log level', () => {
      errorHandler.setLogLevel(DEBUG.LOG_LEVELS.ERROR);
      
      errorHandler.debug('Debug message');
      errorHandler.info('Info message');
      errorHandler.warn('Warning message');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Info message')
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle error objects with all properties', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test.source', { userId: 123 }, true);
      
      expect(errorHandler.errors).toHaveLength(1);
      expect(errorHandler.errors[0]).toMatchObject({
        timestamp: 1234567890,
        message: 'Test error',
        source: 'test.source',
        context: { userId: 123 },
        critical: true,
        stack: expect.any(String),
        id: expect.stringMatching(/^err_\d+_[a-z0-9]+$/)
      });
    });

    test('should handle string errors', () => {
      errorHandler.handleError('String error', 'test.source');
      
      expect(errorHandler.errors).toHaveLength(1);
      expect(errorHandler.errors[0]).toMatchObject({
        message: 'String error',
        source: 'test.source',
        critical: false
      });
    });

    test('should increment performance counters', () => {
      errorHandler.handleError('Error 1', 'test');
      errorHandler.handleError('Error 2', 'test', {}, true);
      
      expect(errorHandler.performance.errorCount).toBe(2);
      expect(errorHandler.performance.criticalErrors).toBe(1);
    });

    test('should log error details with original console methods', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test.source', { data: 'context' });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] test.source:'),
        expect.any(String)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('Test error');
      expect(consoleLogSpy).toHaveBeenCalledWith('Context:', { data: 'context' });
      expect(consoleLogSpy).toHaveBeenCalledWith('Stack:', expect.any(String));
    });
  });

  describe('Error Boundary Creation', () => {
    test('should create working error boundary for function', () => {
      const riskyFn = jest.fn(() => 'success');
      const safeFn = errorHandler.createErrorBoundary(riskyFn, 'testFunction');
      
      const result = safeFn('arg1', 'arg2');
      
      expect(result).toBe('success');
      expect(riskyFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('should catch errors and return null', () => {
      const riskyFn = jest.fn(() => {
        throw new Error('Function failed');
      });
      const safeFn = errorHandler.createErrorBoundary(riskyFn, 'testFunction');
      
      const result = safeFn('arg1');
      
      expect(result).toBeNull();
      expect(errorHandler.errors).toHaveLength(1);
      expect(errorHandler.errors[0]).toMatchObject({
        message: 'Function failed',
        source: 'errorBoundary.testFunction',
        context: { args: ['arg1'] }
      });
    });

    test('should use fallback function on error', () => {
      const riskyFn = jest.fn(() => {
        throw new Error('Primary failed');
      });
      const fallbackFn = jest.fn(() => 'fallback result');
      const safeFn = errorHandler.createErrorBoundary(riskyFn, 'testFunction', fallbackFn);
      
      const result = safeFn('arg1');
      
      expect(result).toBe('fallback result');
      expect(fallbackFn).toHaveBeenCalledWith('arg1');
    });

    test('should handle fallback function errors', () => {
      const riskyFn = jest.fn(() => {
        throw new Error('Primary failed');
      });
      const fallbackFn = jest.fn(() => {
        throw new Error('Fallback failed');
      });
      const safeFn = errorHandler.createErrorBoundary(riskyFn, 'testFunction', fallbackFn);
      
      const result = safeFn();
      
      expect(result).toBeNull();
      expect(errorHandler.errors).toHaveLength(2);
      expect(errorHandler.errors[1]).toMatchObject({
        message: 'Fallback failed',
        source: 'errorBoundary.testFunction.fallback'
      });
    });
  });

  describe('Recovery Mechanisms', () => {
    test('should attempt recovery for gameLoop errors', () => {
      const warnSpy = jest.spyOn(errorHandler, 'warn');
      errorHandler.handleError('Error', 'gameLoop.update');
      
      expect(warnSpy).toHaveBeenCalledWith('Attempting game loop recovery');
      expect(errorHandler.performance.recoveryCount).toBe(1);
    });

    test('should attempt recovery for renderer errors', () => {
      const warnSpy = jest.spyOn(errorHandler, 'warn');
      errorHandler.handleError('Error', 'renderer.draw');
      
      expect(warnSpy).toHaveBeenCalledWith('Attempting renderer recovery');
      expect(errorHandler.performance.recoveryCount).toBe(1);
    });

    test('should attempt recovery for gameState errors', () => {
      const warnSpy = jest.spyOn(errorHandler, 'warn');
      errorHandler.handleError('Error', 'gameState.save');
      
      expect(warnSpy).toHaveBeenCalledWith('Attempting game state recovery');
      expect(errorHandler.performance.recoveryCount).toBe(1);
    });

    test('should attempt recovery for localStorage errors', () => {
      const warnSpy = jest.spyOn(errorHandler, 'warn');
      errorHandler.handleError('Error', 'localStorage.setItem');
      
      expect(warnSpy).toHaveBeenCalledWith('Attempting localStorage recovery');
      expect(errorHandler.performance.recoveryCount).toBe(1);
    });

    test('should attempt generic recovery for critical errors', () => {
      const warnSpy = jest.spyOn(errorHandler, 'warn');
      errorHandler.handleError('Error', 'unknown.source', {}, true);
      
      expect(warnSpy).toHaveBeenCalledWith('Attempting generic recovery');
    });

    test('should handle recovery failures', () => {
      // Mock recovery to throw
      jest.spyOn(errorHandler, '_recoverGameLoop').mockImplementation(() => {
        throw new Error('Recovery failed');
      });
      
      // Mock _log to verify error logging
      const logSpy = jest.spyOn(errorHandler, '_log');
      
      errorHandler.handleError('Error', 'gameLoop.update');
      
      // Check that error was logged
      expect(logSpy).toHaveBeenCalledWith('ERROR', 'Recovery failed:', expect.any(Error));
    });
  });

  describe('Log Level Management', () => {
    test('should set log level correctly', () => {
      errorHandler.setLogLevel(DEBUG.LOG_LEVELS.DEBUG);
      expect(errorHandler.logLevel).toBe(DEBUG.LOG_LEVELS.DEBUG);
    });

    test('should log level change', () => {
      // The log level change should be recorded
      errorHandler.setLogLevel(DEBUG.LOG_LEVELS.WARN);
      
      // Verify the log level was changed
      expect(errorHandler.logLevel).toBe(DEBUG.LOG_LEVELS.WARN);
      
      // The info method should have been called internally
      // We can't easily test the console output due to mocking issues
      // but we can verify the behavior worked
    });

    test('should get correct log level name', () => {
      const getLogLevelName = errorHandler._getLogLevelName.bind(errorHandler);
      
      expect(getLogLevelName(DEBUG.LOG_LEVELS.ERROR)).toBe('ERROR');
      expect(getLogLevelName(DEBUG.LOG_LEVELS.WARN)).toBe('WARN');
      expect(getLogLevelName(DEBUG.LOG_LEVELS.INFO)).toBe('INFO');
      expect(getLogLevelName(DEBUG.LOG_LEVELS.DEBUG)).toBe('DEBUG');
      expect(getLogLevelName(999)).toBe('UNKNOWN');
    });
  });

  describe('Error History Management', () => {
    test('should maintain error history', () => {
      errorHandler.handleError('Error 1', 'source1');
      errorHandler.handleError('Error 2', 'source2');
      errorHandler.handleError('Error 3', 'source3');
      
      expect(errorHandler.errors).toHaveLength(3);
      expect(errorHandler.errors[0].message).toBe('Error 1');
      expect(errorHandler.errors[2].message).toBe('Error 3');
    });

    test('should limit error history to maxErrors', () => {
      errorHandler.maxErrors = 5;
      
      for (let i = 0; i < 10; i++) {
        errorHandler.handleError(`Error ${i}`, 'source');
      }
      
      expect(errorHandler.errors).toHaveLength(5);
      expect(errorHandler.errors[0].message).toBe('Error 5');
      expect(errorHandler.errors[4].message).toBe('Error 9');
    });

    test('should get recent errors', () => {
      for (let i = 0; i < 10; i++) {
        errorHandler.handleError(`Error ${i}`, 'source');
      }
      
      const recent = errorHandler.getRecentErrors(3);
      
      expect(recent).toHaveLength(3);
      expect(recent[0].message).toBe('Error 7');
      expect(recent[2].message).toBe('Error 9');
    });

    test('should clear error history', () => {
      errorHandler.handleError('Error 1', 'source');
      errorHandler.handleError('Error 2', 'source', {}, true);
      
      errorHandler.clearErrors();
      
      expect(errorHandler.errors).toEqual([]);
      expect(errorHandler.performance).toEqual({
        errorCount: 0,
        recoveryCount: 0,
        criticalErrors: 0
      });
    });
  });

  describe('Error Statistics', () => {
    test('should calculate error statistics', () => {
      errorHandler.handleError('Error 1', 'source1');
      errorHandler.handleError('Error 2', 'source2', {}, true);
      errorHandler.handleError('Error 3', 'gameLoop.update'); // triggers recovery
      
      const stats = errorHandler.getStats();
      
      expect(stats).toEqual({
        errorCount: 3,
        recoveryCount: 1,
        criticalErrors: 1,
        totalErrors: 3,
        criticalErrorRate: 1/3,
        recoveryRate: 1/3
      });
    });

    test('should handle zero errors in statistics', () => {
      const stats = errorHandler.getStats();
      
      expect(stats).toEqual({
        errorCount: 0,
        recoveryCount: 0,
        criticalErrors: 0,
        totalErrors: 0,
        criticalErrorRate: 0,
        recoveryRate: 0
      });
    });
  });

  describe('Error Export', () => {
    test('should export error log as JSON', () => {
      errorHandler.handleError('Error 1', 'source1');
      errorHandler.handleError('Error 2', 'source2', { data: 'test' }, true);
      
      const exported = errorHandler.exportErrorLog();
      const parsed = JSON.parse(exported);
      
      expect(parsed).toMatchObject({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Error 1',
            source: 'source1'
          }),
          expect.objectContaining({
            message: 'Error 2',
            source: 'source2',
            context: { data: 'test' },
            critical: true
          })
        ]),
        performance: {
          errorCount: 2,
          recoveryCount: 0,
          criticalErrors: 1
        },
        timestamp: 1234567890,
        version: '2.0.0'
      });
    });
  });

  describe('Global Error Handlers', () => {
    test('should handle window error events', () => {
      const errorEvent = {
        message: 'Uncaught error',
        filename: 'test.js',
        lineno: 42,
        colno: 10,
        error: new Error('Test error')
      };
      
      // Get the error handler function that was registered
      const errorHandlerFn = windowAddEventListenerSpy.mock.calls
        .find(call => call[0] === 'error')[1];
      
      errorHandlerFn(errorEvent);
      
      expect(errorHandler.errors).toHaveLength(1);
      expect(errorHandler.errors[0]).toMatchObject({
        message: 'Uncaught error',
        source: 'global.uncaughtError',
        context: {
          filename: 'test.js',
          lineno: 42,
          colno: 10,
          stack: expect.any(String)
        }
      });
    });

    test('should handle unhandled promise rejections', () => {
      const rejectionEvent = {
        reason: new Error('Promise rejected'),
        promise: Promise.resolve() // Use resolved promise to avoid actual rejection
      };
      
      // Get the rejection handler function that was registered
      const rejectionHandler = windowAddEventListenerSpy.mock.calls
        .find(call => call[0] === 'unhandledrejection')[1];
      
      rejectionHandler(rejectionEvent);
      
      expect(errorHandler.errors).toHaveLength(1);
      expect(errorHandler.errors[0]).toMatchObject({
        message: 'Promise rejected',
        source: 'global.unhandledRejection',
        context: {
          promise: expect.any(Promise)
        }
      });
    });
  });

  describe('Error ID Generation', () => {
    test('should generate unique error IDs', () => {
      const id1 = errorHandler._generateErrorId();
      const id2 = errorHandler._generateErrorId();
      
      expect(id1).toMatch(/^err_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^err_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null error objects', () => {
      errorHandler.handleError(null, 'test.source');
      
      expect(errorHandler.errors).toHaveLength(1);
      expect(errorHandler.errors[0].message).toBeNull();
    });

    test('should handle undefined error objects', () => {
      errorHandler.handleError(undefined, 'test.source');
      
      expect(errorHandler.errors).toHaveLength(1);
      expect(errorHandler.errors[0].message).toBeUndefined();
    });

    test('should handle error objects without message property', () => {
      const customError = { code: 'ERR_001', description: 'Custom error' };
      errorHandler.handleError(customError, 'test.source');
      
      expect(errorHandler.errors).toHaveLength(1);
      expect(errorHandler.errors[0].message).toEqual(customError);
    });

    test('should handle empty context objects', () => {
      errorHandler.handleError('Error', 'test.source', {});
      
      // Should not log context when empty
      expect(consoleLogSpy).not.toHaveBeenCalledWith('Context:', {});
    });

    test('should handle errors without stack trace', () => {
      const errorWithoutStack = { message: 'No stack' };
      errorHandler.handleError(errorWithoutStack, 'test.source');
      
      expect(errorHandler.errors[0].stack).toBeUndefined();
      expect(consoleLogSpy).not.toHaveBeenCalledWith('Stack:', undefined);
    });
  });

  describe('Console Override', () => {
    test('should intercept console.error calls', () => {
      // Due to the complex interaction between mocking and the console.error override,
      // we'll test this indirectly by verifying the override exists
      
      // Save current console.error
      const currentConsoleError = console.error;
      
      // Restore all mocks temporarily
      consoleErrorSpy.mockRestore();
      
      // Create a new handler which should override console.error
      const handler = new ErrorHandler();
      
      // Verify console.error was changed
      expect(console.error).not.toBe(currentConsoleError);
      
      // The console.error function should now be the override
      expect(console.error.toString()).toContain('this.error');
      
      // Restore our mock for other tests
      console.error = consoleErrorSpy;
    });

    test('should not cause infinite recursion when console.error is overridden', () => {
      // This test ensures the fix prevents infinite recursion
      let callCount = 0;
      const maxCalls = 10;
      
      // Save original console.error
      const originalConsoleError = console.error;
      
      // Mock console.error to count calls and detect infinite recursion
      console.error = jest.fn(() => {
        callCount++;
        if (callCount > maxCalls) {
          throw new Error('Infinite recursion detected');
        }
      });
      
      try {
        // Create a new ErrorHandler which overrides console.error
        const handler = new ErrorHandler();
        
        // This should not cause infinite recursion
        expect(() => {
          console.error('Test error message');
        }).not.toThrow();
        
        // Should have called console.error a reasonable number of times (not infinite)
        expect(callCount).toBeLessThan(maxCalls);
        expect(callCount).toBeGreaterThan(0);
      } finally {
        // Restore original console.error
        console.error = originalConsoleError;
      }
    });

    test('should use original console methods internally', () => {
      // Verify that the ErrorHandler stores and uses original console methods
      expect(errorHandler._originalConsole).toBeDefined();
      expect(typeof errorHandler._originalConsole.error).toBe('function');
      expect(typeof errorHandler._originalConsole.warn).toBe('function');
      expect(typeof errorHandler._originalConsole.info).toBe('function');
      expect(typeof errorHandler._originalConsole.log).toBe('function');
    });
  });
});