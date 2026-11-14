<script lang="ts">
	let {
		href,
		active = false,
		children
	}: { href?: string; active?: boolean; children: import('svelte').Snippet } = $props();
</script>

{#if href}
	<a
		{href}
		class="inline-block border px-2 py-0.5 text-xs transition-colors {active
			? 'border-signal bg-signal text-void'
			: 'border-ridge text-mute hover:border-signal hover:text-signal'}"
		aria-current={active ? 'page' : undefined}
	>
		{@render children()}
	</a>
{:else}
	<span class="inline-block border border-ridge px-2 py-0.5 text-xs text-mute">
		{@render children()}
	</span>
{/if}
