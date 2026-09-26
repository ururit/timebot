// TimeBot sync API — хранит данные пользователей в JSON-файлах
// Маршруты:
//   GET  /sync/:userId  -> { data: {...} } или { data: null }
//   POST /sync/:userId  -> body { data: {...} }, атомарная запись
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_DIR = '/var/lib/timebot';
const AUTH_TOKEN = 'tb-rp-2026-sync-secret';

fs.mkdirSync(DATA_DIR, { recursive: true });

function safeName(userId) {
  // только безопасные символы для имени файла
  return String(userId).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64);
}

function fileFor(userId) {
  return path.join(DATA_DIR, safeName(userId) + '.json');
}

function send(res, code, obj, extraHeaders) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Length': Buffer.byteLength(body),
    ...(extraHeaders || {})
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const m = url.pathname.match(/^\/sync\/([^/]+)$/);

  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }

  // проверка токена
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${AUTH_TOKEN}`) {
    send(res, 401, { error: 'unauthorized' });
    return;
  }

  if (!m) {
    send(res, 404, { error: 'not found' });
    return;
  }
  const userId = decodeURIComponent(m[1]);
  const file = fileFor(userId);

  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(file)) {
        send(res, 200, { data: null });
        return;
      }
      const raw = fs.readFileSync(file, 'utf8');
      const parsed = JSON.parse(raw);
      send(res, 200, { data: parsed });
    } catch (e) {
      send(res, 500, { error: 'read failed' });
    }
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; if (body.length > 5 * 1024 * 1024) req.destroy(); });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (!parsed || typeof parsed !== 'object' || !('data' in parsed)) {
          send(res, 400, { error: 'bad body' });
          return;
        }
        // атомарная запись: temp + rename
        const tmp = file + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(parsed.data));
        fs.renameSync(tmp, file);
        send(res, 200, { ok: true, savedAt: new Date().toISOString() });
      } catch (e) {
        send(res, 400, { error: 'bad json' });
      }
    });
    return;
  }

  send(res, 405, { error: 'method not allowed' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`timebot-sync listening on 127.0.0.1:${PORT}`);
});