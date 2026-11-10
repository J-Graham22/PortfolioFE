import { expect, it } from 'vitest';
import { slugify } from './slug';

it('slugifies titles', () => {
	expect(slugify('  Héllo, World! — Part 2 ')).toBe('hello-world-part-2');
	expect(slugify('Tailwind CSS')).toBe('tailwind-css');
});
