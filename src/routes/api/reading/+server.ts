import { getCurrentlyReading } from '#lib/server/hardcover.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		return Response.json(await getCurrentlyReading(), {
			headers: { 'Cache-Control': 'public, max-age=600' }
		});
	} catch (err) {
		console.error(err);
		return Response.json([], { status: 502 });
	}
};
