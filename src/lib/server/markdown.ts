import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';
import { slugify } from '#lib/slug.ts';

const marked = new Marked({ gfm: true });

// Give headings ids so posts can be deep-linked.
marked.use({
	renderer: {
		heading({ tokens, depth }) {
			const text = this.parser.parseInline(tokens);
			const id = slugify(text.replace(/<[^>]+>/g, ''));
			return `<h${depth} id="${id}">${text}</h${depth}>\n`;
		}
	}
});

export function renderMarkdown(source: string) {
	return marked.parse(source, { async: false });
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Splits optional YAML frontmatter from a markdown document. */
export function parseFrontmatter(source: string): {
	data: Record<string, unknown>;
	content: string;
} {
	const match = FRONTMATTER.exec(source);
	if (!match) return { data: {}, content: source };

	const data = parseYaml(match[1]);
	return {
		data: data && typeof data === 'object' ? (data as Record<string, unknown>) : {},
		content: source.slice(match[0].length)
	};
}
