<script lang="ts">
	// Simplified 16px pixel-grid glyphs; brand marks are approximations, not logos.
	const paths = {
		github:
			'M5 1h6v1h2v2h1v6h-1v2h-1v1h-1v2H5v-2H3v-1h2v-1H4v-1H3V4h1V2h1zM6 3v1H5v5h1v1h4V9h1V4h-1V3z',
		codeberg: 'M8 1h1v1h1v2h1v2h1v2h1v2h1v2h1v2H1v-2h1v-2h1V8h1V6h1V4h1V2h1zM8 6v6h2V8H9V6z',
		link: 'M9 1h6v6h-2V4.4L8.7 8.7 7.3 7.3 11.6 3H9zM1 3h6v2H3v8h8V9h2v6H1z',
		post: 'M2 1h9l3 3v11H2zM4 5v1h6V5zm0 3v1h8V8zm0 3v1h8v-1z',
		play: 'M4 2h2v1h2v1h2v1h2v1h1v4h-1v1h-2v1H8v1H6v1H4z',
		book: 'M1 2h5l2 2 2-2h5v11h-5l-2 2-2-2H1zM3 4v7h3l1 1V5L6 4zm7 0-1 1v7l1-1h3V4z'
	};

	let { name, class: className = 'size-4' }: { name: keyof typeof paths; class?: string } =
		$props();
</script>

<svg
	viewBox="0 0 16 16"
	fill="currentColor"
	shape-rendering="crispEdges"
	aria-hidden="true"
	class={className}
>
	<path d={paths[name]} fill-rule="evenodd" />
</svg>
