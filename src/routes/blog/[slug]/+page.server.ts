import { getPost, listProjects } from '#lib/server/api.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [post, projects] = await Promise.all([getPost(params.slug), listProjects()]);
	return {
		post,
		// Projects point at their write-up; this follows that link backwards.
		projects: projects
			.filter((project) => project.post?.slug === post.slug)
			.map(({ slug, name }) => ({ slug, name }))
	};
};
