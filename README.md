# Pagsibol Village - Northeastern Naic (PVNE)

A mobile-first Next.js App Router + TypeScript starter for Pagsibol Village - Northeastern Naic (PVNE). Includes a homepage, house/lot directory, linked business listings, topic-based community preview, announcements, and a village map page using the supplied site plan.

## Stack
- Next.js App Router + React + TypeScript
- Custom responsive CSS (no localStorage or sessionStorage)
- Vercel Blob for server-side JSON persistence and uploaded images
- GitHub + Vercel deployment

## Important starter limitations
This is a functional UI starter, not a production-ready public community network yet.
- Current pages use sample records in `lib/data.ts` for display. The `/api/village-data` route reads/writes the persistent JSON document in Vercel Blob, but the sample UI has not yet been connected to all CRUD operations.
- Updating the complete JSON document is protected by `VILLAGE_ADMIN_KEY`. Never expose this key in client-side code.
- Blob is object storage, not a relational database. A single JSON document is useful for a low-volume prototype but can suffer from write conflicts and is not a safe long-term datastore for many residents simultaneously posting messages. Before public launch, use a database for households, businesses, users, permissions, chat messages, comments, and moderation; keep Vercel Blob for images and uploaded files. This starter intentionally does not add Supabase.
- Resident login, verification, roles, realtime chat, real vote recording, contact messaging, report workflow, and admin screens still need to be implemented before public launch.
- The map page uses a high-resolution 5961 × 4210 raster rendered directly from the supplied original PDF page, preserving the original map artwork and its house/lot layout. The map viewer supports zooming, panning, and temporary point marking for reference. Exact clickable lot boundaries are not digitized or individually clickable yet; directory search results are shown alongside the plan, not positioned on the image. Do not claim exact lot hit areas until each lot polygon has been traced and validated against the original plan.
- Sample household/business names, events, and posts are illustrative. Replace them with verified information before publishing.
- Do not publish private household contact information or family details without consent.

## Run locally
Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

No browser storage is used for persistence. Local development shows seeded sample data. Persistent data updates require the Blob token and admin key.

## Configure Vercel Blob
1. Import this repository into Vercel.
2. In the Vercel project, open **Storage** and create/connect a Blob store.
3. Add the generated `BLOB_READ_WRITE_TOKEN` to the project's Environment Variables.
4. Generate a long random `VILLAGE_ADMIN_KEY` and add it as an Environment Variable. Do not use a `NEXT_PUBLIC_` prefix.
5. Redeploy after adding environment variables.

## API
- `GET /api/village-data` — reads the JSON document from Blob if present, otherwise returns seeded sample data.
- `PUT /api/village-data` — saves `{ "households": [], "businesses": [], "posts": [] }` to Blob. Requires header `x-village-admin-key: <VILLAGE_ADMIN_KEY>`.
- `POST /api/upload` — uploads an image (JPEG, PNG, WebP, AVIF, max 8 MB) to Blob. Requires the same admin header.

Do not make the admin key available in client JavaScript. For production, replace the shared admin key with proper authentication and per-record authorization, rate limits, validation, audit logging, and moderation.

## Suggested next build phase
1. Add secure resident sign-in and verification.
2. Connect all directory pages to `/api/village-data` or a proper database-backed API.
3. Build resident-owned household and business CRUD pages.
4. Digitize the supplied site plan into SVG polygons or map coordinates, with a unique block/lot ID for each parcel.
5. Add secure community posting, topic rooms, realtime chat, comments, notifications, and moderation.
6. Add an admin dashboard and backups/export process.

## Community Hub discussions
- `/community` now includes topic filtering, search, sort modes, a discussion composer, post detail threads, comments, nested replies, helpful counts, and links to each topic's chat room.
- `GET /api/community` returns discussion records. `POST /api/community` supports `create`, `comment`, `reply`, and `like` actions.
- When `BLOB_READ_WRITE_TOKEN` is configured, discussion updates are written to `village-data/community-discussions.json` in Vercel Blob and can be loaded across visits. Without the token, the UI uses sample data and write actions return a storage configuration error; it does not pretend the data was saved.
- `/community/chat?topic=...` is currently a UI preview only. Its messages are temporary in the current browser session and are not shared or persisted. A real shared chat room requires authenticated residents and a database/realtime service. The current Blob JSON discussion store is suitable only for a low-volume prototype and can lose updates if several residents write concurrently. Add database-backed transactions, authentication, moderation, rate limiting, and resident verification before public launch.
