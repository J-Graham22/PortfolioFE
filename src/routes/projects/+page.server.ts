import { listProjects, listSkills } from '#lib/server/api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const skill = url.searchParams.get('skill') ?? '';
	const [categories, projects] = await Promise.all([listSkills(), listProjects({ skill })]);
	return {
		skill,
		skillName: categories.flatMap((c) => c.skills).find((s) => s.slug === skill)?.name,
		projects
	};
};
