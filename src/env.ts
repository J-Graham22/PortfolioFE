import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'Path to the SQLite database file.' },
	UPLOAD_DIR: {
		description: 'Directory where uploaded images are stored. Defaults to ./uploads.',
		schema: (value) => value || 'uploads'
	},
	ADMIN_API_TOKEN: {
		description: 'Bearer token required for every write request to /api/*.',
		schema: optional
	},
	SPOTIFY_CLIENT_ID: { description: 'Spotify app client id.', schema: optional },
	SPOTIFY_CLIENT_SECRET: { description: 'Spotify app client secret.', schema: optional },
	SPOTIFY_REFRESH_TOKEN: {
		description: 'Refresh token from `npm run spotify:auth`.',
		schema: optional
	},
	HARDCOVER_API_TOKEN: {
		description: 'Personal API token from https://hardcover.app/account/api.',
		schema: optional
	}
});
