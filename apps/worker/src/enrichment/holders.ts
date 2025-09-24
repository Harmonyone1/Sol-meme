export type Holders = {
  top1Pct: number; // 0..1
  top5Pct: number; // 0..1
};

export async function fetchHoldersSnapshot(_rpc: string, _mint: string): Promise<Holders> {
  // TODO: implement via token account scan or indexer
  return { top1Pct: 0.2, top5Pct: 0.45 };
}

