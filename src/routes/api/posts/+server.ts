import { requireAdmin } from '#lib/server/auth.ts';
import { createPost, listPosts } from '#lib/server/posts.ts';
import { readFields } from '#lib/server/request.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const posts = await listPosts({
		tag: url.searchParams.get('tag') ?? undefined,
		q: url.searchParams.get('q') ?? undefined
	});
	return Response.json(posts);
};

/**
 * Create a post. Accepts:
 * - multipart/form-data with a `file` (markdown, optional frontmatter) plus optional
 *   `title`, `slug`, `summary`, `tags`, `published`, `publishedAt`, `coverImage` (URL or image file)
 * - application/json with the same fields and `markdown`
 * - text/markdown with frontmatter
 */
export const POST: RequestHandler = async ({ request }) => {
	requireAdmin(request);
	const post = await createPost(await readFields(request));
	return Response.json(post, { status: 201, headers: { Location: `/blog/${post.slug}` } });
};
