import { setTimeout as sleep } from 'timers/promises';
import dotenv from 'dotenv';
import IORedis from 'ioredis';
import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

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
  setInterval(() => {
    queues.scanner.add('heartbeat', { ts: Date.now() }, defaultJobOpts).catch(() => {});
  }, 60_000);

  heartbeat();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
