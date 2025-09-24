"use client";

import { useEffect, useState } from 'react';

export default function HealthPage() {
  const [health, setHealth] = useState<any>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    fetch(`${apiBase}/healthz`).then(r => r.json()).then(setHealth).catch(() => {});
  }, [apiBase]);

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Health</h1>
      <pre style={{ background: '#121622', padding: 12, border: '1px solid #1b1f2a', borderRadius: 8, fontSize: 12 }}>
        {JSON.stringify(health, null, 2)}
      </pre>
    </div>
  );
}

