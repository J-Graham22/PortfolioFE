import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	API_URL: {
		description:
			'Base URL of the portfolio back end (NewPortfolioWebsiteBE), e.g. http://localhost:8080. Only the server calls it.',
		schema: (value) => {
			const url = value || 'http://localhost:8080';
			if (!/^https?:\/\//.test(url)) throw new Error('API_URL must be an http(s) URL');
			return url.replace(/\/+$/, '');
		}
	}
});
