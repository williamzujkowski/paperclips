/**
 * Formatting utilities for Universal Paperclips
 *
 * Handles number formatting, currency display, and other text formatting
 * needs throughout the game.
 */

import { MATH } from '../game/core/constants.js';

/**
 * Format large numbers with appropriate suffixes
 * @param {number} num - Number to format
 * @param {number} precision - Decimal places to show
 * @returns {string} Formatted number
 */
export function formatNumber(num, precision = 2) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const absNum = Math.abs(num);
  const isNegative = num < 0;

  // Handle very small numbers
  if (absNum < 0.001 && absNum > 0) {
    return (isNegative ? '-' : '') + absNum.toExponential(precision);
  }

  // Handle numbers less than 1000
  if (absNum < MATH.THOUSAND) {
    if (Number.isInteger(num)) {
      return num.toString();
    }
    return num.toFixed(Math.min(precision, 2));
  }

  // Use scientific notation for very large numbers
  if (absNum >= MATH.SCIENTIFIC_NOTATION_THRESHOLD) {
    return (isNegative ? '-' : '') + absNum.toExponential(precision);
  }

  // Use suffix notation for moderately large numbers
  const suffixes = [
    { value: MATH.TRILLION, suffix: 'T' },
    { value: MATH.BILLION, suffix: 'B' },
    { value: MATH.MILLION, suffix: 'M' },
    { value: MATH.THOUSAND, suffix: 'K' }
  ];

  for (const { value, suffix } of suffixes) {
    if (absNum >= value) {
      const formatted = (absNum / value).toFixed(precision);
      return (isNegative ? '-' : '') + formatted + suffix;
    }
  }

  return num.toString();
}

/**
 * Format currency (dollars)
 * @param {number} amount - Amount to format
 * @param {boolean} showCents - Whether to show cents
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, showCents = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }

  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;
  const prefix = isNegative ? '-$' : '$';

  // For large amounts, use number formatting
  if (absAmount >= MATH.MILLION) {
    return prefix + formatNumber(absAmount, MATH.CURRENCY_PRECISION);
  }

  // For normal amounts, use currency formatting
  if (showCents || absAmount < 1) {
    return prefix + absAmount.toFixed(2);
  }

  return prefix + Math.floor(absAmount).toString();
}

/**
 * Format percentages
 * @param {number} value - Value to format (0.5 = 50%)
 * @param {number} precision - Decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, precision = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${(value * 100).toFixed(precision)}%`;
}

/**
 * Format time duration in milliseconds
 * @param {number} ms - Milliseconds
 * @param {boolean} includeMs - Whether to include milliseconds
 * @returns {string} Formatted duration
 */
