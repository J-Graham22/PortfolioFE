import { error } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/auth.ts';
import { deletePost, getPost, updatePost } from '#lib/server/posts.ts';
import { readFields } from '#lib/server/request.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, request }) => {
	const includeDrafts = request.headers.has('authorization');
	if (includeDrafts) requireAdmin(request);
	const post = await getPost(params.slug, { includeDrafts });
	if (!post) error(404, 'Post not found');
	return Response.json(post);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	requireAdmin(request);
	return Response.json(await updatePost(params.slug, await readFields(request)));
};

export const PUT = PATCH;

export const DELETE: RequestHandler = async ({ params, request }) => {
	requireAdmin(request);
	await deletePost(params.slug);
	return new Response(null, { status: 204 });
};
