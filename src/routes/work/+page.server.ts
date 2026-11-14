import { listWork } from '#lib/server/api.ts';
import type { PageServerLoad } from './$types';

/** Work history, current roles first (the back end's order). */
export const load: PageServerLoad = async () => ({ work: await listWork() });
