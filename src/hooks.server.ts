import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { runMigrations } from '#lib/server/db/index.ts';

export const init: ServerInit = () => {
	runMigrations();
};

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	return response;
};
