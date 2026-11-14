import { listProjects, listSkills, listWork } from '#lib/server/api.ts';
import type { Skill } from '#lib/types.ts';
import type { PageServerLoad } from './$types';

function countBySlug(lists: Skill[][]) {
	const counts = new Map<string, number>();
	for (const skills of lists) {
		for (const { slug } of skills) counts.set(slug, (counts.get(slug) ?? 0) + 1);
	}
	return counts;
}

export const load: PageServerLoad = async () => {
	const [categories, projects, work] = await Promise.all([
		listSkills(),
		listProjects(),
		listWork()
	]);
	const projectCounts = countBySlug(projects.map((p) => p.skills));
	const workSkills = new Set(work.flatMap((w) => w.skills.map((s) => s.slug)));

	return {
		categories: categories.map((category) => ({
			slug: category.slug,
			name: category.name,
			skills: category.skills.map((skill) => ({
				slug: skill.slug,
				name: skill.name,
				projectCount: projectCounts.get(skill.slug) ?? 0,
				usedAtWork: workSkills.has(skill.slug)
			}))
		}))
	};
};