export function formatDuration(ms, includeMs = false) {
  if (ms === null || ms === undefined || isNaN(ms)) {
    return '0s';
  }

  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`);
  }

  if (includeMs && parts.length === 1 && seconds < 10) {
    const milliseconds = Math.floor(ms % 1000);
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
  }

  return parts.join(' ');
}

/**
 * Format rate (per second)
 * @param {number} rate - Rate value
 * @param {string} unit - Unit name
 * @returns {string} Formatted rate
 */
export function formatRate(rate, unit = 'clips') {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return `0 ${unit}/sec`;
  }

  return `${formatNumber(rate, MATH.RATE_PRECISION)} ${unit}/sec`;
}

/**
 * Format memory size in bytes
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted memory size
 */
export function formatMemorySize(bytes) {
  if (bytes === null || bytes === undefined || isNaN(bytes)) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format ordinal numbers (1st, 2nd, 3rd, etc.)
 * @param {number} num - Number to format
 * @returns {string} Ordinal number
 */
export function formatOrdinal(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0th';
  }

  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${num}th`;
  }

  switch (lastDigit) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text || '';
  }

  return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export function capitalizeWords(text) {
  if (!text) {
    return '';
  }

  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to human readable
 * @param {string} text - CamelCase text
 * @returns {string} Human readable text
 */
export function camelToHuman(text) {
  if (!text) {
    return '';
  }

  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Format game statistics
 * @param {Object} stats - Statistics object
 * @returns {string} Formatted statistics
 */
export function formatStats(stats) {
  const lines = [];

  for (const [key, value] of Object.entries(stats)) {
    const humanKey = camelToHuman(key);
    let formattedValue;

    if (typeof value === 'number') {
      if (key.includes('time') || key.includes('duration')) {
        formattedValue = formatDuration(value);
      } else if (key.includes('rate')) {
        formattedValue = formatRate(value);
      } else if (key.includes('percent') || key.includes('ratio')) {
        formattedValue = formatPercentage(value);
      } else if (key.includes('memory') || key.includes('size')) {
        formattedValue = formatMemorySize(value);
      } else if (key.includes('currency') || key.includes('cost') || key.includes('price')) {
        formattedValue = formatCurrency(value);
      } else {
        formattedValue = formatNumber(value);
      }
    } else {
      formattedValue = String(value);
    }

    lines.push(`${humanKey}: ${formattedValue}`);
  }

  return lines.join('\n');
}

/**
 * Create a progress bar string
 * @param {number} current - Current value
 * @param {number} max - Maximum value
 * @param {number} width - Width in characters
 * @param {string} fillChar - Character to use for filled portion
 * @param {string} emptyChar - Character to use for empty portion
 * @returns {string} Progress bar
 */
export function createProgressBar(current, max, width = 20, fillChar = '█', emptyChar = '░') {
  if (max <= 0) {
    return emptyChar.repeat(width);
  }

  const progress = Math.min(current / max, 1);
  const fillWidth = Math.round(progress * width);
  const emptyWidth = width - fillWidth;

  return fillChar.repeat(fillWidth) + emptyChar.repeat(emptyWidth);
}

/**
 * Format a table from an array of objects
 * @param {Array} data - Array of objects
 * @param {Array} columns - Column definitions
 * @returns {string} Formatted table
 */
export function formatTable(data, columns) {
  if (!data || !data.length) {
    return '';
  }

  const rows = [];
  const columnWidths = {};

  // Calculate column widths
  columns.forEach((col) => {
    columnWidths[col.key] = Math.max(
      col.title.length,
      ...data.map((row) => String(row[col.key] || '').length)
    );
  });

  // Header
  const header = columns.map((col) => col.title.padEnd(columnWidths[col.key])).join(' | ');
  rows.push(header);

  // Separator
  const separator = columns.map((col) => '-'.repeat(columnWidths[col.key])).join('-|-');
  rows.push(separator);

  // Data rows
  data.forEach((row) => {
    const formattedRow = columns
      .map((col) => {
        let value = row[col.key] || '';
        if (col.formatter) {
          value = col.formatter(value, row);
        }
        return String(value).padEnd(columnWidths[col.key]);
      })
      .join(' | ');
    rows.push(formattedRow);
  });

  return rows.join('\n');
}

/**
 * Cache for formatted numbers to improve performance
 */
const formatCache = new Map();
const CACHE_MAX_SIZE = 1000;

/**
 * Clear the format cache
 */
export function clearFormatCache() {
  formatCache.clear();
}

/**
 * Get cached formatted number or compute and cache it
 * @param {number} num - Number to format
 * @param {Function} formatter - Formatting function
 * @param {string} key - Cache key
 * @returns {string} Formatted number
 */
function getCachedFormat(num, formatter, key) {
  const cacheKey = `${key}_${num}`;

  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey);
  }

  const formatted = formatter(num);

  // Limit cache size
  if (formatCache.size >= CACHE_MAX_SIZE) {
    const firstKey = formatCache.keys().next().value;
    formatCache.delete(firstKey);
  }

  formatCache.set(cacheKey, formatted);
  return formatted;
}

/**
 * Cached version of formatNumber
 * @param {number} num - Number to format
 * @param {number} precision - Decimal places
 * @returns {string} Formatted number
 */
export function formatNumberCached(num, precision = 2) {
  return getCachedFormat(num, (n) => formatNumber(n, precision), `num_${precision}`);
}

/**
 * Cached version of formatCurrency
 * @param {number} amount - Amount to format
 * @param {boolean} showCents - Whether to show cents
 * @returns {string} Formatted currency
 */
export function formatCurrencyCached(amount, showCents = true) {
  return getCachedFormat(amount, (a) => formatCurrency(a, showCents), `curr_${showCents}`);
}
