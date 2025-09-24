import type { Request, Response } from 'express';
import crypto from 'crypto';
import IORedis from 'ioredis';
import { getScannerQueue } from '../queues';

function verifyHmac(req: Request, secret?: string) {
  if (!secret) return true; // allow in dev if not set
  const sig = req.header('x-helius-signature') || '';
  const body = JSON.stringify(req.body || {});
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export function heliusWebhook(redis: IORedis) {
  const q = getScannerQueue(redis);
  return async (req: Request, res: Response) => {
    const secret = process.env.HELIUS_WEBHOOK_SECRET;
    if (!verifyHmac(req, secret)) return res.status(401).json({ ok: false, error: 'bad_signature' });
    try {
      const events = Array.isArray(req.body) ? req.body : [req.body];
      const jobs = [] as any[];
      for (const ev of events) {
        // Minimal extraction: capture mints/pools of interest from Raydium/Orca events
        const mint = ev?.mint || ev?.tokenMint || ev?.account || null;
        const pool = ev?.pool || ev?.poolAddress || null;
        if (mint || pool) jobs.push({ mint, pool, raw: ev });
      }
      if (jobs.length) await q.addBulk(jobs.map((data, i) => ({ name: 'helius', data, opts: { removeOnComplete: 100, removeOnFail: 100, jobId: `${Date.now()}-${i}` } })));
      res.status(200).json({ ok: true, enqueued: jobs.length });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err?.message });
    }
  };
}

