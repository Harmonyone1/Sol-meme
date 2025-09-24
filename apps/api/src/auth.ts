import type { Request, Response, NextFunction } from 'express';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const required = process.env.API_KEY;
  if (!required) return next(); // open if not configured

  const provided = req.header('x-api-key') || req.header('X-API-Key');
  if (provided && provided === required) return next();

  res.status(401).json({ ok: false, error: 'unauthorized' });
}

