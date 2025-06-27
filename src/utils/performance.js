/**
 * Performance optimization utilities
 * @module PerformanceUtils
 */

/**
 * Request idle callback polyfill
 * @param {Function} callback - Function to call when idle
 * @param {Object} options - Options object
 * @returns {number} Request ID
 */
export const requestIdleCallback =
  window.requestIdleCallback ||
  function (callback, _options) {
    const start = Date.now();
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1);
  };

/**
 * Cancel idle callback polyfill
 * @param {number} id - Request ID to cancel
 */
export const cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  };

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images when they enter viewport
 * @param {string} selector - CSS selector for images
 */
export function lazyLoadImages(selector = 'img[data-src]') {
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll(selector);
    const imageObserver = new IntersectionObserver((entries, _observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.removeAttribute('data-src');
          imageObserver.unobserve(image);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    const images = document.querySelectorAll(selector);
    images.forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

/**
 * Preload critical resources
 * @param {Array<Object>} resources - Array of resource objects
 */
export function preloadResources(resources) {
  resources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.type;
    if (resource.type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
}

/**
 * Enable passive event listeners for better scrolling performance
 */
export function enablePassiveListeners() {
  // Test for passive support
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassive = true;
        return true;
      },
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {
    // Passive event listeners not supported
  }

  return supportsPassive ? { passive: true } : false;
}

/**
 * Batch DOM reads and writes
 * @param {Array<Function>} reads - Array of read operations
 * @param {Array<Function>} writes - Array of write operations
 */
export function batchDOM(reads, writes) {
  // Schedule reads for next frame
  requestAnimationFrame(() => {
    // Perform all reads
    const readResults = reads.map((fn) => fn());

    // Schedule writes for next frame
    requestAnimationFrame(() => {
      // Perform all writes with read results
      writes.forEach((fn, index) => fn(readResults[index]));
    });
  });
}

/**
 * Web Worker manager for offloading heavy computations
 */
export class WorkerManager {
  constructor() {
    this.workers = new Map();
  }

  /**
   * Create a worker from a function
   * @param {string} name - Worker name
   * @param {Function} func - Function to run in worker
   * @returns {Worker} Created worker
   */
  createWorker(name, func) {
    const blob = new Blob(['(' + func.toString() + ')()'], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    this.workers.set(name, worker);
    return worker;
  }

  /**
   * Run a task in a worker
   * @param {string} name - Worker name
   * @param {any} data - Data to send to worker
   * @returns {Promise} Promise that resolves with worker result
   */
  runTask(name, data) {
    return new Promise((resolve, reject) => {
      const worker = this.workers.get(name);
      if (!worker) {
        reject(new Error(`Worker ${name} not found`));
        return;
      }

      worker.onmessage = (e) => resolve(e.data);
      worker.onerror = reject;
      worker.postMessage(data);
    });
  }

  /**
   * Terminate a worker
   * @param {string} name - Worker name
   */
  terminateWorker(name) {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
    }
  }

  /**
   * Terminate all workers
   */
  terminateAll() {
    this.workers.forEach((worker) => worker.terminate());
    this.workers.clear();
  }
}
