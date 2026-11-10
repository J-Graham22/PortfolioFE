<script lang="ts">
	import type { Book } from '#lib/types.ts';

	let { books }: { books: Book[] } = $props();
</script>

<section class="pixel-panel p-5" aria-labelledby="reading-heading">
	<h2 id="reading-heading" class="text-sm text-mute">Currently reading</h2>

	{#if books.length}
		<ul class="mt-3 flex flex-col gap-3">
			{#each books.slice(0, 3) as book (book.url)}
				<li>
					<a href={book.url} target="_blank" rel="noopener" class="group flex items-center gap-4">
						{#if book.coverUrl}
							<img
								src={book.coverUrl}
								alt=""
								loading="lazy"
								class="h-16 w-11 border-2 border-ridge object-cover"
							/>
						{/if}
						<span class="min-w-0">
							<span
								class="block truncate font-pixel text-lg transition-colors group-hover:text-signal"
								>{book.title}</span
							>
							<span class="block truncate text-sm text-mute">{book.authors.join(', ')}</span>
						</span>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mt-3 text-sm text-dim">Between books at the moment.</p>
	{/if}
</section>
