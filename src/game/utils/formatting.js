/**
 * Number formatting utilities
 */

import { NOTATION_THRESHOLD, SCIENTIFIC_THRESHOLD } from '../core/constants.js';

/**
 * Format a number for display with appropriate notation
 */
export function formatNumber(num, decimals = 0) {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }

  // Handle negative numbers
  const negative = num < 0;
  num = Math.abs(num);

  let result;

  if (num < 1000) {
    // For small numbers
    if (decimals > 0) {
      result = num.toFixed(decimals);
    } else {
      result = Math.round(num).toString();
    }
  } else if (num < NOTATION_THRESHOLD) {
    // Regular notation for smaller numbers
    if (decimals > 0) {
      // Format with commas and decimals
      const parts = num.toFixed(decimals).split('.');
      parts[0] = parseInt(parts[0]).toLocaleString();
      result = parts.join('.');
    } else {
      result = Math.floor(num).toLocaleString();
    }
  } else if (num < SCIENTIFIC_THRESHOLD) {
    // Use abbreviations for millions, billions, etc.
    result = abbreviateNumber(num, decimals);
  } else {
    // Scientific notation for very large numbers
    result = num.toExponential(decimals);
  }

  return negative ? '-' + result : result;
}

/**
 * Abbreviate large numbers (K, M, B, T, etc.)
 */
function abbreviateNumber(num, decimals = 0) {
  const abbrev = ['', 'K', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'o', 'n', 'd'];
  const unrangifiedOrder = Math.floor(Math.log10(Math.abs(num)) / 3);
  const order = Math.max(0, Math.min(unrangifiedOrder, abbrev.length - 1));
  const suffix = abbrev[order];
  const scaled = num / Math.pow(10, order * 3);

  // For default formatting with no decimals specified, show decimals only if needed
  if (decimals === 0 && scaled === Math.floor(scaled)) {
    return scaled.toString() + suffix;
  }

  // Otherwise format with specified decimals
  return scaled.toFixed(decimals || 1) + suffix;
}

/**
 * Format currency values
 */
export function formatCurrency(amount, decimals = 2) {
  // For whole millions/billions with default decimals, show without decimals
  if (decimals === 2 && amount >= 1000000 && amount === Math.floor(amount)) {
    return '$' + formatNumber(amount, 0);
  }
  return '$' + formatNumber(amount, decimals);
}

/**
 * Format percentages
 */
export function formatPercentage(value, decimals = 0) {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Format time duration
 */
export function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Parse formatted number back to numeric value
 */
export function parseFormattedNumber(str) {
  if (typeof str !== 'string' || str.trim() === '') {
    return 0;
  }

  // Remove currency symbols and spaces
  str = str.replace(/[$,\s]/g, '');

  // Check if empty after cleanup
  if (str === '') {
    return 0;
  }

  // Handle abbreviations
  const abbrevMap = {
    K: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12,
    q: 1e15,
    Q: 1e18,
    s: 1e21,
    S: 1e24,
    o: 1e27,
    n: 1e30,
    d: 1e33,
  };

  for (const [suffix, multiplier] of Object.entries(abbrevMap)) {
    if (str.endsWith(suffix)) {
      const numPart = parseFloat(str.slice(0, -1));
      return isNaN(numPart) ? 0 : numPart * multiplier;
    }
  }

  // Handle scientific notation
  if (str.includes('e')) {
    return parseFloat(str);
  }

  // Regular number
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 */
export function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

/**
 * Check if a number is approximately equal to another
 */
export function approximately(a, b, epsilon = 0.001) {
  return Math.abs(a - b) < epsilon;
}
