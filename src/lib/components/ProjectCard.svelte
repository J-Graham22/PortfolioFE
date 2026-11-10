<script lang="ts">
	import type { Project } from '#lib/server/projects.ts';
	import { statusLabels } from '#lib/format.ts';
	import Icon from './Icon.svelte';
	import Tag from './Tag.svelte';

	let { project, activeSkill }: { project: Project; activeSkill?: string } = $props();
</script>

<article class="flex flex-col overflow-hidden pixel-panel">
	<img
		src={project.image}
		alt=""
		loading="lazy"
		class="aspect-video w-full border-b-2 border-ridge bg-abyss object-cover pixelated"
	/>
	<div class="flex flex-1 flex-col gap-3 p-5">
		<div class="flex items-start justify-between gap-3">
			<h3 class="text-xl">{project.name}</h3>
			<span
				class="shrink-0 border px-1.5 text-[11px] uppercase {project.status === 'in_progress'
					? 'border-signal-dim text-signal'
					: 'border-ridge text-dim'}"
			>
				{statusLabels[project.status]}
			</span>
		</div>

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

		{#if project.repoUrl || project.demoUrl || project.post}
			<div class="mt-auto flex flex-wrap gap-3 pt-2">
				{#if project.repoUrl && project.repoHost}
					<a class="pixel-button" href={project.repoUrl} rel="noopener" target="_blank">
						<Icon name={project.repoHost} />
						{project.repoHost === 'codeberg' ? 'Codeberg' : 'GitHub'}
					</a>
				{/if}
				{#if project.demoUrl}
					<a class="pixel-button" href={project.demoUrl} rel="noopener" target="_blank">
						<Icon name="link" /> Demo
					</a>
				{/if}
				{#if project.post}
					<a class="pixel-button" href="/blog/{project.post.slug}" title={project.post.title}>
						<Icon name="post" /> Write-up
					</a>
				{/if}
			</div>
		{/if}
	</div>
</article>
