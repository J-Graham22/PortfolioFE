<script lang="ts">
	import { getIdentity } from '#lib/identity.svelte.ts';
	import PixelImage from './PixelImage.svelte';

	const identity = getIdentity();
</script>

<button
	type="button"
	onclick={() => identity.toggle()}
	class="group flex cursor-pointer flex-col items-center gap-5 text-center sm:flex-row sm:text-left"
	aria-label="Switch to {identity.key === 'real' ? 'online persona' : 'real name'}"
>
	<PixelImage
		src={identity.current.image}
		alt={identity.current.imageAlt}
		size={160}
		pixel={3}
		class="pixel-panel border-ridge transition-colors group-hover:border-signal"
	/>
	<span class="flex flex-col gap-2">
		<span class="font-pixel text-4xl text-ink sm:text-5xl">
			{identity.current.name}<span class="animate-pulse text-signal">_</span>
		</span>
		<span class="max-w-md text-mute">{identity.current.tagline}</span>
		<span class="text-xs text-dim transition-colors group-hover:text-signal">
			[ click to switch to {identity.key === 'real' ? 'persona' : 'real me'} ]
		</span>
	</span>
</button>
