<script lang="ts">
	import Tag from '#lib/components/Tag.svelte';
	import { formatDate } from '#lib/format.ts';
	import { postDate } from '#lib/types.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let post = $derived(data.post);
	let date = $derived(postDate(data.post));
</script>

<svelte:head>
	<title>{post.title}</title>
	{#if post.summary}<meta name="description" content={post.summary} />{/if}
</svelte:head>

<article class="mx-auto max-w-3xl">
	<a href="/blog" class="text-sm text-mute hover:text-signal">&larr; all posts</a>

	<header class="mt-6 border-b-2 border-navy pb-6">
		<p class="text-sm text-dim">
			<time datetime={date}>{formatDate(date)}</time>
		</p>
		<h1 class="mt-2 text-4xl sm:text-5xl">{post.title}</h1>
		{#if post.summary}<p class="mt-3 text-lg text-mute">{post.summary}</p>{/if}
		{#if post.tags.length}
			<ul class="mt-4 flex flex-wrap gap-2">
				{#each post.tags as tag (tag.slug)}
					<li><Tag href="/blog?tag={tag.slug}">#{tag.name}</Tag></li>
				{/each}
			</ul>
		{/if}
	</header>

	<div class="prose-site mt-8">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- rendered by the back end, which drops raw HTML -->
		{@html post.content_html}
	</div>

	{#if data.projects.length}
		<aside class="mt-12 pixel-panel p-5 text-sm">
			Related project{data.projects.length > 1 ? 's' : ''}:
			{#each data.projects as project, i (project.slug)}
				{#if i > 0},{/if}
				<a href="/projects#{project.slug}" class="text-signal hover:underline">{project.name}</a>
			{/each}
		</aside>
	{/if}
</article>
