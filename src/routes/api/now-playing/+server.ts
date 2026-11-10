import { getNowPlaying } from '#lib/server/spotify.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		return Response.json(await getNowPlaying(), {
			headers: { 'Cache-Control': 'public, max-age=15' }
		});
	} catch (err) {
		console.error(err);
		return Response.json(null, { status: 502 });
	}
};
