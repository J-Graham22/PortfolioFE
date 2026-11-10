import { error } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/auth.ts';
import { deleteProject, getProject, updateProject } from '#lib/server/projects.ts';
import { readFields } from '#lib/server/request.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const project = await getProject(params.slug);
	if (!project) error(404, 'Project not found');
	return Response.json(project);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	requireAdmin(request);
	return Response.json(await updateProject(params.slug, await readFields(request)));
};

export const PUT = PATCH;

export const DELETE: RequestHandler = async ({ params, request }) => {
	requireAdmin(request);
	await deleteProject(params.slug);
	return new Response(null, { status: 204 });
};
