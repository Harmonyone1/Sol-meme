import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());

const ALLOWED_ORIGINS = process.env.WEB_ORIGIN ? [process.env.WEB_ORIGIN] : [/\.vercel\.app$/];
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: false }));

app.get('/healthz', async (_req, res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on ${port}`));
