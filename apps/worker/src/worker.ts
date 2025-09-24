import { setTimeout as sleep } from 'timers/promises';
import dotenv from 'dotenv';
import IORedis from 'ioredis';
import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import { prisma } from '../../../packages/db/src';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const pub = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const queues = {
  scanner: new Queue('scanner', { connection }),
  executor: new Queue('executor', { connection })
};

const qEvents = {
  scanner: new QueueEvents('scanner', { connection }),
  executor: new QueueEvents('executor', { connection })
};

const defaultJobOpts: JobsOptions = { removeOnComplete: 100, removeOnFail: 100 };

async function heartbeat() {
  while (true) {
    console.log(JSON.stringify({ ts: new Date().toISOString(), type: 'heartbeat' }));
    await sleep(60_000);
  }
}

async function main() {
  // Redis + queues
  console.log('Worker starting...');
  connection.on('connect', () => console.log('Redis connected'));
  connection.on('error', (err) => console.error('Redis error', err));

  // Minimal workers (placeholders)
  new Worker('scanner', async (job) => {
    console.log('scanner job', job.id, job.name);
    // Accept either a webhook batch or a single token/mint payload
    const payload = job.data;
    // TODO: parse Helius Raydium/Orca events here
    const candidates = Array.isArray(payload) ? payload : [payload];
    for (const raw of candidates) {
      const cand = await processCandidate(raw).catch((e) => ({ error: String(e) }));
      if ((cand as any)?.id) {
        await pub.publish('scanner', JSON.stringify(cand));
      }
    }
  }, { connection });

  new Worker('executor', async (job) => {
    console.log('executor job', job.id, job.name);
    const { strategyId, mint, side, size } = job.data as { strategyId?: string; mint: string; side: 'buy'|'sell'; size: number };
    // Guard: kill switch via Redis
    const kill = await connection.get('kill_switch');
    if (kill === '1') {
      console.warn('Kill switch active; skipping execution');
      return;
    }
    // Create Trade row (pending)
    const trade = await prisma.trade.create({ data: {
      strategyId: strategyId ?? 'unknown',
      mint,
      side,
      size,
      quoteJson: { price: 1, slipBps: 25 },
      routeJson: {},
      status: 'pending'
    }});
    // TODO: call Jupiter for real quote/build and send via RPC/Jito
    const realized = { price: 1.01, slipBps: 30 };
    const updated = await prisma.trade.update({ where: { id: trade.id }, data: { status: 'confirmed', realizedJson: realized, txSig: 'stub' } });
    await pub.publish('trades', JSON.stringify(updated));
  }, { connection });

  // Example: enqueue periodic heartbeat jobs (optional)
  // Publish periodic health and a mock scanner candidate
  setInterval(() => {
    const ts = new Date().toISOString();
    pub.publish('health', JSON.stringify({ worker: 'ok', ts })).catch(() => {});
    const cand = {
      id: Math.random().toString(36).slice(2),
      mint: 'So11111111111111111111111111111111111111112',
      score: Math.round(Math.random() * 1000) / 10,
      tvlUsd: 75000 + Math.round(Math.random() * 25000),
      ageMin: 10 + Math.floor(Math.random() * 50),
      impactBps: 50 + Math.floor(Math.random() * 100),
      flags: { freeze: false, clawback: false }
    };
    pub.publish('scanner', JSON.stringify(cand)).catch(() => {});
  }, 60_000);

  heartbeat();
}

async function processCandidate(raw: any) {
  // Enrichment (stubbed)
  const mint = String(raw?.mint ?? raw?.token ?? 'So11111111111111111111111111111111111111112');
  const tvlUsd = Number(raw?.tvlUsd ?? 100000 + Math.random() * 50000);
  const ageMin = Number(raw?.ageMin ?? 10 + Math.floor(Math.random() * 120));
  const impactBps = Number(raw?.impactBps ?? 50 + Math.floor(Math.random() * 100));
  const flagsJson = { freeze: false, clawback: false, transferFee: false };
  // Risk filters (simplified)
  if (ageMin < 10) throw new Error('Too young');
  if (tvlUsd < 75000) throw new Error('Low TVL');
  if (impactBps > 150) throw new Error('High impact');
  // Score per docs (simplified weighted sum)
  const score = scoreCandidate({ tvlUsd, uniques10m: 50, volume10m: 100000, momentumZ: 0.5, holderConcentration: 0.2 });
  const created = await prisma.candidate.create({ data: { mint, pool: null, score, tvlUsd, ageMin, impactBps, flagsJson } });
  return created;
}

function scoreCandidate(f: { tvlUsd: number; uniques10m: number; volume10m: number; momentumZ: number; holderConcentration: number; }) {
  const weights = { liquidity: 0.25, uniques10m: 0.2, volume10m: 0.2, momentumZ: 0.15, holderConcentration: 0.2 };
  const liquidityScore = Math.min(1, f.tvlUsd / 150000);
  const uniquesScore = Math.min(1, f.uniques10m / 200);
  const volumeScore = Math.min(1, f.volume10m / 200000);
  const momentumScore = Math.max(0, Math.min(1, (f.momentumZ + 3) / 6));
  const concentrationScore = 1 - Math.min(1, f.holderConcentration);
  const composite = liquidityScore * weights.liquidity + uniquesScore * weights.uniques10m + volumeScore * weights.volume10m + momentumScore * weights.momentumZ + concentrationScore * weights.holderConcentration;
  return Math.round(composite * 1000) / 10; // 0..100
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
