import type { Request, Response } from 'express';
import IORedis from 'ioredis';

// POST /api/execution/kill { enabled: boolean }
export function postKillSwitch(redis: IORedis) {
  return async (req: Request, res: Response) => {
    try {
      const enabled = Boolean(req.body?.enabled);
      await redis.set('kill_switch', enabled ? '1' : '0');
      res.json({ ok: true, killSwitch: enabled });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err?.message });
    }
  };
}

