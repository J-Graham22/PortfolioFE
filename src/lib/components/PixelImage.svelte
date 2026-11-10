<script lang="ts">
	import { untrack } from 'svelte';

	/**
	 * Renders an image downsampled onto a canvas so it reads as lightly
	 * pixelated. When `src` changes it "resolves" from chunky pixels back down to
	 * `pixel`, which doubles as the identity swap transition.
	 */
	let {
		src,
		alt,
		size,
		pixel = 4,
		class: className = ''
	}: { src: string; alt: string; size: number; pixel?: number; class?: string } = $props();

	let canvas = $state<HTMLCanvasElement>();
	let drawn = $state(false);

	function draw(img: HTMLImageElement, blockSize: number) {
		if (!canvas) return;
		const res = Math.max(1, Math.round(size / blockSize));
		canvas.width = res;
		canvas.height = res;
		const ctx = canvas.getContext('2d')!;
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';

		// object-fit: cover
		const w = img.naturalWidth || size;
		const h = img.naturalHeight || size;
		const side = Math.min(w, h);
		ctx.clearRect(0, 0, res, res);
		ctx.drawImage(img, (w - side) / 2, (h - side) / 2, side, side, 0, 0, res, res);
	}

	$effect(() => {
		const img = new Image();
		let frame = 0;
		let cancelled = false;
		const animate = untrack(() => drawn) && !matchMedia('(prefers-reduced-motion: reduce)').matches;

		img.onload = () => {
			if (cancelled) return;
			if (!animate) {
				draw(img, pixel);
				drawn = true;
				return;
			}
			const start = performance.now();
			const duration = 450;
			const from = Math.max(pixel * 6, size / 8);
			const step = (now: number) => {
				const t = Math.min(1, (now - start) / duration);
				const eased = 1 - (1 - t) ** 3;
				draw(img, from + (pixel - from) * eased);
				if (t < 1 && !cancelled) frame = requestAnimationFrame(step);
			};
			frame = requestAnimationFrame(step);
		};
		img.src = src;

		return () => {
			cancelled = true;
			cancelAnimationFrame(frame);
		};
	});
</script>

<div
	class="relative shrink-0 overflow-hidden {className}"
	style:width="{size}px"
	style:height="{size}px"
>
	<img
		{src}
		{alt}
		width={size}
		height={size}
		class="size-full object-cover pixelated"
		class:invisible={drawn}
	/>
	<canvas
		bind:this={canvas}
		aria-hidden="true"
		class="absolute inset-0 size-full pixelated"
		class:invisible={!drawn}
	></canvas>
</div>
