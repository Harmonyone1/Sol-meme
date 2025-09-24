import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

dotenv.config();

const app = express();
app.use(express.json());

const ALLOWED_ORIGINS = process.env.WEB_ORIGIN ? [process.env.WEB_ORIGIN] : [/\.vercel\.app$/];
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: false }));

app.get('/healthz', async (_req, res) => {
  // TODO: check DB, Redis, RPC reachability here
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post('/webhooks/helius', (req, res) => {
  // TODO: verify HMAC, enqueue event
  res.status(200).end();
});

app.post('/webhooks/jito', (req, res) => {
  // TODO: verify, handle bundle status
  res.status(200).end();
});

// TODO: strategies, trades, execution, ws

const port = Number(process.env.PORT || 8080);
const server = createServer(app);

// Minimal WS broadcast (health/heartbeat placeholder)
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'hello', ts: new Date().toISOString() }));
});

setInterval(() => {
  const msg = JSON.stringify({ type: 'health', payload: { ok: true, ts: new Date().toISOString() } });
  wss.clients.forEach((c) => {
    try { c.send(msg); } catch {}
  });
}, 30_000);

server.listen(port, () => console.log(`API listening on ${port}`));
