# UD🏀KA full-stack backend setup

This adds a separate Node API for authenticated project persistence, storyboard JSON, generation-job tracking, and admin overview. It uses Supabase Auth + Postgres and keeps the service-role key on the server.

## Render backend service
- Runtime: Node
- Root directory: repository root
- Build command: `echo "No build required"`
- Start command: `node server/udok-data-api.mjs`
- Health check path: `/api/health`
- Environment variables:
  - `SUPABASE_URL`: Supabase project URL
  - `SUPABASE_ANON_KEY`: public/anon key (server-side use for validating Auth sessions)
  - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key (secret; never add to frontend)
  - `FRONTEND_ORIGIN`: exact frontend origin; comma-separated origins may be supplied if needed

Run `server/supabase-schema.sql` in the Supabase SQL Editor before using the API. Enable email/password sign-in (or another supported provider) in Supabase Auth. To grant admin access, set `profiles.is_admin = true` for the trusted owner's auth UUID using the SQL Editor.

## Routes
- `GET /api/health` — service health/configuration flag
- `GET /api/me` — current signed-in profile
- `GET /api/projects` — current user's projects
- `POST /api/projects` — create project (`title`, optional `description`, `aspect_ratio`, `storyboard`)
- `PATCH /api/projects/:uuid` — update an owned project
- `DELETE /api/projects/:uuid` — delete an owned project
- `GET /api/jobs` — current user's generation-job history
- `POST /api/jobs` — record a generation job (`kind`, `prompt`, optional `project_id`, `provider`)
- `GET /api/admin/overview` — admin-only user/project/job overview

Send `Authorization: Bearer <Supabase access token>` for authenticated routes. The browser should use the Supabase **anon** key for sign-in; never expose the service-role key.

## Important boundaries
- This API persists projects and tracks jobs; it does **not** itself generate AI video. Jobs remain queued until a real worker/provider is connected.
- The current Udok companion API remains a separate service. If running both APIs on Render, use separate services/URLs or combine the handlers before deploying.
- `react-starter-studio.onrender.com` has not been modified by this repository change; its source repository and Render service configuration must be connected separately to wire these routes into its frontend.
- CORS is not authentication. Production rollout should add stronger rate limiting, monitoring, and an asynchronous worker before public AI generation.
