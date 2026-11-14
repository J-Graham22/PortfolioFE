import { error } from '@sveltejs/kit';
import { backend } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

// The back end only ever generates names like this, so anything else is a 404
// without a round trip.
const PHOTO_NAME = /^[0-9a-f]{32}\.(jpg|png|gif|webp)$/;

const FORWARDED = ['content-type', 'content-length', 'cache-control', 'etag'];

/**
 * Streams project photos from the back end, so its `photo_url` values work
 * as-is and the back end never has to be exposed to browsers.
 */
export const GET: RequestHandler = async ({ params, request }) => {
	if (!PHOTO_NAME.test(params.file)) error(404, 'Not found');

	const res = await backend(`/uploads/${params.file}`, {}, { method: request.method });
	if (res.status === 404) error(404, 'Not found');
	if (!res.ok) error(502, 'Could not load the image');

	const headers = new Headers();
	for (const name of FORWARDED) {
		const value = res.headers.get(name);
		if (value) headers.set(name, value);
	}
	return new Response(request.method === 'HEAD' ? null : res.body, { headers });
};

export const HEAD = GET;
