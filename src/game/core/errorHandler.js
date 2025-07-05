/**
 * Error Handler for Universal Paperclips
 *
 * Provides comprehensive error handling, logging, and recovery mechanisms
 * to prevent the game from crashing and provide debugging information.
 *
 * CRITICAL FIX: Prevents infinite recursion in console.error override by
 * storing original console methods before overriding them. When the
 * overridden console.error calls this.error(), it uses the stored
 * original console methods instead of the overridden ones.
 */

import { DEBUG } from './constants.js';

class ErrorHandler {
  constructor() {
    this.logLevel = DEBUG.LOG_LEVELS.INFO;
    this.errors = [];
    this.maxErrors = 100;
    this.performance = {
      errorCount: 0,
      recoveryCount: 0,
      criticalErrors: 0
    };

    // Store original console methods before overriding
    this._originalConsole = {
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      log: console.log.bind(console)
    };

    // Set up global error handling
    this._setupGlobalHandlers();
  }

  /**
   * Set up global error handlers
   * @private
   */
  _setupGlobalHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message), 'global.uncaughtError', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'global.unhandledRejection', { promise: event.promise });
    });

    // Handle console errors
    console.error = (...args) => {
      this.error('Console error:', ...args);
      this._originalConsole.error(...args);
    };
  }

  /**
   * Handle an error with context and attempt recovery
   * @param {Error|string} error - The error to handle
   * @param {string} source - Source location of the error
   * @param {Object} context - Additional context information
   * @param {boolean} critical - Whether this is a critical error
   */
  handleError(error, source = 'unknown', context = {}, critical = false) {
    const errorObj = {
      timestamp: Date.now(),
      message: error?.message || error,
      source,
      context,
      critical,
      stack: error?.stack,
      id: this._generateErrorId()
    };

    this.errors.push(errorObj);
    this.performance.errorCount++;

    if (critical) {
      this.performance.criticalErrors++;
    }

    // Trim error history
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log the error
    this._logError(errorObj);

    // Attempt recovery
    this._attemptRecovery(errorObj);

    // Notify listeners
    this._notifyErrorListeners(errorObj);
  }

  /**
   * Create an error boundary wrapper for functions
   * @param {Function} fn - Function to wrap
   * @param {string} name - Name for error reporting
   * @param {Function} fallback - Fallback function on error
   * @returns {Function} Wrapped function
   */
  createErrorBoundary(fn, name, fallback = null) {
    return (...args) => {
      try {
        return fn.apply(this, args);
      } catch (error) {
        this.handleError(error, `errorBoundary.${name}`, { args });

        if (fallback) {
          try {
            return fallback.apply(this, args);
          } catch (fallbackError) {
            this.handleError(fallbackError, `errorBoundary.${name}.fallback`, { args });
          }
        }

        return null;
      }
    };
  }

  /**
   * Log an error message
   * @param {string} message - Error message
   * @param {...*} args - Additional arguments
   */
  error(message, ...args) {
    if (this.logLevel >= DEBUG.LOG_LEVELS.ERROR) {
      this._log('ERROR', message, ...args);
    }
  }

  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {...*} args - Additional arguments
   */
  warn(message, ...args) {
    if (this.logLevel >= DEBUG.LOG_LEVELS.WARN) {
      this._log('WARN', message, ...args);
    }
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {...*} args - Additional arguments
   */
  info(message, ...args) {
    if (this.logLevel >= DEBUG.LOG_LEVELS.INFO) {
      this._log('INFO', message, ...args);
    }
  }

  /**
   * Log a debug message
   * @param {string} message - Debug message
   * @param {...*} args - Additional arguments
   */
  debug(message, ...args) {
    if (this.logLevel >= DEBUG.LOG_LEVELS.DEBUG) {
      this._log('DEBUG', message, ...args);
    }
  }

  /**
   * Set the log level
   * @param {number} level - Log level from DEBUG.LOG_LEVELS
   */
  setLogLevel(level) {
    this.logLevel = level;
    this.info(`Log level set to ${this._getLogLevelName(level)}`);
  }

  /**
   * Get recent errors
   * @param {number} count - Number of recent errors to get
   * @returns {Array} Recent errors
   */
  getRecentErrors(count = 10) {
    return this.errors.slice(-count);
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getStats() {
    return {
      ...this.performance,
      totalErrors: this.errors.length,
      criticalErrorRate: this.performance.criticalErrors / Math.max(this.performance.errorCount, 1),
      recoveryRate: this.performance.recoveryCount / Math.max(this.performance.errorCount, 1)
    };
  }

  /**
   * Clear error history
   */
  clearErrors() {
    this.errors = [];
    this.performance = {
      errorCount: 0,
      recoveryCount: 0,
      criticalErrors: 0
    };
    this.info('Error history cleared');
  }

  /**
   * Export error log as JSON
   * @returns {string} JSON string of error log
   */
  exportErrorLog() {
    return JSON.stringify(
      {
        errors: this.errors,
        performance: this.performance,
        timestamp: Date.now(),
        version: '2.0.0'
      },
      null,
      2
    );
  }

  /**
   * Generate unique error ID
   * @private
   */
  _generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log an error object
   * @private
   */
  _logError(errorObj) {
    const level = errorObj.critical ? 'ERROR' : 'WARN';
    const prefix = `[${level}] ${errorObj.source}:`;
    const message = errorObj.message;

    this._originalConsole.log(`%c${prefix}`, 'font-weight: bold; color: red;');
    this._originalConsole.log(message);

    if (errorObj.context && Object.keys(errorObj.context).length > 0) {
      this._originalConsole.log('Context:', errorObj.context);
    }

    if (errorObj.stack) {
      this._originalConsole.log('Stack:', errorObj.stack);
    }
  }

  /**
   * Attempt to recover from an error
   * @private
   */
  _attemptRecovery(errorObj) {
    const { source, critical } = errorObj;

    // Specific recovery strategies based on error source
    const recoveryStrategies = {
      gameLoop: () => this._recoverGameLoop(),
      renderer: () => this._recoverRenderer(),
      gameState: () => this._recoverGameState(),
      localStorage: () => this._recoverLocalStorage()
    };

    // Try source-specific recovery
    for (const [pattern, recovery] of Object.entries(recoveryStrategies)) {
      if (source.includes(pattern)) {
        try {
          recovery();
          this.performance.recoveryCount++;
          this.info(`Recovery attempted for ${source}`);
          return;
        } catch (recoveryError) {
          this.error('Recovery failed:', recoveryError);
        }
      }
    }

    // Generic recovery for critical errors
    if (critical) {
      this._genericRecovery();
    }
  }

  /**
   * Recover game loop
   * @private
   */
  _recoverGameLoop() {
    // Clear any running intervals and restart main loop
    this.warn('Attempting game loop recovery');
    // Implementation would restart the game loop
  }

  /**
   * Recover renderer
   * @private
   */
  _recoverRenderer() {
    // Force a complete UI refresh
    this.warn('Attempting renderer recovery');
    // Implementation would refresh the UI
  }

  /**
   * Recover game state
   * @private
   */
  _recoverGameState() {
    // Validate and repair game state
    this.warn('Attempting game state recovery');
    // Implementation would validate and repair state
  }

  /**
   * Recover localStorage
   * @private
   */
  _recoverLocalStorage() {
    // Try to repair or fallback localStorage
    this.warn('Attempting localStorage recovery');
    // Implementation would try to repair save data
  }

  /**
   * Generic recovery strategy
   * @private
   */
  _genericRecovery() {
    this.warn('Attempting generic recovery');
    // Implementation would try generic recovery strategies
  }

  /**
   * Internal logging method
   * @private
   */
  _log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    switch (level) {
      case 'ERROR':
        this._originalConsole.error(logMessage, ...args);
        break;
      case 'WARN':
        this._originalConsole.warn(logMessage, ...args);
        break;
      case 'INFO':
        this._originalConsole.info(logMessage, ...args);
        break;
      case 'DEBUG':
        this._originalConsole.log(logMessage, ...args);
        break;
      default:
        this._originalConsole.log(logMessage, ...args);
    }
  }

  /**
   * Get log level name from number
   * @private
   */
  _getLogLevelName(level) {
    const names = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    return names[level] || 'UNKNOWN';
  }

  /**
   * Notify error listeners
   * @private
   */
  _notifyErrorListeners(errorObj) {
    // Implementation for notifying error listeners
    // This would be used by other systems to react to errors
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Export class for testing
export { ErrorHandler };
