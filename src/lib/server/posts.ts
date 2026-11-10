import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { slugify } from '#lib/slug.ts';
import { db } from './db';
import { post, postTag, tag } from './db/schema';
import { parseFrontmatter, renderMarkdown } from './markdown';
import { emptyToNull, looseBoolean, stringList, validate, type Fields } from './request';

const postInput = z.object({
	title: z.string().trim().min(1),
	slug: z.string().trim().optional(),
	summary: z.string().trim().optional(),
	markdown: z.string().min(1),
	tags: stringList.optional(),
	published: looseBoolean.optional(),
	publishedAt: z.coerce.date().optional(),
	coverImage: z.preprocess(emptyToNull, z.string().nullable().optional())
});

export type PostInput = z.input<typeof postInput>;

/**
 * Normalises post fields. A `markdown` (or `file`) value may carry YAML
 * frontmatter (title, slug, summary, tags, published, date, cover); explicit
 * fields take precedence over it.
 */
function mergePostFields(fields: Fields) {
	const source = fields.markdown ?? fields.file;
	const merged: Fields = {};

	if (typeof source === 'string') {
		const { data, content } = parseFrontmatter(source);
		Object.assign(merged, {
			title: data.title,
			slug: data.slug,
			summary: data.summary ?? data.description,
			tags: data.tags,
			published: data.published ?? (data.draft === undefined ? undefined : !data.draft),
			publishedAt: data.date ?? data.publishedAt,
			coverImage: data.cover ?? data.coverImage,
			markdown: content
		});
	}

	for (const [key, value] of Object.entries(fields)) {
		if (key !== 'file' && key !== 'markdown' && value !== undefined) merged[key] = value;
	}
	for (const key of Object.keys(merged)) if (merged[key] === undefined) delete merged[key];

	return merged;
}

async function setTags(postId: number, names: string[]) {
	db.delete(postTag).where(eq(postTag.postId, postId)).run();
	for (const name of names) {
		const slug = slugify(name);
		if (!slug) continue;
		const row = db
			.insert(tag)
			.values({ slug, name })
			.onConflictDoUpdate({ target: tag.slug, set: { slug } })
			.returning({ id: tag.id })
			.get();
		db.insert(postTag).values({ postId, tagId: row.id }).onConflictDoNothing().run();
	}
	pruneTags();
}

/** Drops tags no longer used by any post. */
function pruneTags() {
	db.delete(tag)
		.where(sql`${tag.id} not in (select ${postTag.tagId} from ${postTag})`)
		.run();
}

const withRelations = {
	tags: { with: { tag: true } },
	projects: { columns: { slug: true, name: true } }
} as const;

type PostRow = NonNullable<Awaited<ReturnType<typeof findBySlug>>>;

function findBySlug(slug: string) {
	return db.query.post.findFirst({ where: eq(post.slug, slug), with: withRelations });
}

function present(row: PostRow) {
	return {
		...row,
		tags: row.tags
			.map(({ tag }) => ({ slug: tag.slug, name: tag.name }))
			.sort((a, b) => a.name.localeCompare(b.name))
	};
}

export type Post = ReturnType<typeof present>;

export async function listPosts(
	options: { tag?: string; q?: string; includeDrafts?: boolean; limit?: number } = {}
) {
	const filters = [];
	if (!options.includeDrafts) filters.push(eq(post.published, true));
	if (options.tag) {
		filters.push(
			inArray(
				post.id,
				db
					.select({ id: postTag.postId })
					.from(postTag)
					.innerJoin(tag, eq(tag.id, postTag.tagId))
					.where(eq(tag.slug, options.tag))
			)
		);
	}
	const q = options.q?.trim().toLowerCase();
	if (q) {
		filters.push(
			sql`(instr(lower(${post.title}), ${q}) > 0 or instr(lower(${post.summary}), ${q}) > 0 or instr(lower(${post.markdown}), ${q}) > 0)`
		);
	}

	const rows = await db.query.post.findMany({
		where: and(...filters),
		orderBy: desc(post.publishedAt),
		limit: options.limit,
		with: withRelations,
		columns: { markdown: false, html: false }
	});
	return rows.map((row) => present(row as PostRow));
}

export async function getPost(slug: string, options: { includeDrafts?: boolean } = {}) {
	const row = await findBySlug(slug);
	if (!row || (!row.published && !options.includeDrafts)) return null;
	return present(row);
}

export async function listTags() {
	return db
		.select({ slug: tag.slug, name: tag.name, count: sql<number>`count(${post.id})` })
		.from(tag)
		.innerJoin(postTag, eq(postTag.tagId, tag.id))
		.innerJoin(post, and(eq(post.id, postTag.postId), eq(post.published, true)))
		.groupBy(tag.id)
		.orderBy(tag.name);
}

export async function createPost(fields: Fields) {
	const input = validate(postInput, mergePostFields(fields));
	const slug = slugify(input.slug || input.title);
	if (!slug) error(400, 'Could not derive a slug from the title');
	if (await findBySlug(slug)) error(409, `A post with slug "${slug}" already exists`);

	const row = db
		.insert(post)
		.values({
			slug,
			title: input.title,
			summary: input.summary ?? '',
			markdown: input.markdown,
			html: renderMarkdown(input.markdown),
			published: input.published ?? true,
			publishedAt: input.publishedAt ?? new Date(),
			coverImage: input.coverImage ?? null
		})
		.returning({ id: post.id })
		.get();
	await setTags(row.id, input.tags ?? []);
	return (await getPost(slug, { includeDrafts: true }))!;
}

export async function updatePost(slug: string, fields: Fields) {
	const existing = await findBySlug(slug);
	if (!existing) error(404, 'Post not found');

	const input = validate(postInput.partial(), mergePostFields(fields));
	const nextSlug = input.slug ? slugify(input.slug) : existing.slug;
	if (nextSlug !== existing.slug && (await findBySlug(nextSlug))) {
		error(409, `A post with slug "${nextSlug}" already exists`);
	}

	db.update(post)
		.set({
			slug: nextSlug,
			title: input.title,
			summary: input.summary,
			published: input.published,
			publishedAt: input.publishedAt,
			coverImage: input.coverImage,
			...(input.markdown !== undefined && {
				markdown: input.markdown,
				html: renderMarkdown(input.markdown)
			})
		})
		.where(eq(post.id, existing.id))
		.run();
	if (input.tags) await setTags(existing.id, input.tags);
	return (await getPost(nextSlug, { includeDrafts: true }))!;
}

export async function deletePost(slug: string) {
	const deleted = db.delete(post).where(eq(post.slug, slug)).returning({ id: post.id }).all();
	if (!deleted.length) error(404, 'Post not found');
	pruneTags();
}
