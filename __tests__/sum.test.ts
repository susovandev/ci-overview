import { describe, test, expect } from '@jest/globals';
import { sum } from '../src/sum';

describe('sum module', () => {
	test('adds 1 + 2 to equal 3', () => {
		expect(sum(1, 2)).toBe(3);
	});

	test('should handle negative numbers', () => {
		expect(sum(-1, -1)).toBe(-2);
	});
});
