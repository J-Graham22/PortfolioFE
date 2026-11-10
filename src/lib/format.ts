const dateFormat = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric'
});

export function formatDate(value: Date | string | number) {
	return dateFormat.format(new Date(value));
}

export const statusLabels = {
	in_progress: 'in progress',
	paused: 'paused',
	completed: 'completed'
} as const;
