import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { slugify } from '#lib/slug.ts';
import { db } from './db';
import { skill, skillCategory } from './db/schema';
import { validate, type Fields } from './request';

const categoryInput = z.object({
	name: z.string().trim().min(1),
	slug: z.string().trim().optional(),
	sortOrder: z.coerce.number().int().optional()
});

const skillInput = z.object({
	name: z.string().trim().min(1),
	slug: z.string().trim().optional(),
	category: z.string().trim().min(1),
	sortOrder: z.coerce.number().int().optional()
});

/** All categories with their skills and how many projects use each skill. */
export async function listSkillCategories() {
	const rows = await db.query.skillCategory.findMany({
		orderBy: [asc(skillCategory.sortOrder), asc(skillCategory.name)],
		with: {
			skills: {
				orderBy: [asc(skill.sortOrder), asc(skill.name)],
				with: { projects: { columns: { projectId: true } } }
			}
		}
	});
	return rows.map((category) => ({
		slug: category.slug,
		name: category.name,
		sortOrder: category.sortOrder,
		skills: category.skills.map((s) => ({
			slug: s.slug,
			name: s.name,
			sortOrder: s.sortOrder,
			projectCount: s.projects.length
		}))
	}));
}

async function categoryId(slugOrName: string) {
	const row = await db.query.skillCategory.findFirst({
		where: eq(skillCategory.slug, slugify(slugOrName))
	});
	if (!row) error(400, `Unknown skill category "${slugOrName}"`);
	return row.id;
}

export async function createCategory(fields: Fields) {
	const input = validate(categoryInput, fields);
	const slug = slugify(input.slug || input.name);
	if (await db.query.skillCategory.findFirst({ where: eq(skillCategory.slug, slug) })) {
		error(409, `Category "${slug}" already exists`);
	}
	return db
		.insert(skillCategory)
		.values({ slug, name: input.name, sortOrder: input.sortOrder })
		.returning()
		.get();
}

export async function updateCategory(slug: string, fields: Fields) {
	const input = validate(categoryInput.partial(), fields);
	const row = db
		.update(skillCategory)
		.set({ name: input.name, sortOrder: input.sortOrder, slug: input.slug && slugify(input.slug) })
		.where(eq(skillCategory.slug, slug))
		.returning()
		.get();
	if (!row) error(404, 'Category not found');
	return row;
}

export async function deleteCategory(slug: string) {
	const row = await db.query.skillCategory.findFirst({
		where: eq(skillCategory.slug, slug),
		with: { skills: true }
	});
	if (!row) error(404, 'Category not found');
	if (row.skills.length) error(409, 'Move or delete the skills in this category first');
	db.delete(skillCategory).where(eq(skillCategory.id, row.id)).run();
}

export async function createSkill(fields: Fields) {
	const input = validate(skillInput, fields);
	const slug = slugify(input.slug || input.name);
	if (await db.query.skill.findFirst({ where: eq(skill.slug, slug) }))
		error(409, `Skill "${slug}" already exists`);
	return db
		.insert(skill)
		.values({
			slug,
			name: input.name,
			categoryId: await categoryId(input.category),
			sortOrder: input.sortOrder
		})
		.returning()
		.get();
}

export async function updateSkill(slug: string, fields: Fields) {
	const input = validate(skillInput.partial(), fields);
	const row = db
		.update(skill)
		.set({
			name: input.name,
			sortOrder: input.sortOrder,
			slug: input.slug && slugify(input.slug),
			categoryId: input.category ? await categoryId(input.category) : undefined
		})
		.where(eq(skill.slug, slug))
		.returning()
		.get();
	if (!row) error(404, 'Skill not found');
	return row;
}

export async function deleteSkill(slug: string) {
	const deleted = db.delete(skill).where(eq(skill.slug, slug)).returning().all();
	if (!deleted.length) error(404, 'Skill not found');
}
