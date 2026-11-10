import { createContext } from 'svelte';
import { identities, identityCookie, type IdentityKey } from '#lib/config/site.ts';

export class Identity {
	key: IdentityKey;

	constructor(initial: () => IdentityKey) {
		this.key = $derived(initial());
	}

	get current() {
		return identities[this.key];
	}

	toggle() {
		this.key = this.key === 'real' ? 'persona' : 'real';
		document.cookie = `${identityCookie}=${this.key}; path=/; max-age=31536000; samesite=lax`;
	}
}

export const [getIdentity, setIdentity] = createContext<Identity>();
