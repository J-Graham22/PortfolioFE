import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { error } from '@sveltejs/kit';
import { UPLOAD_DIR } from '$app/env/private';

const MAX_BYTES = 10 * 1024 * 1024;

export const imageTypes: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/avif': 'avif'
};

const typesByExt = Object.fromEntries(Object.entries(imageTypes).map(([type, ext]) => [ext, type]));

/** Stores an uploaded image and returns the public URL it is served from. */
export async function saveImage(file: File) {
	const ext = imageTypes[file.type];
	if (!ext) error(415, `Unsupported image type "${file.type}". Use png, jpeg, webp, gif or avif.`);
	if (file.size > MAX_BYTES) error(413, 'Images must be 10MB or smaller');

	const name = `${crypto.randomUUID()}.${ext}`;
	await mkdir(UPLOAD_DIR, { recursive: true });
	await writeFile(join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
	return `/uploads/${name}`;
}

export async function readImage(name: string) {
	const safe = basename(name);
	const type = typesByExt[safe.split('.').pop() ?? ''];
	if (safe !== name || !type) return null;

	try {
		return { body: await readFile(join(UPLOAD_DIR, safe)), type };
	} catch {
		return null;
	}
}
