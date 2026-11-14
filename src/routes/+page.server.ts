import { getNowListening, getNowReading, listPosts, listProjects } from '#lib/server/api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [projects, posts] = await Promise.all([listProjects(), listPosts({ perPage: 3 })]);
	return {
		// Every listed project counts as in progress; the back end has no status field.
		projects: projects.slice(0, 4),
		posts: posts.items,
		// Spotify and Hardcover sit behind the back end; stream them so they never hold up the page.
		nowListening: getNowListening(),
		nowReading: getNowReading()
	};
};
