/**
 * Tests for number formatting utilities
 */

import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDuration,
  parseFormattedNumber,
  clamp,
  lerp,
  approximately,
} from '../../src/game/utils/formatting.js';

describe('Formatting Utilities', () => {
  describe('formatNumber', () => {
    it('should format small numbers normally', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(123)).toBe('123');
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(999999)).toBe('999,999');
    });

    it('should format numbers with decimals', () => {
      expect(formatNumber(123.456, 2)).toBe('123.46');
      expect(formatNumber(0.123, 3)).toBe('0.123');
      expect(formatNumber(1234.5678, 1)).toBe('1,234.6');
    });

    it('should abbreviate large numbers', () => {
      expect(formatNumber(1000000)).toBe('1M');
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(1000000000)).toBe('1B');
      expect(formatNumber(1500000000000)).toBe('1.5T');
    });

    it('should use scientific notation for very large numbers', () => {
      expect(formatNumber(1e21)).toBe('1e+21');
      expect(formatNumber(1.23e25)).toBe('1e+25');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-123)).toBe('-123');
      expect(formatNumber(-1000000)).toBe('-1M');
      expect(formatNumber(-1e21)).toBe('-1e+21');
    });

    it('should handle invalid inputs', () => {
      expect(formatNumber(NaN)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber('not a number')).toBe('0');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency values', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(10.5)).toBe('$10.50');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000000)).toBe('$1M');
    });

    it('should respect decimal places', () => {
      expect(formatCurrency(10.999, 0)).toBe('$11');
      expect(formatCurrency(10.999, 3)).toBe('$10.999');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(0.5)).toBe('50%');
      expect(formatPercentage(1)).toBe('100%');
      expect(formatPercentage(0.123)).toBe('12%');
    });

    it('should handle decimal places', () => {
      expect(formatPercentage(0.12345, 2)).toBe('12.35%');
      expect(formatPercentage(0.999, 1)).toBe('99.9%');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(45000)).toBe('45s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(60000)).toBe('1m 0s');
      expect(formatDuration(90000)).toBe('1m 30s');
      expect(formatDuration(3661000)).toBe('1h 1m');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(3600000)).toBe('1h 0m');
      expect(formatDuration(7200000)).toBe('2h 0m');
      expect(formatDuration(3700000)).toBe('1h 1m');
    });

    it('should format days and hours', () => {
      expect(formatDuration(86400000)).toBe('1d 0h');
      expect(formatDuration(90000000)).toBe('1d 1h');
      expect(formatDuration(172800000)).toBe('2d 0h');
    });
  });

  describe('parseFormattedNumber', () => {
    it('should parse regular numbers', () => {
      expect(parseFormattedNumber('123')).toBe(123);
      expect(parseFormattedNumber('1,234')).toBe(1234);
      expect(parseFormattedNumber('1,234.56')).toBe(1234.56);
    });

    it('should parse currency', () => {
      expect(parseFormattedNumber('$100')).toBe(100);
      expect(parseFormattedNumber('$1,234.56')).toBe(1234.56);
    });

    it('should parse abbreviated numbers', () => {
      expect(parseFormattedNumber('1K')).toBe(1000);
      expect(parseFormattedNumber('1.5M')).toBe(1500000);
      expect(parseFormattedNumber('2.5B')).toBe(2500000000);
      expect(parseFormattedNumber('1T')).toBe(1000000000000);
    });

    it('should parse scientific notation', () => {
      expect(parseFormattedNumber('1e6')).toBe(1000000);
      expect(parseFormattedNumber('2.5e10')).toBe(25000000000);
    });

    it('should handle invalid inputs', () => {
      expect(parseFormattedNumber('')).toBe(0);
      expect(parseFormattedNumber('invalid')).toBe(0);
      expect(parseFormattedNumber(null)).toBe(0);
      expect(parseFormattedNumber(undefined)).toBe(0);
    });
  });

  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 1)).toBe(10);
    });

    it('should handle negative values', () => {
      expect(lerp(-10, 10, 0.5)).toBe(0);
      expect(lerp(-5, -10, 0.5)).toBe(-7.5);
    });

    it('should extrapolate beyond range', () => {
      expect(lerp(0, 10, 2)).toBe(20);
      expect(lerp(0, 10, -1)).toBe(-10);
    });
  });

  describe('approximately', () => {
    it('should check approximate equality', () => {
      expect(approximately(1, 1)).toBe(true);
      expect(approximately(1, 1.0001)).toBe(true);
      expect(approximately(1, 1.1)).toBe(false);
    });

    it('should use custom epsilon', () => {
      expect(approximately(1, 1.1, 0.2)).toBe(true);
      expect(approximately(1, 2, 0.5)).toBe(false);
    });

    it('should handle negative values', () => {
      expect(approximately(-1, -1.0001)).toBe(true);
      expect(approximately(-1, 1)).toBe(false);
    });
  });
});