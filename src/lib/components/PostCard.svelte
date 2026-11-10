<script lang="ts">
	import type { Post } from '#lib/server/posts.ts';
	import { formatDate } from '#lib/format.ts';
	import Tag from './Tag.svelte';

	let { post }: { post: Omit<Post, 'markdown' | 'html'> } = $props();
</script>

<article class="group pixel-panel p-5 transition-colors hover:border-signal-dim">
	<p class="text-xs text-dim">
		<time datetime={new Date(post.publishedAt).toISOString()}>{formatDate(post.publishedAt)}</time>
	</p>
	<h3 class="mt-1 text-xl">
		<a href="/blog/{post.slug}" class="transition-colors group-hover:text-signal">{post.title}</a>
	</h3>
	{#if post.summary}
		<p class="mt-2 text-sm text-mute">{post.summary}</p>
	{/if}
	{#if post.tags.length}
		<ul class="mt-3 flex flex-wrap gap-2">
			{#each post.tags as tag (tag.slug)}
				<li><Tag href="/blog?tag={tag.slug}">#{tag.name}</Tag></li>
			{/each}
		</ul>
	{/if}
</article>
