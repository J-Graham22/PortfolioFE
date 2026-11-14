# Portfolio

Personal site built with SvelteKit, Svelte 5 and Tailwind 4. It keeps no data of its own: every post, project, skill, job and widget comes from the back end, [NewPortfolioWebsiteBE](../NewPortfolioWebsiteBE), which only this site's server calls. Pages:

- `/`: profile (click it to switch between real name and online persona), Spotify now playing, Hardcover currently reading, projects and latest posts
- `/blog`: all posts, with search (`?q=`), tag filtering (`?tag=`) and pages (`?page=`); `/blog/<slug>` for each post; RSS at `/blog/rss.xml`
- `/projects`: projects with photo, skills and repo (GitHub or Codeberg), demo and write-up links; filter with `?skill=`
- `/skills`: skills grouped by category, with how many projects use each and which were used at work
- `/work`: work history, current roles first

## Getting started

Start the back end first (see its README), then:

```sh
npm install
cp .env.example .env   # set API_URL to the back end, e.g. http://localhost:8080
npm run dev
```

## How it talks to the back end

`src/lib/server/api.ts` is the only place that calls the back end, from server load functions. Response types are in `src/lib/types.ts` and use the back end's field names. If the back end is down, pages show a 503, and the home page widgets are hidden instead.

The browser never calls the back end directly. Two routes pass requests through instead:

| Route                | Back end route       | Why                                                                          |
| -------------------- | -------------------- | ---------------------------------------------------------------------------- |
| `/uploads/:file`     | `/uploads/:file`     | Project `photo_url` values are relative, so they work unchanged on this site |
| `/api/now/listening` | `/api/now/listening` | The now-playing widget refreshes itself every 30 seconds                     |

So the back end's `CORS_ALLOWED_ORIGINS` can stay empty, and it can sit on a private network.

## Making it yours

- **Names, taglines, photos and footer links:** `src/lib/config/site.ts`. Profile images go in `static/profile/`.
- **Which identity a link opens with:** `https://your.site/?as=persona` or `?as=real`. Without the parameter, the visitor's last choice (a cookie) is used, then `defaultIdentity`.
- **Colors and fonts:** the `@theme` block in `src/routes/layout.css`. Headings use Pixelify Sans and body text uses Space Mono, both self-hosted through Fontsource.
- **Pixelation strength:** the `pixel` prop on `PixelImage` (block size in px).

## Managing content

All content is created through the back end's admin API (`/api/admin/*`, with `Authorization: Bearer $ADMIN_API_KEY`). Its README covers posts, projects, skills, work history, Spotify and Hardcover.

### Publishing a post

Markdown files can carry YAML frontmatter (see `content/examples/example-post.md`):

```md
---
title: My post
summary: One line for the listing
tags: [svelte, gamedev]
draft: false
---

Body…
```

The back end renders the whole uploaded file, so use the bundled script, which strips the frontmatter and sends it as form fields. It reads `API_URL` and `ADMIN_API_KEY` (the back end's key) from `.env`:

```sh
npm run post -- content/my-post.md --tags svelte,meta
npm run post -- content/my-post.md --update      # update the post whose slug is the file name (or --slug)
```

Flags override the frontmatter. The back end sets the publish date itself and has no cover images.

## Deploying (Docker)

```sh
API_URL=http://backend:8080 ORIGIN=https://your.site docker compose up -d --build
```

`API_URL` must be reachable from inside the container. The default, `http://host.docker.internal:8080`, is a back end running on the Docker host. `ORIGIN` must match your public URL. Put a reverse proxy such as Caddy or nginx in front for TLS.

Without Docker: `npm run build && npm start`. That serves `build/` on port 3000 and reads `.env`.

## Scripts

| Script                            | What it does                 |
| --------------------------------- | ---------------------------- |
| `npm run dev`                     | dev server                   |
| `npm run check` / `lint` / `test` | type check, lint, unit tests |
| `npm run post`                    | publish a markdown post      |
