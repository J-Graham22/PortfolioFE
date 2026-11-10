import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { slugify } from '#lib/slug.ts';
import { db } from './db';
import { post, project, projectSkill, projectStatus, skill, type ProjectStatus } from './db/schema';
import { emptyToNull, stringList, validate, type Fields } from './request';

const REPO_HOSTS = ['github.com', 'codeberg.org'];

const repoUrl = z
	.url({ protocol: /^https$/ })
	.refine((value) => REPO_HOSTS.includes(new URL(value).hostname), {
		message: 'Repository must be a https://github.com or https://codeberg.org link'
	});

const projectInput = z.object({
	name: z.string().trim().min(1),
	slug: z.string().trim().optional(),
	description: z.string().trim().optional(),
	image: z.string().min(1),
	repoUrl: z.preprocess(emptyToNull, repoUrl.nullable().optional()),
	demoUrl: z.preprocess(
		emptyToNull,
		z
			.url({ protocol: /^https?$/ })
			.nullable()
			.optional()
	),
	post: z.preprocess(emptyToNull, z.string().trim().nullable().optional()),
	status: z.enum(projectStatus).optional(),
	skills: stringList.optional(),
	sortOrder: z.coerce.number().int().optional()
});

function repoHost(url: string): 'github' | 'codeberg' {
	return new URL(url).hostname === 'codeberg.org' ? 'codeberg' : 'github';
}

const withRelations = {
	post: { columns: { slug: true, title: true, published: true } },
	skills: { with: { skill: { with: { category: { columns: { slug: true, name: true } } } } } }
} as const;

type ProjectRow = NonNullable<Awaited<ReturnType<typeof findBySlug>>>;

function findBySlug(slug: string) {
	return db.query.project.findFirst({
		where: eq(project.slug, slug),
		columns: { postId: false },
		with: withRelations
	});
}

function present({ post: linkedPost, skills, ...row }: ProjectRow) {
	return {
		...row,
		repoHost: row.repoUrl ? repoHost(row.repoUrl) : null,
		post: linkedPost?.published ? { slug: linkedPost.slug, title: linkedPost.title } : null,
		skills: skills
			.map(({ skill: s }) => ({ slug: s.slug, name: s.name, category: s.category }))
			.sort((a, b) => a.name.localeCompare(b.name))
	};
}

export type Project = ReturnType<typeof present>;

export async function listProjects(options: { skill?: string; status?: ProjectStatus } = {}) {
	const filters = [];
	if (options.skill) {
		filters.push(
			inArray(
				project.id,
				db
					.select({ id: projectSkill.projectId })
					.from(projectSkill)
					.innerJoin(skill, eq(skill.id, projectSkill.skillId))
					.where(eq(skill.slug, options.skill))
			)
		);
	}
	if (options.status) filters.push(eq(project.status, options.status));

	const rows = await db.query.project.findMany({
		where: and(...filters),
		orderBy: [asc(project.sortOrder), desc(project.updatedAt)],
		columns: { postId: false },
		with: withRelations
	});
	return rows.map(present);
}

export async function getProject(slug: string) {
	const row = await findBySlug(slug);
	return row ? present(row) : null;
}

async function resolvePostId(slug: string | null | undefined) {
	if (slug === undefined) return undefined;
	if (slug === null) return null;
	const row = await db.query.post.findFirst({ where: eq(post.slug, slug), columns: { id: true } });
	if (!row) error(400, `No blog post with slug "${slug}"`);
	return row.id;
}

/** Looks up skill ids by slug, failing before anything is written if one is unknown. */
async function resolveSkillIds(slugs: string[] | undefined) {
	if (!slugs) return undefined;
	const wanted = [...new Set(slugs.map(slugify))];
	const rows = wanted.length
		? await db.query.skill.findMany({
				where: inArray(skill.slug, wanted),
				columns: { id: true, slug: true }
			})
		: [];
	const missing = wanted.filter((s) => !rows.some((r) => r.slug === s));
	if (missing.length)
		error(400, `Unknown skills: ${missing.join(', ')}. Create them via POST /api/skills first.`);
	return rows.map((r) => r.id);
}

function setSkills(projectId: number, skillIds: number[]) {
	db.delete(projectSkill).where(eq(projectSkill.projectId, projectId)).run();
	if (skillIds.length)
		db.insert(projectSkill)
			.values(skillIds.map((skillId) => ({ projectId, skillId })))
			.run();
}

export async function createProject(fields: Fields) {
	const input = validate(projectInput, fields);
	const slug = slugify(input.slug || input.name);
	if (!slug) error(400, 'Could not derive a slug from the name');
	if (await findBySlug(slug)) error(409, `A project with slug "${slug}" already exists`);
	const skillIds = (await resolveSkillIds(input.skills)) ?? [];
	const postId = (await resolvePostId(input.post)) ?? null;

	const row = db
		.insert(project)
		.values({
			slug,
			name: input.name,
			description: input.description ?? '',
			image: input.image,
			repoUrl: input.repoUrl ?? null,
			demoUrl: input.demoUrl ?? null,
			postId,
			status: input.status,
			sortOrder: input.sortOrder
		})
		.returning({ id: project.id })
		.get();
	setSkills(row.id, skillIds);
	return (await getProject(slug))!;
}

export async function updateProject(slug: string, fields: Fields) {
	const existing = await findBySlug(slug);
	if (!existing) error(404, 'Project not found');

	const input = validate(projectInput.partial(), fields);
	const nextSlug = input.slug ? slugify(input.slug) : existing.slug;
	if (nextSlug !== existing.slug && (await findBySlug(nextSlug))) {
		error(409, `A project with slug "${nextSlug}" already exists`);
	}
	const skillIds = await resolveSkillIds(input.skills);
	const postId = await resolvePostId(input.post);

	db.update(project)
		.set({
			slug: nextSlug,
			name: input.name,
			description: input.description,
			image: input.image,
			repoUrl: input.repoUrl,
			demoUrl: input.demoUrl,
			postId,
			status: input.status,
			sortOrder: input.sortOrder
		})
		.where(eq(project.id, existing.id))
		.run();
	if (skillIds) setSkills(existing.id, skillIds);
	return (await getProject(nextSlug))!;
}

export async function deleteProject(slug: string) {
	const deleted = db.delete(project).where(eq(project.slug, slug)).returning().all();
	if (!deleted.length) error(404, 'Project not found');
}
