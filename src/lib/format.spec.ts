import { describe, expect, it } from 'vitest';
import { formatDate, formatMonth, formatMonthRange } from './format';

describe('formatMonth', () => {
	it('formats the back end’s YYYY-MM dates in UTC', () => {
		expect(formatMonth('2022-03')).toBe('Mar 2022');
		expect(formatMonth('2020-01')).toBe('Jan 2020');
	});

	it('passes through values it cannot parse', () => {
		expect(formatMonth('soon')).toBe('soon');
	});
});

it('formatMonthRange marks current roles', () => {
	expect(formatMonthRange('2022-03', null)).toBe('Mar 2022 – Present');
	expect(formatMonthRange('2019-06', '2022-02')).toBe('Jun 2019 – Feb 2022');
});

it('formatDate reads RFC 3339 timestamps', () => {
	expect(formatDate('2026-11-13T04:02:44Z')).toBe('Nov 13, 2026');
});
