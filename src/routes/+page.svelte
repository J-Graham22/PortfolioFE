<script lang="ts">
	import NowPlaying from '#lib/components/NowPlaying.svelte';
	import PostCard from '#lib/components/PostCard.svelte';
	import ProfileCard from '#lib/components/ProfileCard.svelte';
	import ProjectCard from '#lib/components/ProjectCard.svelte';
	import Reading from '#lib/components/Reading.svelte';
	import { getIdentity } from '#lib/identity.svelte.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const identity = getIdentity();
</script>

<svelte:head>
	<title>{identity.current.name}</title>
</svelte:head>

<section class="py-10 sm:py-16">
	<ProfileCard />
</section>

{#if data.nowPlaying !== null || data.reading !== null}
	<section class="grid gap-6 sm:grid-cols-2" aria-label="What I'm into right now">
		{#if data.nowPlaying !== null}
			{#await data.nowPlaying}
				<div class="h-32 animate-pulse pixel-panel"></div>
			{:then track}
				<NowPlaying initial={track} />
			{/await}
		{/if}
		{#if data.reading !== null}
			{#await data.reading}
				<div class="h-32 animate-pulse pixel-panel"></div>
			{:then books}
				<Reading {books} />
			{/await}
		{/if}
	</section>
{/if}

<section class="mt-16">
	<div class="flex items-baseline justify-between">
		<h2 class="text-2xl"><span class="text-signal">#</span> In progress</h2>
		<a href="/projects" class="text-sm text-mute hover:text-signal">all projects &rarr;</a>
	</div>
	{#if data.projects.length}
		<div class="mt-6 grid gap-6 md:grid-cols-2">
			{#each data.projects as project (project.slug)}
				<ProjectCard {project} />
			{/each}
		</div>
	{:else}
		<p class="mt-6 text-dim">Nothing on the bench right now.</p>
	{/if}
</section>

<section class="mt-16">
	<div class="flex items-baseline justify-between">
		<h2 class="text-2xl"><span class="text-signal">#</span> Latest writing</h2>
		<a href="/blog" class="text-sm text-mute hover:text-signal">all posts &rarr;</a>
	</div>
	{#if data.posts.length}
		<div class="mt-6 flex flex-col gap-4">
			{#each data.posts as post (post.slug)}
				<PostCard {post} />
			{/each}
		</div>
	{:else}
		<p class="mt-6 text-dim">No posts yet.</p>
	{/if}
</section>
