/**
 * UDOKS Udok Companion API
 * Node.js 18+; keep ANTHROPIC_API_KEY in the server environment, never in browser code.
 * Mount this handler in your app or use the included minimal HTTP server below.
 */
import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://react-starter-studio.onrender.com';
const SYSTEM_PROMPT = `You are Udok, the creative companion inside the UDOKS Animation Platform for UD🏀KA / YSL ENT.
Be calm, practical, encouraging, honest, and concise. Help with cinematic animation, shot planning, image-to-video prompts, music-video storyboards, character continuity, editing workflows, creative tools, and debugging.
For animation requests, prefer a continuous sequence with clear geography, motivated camera movement, explicit actions, and consistent identity/wardrobe. Structure useful briefs with: concept, aspect ratio, duration, shot sequence, camera, lighting, continuity notes, sound, and final frame.
Know the current platform boundary: the repository's browser prototype can plan prompts/storyboards, preview local assets, animate a still image with camera motion, and export WebM where supported. It does NOT itself provide true AI video generation, cloud project persistence, user authentication, or guaranteed MP4 rendering. Never claim a video was generated or a provider is connected unless the application confirms it.
When writing prompts, preserve user-supplied character identity and wardrobe; avoid abrupt scene jumps unless requested. Ask only for essential missing information. Never invent API integrations, costs, free tiers, or project state. Do not expose secrets or ask the user to paste API keys into chat.`;

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}
function readBody(req, maxBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (Buffer.byteLength(raw) > maxBytes) {
        reject(Object.assign(new Error('Request body too large.'), { status: 413 }));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch { reject(Object.assign(new Error('Invalid JSON body.'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}
const hits = new Map();
function rateLimited(req) {
  const key = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const prior = hits.get(key) || [];
  const recent = prior.filter(t => now - t < 60_000);
  recent.push(now); hits.set(key, recent);
  return recent.length > 20;
}
const server = http.createServer(async (req, res) => {
  // Allow browser access only from the configured frontend origin.
  // CORS is not authentication; add user auth/stronger abuse controls before broad public use.
  const origin = req.headers.origin;
  if (origin && origin !== FRONTEND_ORIGIN) {
    return sendJson(res, 403, { error: 'Origin not allowed.' });
  }
  if (origin === FRONTEND_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') {
    if (origin !== FRONTEND_ORIGIN) {
      return sendJson(res, 403, { error: 'Origin not allowed.' });
    }
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET' && req.url === '/api/health') return sendJson(res, 200, { ok: true, service: 'udok-companion' });
  if (req.method !== 'POST' || req.url !== '/api/udok/chat') {
    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ error: 'Not found.' }));
  }
  if (rateLimited(req)) return sendJson(res, 429, { error: 'Too many requests. Wait a minute and try again.' });
  if (!API_KEY) return sendJson(res, 503, { error: 'Udok backend is missing the ANTHROPIC_API_KEY environment variable.' });
  try {
    const body = await readBody(req);
    if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 20) {
      return sendJson(res, 400, { error: 'messages must be an array containing 1–20 messages.' });
    }
    const messages = body.messages.map(m => {
      if (!m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string') throw Object.assign(new Error('Each message needs a valid role and text content.'), { status: 400 });
      const content = m.content.trim();
      if (!content || content.length > 12_000) throw Object.assign(new Error('Each message must contain 1–12,000 characters.'), { status: 400 });
      return { role: m.role, content };
    });
    if (messages[messages.length - 1].role !== 'user') return sendJson(res, 400, { error: 'The latest message must be from the user.' });
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1200, system: SYSTEM_PROMPT, messages })
    });
    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      // Do not return upstream headers, credentials, or raw provider error details to clients.
      console.error('Udok upstream request failed with status', upstream.status);
      return sendJson(res, upstream.status === 429 ? 429 : 502, { error: upstream.status === 429 ? 'The AI provider is busy or rate-limited. Try again shortly.' : 'The AI provider request failed. Check server configuration and provider account status.' });
    }
    const reply = (result.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n\n').trim();
    if (!reply) return sendJson(res, 502, { error: 'The AI provider returned no text.' });
    return sendJson(res, 200, { reply, model: MODEL });
  } catch (err) {
    return sendJson(res, err.status || 500, { error: err.status ? err.message : 'Unexpected server error.' });
  }
});
server.listen(PORT, '0.0.0.0', () => console.log('Udok API listening on port ' + PORT));
