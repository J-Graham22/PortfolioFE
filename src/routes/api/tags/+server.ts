import { listTags } from '#lib/server/posts.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => Response.json(await listTags());
