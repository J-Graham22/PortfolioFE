// UTC throughout, so server-rendered and hydrated dates always agree.
const dateFormat = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC'
});

const monthFormat = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	timeZone: 'UTC'
});

export function formatDate(value: Date | string | number) {
	return dateFormat.format(new Date(value));
}

/** Formats a `YYYY-MM` month, e.g. `2022-03` → `Mar 2022`. */
export function formatMonth(value: string) {
	const date = new Date(`${value}-01T00:00:00Z`);
	return Number.isNaN(date.getTime()) ? value : monthFormat.format(date);
}

/** `Mar 2022 – Present` for a current role. */
export function formatMonthRange(start: string, end: string | null) {
	return `${formatMonth(start)} – ${end ? formatMonth(end) : 'Present'}`;
}
