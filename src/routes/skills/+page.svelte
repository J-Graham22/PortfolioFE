<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Skills</title>
</svelte:head>

<h1 class="text-4xl"><span class="text-signal">&gt;</span> skills</h1>
<p class="mt-3 text-mute">
	Pick a skill to see the projects that use it. <span class="text-signal">*</span> marks skills I've
	used <a href="/work" class="text-signal hover:underline">at work</a>.
</p>

<div class="mt-10 grid gap-6 sm:grid-cols-2">
	{#each data.categories as category (category.slug)}
		<section class="pixel-panel p-5" aria-labelledby="cat-{category.slug}">
			<h2 id="cat-{category.slug}" class="text-xl">{category.name}</h2>
			{#if category.skills.length}
				<ul class="mt-4 flex flex-wrap gap-2">
					{#each category.skills as skill (skill.slug)}
						<li>
							{#if skill.projectCount}
								<a
									href="/projects?skill={skill.slug}"
									class="inline-flex items-center gap-2 border-2 border-ridge bg-navy px-2.5 py-1 text-sm transition-colors hover:border-signal hover:text-signal"
								>
									{skill.name}{#if skill.usedAtWork}<span class="text-signal" title="Used at work"
											>*</span
										>{/if}
									<span class="text-xs text-signal">{skill.projectCount}</span>
								</a>
							{:else}
								<span class="inline-block border-2 border-navy px-2.5 py-1 text-sm text-mute"
									>{skill.name}{#if skill.usedAtWork}<span class="text-signal" title="Used at work"
											>*</span
										>{/if}</span
								>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-4 text-sm text-dim">Nothing here yet.</p>
			{/if}
		</section>
	{:else}
		<p class="text-dim">No skills listed yet.</p>
	{/each}
</div>
