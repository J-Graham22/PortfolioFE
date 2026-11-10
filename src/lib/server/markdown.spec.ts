import { describe, expect, it } from 'vitest';
import { parseFrontmatter, renderMarkdown } from './markdown';

describe('parseFrontmatter', () => {
	it('splits YAML frontmatter from the body', () => {
		const { data, content } = parseFrontmatter('---\ntitle: Hi\ntags: [a, b]\n---\n# Body\n');
		expect(data).toEqual({ title: 'Hi', tags: ['a', 'b'] });
		expect(content).toBe('# Body\n');
	});

	it('returns the whole document when there is no frontmatter', () => {
		expect(parseFrontmatter('# Just markdown')).toEqual({ data: {}, content: '# Just markdown' });
	});
});

describe('renderMarkdown', () => {
	it('adds ids to headings', () => {
		expect(renderMarkdown('## Hello *World*')).toContain(
			'<h2 id="hello-world">Hello <em>World</em></h2>'
		);
	});
});
