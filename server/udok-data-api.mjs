/**
 * UD🏀KA / YSL ENT full-stack data API
 * Node 18+. Deploy as a separate Render Web Service.
 * Required env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, FRONTEND_ORIGIN.
 * Supabase service-role credentials are server-only and must never be sent to a browser.
 */
import http from 'node:http';

const PORT = Number(process.env.PORT || 8788);
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://react-starter-studio.onrender.com';
const MAX_BODY = 1_000_000;
const allowedOrigins = new Set(FRONTEND_ORIGIN.split(',').map(s => s.trim()).filter(Boolean));

function json(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(JSON.stringify(payload));
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '', size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error('Request body too large.'), { status: 413 })); req.destroy(); return; }
      raw += chunk.toString('utf8');
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch { reject(Object.assign(new Error('Invalid JSON.'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}
function configReady() { return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY); }
function bearer(req) {
  const value = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(value);
  return match?.[1] || '';
}
async function supabase(path, { method = 'GET', key = SUPABASE_SERVICE_ROLE_KEY, token, body, prefer } = {}) {
  const headers = { apikey: key, Authorization: 'Bearer ' + (token || key), Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(SUPABASE_URL + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = { message: 'Invalid response from data service.' }; }
  if (!response.ok) {
    const err = new Error(response.status === 404 ? 'Resource not found.' : 'Data service request failed.');
    err.status = response.status === 401 || response.status === 403 ? 401 : response.status >= 500 ? 502 : response.status;
    throw err;
  }
  return data;
}
async function authenticate(req) {
  const token = bearer(req);
  if (!token) throw Object.assign(new Error('Sign in to continue.'), { status: 401 });
  const user = await supabase('/auth/v1/user', { key: SUPABASE_ANON_KEY, token });
  if (!user?.id) throw Object.assign(new Error('Your session is invalid or expired. Sign in again.'), { status: 401 });
  return { id: user.id, email: user.email || null, token };
}
function cleanProject(input, partial = false) {
  const out = {};
  if (!partial || Object.hasOwn(input, 'title')) {
    if (typeof input.title !== 'string' || !input.title.trim() || input.title.trim().length > 120) throw Object.assign(new Error('title is required and must be 1–120 characters.'), { status: 400 });
    out.title = input.title.trim();
  }
  for (const field of ['description', 'aspect_ratio', 'status', 'storyboard']) {
    if (!Object.hasOwn(input, field)) continue;
    if (field === 'description' && (typeof input[field] !== 'string' || input[field].length > 5000)) throw Object.assign(new Error('description must be text up to 5,000 characters.'), { status: 400 });
    if (field === 'aspect_ratio' && !['9:16', '16:9', '1:1', '4:5'].includes(input[field])) throw Object.assign(new Error('Unsupported aspect ratio.'), { status: 400 });
    if (field === 'status' && !['draft', 'ready', 'archived'].includes(input[field])) throw Object.assign(new Error('Unsupported project status.'), { status: 400 });
    if (field === 'storyboard' && (!Array.isArray(input[field]) || input[field].length > 100)) throw Object.assign(new Error('storyboard must be an array of up to 100 shots.'), { status: 400 });
    out[field] = input[field];
  }
  return out;
}
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin)) return json(res, 403, { error: 'Origin not allowed.' });
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  }
  if (req.method === 'OPTIONS') { res.writeHead(origin && allowedOrigins.has(origin) ? 204 : 403); return res.end(); }
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true, service: 'udoka-data-api', configured: configReady() });
  if (!configReady()) return json(res, 503, { error: 'Backend is not configured. Set the required Supabase environment variables.' });
  try {
    if (url.pathname === '/api/me' && req.method === 'GET') {
      const user = await authenticate(req);
      const profiles = await supabase('/rest/v1/profiles?select=display_name,is_admin&id=eq.' + encodeURIComponent(user.id));
      return json(res, 200, { user: { id: user.id, email: user.email, display_name: profiles?.[0]?.display_name || null }, is_admin: Boolean(profiles?.[0]?.is_admin) });
    }
    if (url.pathname === '/api/projects' && req.method === 'GET') {
      const user = await authenticate(req);
      const projects = await supabase('/rest/v1/projects?select=id,title,description,aspect_ratio,status,storyboard,created_at,updated_at&owner_id=eq.' + encodeURIComponent(user.id) + '&order=updated_at.desc&limit=100');
      return json(res, 200, { projects: projects || [] });
    }
    if (url.pathname === '/api/projects' && req.method === 'POST') {
      const user = await authenticate(req), body = await readJson(req);
      const project = cleanProject(body);
      const rows = await supabase('/rest/v1/projects?select=id,title,description,aspect_ratio,status,storyboard,created_at,updated_at', { method: 'POST', body: { ...project, owner_id: user.id }, prefer: 'return=representation' });
      return json(res, 201, { project: rows[0] });
    }
    const projectMatch = /^\/api\/projects\/([0-9a-f-]{36})$/.exec(url.pathname);
    if (projectMatch && ['PATCH', 'DELETE'].includes(req.method)) {
      const user = await authenticate(req), id = projectMatch[1];
      const owned = '/rest/v1/projects?id=eq.' + encodeURIComponent(id) + '&owner_id=eq.' + encodeURIComponent(user.id);
      if (req.method === 'DELETE') {
        await supabase(owned, { method: 'DELETE', prefer: 'return=minimal' });
        return json(res, 200, { ok: true });
      }
      const body = await readJson(req), patch = cleanProject(body, true);
      if (!Object.keys(patch).length) return json(res, 400, { error: 'No supported fields supplied.' });
      const rows = await supabase(owned + '&select=id,title,description,aspect_ratio,status,storyboard,created_at,updated_at', { method: 'PATCH', body: patch, prefer: 'return=representation' });
      if (!rows?.length) return json(res, 404, { error: 'Project not found.' });
      return json(res, 200, { project: rows[0] });
    }
    if (url.pathname === '/api/jobs' && req.method === 'GET') {
      const user = await authenticate(req);
      const jobs = await supabase('/rest/v1/generation_jobs?select=id,project_id,kind,status,prompt,provider,output_url,error_message,created_at,updated_at&owner_id=eq.' + encodeURIComponent(user.id) + '&order=created_at.desc&limit=100');
      return json(res, 200, { jobs: jobs || [] });
    }
    if (url.pathname === '/api/jobs' && req.method === 'POST') {
      const user = await authenticate(req), body = await readJson(req);
      if (!['text-to-video', 'image-to-video', 'image-generation', 'preview-export'].includes(body.kind)) return json(res, 400, { error: 'Unsupported generation job kind.' });
      if (typeof body.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 12000) return json(res, 400, { error: 'prompt is required and must be up to 12,000 characters.' });
      const row = { owner_id: user.id, project_id: body.project_id || null, kind: body.kind, prompt: body.prompt.trim(), provider: body.provider || 'unconfigured', status: 'queued' };
      const jobs = await supabase('/rest/v1/generation_jobs?select=id,project_id,kind,status,prompt,provider,created_at,updated_at', { method: 'POST', body: row, prefer: 'return=representation' });
      return json(res, 201, { job: jobs[0], note: 'Job recorded. A compatible generation worker/provider must be configured to process it.' });
    }
    if (url.pathname === '/api/admin/overview' && req.method === 'GET') {
      const user = await authenticate(req);
      const profiles = await supabase('/rest/v1/profiles?select=is_admin&id=eq.' + encodeURIComponent(user.id));
      if (!profiles?.[0]?.is_admin) return json(res, 403, { error: 'Admin access required.' });
      const [users, projects, jobs] = await Promise.all([
        supabase('/rest/v1/profiles?select=id,display_name,is_admin,created_at&order=created_at.desc&limit=100'),
        supabase('/rest/v1/projects?select=id,title,owner_id,status,created_at&order=created_at.desc&limit=100'),
        supabase('/rest/v1/generation_jobs?select=id,owner_id,kind,status,provider,error_message,created_at&order=created_at.desc&limit=100')
      ]);
      return json(res, 200, { users, projects, jobs });
    }
    return json(res, 404, { error: 'Route not found.' });
  } catch (error) {
    if ((error.status || 500) >= 500) console.error('UDOK data API failure:', error.message);
    return json(res, error.status || 500, { error: error.status ? error.message : 'Unexpected backend error.' });
  }
});
server.listen(PORT, '0.0.0.0', () => console.log('UDOK data API listening on port ' + PORT));
