#!/usr/bin/env node
/**
 * One-time helper that gets a Spotify refresh token for the "now playing" widget.
 *
 * 1. Create an app at https://developer.spotify.com/dashboard
 * 2. Add the redirect URI  http://127.0.0.1:8888/callback  to it
 * 3. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env
 * 4. npm run spotify:auth  and open the printed URL
 */
import { createServer } from 'node:http';

try {
	process.loadEnvFile();
} catch {
	// no .env file; rely on the real environment
}

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
if (!clientId || !clientSecret) {
	console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env first');
	process.exit(1);
}

const redirectUri = 'http://127.0.0.1:8888/callback';
const state = crypto.randomUUID();
const authorizeUrl = new URL('https://accounts.spotify.com/authorize');
authorizeUrl.search = new URLSearchParams({
	client_id: clientId,
	response_type: 'code',
	redirect_uri: redirectUri,
	scope: 'user-read-currently-playing user-read-recently-played',
	state
}).toString();

const server = createServer(async (req, res) => {
	const url = new URL(req.url ?? '/', redirectUri);
	if (url.pathname !== '/callback') return res.writeHead(404).end();

	if (url.searchParams.get('state') !== state || !url.searchParams.get('code')) {
		res.writeHead(400).end('Authorization failed');
		console.error('Authorization failed:', url.searchParams.get('error') ?? 'state mismatch');
		return server.close();
	}

	const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code: url.searchParams.get('code')!,
			redirect_uri: redirectUri
		})
	});
	const body = (await tokenRes.json()) as { refresh_token?: string; error_description?: string };

	if (body.refresh_token) {
		res.end('Done! You can close this tab and go back to the terminal.');
		console.log(`\nAdd this to your .env:\n\nSPOTIFY_REFRESH_TOKEN=${body.refresh_token}\n`);
	} else {
		res.writeHead(500).end('Token exchange failed');
		console.error('Token exchange failed:', body.error_description ?? body);
	}
	server.close();
});

server.listen(8888, '127.0.0.1', () => {
	console.log(`Open this URL in your browser:\n\n${authorizeUrl}\n`);
});
