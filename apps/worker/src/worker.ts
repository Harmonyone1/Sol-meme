import { setTimeout as sleep } from 'timers/promises';

async function heartbeat() {
  while (true) {
    console.log(JSON.stringify({ ts: new Date().toISOString(), type: 'heartbeat' }));
    await sleep(60_000);
  }
}

async function main() {
  // TODO: connect Redis, set up BullMQ queues for scanner/executor
  console.log('Worker starting...');
  heartbeat();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
