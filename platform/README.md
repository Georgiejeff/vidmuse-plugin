# UDOKS Animation Platform

Mobile-friendly creative workspace for text-to-video planning, cinematic photo motion, storyboards, and UD🏀KA / YSL ENT content.

## What is implemented

- Responsive dashboard, project gallery, workspace navigation, and storyboard scene planning.
- Animation brief builder for prompts, visual direction, duration, aspect ratio, camera movement, and brand text.
- **Text to Video:** prompt builder with optional negative prompt, visual style, camera move, duration, aspect ratio, branding, live brief preview, copy-to-clipboard, and JSON brief export.
- **Animate Photo:** client-side Ken Burns-style camera motion (push-in, pull-back, pan, float, pulse) applied to a user-selected still image.
- **Local WebM export:** uses Canvas capture and browser MediaRecorder where supported. The clip animates a still image; it does not generate new AI frames. Browser/device support varies; MP4 conversion is not built in.
- Local reference-image preview; the selected photo is not uploaded by the static prototype.
- Motion prompt presets, character-continuity prompt helpers, and export checklists.

## What is not implemented yet

- No real text-to-video or image-to-video generation provider is connected. The Text to Video page creates a local brief; the status intentionally says the provider is not connected.
- No login, cloud project persistence, server-side asset upload, billing, job queue, or backend MP4 rendering.
- Project cards and planning data are prototype/demo data and do not persist to a database.
- The photo animator moves camera framing around one still image. It does not create new poses, lip-sync, body motion, or new AI frames.
- A full non-linear timeline editor with trimming, audio synchronization, transitions, and final compositing remains a future milestone.

## Run locally

Open index.html in a modern browser, or from the repository root run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/platform/.

For local WebM export, use a browser with Canvas captureStream() and MediaRecorder support. Browser recording support varies on phones; a recent desktop Chrome or Edge is a fallback if the export is unavailable.

## Enable real text-to-video generation

The current Text to Video page prepares a prompt and exports its settings as JSON. It does **not** send a request to an AI model or generate a video.

Recommended secure integration sequence:

1. Build an authenticated backend endpoint such as POST /api/generations.
2. Validate user authorization, prompt length, requested duration/aspect ratio, file permissions, rate limits, and budget limits.
3. Store the selected provider's API key only in a private server environment variable (for example VIDEO_PROVIDER_API_KEY). Never put a secret in index.html, browser JavaScript, public environment variables, Git commits, or a mobile app bundle.
4. Submit the prompt and generation settings from the backend to a selected provider API. Return a job ID and a pending status, not a fake completed result.
5. Poll or receive a verified webhook for completion, save the result to private object storage, and provide a short-lived download URL.
6. Show job status, errors, retries, expected cost/credits, and usage caps in the UI.

### API keys and cost

- Prompt building, JSON export, and local still-image motion do not need an API key.
- True AI text-to-video usually requires a provider account and credentials. Free credits, free-tier availability, model access, and pricing can change; verify current provider API terms before promising a free option.
- Hosting, backend execution, storage, and video rendering may cost money even if generation credits are free. Add a per-user budget cap and rate limiting before public launch.
- Provider credentials belong on the server. Do not expose them in frontend source or commit them to GitHub.

## Recommended production architecture

- Frontend: Next.js + TypeScript, responsive and accessible controls.
- Backend: authenticated server routes and a provider adapter layer.
- Database: projects, storyboards, characters, assets, generation jobs, and usage records.
- Private object storage for reference images and rendered video.
- Queue-backed generation orchestration, retries, verified webhooks, and job status events.
- FFmpeg-based final assembly for clip trimming, audio, captions, transitions, UD🏀KA / YSL ENT branding, and MP4 output.
- Usage accounting, observability, abuse prevention, retention controls, and per-user spending limits.

## Suggested next milestones

1. Connect a real text-to-video provider behind a secure backend adapter.
2. Add generation job status and private output storage.
3. Persist projects and storyboards.
4. Build the timeline editor with reorder, trim, and audio tracks.
5. Render assembled MP4s through a queue-backed render service.
