<script lang="ts">
	import { onMount } from 'svelte';
	import type { NowPlaying } from '#lib/types.ts';
	import { formatDate } from '#lib/format.ts';

	let { initial }: { initial: NowPlaying | null } = $props();

	let track = $derived(initial);

	onMount(() => {
		const refresh = async () => {
			if (document.hidden) return;
			const res = await fetch('/api/now-playing').catch(() => null);
			if (res?.ok) track = await res.json();
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
		{#if track?.isPlaying}
			<span class="flex h-3 items-end gap-0.5" aria-hidden="true">
				{#each [0, 1, 2, 3] as i (i)}
					<span class="eq-bar w-1 bg-signal" style:animation-delay="{i * 0.15}s"></span>
				{/each}
			</span>
			Listening to
		{:else}
			Last listened to
		{/if}
	</h2>

	{#if track}
		<a href={track.url} target="_blank" rel="noopener" class="group mt-3 flex items-center gap-4">
			{#if track.artUrl}
				<img
					src={track.artUrl}
					alt=""
					width="64"
					height="64"
					class="size-16 border-2 border-ridge pixelated"
				/>
			{/if}
			<span class="min-w-0">
				<span class="block truncate font-pixel text-lg transition-colors group-hover:text-signal"
					>{track.title}</span
				>
				<span class="block truncate text-sm text-mute">{track.artist}</span>
				{#if !track.isPlaying && track.playedAt}
					<span class="block text-xs text-dim">{formatDate(track.playedAt)}</span>
				{/if}
			</span>
		</a>
	{:else}
		<p class="mt-3 text-sm text-dim">Silence. Spotify isn't telling me anything right now.</p>
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
