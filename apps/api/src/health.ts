import type { Request, Response } from 'express';
import IORedis from 'ioredis';
import { prisma } from './db';
import { fetchJson } from './utils';

export async function healthHandler(redis: IORedis): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = { ts: new Date().toISOString() };

  // DB check
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.db = { ok: true };
  } catch (err: any) {
    results.db = { ok: false, error: err?.message };
  }

  // Redis check
  try {
    const pong = await redis.ping();
    results.redis = { ok: pong === 'PONG' };
  } catch (err: any) {
    results.redis = { ok: false, error: err?.message };
  }

  // RPC check (optional; shallow)
  const url = process.env.RPC_PRIMARY_URL;
  if (!url) {
    results.rpc = { configured: false };
  } else {
    try {
      const body = { jsonrpc: '2.0', id: 1, method: 'getHealth', params: [] };
      const r = await fetchJson(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        timeoutMs: 2000
      });
      const healthy = r.ok && (r.data?.result === 'ok' || !r.data?.error);
      results.rpc = { configured: true, ok: healthy };
    } catch (err: any) {
      results.rpc = { configured: true, ok: false, error: err?.message };
    }
  }

  return results;
}

export function healthRoute(redis: IORedis) {
  return async (_req: Request, res: Response) => {
    const data = await healthHandler(redis);
    const ok = Boolean((data.db as any)?.ok) && Boolean((data.redis as any)?.ok);
    res.status(ok ? 200 : 503).json({ ok, ...data });
  };
}
