import { relations, sql } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamps = {
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
		.$onUpdate(() => new Date())
};

export const post = sqliteTable('post', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	summary: text('summary').notNull().default(''),
	coverImage: text('cover_image'),
	markdown: text('markdown').notNull(),
	html: text('html').notNull(),
	published: integer('published', { mode: 'boolean' }).notNull().default(true),
	publishedAt: integer('published_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	...timestamps
});

export const tag = sqliteTable('tag', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull()
});

export const postTag = sqliteTable(
	'post_tag',
	{
		postId: integer('post_id')
			.notNull()
			.references(() => post.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => tag.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.postId, t.tagId] })]
);

export const skillCategory = sqliteTable('skill_category', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	sortOrder: integer('sort_order').notNull().default(0)
});

export const skill = sqliteTable('skill', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	categoryId: integer('category_id')
		.notNull()
		.references(() => skillCategory.id, { onDelete: 'restrict' }),
	sortOrder: integer('sort_order').notNull().default(0)
});

export const projectStatus = ['in_progress', 'paused', 'completed'] as const;
export type ProjectStatus = (typeof projectStatus)[number];

export const project = sqliteTable('project', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	description: text('description').notNull().default(''),
	image: text('image').notNull(),
	repoUrl: text('repo_url'),
	demoUrl: text('demo_url'),
	postId: integer('post_id').references(() => post.id, { onDelete: 'set null' }),
	status: text('status', { enum: projectStatus }).notNull().default('in_progress'),
	sortOrder: integer('sort_order').notNull().default(0),
	...timestamps
});

export const projectSkill = sqliteTable(
	'project_skill',
	{
		projectId: integer('project_id')
			.notNull()
			.references(() => project.id, { onDelete: 'cascade' }),
		skillId: integer('skill_id')
			.notNull()
			.references(() => skill.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.projectId, t.skillId] })]
);

export const postRelations = relations(post, ({ many }) => ({
	tags: many(postTag),
	projects: many(project)
}));

export const tagRelations = relations(tag, ({ many }) => ({ posts: many(postTag) }));

export const postTagRelations = relations(postTag, ({ one }) => ({
	post: one(post, { fields: [postTag.postId], references: [post.id] }),
	tag: one(tag, { fields: [postTag.tagId], references: [tag.id] })
}));

export const skillCategoryRelations = relations(skillCategory, ({ many }) => ({
	skills: many(skill)
}));

export const skillRelations = relations(skill, ({ one, many }) => ({
	category: one(skillCategory, { fields: [skill.categoryId], references: [skillCategory.id] }),
	projects: many(projectSkill)
}));

export const projectRelations = relations(project, ({ one, many }) => ({
	post: one(post, { fields: [project.postId], references: [post.id] }),
	skills: many(projectSkill)
}));

export const projectSkillRelations = relations(projectSkill, ({ one }) => ({
	project: one(project, { fields: [projectSkill.projectId], references: [project.id] }),
	skill: one(skill, { fields: [projectSkill.skillId], references: [skill.id] })
}));
