import { getNowListening } from '#lib/server/api.ts';
import type { RequestHandler } from './$types';

/** Polled by the NowPlaying widget. The back end caches Spotify for 20s. */
export const GET: RequestHandler = async () =>
	Response.json(await getNowListening(), { headers: { 'Cache-Control': 'public, max-age=15' } });
