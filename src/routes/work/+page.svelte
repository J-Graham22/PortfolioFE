<script lang="ts">
	import Tag from '#lib/components/Tag.svelte';
	import { formatMonthRange } from '#lib/format.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Work</title>
</svelte:head>

<h1 class="text-4xl"><span class="text-signal">&gt;</span> work</h1>
<p class="mt-3 text-mute">Where I've worked, and what I did there.</p>

<ol class="mt-10 flex flex-col gap-6">
	{#each data.work as job (job.id)}
		<li class="pixel-panel p-5 {job.current ? 'border-signal-dim' : ''}">
			<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<h2 class="text-xl">
					{job.title}
					<span class="text-mute">@</span>
					{#if job.company_url}
						<a
							href={job.company_url}
							rel="noopener"
							target="_blank"
							class="text-signal hover:underline">{job.company}</a
						>
					{:else}
						<span class="text-signal">{job.company}</span>
					{/if}
				</h2>
				<p class="text-xs text-dim">
					<time datetime={job.start_date}>{formatMonthRange(job.start_date, job.end_date)}</time>
					{#if job.location}&middot; {job.location}{/if}
				</p>
			</div>

			{#if job.description_html}
				<div class="prose-site mt-4 text-sm">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- rendered by the back end, which drops raw HTML -->
					{@html job.description_html}
				</div>
			{/if}

			{#if job.skills.length}
				<ul class="mt-4 flex flex-wrap gap-2" aria-label="Skills used">
					{#each job.skills as skill (skill.slug)}
						<li><Tag>{skill.name}</Tag></li>
					{/each}
				</ul>
			{/if}
		</li>
	{:else}
		<li class="text-dim">No work history listed yet.</li>
	{/each}
</ol>
