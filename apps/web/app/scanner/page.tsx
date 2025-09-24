"use client";

import { useEffect, useMemo, useState } from 'react';

type Cand = { id: string; mint: string; score: number; tvlUsd?: number; ageMin?: number; impactBps?: number; flags?: any };

export default function ScannerPage() {
  const [rows, setRows] = useState<Cand[]>([]);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const wsUrl = useMemo(() => {
    try {
      const u = new URL(apiBase);
      u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
      u.pathname = '/ws';
      u.search = '';
      return u.toString();
    } catch {
      return 'ws://localhost:8080/ws';
    }
  }, [apiBase]);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.channel === 'scanner' && msg?.payload) {
          setRows((prev) => [msg.payload as Cand, ...prev].slice(0, 100));
        }
      } catch {}
    };
    return () => ws.close();
  }, [wsUrl]);

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Scanner</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8, fontSize: 13 }}>
        <div style={{ opacity: 0.7 }}>Mint</div>
        <div style={{ opacity: 0.7 }}>Score</div>
        <div style={{ opacity: 0.7 }}>TVL</div>
        <div style={{ opacity: 0.7 }}>Age (m)</div>
        <div style={{ opacity: 0.7 }}>Impact (bps)</div>
        <div style={{ opacity: 0.7 }}>Flags</div>
        {rows.map((r) => (
          <>
            <div style={{ wordBreak: 'break-all' }}>{r.mint}</div>
            <div>{r.score?.toFixed?.(1)}</div>
            <div>${r.tvlUsd?.toLocaleString?.()}</div>
            <div>{r.ageMin}</div>
            <div>{r.impactBps}</div>
            <div>{r.flags ? Object.keys(r.flags).filter((k) => r.flags[k]).join(', ') : ''}</div>
          </>
        ))}
      </div>
    </div>
  );
}

