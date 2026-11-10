<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status}</title>
</svelte:head>

<div class="py-24 text-center">
	<p class="font-pixel text-7xl text-signal">{page.status}</p>
	<p class="mt-4 text-mute">{page.error?.message}</p>
	<a href="/" class="mt-8 pixel-button">&larr; back home</a>
</div>
