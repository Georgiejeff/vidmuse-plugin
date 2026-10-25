# QwenCloud AI Skills for VidMuse

This project includes an installer for the official QwenCloud Agent Skills collection.

## Install

From the repository root, run:

```bash
bash ./install-qwencloud-skills.sh
```

Equivalent direct command:

```bash
npx -y skills add qwencloud/qwencloud-ai -y
```

Requirements: Node.js 18 or newer and a compatible Agent Skills-aware coding agent.

The current upstream collection installs 10 skills: text, vision, image generation, video generation, audio/TTS, model selection, authentication, payment, usage, and update checks. The exact list can change upstream.

## Important

- Installing the skill files does not automatically configure an API key or enable paid model access.
- QwenCloud API calls may incur charges. Review model pricing and quotas before generating media.
- Treat skills as executable agent instructions. Review their contents before using them and never expose API keys in logs, prompts, or source control.
- Upstream instructions: https://www.qwencloud.com/skills
