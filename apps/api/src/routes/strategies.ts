import type { Request, Response } from 'express';
import { prisma } from '../../../../packages/db/src';

// POST /api/strategies
// If body.id present -> update; else create.
export async function postStrategy(req: Request, res: Response) {
  try {
    const b = req.body ?? {};
    const data = {
      name: String(b.name ?? 'Unnamed'),
      env: String(b.env ?? 'dev'),
      status: String(b.status ?? 'draft'),
      filtersJson: b.filters ?? b.filtersJson ?? {},
      weightsJson: b.weights ?? b.weightsJson ?? {},
      sizingJson: b.sizing ?? b.sizingJson ?? {},
      exitsJson: b.exits ?? b.exitsJson ?? {},
      execJson: b.execution ?? b.execJson ?? {}
    };
    let result;
    if (b.id) {
      result = await prisma.strategy.update({ where: { id: String(b.id) }, data });
    } else {
      result = await prisma.strategy.create({ data });
    }
    res.status(200).json({ ok: true, strategy: result });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err?.message });
  }
}

