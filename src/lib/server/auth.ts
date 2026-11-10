import { timingSafeEqual } from 'node:crypto';
import { error } from '@sveltejs/kit';
import { ADMIN_API_TOKEN } from '$app/env/private';

/** Throws 401/503 unless the request carries `Authorization: Bearer <ADMIN_API_TOKEN>`. */
export function requireAdmin(request: Request) {
	if (!ADMIN_API_TOKEN) error(503, 'Writes are disabled: ADMIN_API_TOKEN is not configured');

	const header = request.headers.get('authorization') ?? '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : '';
	const expected = Buffer.from(ADMIN_API_TOKEN);
	const given = Buffer.from(token);

	if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
		error(401, 'Missing or invalid bearer token');
	}
}
