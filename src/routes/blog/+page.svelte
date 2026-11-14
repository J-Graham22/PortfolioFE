<script lang="ts">
	import PostCard from '#lib/components/PostCard.svelte';
	import Tag from '#lib/components/Tag.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const blogHref = ({ tag = data.tag, page = 1 }: { tag?: string; page?: number }) => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- built and discarded, not reactive state
		const params = new URLSearchParams();
		if (data.q) params.set('q', data.q);
		if (tag) params.set('tag', tag);
		if (page > 1) params.set('page', String(page));
		const query = params.toString();
		return query ? `/blog?${query}` : '/blog';
	};

	// Clicking the active tag clears it.
	const tagHref = (slug: string) => blogHref({ tag: slug === data.tag ? '' : slug });
</script>

<svelte:head>
	<title>Blog</title>
</svelte:head>

<h1 class="text-4xl"><span class="text-signal">&gt;</span> blog</h1>

<form method="GET" class="mt-8 flex gap-3" data-sveltekit-keepfocus data-sveltekit-replacestate>
	{#if data.tag}<input type="hidden" name="tag" value={data.tag} />{/if}
	<label class="sr-only" for="search">Search posts</label>
	<input
		id="search"
		name="q"
		type="search"
		value={data.q}
		placeholder="search posts..."
		class="min-w-0 flex-1 border-2 border-ridge bg-abyss px-3 py-1.5 text-ink placeholder:text-dim focus:border-signal focus:outline-none"
	/>
	<button class="pixel-button" type="submit">search</button>
</form>

{#if data.tags.length}
	<ul class="mt-4 flex flex-wrap gap-2" aria-label="Filter by tag">
		{#each data.tags as tag (tag.slug)}
			<li>
				<Tag href={tagHref(tag.slug)} active={tag.slug === data.tag}
					>#{tag.name} <span class="opacity-60">{tag.count}</span></Tag
				>
			</li>
		{/each}
	</ul>
{/if}

{#if data.q || data.tag}
	<p class="mt-6 text-sm text-mute">
		{data.total} result{data.total === 1 ? '' : 's'}
		{#if data.q}for "<span class="text-ink">{data.q}</span>"{/if}
		{#if data.tag}tagged <span class="text-ink"
				>#{data.tags.find((t) => t.slug === data.tag)?.name ?? data.tag}</span
			>{/if}
		&middot; <a href="/blog" class="text-signal hover:underline">clear</a>
	</p>
{/if}

<div class="mt-8 flex flex-col gap-4">
	{#each data.posts as post (post.slug)}
		<PostCard {post} />
	{:else}
		<p class="text-dim">No posts found.</p>
	{/each}
</div>

{#if data.pages > 1}
	<nav class="mt-8 flex items-center justify-between text-sm" aria-label="Pages">
		{#if data.page > 1}
			<a class="pixel-button" href={blogHref({ page: data.page - 1 })} rel="prev">&larr; newer</a>
		{:else}
			<span></span>
		{/if}
		<span class="text-dim">page {data.page} of {data.pages}</span>
		{#if data.page < data.pages}
			<a class="pixel-button" href={blogHref({ page: data.page + 1 })} rel="next">older &rarr;</a>
		{:else}
			<span></span>
		{/if}
	</nav>
{/if}
