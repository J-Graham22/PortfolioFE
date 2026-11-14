<script lang="ts">
	import type { Project } from '#lib/types.ts';
	import Icon from './Icon.svelte';
	import Tag from './Tag.svelte';

	let { project, activeSkill }: { project: Project; activeSkill?: string } = $props();
</script>

<article class="flex flex-col overflow-hidden pixel-panel">
	<img
		src={project.photo_url}
		alt=""
		loading="lazy"
		class="aspect-video w-full border-b-2 border-ridge bg-abyss object-cover pixelated"
	/>
	<div class="flex flex-1 flex-col gap-3 p-5">
		<h3 class="text-xl">{project.name}</h3>

		{#if project.description}
			<p class="text-sm text-mute">{project.description}</p>
		{/if}

		{#if project.skills.length}
			<ul class="flex flex-wrap gap-2" aria-label="Skills used">
				{#each project.skills as skill (skill.slug)}
					<li>
						<Tag href="/projects?skill={skill.slug}" active={skill.slug === activeSkill}
							>{skill.name}</Tag
						>
					</li>
				{/each}
			</ul>
		{/if}

		{#if project.repo_url || project.demo_url || project.post}
			<div class="mt-auto flex flex-wrap gap-3 pt-2">
				{#if project.repo_url && project.repo_host}
					<a class="pixel-button" href={project.repo_url} rel="noopener" target="_blank">
						<Icon name={project.repo_host} />
						{project.repo_host === 'codeberg' ? 'Codeberg' : 'GitHub'}
					</a>
				{/if}
				{#if project.demo_url}
					<a class="pixel-button" href={project.demo_url} rel="noopener" target="_blank">
						<Icon name="link" /> Demo
					</a>
				{/if}
				{#if project.post}
					<a class="pixel-button" href={project.post.path} title={project.post.title}>
						<Icon name="post" /> Write-up
					</a>
				{/if}
			</div>
		{/if}
	</div>
</article>
