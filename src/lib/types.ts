export type NowPlaying = {
	isPlaying: boolean;
	title: string;
	artist: string;
	album: string;
	artUrl: string | null;
	url: string;
	/** Set when nothing is playing and this is the last played track. */
	playedAt: string | null;
};

export type Book = {
	title: string;
	authors: string[];
	coverUrl: string | null;
	url: string;
};
