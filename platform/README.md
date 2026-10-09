# UDOKS Animation Platform

Mobile-friendly creative workspace for UD🏀KA / YSL ENT music-video pre-production, text-to-video planning, cinematic photo motion, and storyboards.

## What is implemented

- Responsive dashboard, project gallery, workspace navigation, and storyboard scene planning.
- Animation brief builder and **Text to Video** prompt builder with visual style, camera movement, duration, aspect ratio, branding, live preview, copy action, and JSON brief export.
- **Music Video Studio:** track/artist/label fields, song file selection and local audio preview, duration read from audio metadata when supported, optional BPM field, format/style/concept/identity notes, a seven-part starter shot list, editable shot descriptions and camera moves, estimated scene time ranges, per-shot prompt copying, production JSON export, and prompt TXT export.
- Audio is processed locally by the browser for preview/metadata; the prototype does not upload the track.
- **Animate Photo:** client-side Ken Burns-style camera motion (push-in, pull-back, pan, float, pulse) applied to a selected still image.
- **Local WebM export:** uses Canvas capture and browser MediaRecorder where supported. The clip animates a still image; it does not generate new AI frames. Browser/device support varies; MP4 conversion is not built in.
- Motion prompt presets, character-continuity prompt helpers, and export checklists.
- **UDOKS Cut Studio (`editor.html`):** import local video clips and a song, reorder shots, set per-clip start/end trims, preview the assembled sequence, add artist/title/label overlays, and record a composed WebM via Canvas + MediaRecorder where supported. The editor runs client-side; selected assets are not uploaded.

## What is not implemented yet

- No AI video generation provider is connected. Text-to-video and music-video scene tools prepare prompts/briefs only; they do not submit jobs to an AI model.
- No automatic beat detection or lyric alignment. Music-video shot timings are estimated from total song duration, not analyzed against the waveform or BPM.
- **Cut Studio** assembles imported clips in order with hard cuts, a single song track, and simple title/credit overlays, and can export WebM where supported. It does not yet offer beat/lyric sync, transitions, multi-track audio, captions, MP4 export, or cloud project persistence.
- No login, cloud project persistence, server-side asset upload, billing, job queue, or database. Projects and planning data are prototype/demo data.
- The photo animator only moves camera framing around one still image; it does not create new poses, lip-sync, body motion, or new AI frames.
- A professional non-linear editor with waveform display, draggable timeline, transitions, effects, multi-track audio, and server-side MP4 rendering remains a future milestone.

## Run locally

Open index.html in a modern browser, or from the repository root run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/platform/.

For editor WebM export, use a browser with Canvas captureStream(), MediaRecorder, and Web Audio support. The export is real-time and can be resource-intensive on phones; if a long/high-resolution export fails, try 540p, a shorter sequence, or a recent desktop Chrome/Edge.

## Connect a real AI video provider

The current UI does not generate AI video. To enable genuine text-to-video and music-video scene generation:

1. Build an authenticated backend endpoint such as POST /api/generations.
2. Validate authorization, prompt length, aspect ratio, duration, file permissions, rate limits, and spending caps.
3. Store the chosen provider API key only in a private server environment variable (for example VIDEO_PROVIDER_API_KEY). Never put a secret in index.html, browser JavaScript, public environment variables, Git commits, or a mobile app bundle.
4. Send the prompt and supported settings to the selected provider API from the backend. Return a job ID and pending status, not a fake completed result.
5. Poll or receive a verified webhook for completion, store the video in private object storage, and provide a short-lived download URL.
6. Show real job status, errors, retries, provider credits/costs, and per-user usage limits.

### API keys and cost

- Music-video planning, prompt copying, local audio preview, JSON/TXT export, and local still-image motion do not need an API key.
- True AI video generation usually requires a provider account and API credentials. Free credits, free tiers, model access, regional availability, and pricing change; verify current provider API terms before promising a free option.
- Backend hosting, storage, queue workers, and final rendering can cost money even if generation credits are free. Add rate limits and spending caps before public launch.
- Keep songs, reference photos, and generated outputs private unless the user explicitly chooses to share them. Do not upload the user's track without clear consent.

## Recommended production architecture

- Frontend: Next.js + TypeScript, responsive and accessible controls.
- Backend: authenticated server routes and a provider adapter layer.
- Database: projects, tracks, lyrics/sections, storyboards, characters, assets, generation jobs, and usage records.
- Private object storage for source audio, reference images, and rendered clips.
- Queue-backed generation orchestration, retries, verified webhooks, and job status events.
- Timeline editor with clip reorder/trim, audio tracks, lyrics/captions, transitions, title cards, and branding.
- FFmpeg-based final assembly for audio sync, captions, transitions, UD🏀KA / YSL ENT branding, and MP4 output.
- Optional beat/section analysis to align cuts to song structure; do not imply this is present until implemented and tested.
- Usage accounting, observability, abuse prevention, retention controls, and per-user spending limits.

## Suggested next milestones

1. Connect a real text-to-video provider behind a secure backend adapter.
2. Generate scene clips from the Music Video Studio shot prompts and show genuine job status.
3. Add private asset storage and project persistence.
4. Build a real timeline with reorder, trim, and audio tracks.
5. Render and download a finished MP4 with the user's licensed audio and UD🏀KA / YSL ENT branding.
