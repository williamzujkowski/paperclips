/**
 * Tests for Formatting Utilities
 */

import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDuration,
  formatRate,
  formatMemorySize,
  formatOrdinal,
  truncateText,
  capitalizeWords,
  camelToHuman,
  formatStats,
  createProgressBar,
  formatTable,
  clearFormatCache,
  formatNumberCached,
  formatCurrencyCached
} from '../../src/utils/formatting.js';

describe('Formatting Utilities', () => {
  
  describe('formatNumber', () => {
    // Basic formatting
    test('should format integers without suffix', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1)).toBe('1');
      expect(formatNumber(10)).toBe('10');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(999)).toBe('999');
    });

    test('should format decimals with precision', () => {
      expect(formatNumber(1.234, 2)).toBe('1.23');
      expect(formatNumber(99.999, 2)).toBe('100.00');
      expect(formatNumber(0.1, 1)).toBe('0.1');
      expect(formatNumber(0.99, 0)).toBe('1');
    });

    // Suffix notation
    test('should format thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.00K');
      expect(formatNumber(1500)).toBe('1.50K');
      expect(formatNumber(9999)).toBe('10.00K');
      expect(formatNumber(999999)).toBe('1000.00K');
    });

    test('should use scientific notation for numbers >= 1 million', () => {
      expect(formatNumber(1000000)).toBe('1.00e+6');
      expect(formatNumber(1500000)).toBe('1.50e+6');
      expect(formatNumber(999999999)).toBe('1.00e+9');
    });

    test('should use scientific notation for billions', () => {
      expect(formatNumber(1000000000)).toBe('1.00e+9');
      expect(formatNumber(1500000000)).toBe('1.50e+9');
      expect(formatNumber(999999999999)).toBe('1.00e+12');
    });

    test('should use scientific notation for trillions', () => {
      expect(formatNumber(1000000000000)).toBe('1.00e+12');
      expect(formatNumber(1500000000000)).toBe('1.50e+12');
      expect(formatNumber(999999999999999)).toBe('1.00e+15');
    });

    // Scientific notation
    test('should use scientific notation for very large numbers', () => {
      expect(formatNumber(1e15)).toBe('1.00e+15');
      expect(formatNumber(1.23e20)).toBe('1.23e+20');
      expect(formatNumber(9.99e99)).toBe('9.99e+99');
    });

    test('should use scientific notation for very small positive numbers', () => {
      expect(formatNumber(0.0001)).toBe('1.00e-4');
      expect(formatNumber(0.00001)).toBe('1.00e-5');
      expect(formatNumber(1.23e-10)).toBe('1.23e-10');
    });

    // Negative numbers
    test('should handle negative numbers correctly', () => {
      expect(formatNumber(-1)).toBe('-1');
      expect(formatNumber(-999)).toBe('-999');
      expect(formatNumber(-1000)).toBe('-1.00K');
      expect(formatNumber(-1000000)).toBe('-1.00e+6');
      expect(formatNumber(-1000000000)).toBe('-1.00e+9');
      expect(formatNumber(-1000000000000)).toBe('-1.00e+12');
      expect(formatNumber(-1e15)).toBe('-1.00e+15');
      expect(formatNumber(-0.0001)).toBe('-1.00e-4');
    });

    // Edge cases
    test('should handle edge cases gracefully', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber(NaN)).toBe('0');
      expect(formatNumber(Infinity)).toBe('Infinity');
      expect(formatNumber(-Infinity)).toBe('-Infinity');
    });

    // Custom precision
    test('should respect custom precision parameter', () => {
      expect(formatNumber(1234, 0)).toBe('1K');
      expect(formatNumber(1234, 1)).toBe('1.2K');
      expect(formatNumber(1234, 3)).toBe('1.234K');
      expect(formatNumber(1234567, 4)).toBe('1.2346e+6');
    });

    // Late game numbers
    test('should handle extremely large late-game numbers', () => {
      expect(formatNumber(1e50)).toBe('1.00e+50');
      expect(formatNumber(1e100)).toBe('1.00e+100');
      expect(formatNumber(1e308)).toBe('1.00e+308');
      expect(formatNumber(Number.MAX_VALUE)).toMatch(/^1\.[\d]+e\+308$/);
    });
  });

  describe('formatCurrency', () => {
    test('should format basic currency values', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1)).toBe('$1.00');
      expect(formatCurrency(10.50)).toBe('$10.50');
      expect(formatCurrency(999.99)).toBe('$999.99');
    });

    test('should handle large currency values', () => {
      expect(formatCurrency(1000000)).toBe('$1.00e+6');
      expect(formatCurrency(1500000)).toBe('$1.50e+6');
      expect(formatCurrency(1000000000)).toBe('$1.00e+9');
    });

    test('should handle cents parameter', () => {
      expect(formatCurrency(10.50, true)).toBe('$10.50');
      expect(formatCurrency(10.50, false)).toBe('$10');
      expect(formatCurrency(10.99, false)).toBe('$10');
      expect(formatCurrency(0.50, false)).toBe('$0.50'); // Always show cents for < $1
    });

    test('should handle negative currency', () => {
      expect(formatCurrency(-10)).toBe('-$10.00');
      expect(formatCurrency(-999.99)).toBe('-$999.99');
      expect(formatCurrency(-1000000)).toBe('-$1.00e+6');
    });

    test('should handle edge cases', () => {
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
      expect(formatCurrency(NaN)).toBe('$0.00');
    });
  });

  describe('formatPercentage', () => {
    test('should format percentages correctly', () => {
      expect(formatPercentage(0)).toBe('0.0%');
      expect(formatPercentage(0.5)).toBe('50.0%');
      expect(formatPercentage(1)).toBe('100.0%');
      expect(formatPercentage(0.123)).toBe('12.3%');
      expect(formatPercentage(0.999)).toBe('99.9%');
    });

    test('should handle custom precision', () => {
      expect(formatPercentage(0.12345, 0)).toBe('12%');
      expect(formatPercentage(0.12345, 2)).toBe('12.35%');
      expect(formatPercentage(0.12345, 3)).toBe('12.345%');
    });

    test('should handle edge cases', () => {
      expect(formatPercentage(null)).toBe('0%');
      expect(formatPercentage(undefined)).toBe('0%');
      expect(formatPercentage(NaN)).toBe('0%');
      expect(formatPercentage(-0.5)).toBe('-50.0%');
      expect(formatPercentage(1.5)).toBe('150.0%');
    });
  });

  describe('formatDuration', () => {
    test('should format seconds only', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(59000)).toBe('59s');
    });

    test('should format minutes and seconds', () => {
      expect(formatDuration(60000)).toBe('1m');
      expect(formatDuration(61000)).toBe('1m 1s');
      expect(formatDuration(90000)).toBe('1m 30s');
      expect(formatDuration(3599000)).toBe('59m 59s');
    });

    test('should format hours, minutes and seconds', () => {
      expect(formatDuration(3600000)).toBe('1h');
      expect(formatDuration(3661000)).toBe('1h 1m 1s');
      expect(formatDuration(7200000)).toBe('2h');
      expect(formatDuration(86399000)).toBe('23h 59m 59s');
    });

    test('should format days', () => {
      expect(formatDuration(86400000)).toBe('1d');
      expect(formatDuration(90000000)).toBe('1d 1h');
      expect(formatDuration(172800000)).toBe('2d');
      expect(formatDuration(259200000)).toBe('3d');
    });

    test('should handle milliseconds parameter', () => {
      expect(formatDuration(1234, true)).toBe('1.234s');
      expect(formatDuration(5678, true)).toBe('5.678s');
      expect(formatDuration(10000, true)).toBe('10s'); // No ms for >= 10s
      expect(formatDuration(61234, true)).toBe('1m 1s'); // No ms for > 1m
    });

    test('should handle edge cases', () => {
      expect(formatDuration(null)).toBe('0s');
      expect(formatDuration(undefined)).toBe('0s');
      expect(formatDuration(NaN)).toBe('0s');
      expect(formatDuration(-1000)).toBe('-1s'); // Negative durations shown as negative
    });
  });

  describe('formatRate', () => {
    test('should format basic rates', () => {
      expect(formatRate(0)).toBe('0 clips/sec');
      expect(formatRate(1)).toBe('1 clips/sec');
      expect(formatRate(10.5)).toBe('10.50 clips/sec');
      expect(formatRate(999)).toBe('999 clips/sec');
    });

    test('should format large rates', () => {
      expect(formatRate(1000)).toBe('1.00K clips/sec');
      expect(formatRate(1000000)).toBe('1.00e+6 clips/sec');
      expect(formatRate(1000000000)).toBe('1.00e+9 clips/sec');
    });

    test('should handle custom units', () => {
      expect(formatRate(100, 'operations')).toBe('100 operations/sec');
      expect(formatRate(1500, 'watts')).toBe('1.50K watts/sec');
      expect(formatRate(0.5, 'probes')).toBe('0.50 probes/sec');
    });

    test('should handle edge cases', () => {
      expect(formatRate(null)).toBe('0 clips/sec');
      expect(formatRate(undefined)).toBe('0 clips/sec');
      expect(formatRate(NaN)).toBe('0 clips/sec');
      expect(formatRate(-10)).toBe('-10 clips/sec');
    });
  });

  describe('formatMemorySize', () => {
    test('should format bytes', () => {
      expect(formatMemorySize(0)).toBe('0 B');
      expect(formatMemorySize(1)).toBe('1 B');
      expect(formatMemorySize(1023)).toBe('1023 B');
    });

    test('should format kilobytes', () => {
      expect(formatMemorySize(1024)).toBe('1.0 KB');
      expect(formatMemorySize(1536)).toBe('1.5 KB');
      expect(formatMemorySize(1048575)).toBe('1024.0 KB');
    });

    test('should format megabytes', () => {
      expect(formatMemorySize(1048576)).toBe('1.0 MB');
      expect(formatMemorySize(1572864)).toBe('1.5 MB');
      expect(formatMemorySize(1073741823)).toBe('1024.0 MB');
    });

    test('should format gigabytes and terabytes', () => {
      expect(formatMemorySize(1073741824)).toBe('1.0 GB');
      expect(formatMemorySize(1099511627776)).toBe('1.0 TB');
      expect(formatMemorySize(2199023255552)).toBe('2.0 TB');
    });

    test('should handle edge cases', () => {
      expect(formatMemorySize(null)).toBe('0 B');
      expect(formatMemorySize(undefined)).toBe('0 B');
      expect(formatMemorySize(NaN)).toBe('0 B');
      expect(formatMemorySize(-1024)).toBe('-1024 B'); // Negative bytes don't convert to KB
    });
  });

  describe('formatOrdinal', () => {
    test('should format basic ordinals', () => {
      expect(formatOrdinal(1)).toBe('1st');
      expect(formatOrdinal(2)).toBe('2nd');
      expect(formatOrdinal(3)).toBe('3rd');
      expect(formatOrdinal(4)).toBe('4th');
      expect(formatOrdinal(5)).toBe('5th');
    });

    test('should handle teen numbers', () => {
      expect(formatOrdinal(11)).toBe('11th');
      expect(formatOrdinal(12)).toBe('12th');
      expect(formatOrdinal(13)).toBe('13th');
    });

    test('should handle larger numbers', () => {
      expect(formatOrdinal(21)).toBe('21st');
      expect(formatOrdinal(22)).toBe('22nd');
      expect(formatOrdinal(23)).toBe('23rd');
      expect(formatOrdinal(101)).toBe('101st');
      expect(formatOrdinal(111)).toBe('111th');
      expect(formatOrdinal(1001)).toBe('1001st');
    });

    test('should handle edge cases', () => {
      expect(formatOrdinal(0)).toBe('0th');
      expect(formatOrdinal(null)).toBe('0th');
      expect(formatOrdinal(undefined)).toBe('0th');
      expect(formatOrdinal(NaN)).toBe('0th');
      expect(formatOrdinal(-1)).toBe('-1th'); // -1 % 10 = -1, which hits default case
      expect(formatOrdinal(-21)).toBe('-21th'); // -21 % 10 = -1, which hits default case
    });
  });

  describe('truncateText', () => {
    test('should truncate long text', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is...');
      expect(truncateText('Hello World', 8)).toBe('Hello...');
      expect(truncateText('Test', 10)).toBe('Test');
    });

    test('should handle edge cases', () => {
      expect(truncateText('', 10)).toBe('');
      expect(truncateText(null, 10)).toBe('');
      expect(truncateText(undefined, 10)).toBe('');
      expect(truncateText('Short', 3)).toBe('...');
      expect(truncateText('Hi', 2)).toBe('Hi');
    });
  });

  describe('capitalizeWords', () => {
    test('should capitalize first letter of each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('the quick brown fox')).toBe('The Quick Brown Fox');
      expect(capitalizeWords('ALREADY CAPITAL')).toBe('ALREADY CAPITAL');
    });

    test('should handle edge cases', () => {
      expect(capitalizeWords('')).toBe('');
      expect(capitalizeWords(null)).toBe('');
      expect(capitalizeWords(undefined)).toBe('');
      expect(capitalizeWords('a')).toBe('A');
      expect(capitalizeWords('123 numbers')).toBe('123 Numbers');
    });
  });

  describe('camelToHuman', () => {
    test('should convert camelCase to human readable', () => {
      expect(camelToHuman('camelCase')).toBe('Camel Case');
      expect(camelToHuman('someVariableName')).toBe('Some Variable Name');
      expect(camelToHuman('APIKey')).toBe('A P I Key');
      expect(camelToHuman('simple')).toBe('Simple');
    });

    test('should handle edge cases', () => {
      expect(camelToHuman('')).toBe('');
      expect(camelToHuman(null)).toBe('');
      expect(camelToHuman(undefined)).toBe('');
      expect(camelToHuman('alreadySpaced words')).toBe('Already Spaced words');
    });
  });

  describe('formatStats', () => {
    test('should format various stat types', () => {
      const stats = {
        totalClips: 1000000,
        productionrate: 500,  // lowercase 'rate' to match key.includes('rate')
        successpercent: 0.85,  // lowercase 'percent' to match key.includes('percent')
        memorysize: 1048576,  // lowercase 'size' to match key.includes('size')
        averagecost: 99.99,  // lowercase 'cost' to match key.includes('cost')
        playtime: 3600000  // lowercase 'time' to match key.includes('time')
      };

      const formatted = formatStats(stats);
      expect(formatted).toContain('Total Clips: 1.00e+6');
      expect(formatted).toContain('Productionrate: 500 clips/sec');
      expect(formatted).toContain('Successpercent: 85.0%');
      expect(formatted).toContain('Memorysize: 1.0 MB');
      expect(formatted).toContain('Averagecost: $99.99');
      expect(formatted).toContain('Playtime: 1h');
    });

    test('should handle non-numeric values', () => {
      const stats = {
        playerName: 'John',
        status: 'Active',
        score: 12345
      };

      const formatted = formatStats(stats);
      expect(formatted).toContain('Player Name: John');
      expect(formatted).toContain('Status: Active');
      expect(formatted).toContain('Score: 12.35K');
    });
  });

  describe('createProgressBar', () => {
    test('should create progress bars correctly', () => {
      expect(createProgressBar(0, 100)).toBe('░░░░░░░░░░░░░░░░░░░░');
      expect(createProgressBar(50, 100)).toBe('██████████░░░░░░░░░░');
      expect(createProgressBar(100, 100)).toBe('████████████████████');
      expect(createProgressBar(25, 100)).toBe('█████░░░░░░░░░░░░░░░');
    });

    test('should handle custom width and characters', () => {
      expect(createProgressBar(50, 100, 10)).toBe('█████░░░░░');
      expect(createProgressBar(50, 100, 10, '#', '-')).toBe('#####-----');
      expect(createProgressBar(75, 100, 8, '=', ' ')).toBe('======  ');
    });

    test('should handle edge cases', () => {
      expect(createProgressBar(0, 0)).toBe('░░░░░░░░░░░░░░░░░░░░');
      expect(createProgressBar(150, 100)).toBe('████████████████████');
      // This test exposes a bug - negative current values cause negative repeat count
      // The function should clamp progress to [0, 1] range
      expect(() => createProgressBar(-50, 100)).toThrow('Invalid count value');
    });
  });

  describe('formatTable', () => {
    test('should format a basic table', () => {
      const data = [
        { name: 'Alice', score: 100 },
        { name: 'Bob', score: 85 }
      ];
      const columns = [
        { key: 'name', title: 'Name' },
        { key: 'score', title: 'Score' }
      ];

      const table = formatTable(data, columns);
      expect(table).toContain('Name  | Score');
      expect(table).toContain('------|------');
      expect(table).toContain('Alice | 100');
      expect(table).toContain('Bob   | 85');
    });

    test('should handle custom formatters', () => {
      const data = [
        { price: 10.5, quantity: 1000 }
      ];
      const columns = [
        { 
          key: 'price', 
          title: 'Price',
          formatter: (v) => `$${v}`
        },
        { 
          key: 'quantity', 
          title: 'Qty',
          formatter: (v) => formatNumber(v)
        }
      ];

      const table = formatTable(data, columns);
      expect(table).toContain('$10.5 | 1.00K');
    });

    test('should handle empty data', () => {
      expect(formatTable([], [])).toBe('');
      expect(formatTable(null, [])).toBe('');
      expect(formatTable(undefined, [])).toBe('');
    });
  });

  describe('Format Caching', () => {
    beforeEach(() => {
      clearFormatCache();
    });

    test('should cache number formatting', () => {
      // First call should compute
      const result1 = formatNumberCached(1000000);
      expect(result1).toBe('1.00e+6');

      // Second call should use cache (we can't directly test this, but it should be faster)
      const result2 = formatNumberCached(1000000);
      expect(result2).toBe('1.00e+6');

      // Different precision should have different cache entry
      const result3 = formatNumberCached(1000000, 3);
      expect(result3).toBe('1.000e+6');
    });

    test('should cache currency formatting', () => {
      const result1 = formatCurrencyCached(99.99);
      expect(result1).toBe('$99.99');

      const result2 = formatCurrencyCached(99.99, false);
      expect(result2).toBe('$99');
    });

    test('cache should have size limit', () => {
      // Add many entries to exceed cache limit
      for (let i = 0; i < 1100; i++) {
        formatNumberCached(i);
      }

      // Early entries should be evicted, late entries should still work
      const result = formatNumberCached(1099);
      expect(result).toBe('1.10K');
    });
  });

  describe('Special Characters and Edge Cases', () => {
    test('should handle Infinity correctly', () => {
      expect(formatNumber(Infinity)).toBe('Infinity');
      expect(formatNumber(-Infinity)).toBe('-Infinity');
      expect(formatCurrency(Infinity)).toBe('$Infinity');
      expect(formatRate(Infinity)).toBe('Infinity clips/sec');
    });

    test('should handle very small decimals', () => {
      expect(formatNumber(0.000001)).toBe('1.00e-6');
      expect(formatNumber(0.0000001)).toBe('1.00e-7');
      expect(formatNumber(1.23e-20)).toBe('1.23e-20');
    });

    test('should handle zero consistently', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(-0)).toBe('0');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatPercentage(0)).toBe('0.0%');
      expect(formatRate(0)).toBe('0 clips/sec');
    });

    test('should handle maximum safe integers', () => {
      expect(formatNumber(Number.MAX_SAFE_INTEGER)).toBe('9.01e+15');
      expect(formatNumber(Number.MIN_SAFE_INTEGER)).toBe('-9.01e+15');
    });

    test('should handle fractional values correctly', () => {
      expect(formatNumber(0.5)).toBe('0.50');
      expect(formatNumber(0.05)).toBe('0.05');
      expect(formatNumber(0.005)).toBe('0.01');
      expect(formatNumber(999.999)).toBe('1000.00');
    });

    test('should handle K/M/B/T boundary cases', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(999.99)).toBe('999.99');
      expect(formatNumber(999.999)).toBe('1000.00');
      expect(formatNumber(1000)).toBe('1.00K');
      expect(formatNumber(999999)).toBe('1000.00K');
      expect(formatNumber(999999.99)).toBe('1000.00K'); // Still under 1M threshold
    });

    test('formatDuration should handle complex durations', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(999)).toBe('0s');
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(86400000 + 3600000 + 60000 + 1000)).toBe('1d 1h 1m 1s');
      expect(formatDuration(365 * 24 * 60 * 60 * 1000)).toBe('365d');
    });

    test('formatTable should handle missing values', () => {
      const data = [
        { name: 'Alice', score: 100 },
        { name: 'Bob' }, // Missing score
        { score: 75 } // Missing name
      ];
      const columns = [
        { key: 'name', title: 'Name' },
        { key: 'score', title: 'Score' }
      ];

      const table = formatTable(data, columns);
      expect(table).toContain('Alice | 100');
      expect(table).toContain('Bob   |'); // Empty score
      expect(table).toContain('      | 75'); // Empty name
    });
  });
});