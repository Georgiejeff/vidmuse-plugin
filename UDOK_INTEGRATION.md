# Udok companion integration

This change adds the uploaded Udok Creative Companion concept to the UDOKS Animation Platform as a separate page plus a small Node.js API proxy. The current platform is a static browser prototype, so the integration is deliberately additive and does not replace the existing animation/editor screens.

## Files

- `platform/udok.html` — mobile-responsive chat page, UD🏀KA / YSL ENT creative starters, local-only browser history, and a same-origin request to `POST /api/udok/chat`. For a separately hosted frontend, update its fetch URL to the backend's public `/api/udok/chat` URL.
- `server/udok-api.mjs` — Node.js 18+ API proxy to Anthropic. The provider key stays on the server; it is never sent to the browser.
- `platform/index.html` — receives a sidebar link to open Udok.

## Run the API locally

1. Install Node.js 18 or newer on a development computer/server.
2. Set the key in the server environment. Do not commit it or paste it into HTML:
   - macOS/Linux: `export ANTHROPIC_API_KEY='your-key'`
   - PowerShell: `$env:ANTHROPIC_API_KEY='your-key'`
3. Start the API: `node server/udok-api.mjs`. It listens on port 8787 by default.
4. The companion page expects `/api/udok/chat` on the same origin as the page. For local use, configure your development server/reverse proxy to route `/api/udok/*` to the API process. The API-only server is not a static-file server.
5. Set `ANTHROPIC_MODEL` if your account uses a different supported model identifier.

Health check: `GET http://localhost:8787/api/health`.

## Deployment requirements

- Render Web Service settings: Root Directory blank; Build Command `echo "No build required"`; Start Command `node server/udok-api.mjs`; Health Check Path `/api/health`.
- Add `ANTHROPIC_API_KEY` as a private Render environment variable. Set `FRONTEND_ORIGIN=https://react-starter-studio.onrender.com` (or the exact origin of your deployed frontend). Never place the provider key in browser code.
- The API binds to `0.0.0.0` and uses Render's assigned `PORT` environment variable.
- The API permits browser requests only from `FRONTEND_ORIGIN` using CORS. This is not authentication; clients outside a browser can still call the public endpoint.
- If the frontend and API are hosted on separate Render services, change the frontend request URL from `/api/udok/chat` to `https://YOUR-BACKEND-SERVICE.onrender.com/api/udok/chat`, using the actual backend URL.
- Serve `platform/udok.html` and route `/api/udok/chat` to the Node process or adapt the handler to the hosting provider's serverless-function format.
- Use HTTPS, authentication/authorization, production rate limiting, request timeouts, monitoring, and appropriate user/session limits before exposing it publicly. The included in-memory rate limiter is only a starter guard and resets when the process restarts; it is not a substitute for production controls.
- The API currently proxies text chat only. It does not generate images or video, run Blender, or submit animation jobs to a video provider.
- Anthropic usage may incur charges. Confirm current model availability and pricing in your provider account before use.
- No secrets are required for the local-only animation and storyboard features already in UDOKS. Udok chat requires a configured provider key.

## Integration boundary

Udok can help prepare shot lists, prompts, character-continuity notes, and troubleshooting steps for the existing studio. It does not automatically modify the storyboard or start paid video generation. That next stage should use authenticated project APIs and an explicit user confirmation step before any paid generation request.
