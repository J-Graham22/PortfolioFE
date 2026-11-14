#!/usr/bin/env node
/**
 * Publish (or update) a blog post on the back end from a markdown file.
 *
 *   npm run post -- path/to/post.md [--tags a,b] [--title "..."] [--summary "..."] [--slug my-post]
 *                                  [--draft] [--update]
 *
 * YAML frontmatter in the file (title, slug, summary, tags, draft/published) is
 * read and removed before upload, since the back end renders the whole file.
 * Flags override it. Reads API_URL (default http://localhost:8080) and
 * ADMIN_API_KEY (the back end's key) from the environment / .env.
 */
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { parseArgs } from 'node:util';
import { parse as parseYaml } from 'yaml';

try {
	process.loadEnvFile();
} catch {
	// no .env file; rely on the real environment
}

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		title: { type: 'string' },
		slug: { type: 'string' },
		summary: { type: 'string' },
		tags: { type: 'string' },
		draft: { type: 'boolean' },
		update: { type: 'boolean' }
	}
});

const [file] = positionals;
const key = process.env.ADMIN_API_KEY;
const api = (process.env.API_URL ?? 'http://localhost:8080').replace(/\/+$/, '');

if (!file) {
	console.error('Usage: npm run post -- <file.md> [--tags a,b] [--title ...] [--update]');
	process.exit(1);
}
if (!key) {
	console.error('ADMIN_API_KEY is not set (use the back end’s ADMIN_API_KEY)');
	process.exit(1);
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const source = await readFile(file, 'utf8');
const match = FRONTMATTER.exec(source);
const front = (match ? parseYaml(match[1]) : null) ?? {};
const body = match ? source.slice(match[0].length) : source;

const str = (value: unknown) => (value === undefined || value === null ? undefined : String(value));
const list = (value: unknown) => (Array.isArray(value) ? value.join(',') : str(value));
const published =
	values.draft === true
		? false
		: typeof front.published === 'boolean'
			? front.published
			: typeof front.draft === 'boolean'
				? !front.draft
				: undefined;

const fields: Record<string, string | undefined> = {
	title: values.title ?? str(front.title),
	slug: values.slug ?? str(front.slug),
	summary: values.summary ?? str(front.summary ?? front.description),
	tags: values.tags ?? list(front.tags),
	published: published === undefined ? undefined : String(published)
};

const form = new FormData();
// The back end requires a .md or .markdown name.
const name = /\.(md|markdown)$/i.test(file) ? basename(file) : `${basename(file)}.md`;
form.set('file', new Blob([body], { type: 'text/markdown' }), name);
for (const [field, value] of Object.entries(fields))
	if (value !== undefined) form.set(field, value);

const auth = { Authorization: `Bearer ${key}` };

async function call(method: string, path: string, init: RequestInit = {}) {
	const res = await fetch(`${api}${path}`, { method, ...init, headers: auth });
	const json = await res.json().catch(() => null);
	if (!res.ok) {
		console.error(`${method} ${path} failed (${res.status}):`, json?.message ?? json);
		process.exit(1);
	}
	return json;
}

/** Finds a post's id by slug, including drafts. */
async function findPostId(slug: string) {
	for (let page = 1; ; page++) {
		const { items, total, per_page } = await call(
			'GET',
			`/api/admin/posts?per_page=50&page=${page}`
		);
		const hit = items.find((p: { slug: string }) => p.slug === slug);
		if (hit) return hit.id as number;
		if (page * per_page >= total) return null;
	}
}

let post;
if (values.update) {
	const slug = fields.slug ?? basename(file).replace(/\.(md|markdown)$/i, '');
	const id = await findPostId(slug);
	if (id === null) {
		console.error(`No post with slug "${slug}". Pass --slug, or publish without --update.`);
		process.exit(1);
	}
	// Leave the slug alone on update; it was only used to find the post.
	form.delete('slug');
	post = await call('PATCH', `/api/admin/posts/${id}`, { body: form });
} else {
	if (!fields.title) {
		console.error('A title is required: add `title:` to the frontmatter or pass --title.');
		process.exit(1);
	}
	post = await call('POST', '/api/admin/posts', { body: form });
}

console.log(
	`${values.update ? 'Updated' : 'Published'}${post.published ? '' : ' (draft)'}: /blog/${post.slug}`
);
