#!/usr/bin/env node
/**
 * Publish (or update) a blog post from a markdown file.
 *
 *   npm run post -- path/to/post.md [--tags a,b] [--title "..."] [--summary "..."] [--slug my-post]
 *                                  [--draft] [--cover path/to/image.png] [--update]
 *
 * Frontmatter in the file (title, slug, summary, tags, date, draft, cover) is used
 * too; flags override it. Reads SITE_URL (default http://localhost:5173) and
 * ADMIN_API_TOKEN from the environment / .env.
 */
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { parseArgs } from 'node:util';

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
		date: { type: 'string' },
		cover: { type: 'string' },
		draft: { type: 'boolean' },
		update: { type: 'boolean' }
	}
});

const [file] = positionals;
const token = process.env.ADMIN_API_TOKEN;
const site = (process.env.SITE_URL ?? 'http://localhost:5173').replace(/\/$/, '');

if (!file) {
	console.error('Usage: npm run post -- <file.md> [--tags a,b] [--title ...] [--update]');
	process.exit(1);
}
if (!token) {
	console.error('ADMIN_API_TOKEN is not set');
	process.exit(1);
}

const form = new FormData();
form.set('file', new Blob([await readFile(file)], { type: 'text/markdown' }), basename(file));
if (values.title) form.set('title', values.title);
if (values.slug) form.set('slug', values.slug);
if (values.summary) form.set('summary', values.summary);
if (values.tags) form.set('tags', values.tags);
if (values.date) form.set('publishedAt', values.date);
if (values.draft) form.set('published', 'false');
if (values.cover) {
	const ext = values.cover.split('.').pop()?.toLowerCase();
	const type = {
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		webp: 'image/webp',
		gif: 'image/gif',
		avif: 'image/avif'
	}[ext ?? ''];
	form.set(
		'coverImage',
		new Blob([await readFile(values.cover)], { type }),
		basename(values.cover)
	);
}

const slug = values.slug ?? basename(file).replace(/\.mdx?$/, '');
const res = await fetch(
	values.update ? `${site}/api/posts/${encodeURIComponent(slug)}` : `${site}/api/posts`,
	{
		method: values.update ? 'PATCH' : 'POST',
		headers: { Authorization: `Bearer ${token}` },
		body: form
	}
);

const body = await res.json().catch(() => null);
if (!res.ok) {
	console.error(`Failed (${res.status}):`, body?.message ?? body);
	process.exit(1);
}
console.log(`${values.update ? 'Updated' : 'Published'}: ${site}/blog/${body.slug}`);
