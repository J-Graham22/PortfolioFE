/** Memoises an async loader for `ttlMs`, sharing in-flight requests. */
export function cached<T>(ttlMs: number, load: () => Promise<T>) {
	let value: Promise<T> | undefined;
	let expires = 0;

	return () => {
		if (!value || Date.now() > expires) {
			expires = Date.now() + ttlMs;
			value = load().catch((err) => {
				expires = 0; // retry on the next call
				throw err;
			});
		}
		return value;
	};
}
