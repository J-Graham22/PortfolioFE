import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } from '$app/env/private';
import type { NowPlaying } from '#lib/types.ts';
import { cached } from './cache';

let accessToken: { value: string; expires: number } | undefined;

async function getAccessToken() {
	if (accessToken && Date.now() < accessToken.expires) return accessToken.value;

	const res = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: SPOTIFY_REFRESH_TOKEN!
		})
	});
	if (!res.ok) throw new Error(`Spotify token refresh failed: ${res.status}`);

	const body = (await res.json()) as { access_token: string; expires_in: number };
	accessToken = { value: body.access_token, expires: Date.now() + (body.expires_in - 60) * 1000 };
	return accessToken.value;
}

async function spotify(path: string) {
	return fetch(`https://api.spotify.com/v1${path}`, {
		headers: { Authorization: `Bearer ${await getAccessToken()}` }
	});
}

type SpotifyArtist = { name: string };
type SpotifyImage = { url: string; width: number };
type SpotifyItem = {
	type: 'track' | 'episode';
	name: string;
	external_urls: { spotify: string };
	artists?: SpotifyArtist[];
	album?: { name: string; images: SpotifyImage[] };
	show?: { name: string; images: SpotifyImage[] };
	images?: SpotifyImage[];
};

function toNowPlaying(item: SpotifyItem, isPlaying: boolean, playedAt?: string): NowPlaying {
	const images = item.album?.images ?? item.images ?? item.show?.images ?? [];
	// Pick the smallest image that's still at least 160px wide.
	const art =
		[...images].sort((a, b) => a.width - b.width).find((i) => i.width >= 160) ?? images[0];
	return {
		isPlaying,
		title: item.name,
		artist: item.artists?.map((a) => a.name).join(', ') ?? item.show?.name ?? '',
		album: item.album?.name ?? item.show?.name ?? '',
		artUrl: art?.url ?? null,
		url: item.external_urls.spotify,
		playedAt: playedAt ?? null
	};
}

export const spotifyConfigured = Boolean(
	SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET && SPOTIFY_REFRESH_TOKEN
);

/** What's playing right now, falling back to the most recently played track. */
export const getNowPlaying = cached(20_000, async (): Promise<NowPlaying | null> => {
	if (!spotifyConfigured) return null;

	const current = await spotify('/me/player/currently-playing?additional_types=track,episode');
	if (current.status === 200) {
		const body = (await current.json()) as { is_playing: boolean; item: SpotifyItem | null };
		if (body.item) return toNowPlaying(body.item, body.is_playing);
	} else if (current.status !== 204) {
		throw new Error(`Spotify currently-playing failed: ${current.status}`);
	}

	const recent = await spotify('/me/player/recently-played?limit=1');
	if (!recent.ok) throw new Error(`Spotify recently-played failed: ${recent.status}`);
	const body = (await recent.json()) as { items: { track: SpotifyItem; played_at: string }[] };
	const last = body.items[0];
	return last ? toNowPlaying(last.track, false, last.played_at) : null;
});
