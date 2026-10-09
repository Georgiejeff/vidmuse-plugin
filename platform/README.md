# UDOKS Animation Platform

Mobile-friendly creative workspace for cinematic photo motion, AI image-to-video workflows, storyboards, and UD🏀KA / YSL ENT content.

## What is implemented

- Responsive dashboard, project cards, creative workspace navigation, and storyboard scene planning.
- Animation brief builder for prompts, visual direction, duration, aspect ratio, camera movement, and brand text.
- Local reference-image preview: selected images are read by the browser and are not uploaded.
- **Animate Photo:** client-side Ken Burns-style camera motion (push-in, pull-back, pan, float, pulse) applied to a user-selected still image.
- **Local WebM export:** uses Canvas capture and the browser MediaRecorder API where supported. The exported clip is a moving still image, not AI-generated new frames. Output support depends on browser/device; MP4 conversion is not built in.
- AI-video prompt helper for copying a prepared prompt into a compatible external image-to-video service.
- Storyboard scene creation, motion prompt presets, character-continuity prompt helpers, and export checklists.

## What is not implemented yet

- No true AI image-to-video generation API is connected.
- No login, multi-user workspace, cloud project persistence, server-side asset upload, billing, job queue, or backend MP4 rendering.
- Project cards and planning data are prototype/demo data; the current session does not persist projects to a database.
- The local photo animator does not create new poses, lip-sync, body motion, or new AI frames. It animates camera framing around one still image.

## Run locally

Open index.html in a modern browser, or from the repository root run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/platform/.

For the local video export, use a recent browser with Canvas captureStream() and MediaRecorder support. If the export button remains unavailable, try a recent desktop Chrome or Edge. The interface is responsive, but phone browser recording support varies.

## AI image-to-video integration (next backend milestone)

Use a server-side adapter rather than calling a provider directly from browser JavaScript.

1. Create an authenticated server endpoint such as POST /api/generations that accepts a prompt, aspect ratio, duration, and a private uploaded asset ID.
2. Store provider credentials only as server environment variables (for example, VIDEO_PROVIDER_API_KEY). Never put secrets in index.html, public environment variables, source control, or a mobile app bundle.
3. Validate image type/size, prompt length, allowed duration/aspect ratio, user authorization, and provider limits before submitting a job.
4. Submit the image and prompt to a provider's image-to-video endpoint, then store its job ID and return a pending status.
5. Poll or receive a signed webhook for job completion; save the resulting video to private object storage and provide a short-lived download URL.
6. Show queue status, failures, retry controls, estimated cost/credits, and clear user consent for third-party processing.

### Provider and cost notes

- The local photo-motion mode needs no API key and uses the user's browser resources.
- True AI video generation usually requires an external provider account and API credentials. Free credits, model availability, region access, and pricing change over time; verify the chosen provider's current API terms before promising a free tier.
- A secure server/backend and hosting may incur costs even if a provider offers trial credits. Add rate limits and usage caps before making generation public.
- Do not claim a generation succeeded until the provider returns a completed job and a usable output URL.

## Recommended production stack

- Frontend: Next.js + TypeScript, responsive design, accessible controls.
- API: authenticated server routes and provider adapters.
- Database: projects, storyboards, characters, assets, generation jobs, and usage records.
- Private object storage for uploaded references and rendered outputs.
- Queue-backed generation orchestration, retry handling, webhooks, and status events.
- FFmpeg-based final assembly for audio, captions, transitions, branding, and MP4 delivery.
- Observability, abuse prevention, retention controls, and per-user spending limits.

## Suggested next milestones

1. Add a real backend and private asset upload.
2. Integrate one image-to-video provider behind a server-side adapter.
3. Persist projects and show generation job status.
4. Build a clip timeline with reorder/trim and audio placement.
5. Render assembled MP4s through a server-side render queue.
