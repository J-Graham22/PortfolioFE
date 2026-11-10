import { requireAdmin } from '#lib/server/auth.ts';
import { createProject, listProjects } from '#lib/server/projects.ts';
import { readFields } from '#lib/server/request.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	return Response.json(await listProjects({ skill: url.searchParams.get('skill') ?? undefined }));
};

/**
 * Create a project. JSON or multipart; `image` may be an uploaded file or a URL.
 * Fields: name, image, slug?, description?, repoUrl? (github/codeberg), demoUrl?,
 * post? (blog post slug), status? (in_progress|paused|completed), skills? (slugs), sortOrder?
 */
export const POST: RequestHandler = async ({ request }) => {
	requireAdmin(request);
	return Response.json(await createProject(await readFields(request)), { status: 201 });
};
