# UDOKS Animation Platform

**A creator workspace for cinematic animation, AI music videos, character motion, motion graphics, storyboards, and social-first video production.**

UDOKS is being shaped around the visual world of **UD🏀KA / YSL ENT**. This repository combines an interactive frontend prototype with the existing agent workflows for planning, assembling, reviewing, and rendering video projects.

## Platform preview

Open `platform/index.html` in a browser to explore the responsive workspace prototype. It includes:

- Dashboard with project cards and creative activity
- Animation brief builder with prompt, style, camera move, duration, aspect ratio, brand text, and local image preview
- **Animate Photo:** animate a supplied still image with camera moves and export a short browser-rendered WebM where supported
- AI video prompt helper for pasting into a separately chosen image-to-video provider
- Storyboard scene list with add-scene interaction
- Motion Studio preset prompts for camera, effects, character movement, lighting, titles, and music
- Asset and character continuity workspace
- Export checklist for TikTok/Reels, square, portrait, and widescreen deliverables

The current frontend is a **working browser prototype**. The Animate Photo tool can render camera movement over a still image and export WebM locally on supported browsers. This is not true AI image-to-video: it does not create new frames or character actions. The platform does not yet call an AI generation provider, upload assets to a server, authenticate accounts, persist cloud projects, or render MP4s. Those capabilities require a backend, provider integrations, secure credentials, and a render pipeline. See [platform development notes](platform/README.md) for the implementation boundary and next steps.

## Product direction

### Create
Turn a natural-language idea, script, song, or reference image into a structured production brief. Keep identity and wardrobe continuity explicit when animating supplied characters.

### Storyboard
Break each deliverable into timed shots with a clear opening, action or transformation beat, and closing frame. Plan camera movement, lighting, transitions, sound cues, and titles.

### Motion Studio
Organize reusable treatments for:
- Cinematic push-ins, orbits, tracking shots, crane reveals, and whip pans
- Lightning, particles, smoke, rain, atmosphere, and energy effects
- Character transformations and identity-preserving movement
- Kinetic typography, title cards, logo reveals, and end frames
- Music-led timing, transitions, and beat accents

### Export
Plan delivery for:
- **9:16** TikTok, Instagram Reels, and YouTube Shorts
- **1:1** square social media
- **4:5** portrait feeds
- **16:9** YouTube and widescreen film

## Repository layout

```text
.
├── platform/
│   ├── index.html       # Responsive interactive frontend prototype
│   └── README.md       # Platform development notes and next steps
├── .agents/plugins/    # Codex marketplace manifest
├── .claude-plugin/     # Claude marketplace manifest
└── plugins/
    └── vidmuse-packaging/
        ├── .codex-plugin/
        ├── .cursor-plugin/
        ├── .claude-plugin/
        └── skills/     # Existing video-production agent workflows
```

The existing `vidmuse-packaging` directory is intentionally retained for now because host manifests and skill references depend on that path. The installed marketplace/plugin identities have been updated to `udoks-plugin` and `udoks-packaging`; changing directory paths safely is a separate migration.

## Run the prototype

No build step is required for the current static prototype:

1. Open `platform/index.html` in a modern browser.
2. Select **Create** to draft an animation brief.
3. Add a prompt and choose a visual direction, aspect ratio, duration, and camera move.
4. Optionally add a reference image; it is previewed locally in the browser.
5. Build the brief, open the storyboard, and add scene cards.

For local development, a static server can be used, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/platform/`.

## Agent plugin installation

The agent plugin is a separate component from the web prototype. It supplies production skills; it is not a generation service by itself and does not include credentials.

### Codex CLI

```bash
codex plugin marketplace add Georgiejeff/vidmuse-plugin --ref main
codex plugin add udoks-packaging@udoks-plugin
codex plugin list --json
```

If the marketplace is already configured, refresh it:

```bash
codex plugin marketplace upgrade udoks-plugin
```

### Claude Code

```bash
claude plugin marketplace add Georgiejeff/vidmuse-plugin --name udoks-plugin
claude plugin add udoks-packaging@udoks-plugin
```

### Cursor

Use the Cursor Plugins panel and add this repository URL, then select **UDOKS Animation Platform** if it appears in the marketplace listing. Host support and marketplace behavior depend on your installed Cursor version.

After installing, start a new task/session so the host loads the plugin's skills.

## Recommended next engineering stages

1. **App foundation:** migrate the static prototype to a typed React/Next.js app with responsive components and project state.
2. **Authentication and persistence:** user accounts, private projects, asset metadata, and database-backed storyboards.
3. **Generation adapters:** integrate selected image/video providers behind server-side APIs; never expose provider keys in browser code.
4. **Media pipeline:** upload handling, job queue, progress status, retries, storage, FFmpeg validation, and MP4 export.
5. **Timeline editor:** draggable clips, scene duration, audio tracks, captions, transitions, and preview.
6. **Brand and character continuity:** reusable character bibles, reference sets, approved UD🏀KA / YSL ENT branding, and shot-to-shot consistency checks.
7. **Safety and cost controls:** provider-specific estimates, balance checks where available, explicit authorization before paid generation, and visible job status.

## Security and production notes

- The prototype does not send selected images to a server.
- Do not add API keys, session tokens, or production credentials to frontend files or Git.
- Add authentication, authorization, file validation, rate limits, and private storage before accepting user uploads.
- Paid generation must show a current estimate and request confirmation before execution.
- Clearly distinguish generated media, planning artifacts, and mock/demo content.

## License

The original plugin assets and components remain subject to their existing license files and notices. Review third-party notices before redistributing or deploying them.
