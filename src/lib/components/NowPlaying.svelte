<script lang="ts">
	import { onMount } from 'svelte';
	import type { NowListening } from '#lib/types.ts';

	let { initial }: { initial: NowListening } = $props();

	let now = $derived(initial);
	let track = $derived(now.available ? now.track : null);

	onMount(() => {
		const refresh = async () => {
			if (document.hidden) return;
			const res = await fetch('/api/now/listening').catch(() => null);
			if (res?.ok) now = await res.json();
		};
		const interval = setInterval(refresh, 30_000);
		document.addEventListener('visibilitychange', refresh);
		return () => {
			clearInterval(interval);
			document.removeEventListener('visibilitychange', refresh);
		};
	});
</script>

<section class="pixel-panel p-5" aria-labelledby="now-playing-heading">
	<h2 id="now-playing-heading" class="flex items-center gap-2 text-sm text-mute">
		{#if track && now.is_playing}
			<span class="flex h-3 items-end gap-0.5" aria-hidden="true">
				{#each [0, 1, 2, 3] as i (i)}
					<span class="eq-bar w-1 bg-signal" style:animation-delay="{i * 0.15}s"></span>
				{/each}
			</span>
			Listening to
		{:else if track}
			Paused on
		{:else}
			Listening to
		{/if}
	</h2>

	{#if track}
		<svelte:element
			this={track.url ? 'a' : 'div'}
			href={track.url}
			target={track.url ? '_blank' : undefined}
			rel={track.url ? 'noopener' : undefined}
			class="group mt-3 flex items-center gap-4"
		>
			{#if track.image_url}
				<img
					src={track.image_url}
					alt=""
					width="64"
					height="64"
					class="size-16 border-2 border-ridge pixelated"
				/>
			{/if}
			<span class="min-w-0">
				<span class="block truncate font-pixel text-lg transition-colors group-hover:text-signal"
					>{track.name}</span
				>
				<span class="block truncate text-sm text-mute">{track.artists.join(', ')}</span>
				{#if track.album}
					<span class="block truncate text-xs text-dim">{track.album}</span>
				{/if}
			</span>
		</svelte:element>
	{:else}
		<p class="mt-3 text-sm text-dim">Silence. Nothing's playing right now.</p>
	{/if}
</section>

<style>
	.eq-bar {
		height: 100%;
		animation: eq 0.9s steps(4) infinite alternate;
	}

	@keyframes eq {
		from {
			height: 20%;
		}
		to {
			height: 100%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.eq-bar {
			animation: none;
			height: 60%;
		}
	}
</style>
