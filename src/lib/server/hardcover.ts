import { HARDCOVER_API_TOKEN } from '$app/env/private';
import type { Book } from '#lib/types.ts';
import { cached } from './cache';

const ENDPOINT = 'https://api.hardcover.app/v1/graphql';
const CURRENTLY_READING = 2; // Hardcover's user_book status id for "Currently Reading"

const query = /* GraphQL */ `
	query CurrentlyReading($status: Int!) {
		me {
			user_books(where: { status_id: { _eq: $status } }, order_by: { updated_at: desc }) {
				book {
					title
					slug
					image {
						url
					}
					contributions {
						author {
							name
						}
					}
				}
			}
		}
	}
`;

type Response = {
	data?: {
		me: {
			user_books: {
				book: {
					title: string;
					slug: string;
					image: { url: string } | null;
					contributions: { author: { name: string } | null }[];
				};
			}[];
		}[];
	};
	errors?: { message: string }[];
};

export const hardcoverConfigured = Boolean(HARDCOVER_API_TOKEN);

export const getCurrentlyReading = cached(30 * 60_000, async (): Promise<Book[]> => {
	if (!HARDCOVER_API_TOKEN) return [];

	const res = await fetch(ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			// The token shown on Hardcover's settings page already includes the "Bearer " prefix.
			Authorization: HARDCOVER_API_TOKEN.startsWith('Bearer ')
				? HARDCOVER_API_TOKEN
				: `Bearer ${HARDCOVER_API_TOKEN}`,
			'User-Agent': 'portfolio-site (currently-reading widget)'
		},
		body: JSON.stringify({ query, variables: { status: CURRENTLY_READING } })
	});
	if (!res.ok) throw new Error(`Hardcover request failed: ${res.status}`);

	const body = (await res.json()) as Response;
	if (body.errors?.length)
		throw new Error(`Hardcover: ${body.errors.map((e) => e.message).join('; ')}`);

	return (body.data?.me[0]?.user_books ?? []).map(({ book }) => ({
		title: book.title,
		authors: book.contributions.flatMap((c) => (c.author ? [c.author.name] : [])),
		coverUrl: book.image?.url ?? null,
		url: `https://hardcover.app/books/${book.slug}`
	}));
});
