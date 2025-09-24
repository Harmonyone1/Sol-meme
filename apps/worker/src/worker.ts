import { setTimeout as sleep } from 'timers/promises';
import dotenv from 'dotenv';
import IORedis from 'ioredis';
import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';

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
    // TODO: implement per docs/SCANNER.md
  }, { connection });

  new Worker('executor', async (job) => {
    console.log('executor job', job.id, job.name);
    // TODO: implement per docs/EXECUTION.md
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

main().catch(err => {
  console.error(err);
  process.exit(1);
});
