import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { saveImage } from './uploads';

export type Fields = Record<string, unknown>;

/**
 * Reads a JSON or multipart body into a plain object. Multipart image files are
 * saved to the upload dir and replaced by their public URL; other files
 * (e.g. a markdown post) are returned as their text content.
 */
export async function readFields(request: Request): Promise<Fields> {
	const type = request.headers.get('content-type') ?? '';

	if (type.includes('application/json')) {
		const body = await request.json().catch(() => error(400, 'Invalid JSON body'));
		if (!body || typeof body !== 'object' || Array.isArray(body))
			error(400, 'Expected a JSON object');
		return body as Fields;
	}

	if (type.includes('multipart/form-data') || type.includes('application/x-www-form-urlencoded')) {
		const form = await request.formData();
		const fields: Fields = {};
		for (const key of new Set(form.keys())) {
			const values = await Promise.all(
				form.getAll(key).map(async (value) => {
					if (typeof value === 'string') return value;
					return value.type.startsWith('image/') ? saveImage(value) : value.text();
				})
			);
			fields[key] = values.length === 1 ? values[0] : values;
		}
		return fields;
	}

	if (type.includes('text/markdown') || type.includes('text/plain')) {
		return { markdown: await request.text() };
	}

	error(415, 'Send application/json, multipart/form-data or text/markdown');
}

export function validate<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
	const result = schema.safeParse(data);
	if (!result.success) error(400, `Invalid input: ${z.prettifyError(result.error)}`);
	return result.data;
}

/** Accepts `["a", "b"]`, `"a, b"`, or a single string. */
export const stringList = z
	.union([z.array(z.string()), z.string()])
	.transform((value) =>
		(Array.isArray(value) ? value : value.split(',')).map((item) => item.trim()).filter(Boolean)
	);

/** Accepts booleans as well as the strings form fields produce. */
export const looseBoolean = z.union([
	z.boolean(),
	z
		.enum(['true', 'false', '1', '0', 'yes', 'no', 'on', 'off'])
		.transform((value) => ['true', '1', 'yes', 'on'].includes(value))
]);

/** Treats empty strings from forms as "not provided". */
export const emptyToNull = (value: unknown) => (value === '' ? null : value);
