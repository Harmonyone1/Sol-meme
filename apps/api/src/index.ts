import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import IORedis from 'ioredis';
import { healthRoute } from './health';
import { ohlcRoute } from './ohlc';
import { apiKeyAuth } from './auth';
import { postStrategy } from './routes/strategies';
import { postTradeSimulate } from './routes/trades';
import { postKillSwitch } from './routes/execution';
import { postExecute, getKillStatus, getJupiterQuote } from './routes/execute';
import { getStrategies, getTrades } from './routes/read';

dotenv.config();

const app = express();
app.use(express.json());

const ALLOWED_ORIGINS = process.env.WEB_ORIGIN ? [process.env.WEB_ORIGIN] : [/\.vercel\.app$/];
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: false }));

const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const sub = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
app.get('/healthz', healthRoute(redis));
app.get('/api/tokens/:mint/ohlc', ohlcRoute);
app.get('/api/strategies', getStrategies);
app.get('/api/trades', getTrades);
app.get('/api/execution/kill', getKillStatus(redis));
app.get('/api/quotes/jupiter', getJupiterQuote);

// Authenticated routes when API_KEY is set
app.post('/api/strategies', apiKeyAuth, postStrategy);
app.post('/api/trades/simulate', apiKeyAuth, postTradeSimulate);
app.post('/api/execution/kill', apiKeyAuth, postKillSwitch(redis));
app.post('/api/trades/execute', apiKeyAuth, postExecute(redis));

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
  ws.send(JSON.stringify({ channel: 'hello', payload: { ts: new Date().toISOString() } }));
});

// Bridge Redis pub/sub -> WS
const CHANNELS = ['scanner', 'trades', 'alerts', 'health'] as const;
sub.subscribe(...CHANNELS, (err) => {
  if (err) console.error('Redis SUB error', err);
});
sub.on('message', (channel, message) => {
  const envelope = { channel, payload: safeParse(message) };
  const data = JSON.stringify(envelope);
  wss.clients.forEach((c) => {
    try { c.send(data); } catch {}
  });
});

function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return s; }
}

// Local heartbeat to WS
setInterval(() => {
  const msg = JSON.stringify({ channel: 'health', payload: { ok: true, ts: new Date().toISOString() } });
  wss.clients.forEach((c) => {
    try { c.send(msg); } catch {}
  });
}, 30_000);

server.listen(port, () => console.log(`API listening on ${port}`));
