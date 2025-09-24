import type { Request, Response } from 'express';
import { prisma } from '../../../../packages/db/src';

export async function getCandidates(_req: Request, res: Response) {
  const items = await prisma.candidate.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ ok: true, items });
}

export async function getPositions(_req: Request, res: Response) {
  const items = await prisma.position.findMany({ orderBy: { updatedAt: 'desc' }, take: 200 });
  res.json({ ok: true, items });
}

export async function getAlerts(_req: Request, res: Response) {
  const items = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ ok: true, items });
}

export async function getTradeById(req: Request, res: Response) {
  const id = String(req.params.id);
  const item = await prisma.trade.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ ok: false, error: 'not_found' });
  res.json({ ok: true, item });
}

export async function getStrategyById(req: Request, res: Response) {
  const id = String(req.params.id);
  const item = await prisma.strategy.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ ok: false, error: 'not_found' });
  res.json({ ok: true, item });
}

