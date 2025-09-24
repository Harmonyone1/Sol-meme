import { setTimeout as sleep } from 'timers/promises';
import dotenv from 'dotenv';
import IORedis from 'ioredis';
import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import { prisma } from './db';
import { fetchMintInfo } from './enrichment/mint';
import { fetchPoolState } from './enrichment/pool';
import { fetchHoldersSnapshot } from './enrichment/holders';
import { applyRiskFilters } from './risk';
import { score as scoreComposite } from './scoring';

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
  const rpc = process.env.RPC_PRIMARY_URL || '';
  const mint = String(raw?.mint ?? raw?.token ?? 'So11111111111111111111111111111111111111112');
  const pool = raw?.pool ?? null;
  const notionalUsd = Number(process.env.SCANNER_NOTIONAL_USD || 1500);

  const [mintInfo, poolState, holders] = await Promise.all([
    fetchMintInfo(rpc, mint),
    fetchPoolState(rpc, pool, notionalUsd),
    fetchHoldersSnapshot(rpc, mint)
  ]);

  const riskCfg = {
    poolAgeMinMin: Number(process.env.RISK_POOL_AGE_MIN || 10),
    tvlUsdMin: Number(process.env.RISK_TVL_MIN || 75000),
    priceImpactBpsMax: Number(process.env.RISK_IMPACT_MAX_BPS || 150),
    requireRenouncedMint: true
  };
  const risk = applyRiskFilters(mintInfo, poolState, riskCfg);
  if (!risk.pass) throw new Error(`Risk filter: ${risk.reason}`);

  const feat = {
    tvlUsd: poolState.tvlUsd,
    uniques10m: Number(raw?.uniques10m ?? 50),
    volume10m: Number(raw?.volume10m ?? 100000),
    momentumZ: Number(raw?.momentumZ ?? 0.5),
    holderConcentration: Number(holders.top5Pct)
  };
  const weights = { liquidity: 0.25, uniques10m: 0.2, volume10m: 0.2, momentumZ: 0.15, holderConcentration: 0.2 };
  const score = scoreComposite(feat, weights);

  const created = await prisma.candidate.create({ data: {
    mint,
    pool,
    score,
    tvlUsd: poolState.tvlUsd,
    ageMin: poolState.ageMin,
    impactBps: poolState.impactBpsAtNotional,
    flagsJson: mintInfo
  }});
  return created;
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
