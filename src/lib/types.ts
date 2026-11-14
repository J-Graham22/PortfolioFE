// Response shapes of the portfolio back end (NewPortfolioWebsiteBE). Field
// names match its JSON exactly, so these can be read straight off the wire.

export type Tag = {
	name: string;
	slug: string;
	/** Only set by `/api/tags`: how many published posts use it. */
	count?: number;
};

/** A post as listed by `/api/posts`, without its body. */
export type PostSummary = {
	id: number;
	slug: string;
	title: string;
	summary: string;
	published: boolean;
	published_at: string | null;
	created_at: string;
	updated_at: string;
	tags: Tag[];
};

/** A post from `/api/posts/:slug`. `content_html` is sanitised by the back end. */
export type Post = PostSummary & {
	content_html: string;
	content_markdown: string;
};

export type PostPage = {
	items: PostSummary[];
	total: number;
	page: number;
	per_page: number;
};

export type Skill = {
	id: number;
	name: string;
	slug: string;
	/** The category's name. */
	category: string;
};

export type SkillCategory = {
	id: number;
	name: string;
	slug: string;
	sort_order: number;
	skills: Skill[];
};

export type PostRef = {
	slug: string;
	title: string;
	/** Site route of the post, e.g. `/blog/my-post`. */
	path: string;
	published: boolean;
};

export type Project = {
	id: number;
	slug: string;
	name: string;
	description: string;
	/** Relative to the back end, e.g. `/uploads/<file>`; proxied by this site at the same path. */
	photo_url: string;
	repo_url?: string;
	repo_host?: 'github' | 'codeberg';
	demo_url?: string;
	post?: PostRef;
	sort_order: number;
	skills: Skill[];
	created_at: string;
	updated_at: string;
};

export type WorkEntry = {
	id: number;
	company: string;
	title: string;
	location?: string;
	company_url?: string;
	/** `YYYY-MM` */
	start_date: string;
	/** `YYYY-MM`, or null for a current role. */
	end_date: string | null;
	current: boolean;
	description_markdown: string;
	description_html: string;
	skills: Skill[];
	created_at: string;
	updated_at: string;
};

export type Track = {
	name: string;
	artists: string[];
	album: string;
	image_url?: string;
	url?: string;
	progress_ms: number;
	duration_ms: number;
};

/** `available: false` means Spotify isn't set up or couldn't be reached. */
export type NowListening = {
	available: boolean;
	is_playing: boolean;
	track: Track | null;
};

export type Book = {
	title: string;
	authors: string[];
	cover_url?: string;
	url?: string;
};

/** `available: false` means Hardcover isn't set up or couldn't be reached. */
export type NowReading = {
	available: boolean;
	books: Book[];
};

/** Publication date of a post, falling back to when it was created. */
export const postDate = (post: PostSummary) => post.published_at ?? post.created_at;
