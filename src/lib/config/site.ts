// TODO: replace the placeholder names, taglines, images and links with your own.
// Profile images live in /static/profile; any square-ish png/jpg/webp works.

export const identities = {
	real: {
		name: 'Your Name',
		tagline:
			'Software developer building things for the web, the terminal and the occasional game.',
		image: '/profile/real.svg',
		imageAlt: 'Photo of Your Name'
	},
	persona: {
		name: 'y0ur_handle',
		tagline: 'Professional tinkerer. Breaks things on purpose, fixes them by accident.',
		image: '/profile/persona.svg',
		imageAlt: 'Avatar of y0ur_handle'
	}
} as const;

export type IdentityKey = keyof typeof identities;

/** Identity shown when the link doesn't choose one, e.g. `/` vs `/?as=persona`. */
export const defaultIdentity: IdentityKey = 'real';

/** Query parameter that picks the identity: `?as=real` or `?as=persona`. */
export const identityParam = 'as';
export const identityCookie = 'identity';

export const site = {
	title: 'Portfolio',
	description: 'Projects, writing and the things I am currently into.',
	links: [
		{ label: 'GitHub', href: 'https://github.com/your-username' },
		{ label: 'Codeberg', href: 'https://codeberg.org/your-username' }
	]
};

export function isIdentityKey(value: unknown): value is IdentityKey {
	return typeof value === 'string' && value in identities;
}
