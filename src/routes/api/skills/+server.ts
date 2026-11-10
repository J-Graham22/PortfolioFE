import { requireAdmin } from '#lib/server/auth.ts';
import { readFields } from '#lib/server/request.ts';
import { createSkill, listSkillCategories } from '#lib/server/skills.ts';
import type { RequestHandler } from './$types';

/** Skills grouped by category. */
export const GET: RequestHandler = async () => Response.json(await listSkillCategories());

/** Fields: name, category (slug), slug?, sortOrder? */
export const POST: RequestHandler = async ({ request }) => {
	requireAdmin(request);
	return Response.json(await createSkill(await readFields(request)), { status: 201 });
};
