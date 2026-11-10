import { getCurrentlyReading, hardcoverConfigured } from '#lib/server/hardcover.ts';
import { listPosts } from '#lib/server/posts.ts';
import { listProjects } from '#lib/server/projects.ts';
import { getNowPlaying, spotifyConfigured } from '#lib/server/spotify.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const swallow =
		<T>(fallback: T) =>
		(err: unknown) => {
			console.error(err);
			return fallback;
		};

	return {
		projects: (await listProjects({ status: 'in_progress' })).slice(0, 4),
		posts: await listPosts({ limit: 3 }),
		// Third-party calls are streamed so they never hold up the page.
		nowPlaying: spotifyConfigured ? getNowPlaying().catch(swallow(null)) : null,
		reading: hardcoverConfigured ? getCurrentlyReading().catch(swallow([])) : null
	};
};
