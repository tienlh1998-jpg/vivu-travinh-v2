# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install dependencies: `npm install`
- Run local dev server: `npm run dev`
- Alternative local server: `python -m http.server 8000` or `npx http-server -p 8000`
- Open app locally: `http://localhost:8000`

There are currently no configured build, lint, or automated test scripts in `package.json`. Validation is primarily manual in the browser.

## Manual validation checklist

- Run via HTTP/HTTPS, not `file://`, because ES modules, PWA behavior, and service worker registration depend on browser security rules.
- For the main app, verify search/filtering, place detail modal, image loading, maps, share buttons, dark mode, and comment submission.
- For PWA changes, use Chrome DevTools > Application to inspect Manifest and Service Worker; test offline mode through DevTools > Network > Offline.
- For admin comment changes, open `admin.html` through the dev server and provide the Vercel `ADMIN_SECRET` configured for the deployment.

## Architecture overview

This is a vanilla HTML/CSS/JavaScript static web app for discovering places in Trà Vinh. It uses CDN-loaded UI libraries from `index.html` rather than a bundler or framework: Tailwind CSS, Swiper, AOS, Leaflet, FontAwesome, PapaParse, and Google Fonts.

`index.html` contains the main UI and most client-side interaction code. It imports ES modules from `js/data.js` and `js/comments.js`, exposes them on `window.ViVuData` and `window.ViVuComments`, then renders places, details, comments, maps, sharing, install prompts, and service worker registration.

`js/config.js` centralizes runtime configuration. `initConfig()` merges explicit overrides, `window.VIVUTRAVINH_CONFIG`, and module defaults for Google Sheets and Supabase. The README notes that real Google API keys should be injected at runtime instead of committed.

`js/data.js` owns place loading and normalization. It fetches approved rows from Google Sheets API v4, maps flexible Vietnamese/English column names into the normalized place shape used by the UI, converts Google Drive image links, caches results in `localStorage` for 5 minutes, and falls back to `data/data-fallback.json` when the sheet/API is unavailable.

`js/comments.js` owns public comments and ratings. It calls Supabase REST on table `place_comments` using the anon key, validates comment input client-side, applies a per-place `localStorage` cooldown, loads non-hidden comments, and summarizes average rating/count.

`api/admin-comments.js` is a Vercel serverless function for comment moderation. It requires `ADMIN_SECRET` via the `x-admin-secret` header, uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and supports listing, hiding/unhiding, and deleting rows in `place_comments`.

`admin.html` is the lightweight moderation UI. It stores the admin secret in `sessionStorage`, calls `/api/admin-comments`, and lets admins filter hidden/visible comments, toggle `is_hidden`, or delete comments.

`service-worker.js` implements the PWA offline cache. It precaches the app shell, module files, fallback data, and local images; serves cached responses first; caches same-origin static assets; returns an inline SVG for unavailable images; and falls back to cached `index.html` for offline navigation.

`manifest.json`, `robots.txt`, `sitemap.xml`, SEO metadata in `index.html`, and the static images support PWA installability and search/social sharing.

`vercel.json` currently routes all paths to `/index.html` using `@vercel/static`. If changing serverless API behavior, verify that `/api/admin-comments` is still reachable in the target deployment environment.

## Data and environment notes

- Google Sheets rows must have a status equivalent to `Duyệt`, `Duyet`, or `approved` to display.
- The fallback JSON is expected to be an array of place-like records and is passed through the same normalization and approval filters as Google Sheets data.
- Supabase public comments rely on anon-key permissions/RLS; admin moderation relies on the service-role key only in the serverless environment.
- When changing cached assets, update `CACHE_NAME` in `service-worker.js` so clients receive the new app shell.
