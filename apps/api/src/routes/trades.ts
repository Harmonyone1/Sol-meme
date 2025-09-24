import type { Request, Response } from 'express';

// POST /api/trades/simulate
export async function postTradeSimulate(req: Request, res: Response) {
  try {
    const { mint, side = 'buy', size = 100 } = req.body ?? {};
    // Stub simulation; wire to Jupiter later
    const price = 1 + Math.random() * 0.1;
    const slipBps = Math.floor(Math.random() * 30);
    const feeMicroLamports = 5_000 + Math.floor(Math.random() * 20_000);
    const notional = size * price;
    res.json({ ok: true, mint, side, size, quote: { price, slipBps, feeMicroLamports, notional } });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err?.message });
  }
}

