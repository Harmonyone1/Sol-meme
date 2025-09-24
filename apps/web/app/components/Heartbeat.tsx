"use client";

import { useEffect, useMemo, useState } from 'react';

export default function Heartbeat() {
  const [last, setLast] = useState<string>('(waiting)');
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
      setLast(ev.data);
    };
    ws.onerror = () => setLast('error');
    return () => ws.close();
  }, [wsUrl]);

  return (
    <div style={{ marginTop: 12, padding: 12, background: '#121622', border: '1px solid #1b1f2a', borderRadius: 8 }}>
      <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>WebSocket Heartbeat</div>
      <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{last}</pre>
    </div>
  );
}

