import type { Request, Response } from 'express';
import { prisma } from '../db';

export async function getStrategies(_req: Request, res: Response) {
  const items = await prisma.strategy.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ ok: true, items });
}

export async function getTrades(_req: Request, res: Response) {
  const items = await prisma.trade.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ ok: true, items });
}
