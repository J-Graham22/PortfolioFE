import { error } from '@sveltejs/kit';
import { API_URL } from '$app/env/private';
import type {
	NowListening,
	NowReading,
	Post,
	PostPage,
	Project,
	SkillCategory,
	Tag,
	WorkEntry
} from '#lib/types.ts';

const TIMEOUT_MS = 8_000;

type Query = Record<string, string | number | undefined>;

/** Sends a GET to the back end, so pages never deal with raw HTTP. */
export async function backend(path: string, query: Query = {}, init: RequestInit = {}) {
	const url = new URL(path, API_URL);
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
	}
	try {
		return await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), ...init });
	} catch (err) {
		console.error(`Back end request failed: GET ${url.pathname}`, err);
		error(503, 'The content service is unavailable right now.');
	}
}

async function getJSON<T>(path: string, query?: Query): Promise<T> {
	const res = await backend(path, query, { headers: { Accept: 'application/json' } });
	if (res.status === 404) error(404, 'Not found');
	if (!res.ok) {
		console.error(`Back end returned ${res.status} for GET ${path}: ${await res.text()}`);
		error(502, 'The content service returned an error.');
	}
	return res.json() as Promise<T>;
}

export const listPosts = (
	options: { q?: string; tag?: string; page?: number; perPage?: number } = {}
) =>
	getJSON<PostPage>('/api/posts', {
		q: options.q,
		tag: options.tag,
		page: options.page,
		per_page: options.perPage
	});

export const getPost = (slug: string) => getJSON<Post>(`/api/posts/${encodeURIComponent(slug)}`);

export const listTags = () => getJSON<Tag[]>('/api/tags');

export const listProjects = (options: { skill?: string } = {}) =>
	getJSON<Project[]>('/api/projects', { skill: options.skill });

export const listSkills = () => getJSON<SkillCategory[]>('/api/skills');

export const listWork = () => getJSON<WorkEntry[]>('/api/work');

// The "now" routes always answer 200 with `available`, so a failure here is the
// back end itself being down. Widgets degrade to "unavailable" rather than
// failing the page.

const unavailable =
	<T>(fallback: T) =>
	(err: unknown) => {
		if (!(err && typeof err === 'object' && 'status' in err)) console.error(err);
		return fallback;
	};

export const getNowListening = () =>
	getJSON<NowListening>('/api/now/listening').catch(
		unavailable<NowListening>({ available: false, is_playing: false, track: null })
	);

export const getNowReading = () =>
	getJSON<NowReading>('/api/now/reading').catch(
		unavailable<NowReading>({ available: false, books: [] })
	);
