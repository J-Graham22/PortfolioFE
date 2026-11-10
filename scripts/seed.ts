#!/usr/bin/env node
/**
 * Fills an empty database with example content via the API so you can see the
 * site populated. Run against a running dev server: `npm run dev`, then `npm run db:seed`.
 */
try {
	process.loadEnvFile();
} catch {
	// no .env file; rely on the real environment
}

const site = (process.env.SITE_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const token = process.env.ADMIN_API_TOKEN;
if (!token) {
	console.error('ADMIN_API_TOKEN is not set');
	process.exit(1);
}

async function api(path: string, body: unknown) {
	const res = await fetch(`${site}/api${path}`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (res.status === 409) return console.log(`  skip ${path} (exists)`);
	if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
	console.log(`  created ${path}`);
}

const categories = {
	'Front end': ['Svelte', 'TypeScript', 'Tailwind CSS'],
	'Back end': ['Node.js', 'SQLite', 'Go'],
	Systems: ['Rust', 'Linux', 'Docker'],
	'Game dev': ['Godot', 'Pixel art']
};

console.log('Skills');
for (const [i, [category, skills]] of Object.entries(categories).entries()) {
	await api('/skill-categories', { name: category, sortOrder: i });
	for (const name of skills) await api('/skills', { name, category });
}

console.log('Posts');
await api('/posts', {
	markdown: `---
title: Hello, world
summary: The obligatory first post, and how this site is put together.
tags: [meta, svelte]
---

This site is built with **SvelteKit**, **Tailwind** and a small SQLite database.

## Publishing

Posts are markdown files sent to \`POST /api/posts\`:

\`\`\`sh
npm run post -- content/my-post.md --tags svelte,meta
\`\`\`
`
});
await api('/posts', {
	title: 'Building a tiny roguelike',
	summary: 'Notes from the first week of a Godot side project.',
	tags: ['gamedev', 'godot'],
	markdown: 'Procedural dungeons, one tile at a time.\n\n> Ship the smallest fun thing first.'
});

console.log('Projects');
await api('/projects', {
	name: 'Portfolio site',
	description: 'This site: projects, writing and a pixelated profile picture.',
	image: '/placeholder/project-1.svg',
	repoUrl: 'https://github.com/your-username/portfolio',
	post: 'hello-world',
	skills: ['svelte', 'typescript', 'tailwind-css', 'sqlite']
});
await api('/projects', {
	name: 'Tiny roguelike',
	description: 'A turn-based dungeon crawler with hand-drawn pixel art.',
	image: '/placeholder/project-2.svg',
	repoUrl: 'https://codeberg.org/your-username/tiny-roguelike',
	demoUrl: 'https://example.com',
	post: 'building-a-tiny-roguelike',
	skills: ['godot', 'pixel-art']
});
await api('/projects', {
	name: 'dotfiles',
	description: 'Shell, editor and window manager config.',
	image: '/placeholder/project-3.svg',
	repoUrl: 'https://codeberg.org/your-username/dotfiles',
	status: 'paused',
	skills: ['linux', 'rust']
});

console.log('Done.');
