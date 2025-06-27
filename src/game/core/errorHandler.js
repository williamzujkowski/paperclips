/**
 * Error handling and logging system
 * @module ErrorHandler
 */

/**
 * @class ErrorHandler
 * @description Centralized error handling and logging for the game.
 * Provides error boundaries, logging levels, and error recovery mechanisms.
 */
export class ErrorHandler {
  /**
   * Creates a new ErrorHandler instance
   * @constructor
   */
  constructor() {
    /** @type {Array<Object>} Error log history */
    this.errorLog = [];
    /** @type {number} Maximum log entries to keep */
    this.maxLogSize = 100;
    /** @type {string} Current log level */
    this.logLevel = 'info'; // debug, info, warn, error
    /** @type {boolean} Whether to send errors to console */
    this.consoleOutput = true;
    /** @type {Function|null} Custom error reporter */
    this.errorReporter = null;

    // Set up global error handlers
    this.setupGlobalHandlers();
  }

  /**
   * Set up global error event listeners
   * @private
   */
  setupGlobalHandlers() {
    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'window.error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'unhandledrejection', {
        promise: event.promise,
      });
    });
  }

  /**
   * Log a message at the specified level
   * @param {string} level - Log level (debug, info, warn, error)
   * @param {string} message - Log message
   * @param {Object} [context={}] - Additional context data
   */
  log(level, message, context = {}) {
    const logEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
    };

    // Add to log history
    this.errorLog.push(logEntry);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console output if enabled
    if (this.consoleOutput && this.shouldLog(level)) {
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[logMethod](`[${level.toUpperCase()}] ${message}`, context);
    }

    // Send to custom reporter if configured
    if (this.errorReporter && level === 'error') {
      try {
        this.errorReporter(logEntry);
      } catch (reporterError) {
        console.error('Error reporter failed:', reporterError);
      }
    }
  }

  /**
   * Check if a message should be logged based on current log level
   * @param {string} level - Log level to check
   * @returns {boolean} True if should log
   * @private
   */
  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} [context={}] - Additional context
   */
  debug(message, context = {}) {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} [context={}] - Additional context
   */
  info(message, context = {}) {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} [context={}] - Additional context
   */
  warn(message, context = {}) {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Object} [context={}] - Additional context
   */
  error(message, context = {}) {
    this.log('error', message, context);
  }

  /**
   * Handle an error with context
   * @param {Error} error - The error object
   * @param {string} source - Where the error occurred
   * @param {Object} [context={}] - Additional context
   */
  handleError(error, source, context = {}) {
    this.error(`Error in ${source}: ${error.message}`, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });

    // Attempt recovery if possible
    this.attemptRecovery(error, source);
  }

  /**
   * Attempt to recover from an error
   * @param {Error} error - The error object
   * @param {string} source - Where the error occurred
   * @private
   */
  attemptRecovery(error, source) {
    // Log recovery attempt
    this.info(`Attempting recovery from error in ${source}`);

    // Specific recovery strategies based on error type
    if (error.name === 'QuotaExceededError') {
      // localStorage quota exceeded
      this.warn('localStorage quota exceeded, clearing old data');
      try {
        // Clear old saves or compress data
        const saves = Object.keys(localStorage).filter((key) => key.startsWith('paperclips_'));
        if (saves.length > 5) {
          // Keep only the 5 most recent saves
          saves
            .sort()
            .slice(0, -5)
            .forEach((key) => localStorage.removeItem(key));
        }
      } catch (clearError) {
        this.error('Failed to clear localStorage', { error: clearError });
      }
    }
  }

  /**
   * Create an error boundary wrapper for functions
   * @param {Function} fn - Function to wrap
   * @param {string} [name='anonymous'] - Function name for logging
   * @returns {Function} Wrapped function with error handling
   */
  createErrorBoundary(fn, name = 'anonymous') {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error, `function:${name}`, { args });
        // Return a safe default or re-throw based on context
        if (name.includes('render') || name.includes('update')) {
          // Don't crash the render/update loop
          return undefined;
        }
        throw error;
      }
    };
  }

  /**
   * Get error log entries
   * @param {number} [count] - Number of entries to return (default: all)
   * @returns {Array<Object>} Error log entries
   */
  getErrorLog(count) {
    if (count) {
      return this.errorLog.slice(-count);
    }
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    this.info('Error log cleared');
  }

  /**
   * Set log level
   * @param {string} level - New log level (debug, info, warn, error)
   */
  setLogLevel(level) {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (validLevels.includes(level)) {
      this.logLevel = level;
      this.info(`Log level set to ${level}`);
    } else {
      this.warn(`Invalid log level: ${level}`);
    }
  }

  /**
   * Set custom error reporter
   * @param {Function} reporter - Function to call with error data
   */
  setErrorReporter(reporter) {
    this.errorReporter = reporter;
    this.info('Custom error reporter configured');
  }

  /**
   * Export error log as JSON
   * @returns {string} JSON string of error log
   */
  exportErrorLog() {
    return JSON.stringify(
      {
        timestamp: Date.now(),
        logLevel: this.logLevel,
        errors: this.errorLog,
      },
      null,
      2,
    );
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Export for debugging
if (typeof window !== 'undefined') {
  window.UniversalPaperclipsErrorHandler = errorHandler;
}
