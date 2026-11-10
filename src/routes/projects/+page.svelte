<script lang="ts">
	import ProjectCard from '#lib/components/ProjectCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>

<h1 class="text-4xl"><span class="text-signal">&gt;</span> projects</h1>
<p class="mt-3 text-mute">Things I'm building, poking at, or have left on the workbench.</p>

{#if data.skill}
	<p class="mt-6 text-sm text-mute">
		Showing projects using <span class="text-ink">{data.skillName ?? data.skill}</span>
		&middot; <a href="/projects" class="text-signal hover:underline">show all</a>
	</p>
{/if}

<div class="mt-8 grid gap-6 md:grid-cols-2">
	{#each data.projects as project (project.slug)}
		<div id={project.slug} class="scroll-mt-6">
			<ProjectCard {project} activeSkill={data.skill} />
		</div>
	{:else}
		<p class="text-dim">No projects found.</p>
	{/each}
</div>
