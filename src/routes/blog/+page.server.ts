import { listPosts, listTags } from '#lib/server/api.ts';
import type { PageServerLoad } from './$types';

const PER_PAGE = 10;

export const load: PageServerLoad = async ({ url }) => {
	const tag = url.searchParams.get('tag') ?? '';
	const q = url.searchParams.get('q')?.trim() ?? '';
	const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '', 10) || 1);

	const [tags, posts] = await Promise.all([
		listTags(),
		listPosts({ tag, q, page, perPage: PER_PAGE })
	]);
	return {
		tag,
		q,
		tags,
		posts: posts.items,
		total: posts.total,
		page: posts.page,
		pages: Math.max(1, Math.ceil(posts.total / posts.per_page))
	};
};
