<script lang="ts">
	import '@fontsource/pixelify-sans/400.css';
	import '@fontsource/pixelify-sans/600.css';
	import '@fontsource/space-mono/400.css';
	import '@fontsource/space-mono/700.css';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { site } from '#lib/config/site.ts';
	import { Identity, setIdentity } from '#lib/identity.svelte.ts';
	import PixelImage from '#lib/components/PixelImage.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const identity = setIdentity(new Identity(() => data.identity));

	const nav = [
		{ href: '/', label: 'home' },
		{ href: '/projects', label: 'projects' },
		{ href: '/blog', label: 'blog' },
		{ href: '/skills', label: 'skills' },
		{ href: '/work', label: 'work' }
	];

	const isActive = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		rel="alternate"
		type="application/rss+xml"
		title="{identity.current.name} — blog"
		href="/blog/rss.xml"
	/>
	<meta name="description" content={site.description} />
</svelte:head>

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-signal focus:px-3 focus:py-1 focus:text-void"
>
	Skip to content
</a>

<div class="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 sm:px-6">
	<header class="flex flex-wrap items-center justify-between gap-4 py-6">
		<a href="/" class="flex items-center gap-3 font-pixel text-lg">
			<PixelImage
				src={identity.current.image}
				alt=""
				size={32}
				pixel={2}
				class="border-2 border-ridge"
			/>
			{identity.current.name}
		</a>
		<nav aria-label="Main">
			<ul class="flex gap-1 text-sm">
				{#each nav as item (item.href)}
					<li>
						<a
							href={item.href}
							aria-current={isActive(item.href) ? 'page' : undefined}
							class="px-2 py-1 transition-colors hover:text-signal {isActive(item.href)
								? 'text-signal'
								: 'text-mute'}"
						>
							{isActive(item.href) ? '>' : ''}{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</header>

	<main id="main" class="flex-1 pb-16">
		{@render children()}
	</main>

	<footer
		class="flex flex-wrap items-center justify-between gap-4 border-t-2 border-navy py-6 text-xs text-dim"
	>
		<p>&copy; {new Date().getFullYear()} {identity.current.name}</p>
		<ul class="flex gap-4">
			{#each site.links as link (link.href)}
				<li><a href={link.href} rel="me noopener" class="hover:text-signal">{link.label}</a></li>
			{/each}
			<li><a href="/blog/rss.xml" class="hover:text-signal">RSS</a></li>
		</ul>
	</footer>
</div>
