# Portfolio

Personal site built with SvelteKit, Svelte 5 and Tailwind 4, backed by SQLite (Drizzle ORM). Pages:

- `/`: profile (click it to switch between real name and online persona), Spotify now playing, Hardcover currently reading, in-progress projects and latest posts
- `/blog`: all posts, with search (`?q=`) and tag filtering (`?tag=`); `/blog/<slug>` for each post; RSS at `/blog/rss.xml`
- `/projects`: projects with image, status, skills and repo (GitHub or Codeberg), demo and write-up links; filter with `?skill=`
- `/skills`: skills grouped by category, linking to the projects that use them

## Getting started

```sh
npm install
cp .env.example .env   # then set ADMIN_API_TOKEN (openssl rand -base64 32)
npm run dev
npm run db:seed        # optional: example skills, posts and projects (needs the dev server running)
```

Database migrations in `drizzle/` run automatically on server start.

## Making it yours

- **Names, taglines, photos and footer links:** `src/lib/config/site.ts`. Profile images go in `static/profile/`.
- **Which identity a link opens with:** `https://your.site/?as=persona` or `?as=real`. Without the parameter, the visitor's last choice (a cookie) is used, then `defaultIdentity`.
- **Colors and fonts:** the `@theme` block in `src/routes/layout.css`. Headings use Pixelify Sans and body text uses Space Mono, both self-hosted through Fontsource.
- **Pixelation strength:** the `pixel` prop on `PixelImage` (block size in px).

## Content API

All writes need `Authorization: Bearer $ADMIN_API_TOKEN`. Bodies can be JSON or multipart form data. In multipart requests, image files are saved to `UPLOAD_DIR` and replaced by their URL.

| Method                 | Path                               | Notes                                                                                                                                                          |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`                  | `/api/posts?tag=&q=`               | published posts                                                                                                                                                |
| `POST`                 | `/api/posts`                       | `file` or `markdown`, plus optional `title`, `slug`, `summary`, `tags`, `published`, `publishedAt`, `coverImage`; `text/markdown` also works                   |
| `GET` `PATCH` `DELETE` | `/api/posts/:slug`                 | `GET` with the token includes drafts                                                                                                                           |
| `GET`                  | `/api/tags`                        | tags with post counts                                                                                                                                          |
| `GET` `POST`           | `/api/projects?skill=`             | `name`, `image` (file or URL), `description`, `repoUrl` (github.com/codeberg.org only), `demoUrl`, `post` (post slug), `status`, `skills` (slugs), `sortOrder` |
| `GET` `PATCH` `DELETE` | `/api/projects/:slug`              |                                                                                                                                                                |
| `GET` `POST`           | `/api/skills`                      | `GET` returns skills grouped by category; `POST` takes `name`, `category` (slug), `sortOrder`                                                                  |
| `PATCH` `DELETE`       | `/api/skills/:slug`                |                                                                                                                                                                |
| `POST`                 | `/api/skill-categories`            | `name`, `sortOrder`                                                                                                                                            |
| `PATCH` `DELETE`       | `/api/skill-categories/:slug`      | a category can only be deleted once it has no skills                                                                                                           |
| `POST`                 | `/api/uploads`                     | multipart `file`; returns `{ url }`                                                                                                                            |
| `GET`                  | `/api/now-playing`, `/api/reading` | used by the home page widgets                                                                                                                                  |

### Publishing a post

Markdown files can carry YAML frontmatter (see `content/examples/example-post.md`):

```md
---
title: My post
summary: One line for the listing
tags: [svelte, gamedev]
date: 2026-10-27
draft: false
---

Body…
```

Then either use the bundled script (it reads `SITE_URL` and `ADMIN_API_TOKEN` from `.env`):

```sh
npm run post -- content/my-post.md --tags svelte,meta --cover cover.png
npm run post -- content/my-post.md --update      # PATCH the post whose slug is the file name (or --slug)
```

or curl:

```sh
curl -X POST https://your.site/api/posts \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -F file=@content/my-post.md -F tags=svelte,meta
```

Fields sent with the request override the frontmatter.

### Adding a project

```sh
curl -X POST https://your.site/api/projects \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -F name="Tiny roguelike" -F image=@screenshot.png \
  -F repoUrl=https://codeberg.org/you/tiny-roguelike \
  -F post=building-a-tiny-roguelike -F skills=godot,pixel-art
```

## Now playing (Spotify)

1. Create an app at <https://developer.spotify.com/dashboard> and add the redirect URI `http://127.0.0.1:8888/callback`.
2. Put `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `.env`.
3. Run `npm run spotify:auth`, open the URL it prints, and copy the `SPOTIFY_REFRESH_TOKEN` it outputs into `.env`.

The widget shows the current track, or the last played one, and refreshes every 30 seconds. It is hidden until Spotify is configured.

## Currently reading (Hardcover)

Margins has no public API, so this uses [Hardcover](https://hardcover.app). Copy your token from <https://hardcover.app/account/api> into `HARDCOVER_API_TOKEN`. Books on your "Currently Reading" shelf appear on the home page. Results are cached for 30 minutes, and the widget is hidden until a token is set.

## Deploying (Docker)

```sh
ORIGIN=https://your.site docker compose up -d --build
```

The database and uploads live in the `site-data` volume (`/data`). `ORIGIN` must match your public URL. Put a reverse proxy such as Caddy or nginx in front for TLS.

Without Docker: `npm run build && npm start`. That serves `build/` on port 3000 and reads `.env`.

## Scripts

| Script                            | What it does                                                   |
| --------------------------------- | -------------------------------------------------------------- |
| `npm run dev`                     | dev server                                                     |
| `npm run check` / `lint` / `test` | type check, lint, unit tests                                   |
| `npm run db:generate`             | create a migration after editing `src/lib/server/db/schema.ts` |
| `npm run db:studio`               | browse the database                                            |
| `npm run db:seed`                 | example content                                                |
| `npm run post`                    | publish a markdown post                                        |
| `npm run spotify:auth`            | get a Spotify refresh token                                    |
