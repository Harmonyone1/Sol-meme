import type { Request, Response } from 'express';
import { fetchJson } from './utils';

type Point = { t: number; o: number; h: number; l: number; c: number };

function toBucketMs(tf: string) {
  switch (tf) {
    case '1m': return 60_000;
    case '5m': return 5 * 60_000;
    case '15m': return 15 * 60_000;
    case '1h': return 60 * 60_000;
    case '4h': return 4 * 60 * 60_000;
    case '1d': return 24 * 60 * 60_000;
    default: return 60_000;
  }
}

async function fetchFromBirdeye(mint: string, tf: string, n: number): Promise<Point[] | null> {
  const apiKey = process.env.BIRDEYE_API_KEY;
  const base = process.env.BIRDEYE_API_BASE || 'https://public-api.birdeye.so';
  if (!apiKey) return null;
  const nowSec = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(toBucketMs(tf) / 1000);
  const from = nowSec - n * bucket;
  const u = new URL('/defi/ohlcv', base);
  u.searchParams.set('address', mint);
  u.searchParams.set('type', tf);
  u.searchParams.set('time_from', String(from));
  u.searchParams.set('time_to', String(nowSec));
  const r = await fetch(u.toString(), { headers: { 'X-API-KEY': apiKey, 'x-chain': 'solana', 'accept': 'application/json' } } as any).catch(() => null);
  if (!r || !(r as any).ok) return null;
  const data = await (r as any).json().catch(() => null);
  if (!data) return null;
  const items: any[] = data?.data?.items || data?.data || data?.items || [];
  if (!Array.isArray(items) || items.length === 0) return null;
  const out: Point[] = items.map((it: any) => {
    const tsRaw = it.t ?? it.time ?? it.unixTime ?? 0;
    const t = Number(tsRaw) * (String(tsRaw).length > 10 ? 1 : 1000);
    const o = Number(it.o ?? it.open ?? it.openPrice ?? it.startPrice ?? it.priceOpen ?? NaN);
    const h = Number(it.h ?? it.high ?? it.highPrice ?? it.priceHigh ?? NaN);
    const l = Number(it.l ?? it.low ?? it.lowPrice ?? it.priceLow ?? NaN);
    const c = Number(it.c ?? it.close ?? it.closePrice ?? it.endPrice ?? it.priceClose ?? NaN);
    return { t, o, h, l, c } as Point;
  }).filter((p: Point) => Number.isFinite(p.o) && Number.isFinite(p.h) && Number.isFinite(p.l) && Number.isFinite(p.c) && Number.isFinite(p.t));
  return out.length ? out : null;
}

function syntheticSeries(n: number, tf: string): Point[] {
  const now = Date.now();
  const bucketMs = toBucketMs(tf);
  let price = 1 + Math.random() * 0.1;
  return Array.from({ length: n }, (_, i) => {
    const t = now - (n - i) * bucketMs;
    const o = price;
    const c = o * (1 + (Math.random() - 0.5) * 0.01);
    const h = Math.max(o, c) * (1 + Math.random() * 0.005);
    const l = Math.min(o, c) * (1 - Math.random() * 0.005);
    price = c;
    return { t, o, h, l, c };
  });
}

export async function ohlcRoute(req: Request, res: Response) {
  const { mint } = req.params as { mint: string };
  const { tf = '1m', points = '60' } = req.query as Record<string, string>;
  const n = Math.min(Math.max(parseInt(points, 10) || 60, 5), 500);
  try {
    let series: Point[] | null = null;
    series = await fetchFromBirdeye(mint, String(tf), n);
    if (!series) series = syntheticSeries(n, String(tf));
    res.json({ mint, tf, points: n, series });
  } catch (e: any) {
    res.status(200).json({ mint, tf, points: n, series: syntheticSeries(n, String(tf)), warning: e?.message });
  }
}
