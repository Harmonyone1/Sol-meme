"use client";

import { useEffect, useMemo, useState } from 'react';

type Trade = { id: string; mint: string; side: string; size: number; createdAt: string; status: string; txSig?: string | null; };

export default function TradesPage() {
  const [rows, setRows] = useState<Trade[]>([]);
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
    fetch(`${apiBase}/api/trades`).then(r => r.json()).then(d => setRows(d.items ?? []));
  }, [apiBase]);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.channel === 'trades' && msg?.payload) {
          setRows((prev) => [msg.payload as Trade, ...prev].slice(0, 200));
        }
      } catch {}
    };
    return () => ws.close();
  }, [wsUrl]);

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Trades</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 80px 80px 160px 100px 300px', gap: 8, fontSize: 13 }}>
        <div style={{ opacity: 0.7 }}>Time</div>
        <div style={{ opacity: 0.7 }}>Side</div>
        <div style={{ opacity: 0.7 }}>Size</div>
        <div style={{ opacity: 0.7 }}>Mint</div>
        <div style={{ opacity: 0.7 }}>Status</div>
        <div style={{ opacity: 0.7 }}>Tx</div>
        {rows.map((t) => (
          <>
            <div>{new Date(t.createdAt).toLocaleString()}</div>
            <div style={{ color: t.side === 'buy' ? '#4ade80' : '#f87171' }}>{t.side}</div>
            <div>{t.size}</div>
            <div style={{ wordBreak: 'break-all' }}>{t.mint}</div>
            <div>{t.status}</div>
            <div style={{ wordBreak: 'break-all' }}>{t.txSig ?? ''}</div>
          </>
        ))}
      </div>
    </div>
  );
}

