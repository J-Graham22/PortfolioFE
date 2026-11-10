import { requireAdmin } from '#lib/server/auth.ts';
import { readFields } from '#lib/server/request.ts';
import { deleteSkill, updateSkill } from '#lib/server/skills.ts';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	requireAdmin(request);
	return Response.json(await updateSkill(params.slug, await readFields(request)));
};

export const DELETE: RequestHandler = async ({ params, request }) => {
	requireAdmin(request);
	await deleteSkill(params.slug);
	return new Response(null, { status: 204 });
};
