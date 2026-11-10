import { listProjects } from '#lib/server/projects.ts';
import { listSkillCategories } from '#lib/server/skills.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const skill = url.searchParams.get('skill') ?? '';
	const categories = await listSkillCategories();
	return {
		skill,
		skillName: categories.flatMap((c) => c.skills).find((s) => s.slug === skill)?.name,
		projects: await listProjects({ skill: skill || undefined })
	};
};
