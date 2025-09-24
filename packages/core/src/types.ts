// Shared types mirroring Prisma models (outline)

export type ID = string;

export interface Strategy {
  id: ID;
  name: string;
  status: 'draft' | 'active' | 'paused' | string;
  env: string;
  filtersJson: unknown;
  weightsJson: unknown;
  sizingJson: unknown;
  exitsJson: unknown;
  execJson: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: ID;
  mint: string;
  pool?: string | null;
  score: number;
  tvlUsd?: number | null;
  ageMin?: number | null;
  impactBps?: number | null;
  flagsJson: unknown;
  createdAt: string;
  strategyId?: ID | null;
}

export interface Trade {
  id: ID;
  strategyId: ID;
  mint: string;
  side: 'buy' | 'sell' | string;
  size: number;
  quoteJson: unknown;
  routeJson: unknown;
  txSig?: string | null;
  status: 'pending' | 'confirmed' | 'failed' | string;
  realizedJson?: unknown;
  feeMicroLamports?: number | null;
  jitoTip?: number | null;
  createdAt: string;
}

export interface Position {
  id: ID;
  mint: string;
  size: number;
  avgEntry: number;
  stopsJson?: unknown;
  tpsJson?: unknown;
  pnlRealized: number;
  pnlUnrealized: number;
  updatedAt: string;
  tradeId?: ID | null;
}

export interface Integration {
  id: ID;
  type: string;
  configJson: unknown;
  status: 'unknown' | 'ok' | 'degraded' | 'down' | string;
  lastHeartbeat?: string | null;
}

export interface Alert {
  id: ID;
  type: string;
  severity: 'info' | 'warn' | 'error' | 'critical' | string;
  payloadJson: unknown;
  createdAt: string;
  acknowledgedAt?: string | null;
}

export type WsChannel = 'trades' | 'positions' | 'alerts' | 'health' | 'scanner';

