import { defaultIdentity, identityCookie, identityParam, isIdentityKey } from '#lib/config/site.ts';
import type { LayoutServerLoad } from './$types';

/** `?as=persona` in the link wins, then the visitor's last choice, then the default. */
export const load: LayoutServerLoad = ({ url, cookies }) => {
	const requested = url.searchParams.get(identityParam);
	const remembered = cookies.get(identityCookie);
	return {
		identity: isIdentityKey(requested)
			? requested
			: isIdentityKey(remembered)
				? remembered
				: defaultIdentity
	};
};
