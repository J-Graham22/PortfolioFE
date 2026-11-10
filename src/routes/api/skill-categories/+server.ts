import { requireAdmin } from '#lib/server/auth.ts';
import { readFields } from '#lib/server/request.ts';
import { createCategory } from '#lib/server/skills.ts';
import type { RequestHandler } from './$types';

/** Fields: name, slug?, sortOrder? */
export const POST: RequestHandler = async ({ request }) => {
	requireAdmin(request);
	return Response.json(await createCategory(await readFields(request)), { status: 201 });
};
