import { listSkillCategories } from '#lib/server/skills.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ categories: await listSkillCategories() });
