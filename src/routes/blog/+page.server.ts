import { listPosts, listTags } from '#lib/server/posts.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const tag = url.searchParams.get('tag') ?? '';
	const q = url.searchParams.get('q') ?? '';
	return {
		tag,
		q,
		tags: await listTags(),
		posts: await listPosts({ tag: tag || undefined, q: q || undefined })
	};
};
