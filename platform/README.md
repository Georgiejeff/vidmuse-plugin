# UDOKS Animation Platform — Prototype

This folder contains the first interactive browser prototype for the UDOKS animation workspace.

## Current features

- Responsive dashboard and project gallery
- Animation brief form with aspect ratio, duration, visual style, camera movement, and brand fields
- Local-only reference image preview
- Production brief builder and clipboard action
- Storyboard scene list with add-scene interaction
- Motion prompt presets
- Asset/character continuity prompt helpers
- Export checklist for social and widescreen formats

## Run locally

Open `index.html` directly in a browser, or from the repository root run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/platform/`.

## Limitations

This is a frontend prototype, not a production AI renderer. It does not authenticate users, call generation APIs, persist projects to a server, upload reference assets, or export video files. Those features need a backend, secure provider adapters, database/storage, and a render queue. Keep API keys out of client-side code.

## Production architecture recommendation

- Frontend: Next.js + TypeScript with reusable workspace components
- API: authenticated server routes for projects, assets, and generation jobs
- Database: project, storyboard, character, asset, and job records
- Object storage: private source assets and rendered deliverables
- Generation layer: provider adapters with per-provider capability and pricing checks
- Render layer: queue-backed FFmpeg/HyperFrames composition, validation, and MP4 delivery
- Observability: job events, failures, retries, usage accounting, and audit records
