import { identities, defaultIdentity, site } from '#lib/config/site.ts';
import { listPosts } from '#lib/server/api.ts';
import { postDate } from '#lib/types.ts';
import type { RequestHandler } from './$types';

const escape = (value: string) =>
	value.replace(
		/[<>&'"]/g,
		(c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!
	);

export const GET: RequestHandler = async ({ url }) => {
	// 50 is the most the back end returns per page.
	const { items: posts } = await listPosts({ perPage: 50 });
	const items = posts
		.map(
			(post) => `
		<item>
			<title>${escape(post.title)}</title>
			<link>${url.origin}/blog/${post.slug}</link>
			<guid>${url.origin}/blog/${post.slug}</guid>
			<pubDate>${new Date(postDate(post)).toUTCString()}</pubDate>
			<description>${escape(post.summary)}</description>
			${post.tags.map((t) => `<category>${escape(t.name)}</category>`).join('')}
		</item>`
		)
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>${escape(identities[defaultIdentity].name)} — blog</title>
		<link>${url.origin}/blog</link>
		<description>${escape(site.description)}</description>${items}
	</channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=600'
		}
	});
};
