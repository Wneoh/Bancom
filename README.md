# Bancom

A simple electronics ecommerce website built with Node.js, Express, EJS and MongoDB.

## Local development

Requires Node.js 24.x and Docker Desktop (running with Linux containers).

```sh
npm install
docker compose up -d
npm run dev
```

Open http://localhost:3000. Use `npm start` to run without automatic reload.
The local database starts empty; existing cloud products and users are not copied.
MongoDB data persists in the Docker volume `bancom_mongo`.

Optionally copy `.env.example` to `.env` and configure `MONGODB_URI`, `PORT`,
and a random `SESSION_SECRET`. For production, also set `NODE_ENV=production`.
Without `SESSION_SECRET`, a temporary secret is generated on each restart.

Stop MongoDB with `docker compose stop`. Stop the application with Ctrl+C.

## Demo catalogue

Run `npm run seed` to add 12 fictional electronics products with original SVG illustrations, sample specifications and prices in RM. The script uses the configured `MONGODB_URI`. Stable IDs prevent duplicates, and reruns preserve existing products and admin edits. Demo items are marked in the catalogue and on product pages.

Product editing supports 1–6 images (JPG/PNG, up to 2 MB each). Add uploads, remove images, undo removal or choose a cover image; use Preview gallery before saving. Saved images also appear as selectable thumbnails on the product page.
