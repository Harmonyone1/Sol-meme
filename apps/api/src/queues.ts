import IORedis from 'ioredis';
import { Queue } from 'bullmq';

let scannerQ: Queue | null = null;

export function getScannerQueue(redis: IORedis) {
  if (!scannerQ) scannerQ = new Queue('scanner', { connection: redis as any });
  return scannerQ;
}

