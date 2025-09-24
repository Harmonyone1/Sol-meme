"use client";

import { useEffect, useState } from 'react';

type Strategy = { id: string; name: string; env: string; status: string };

export default function StrategiesPage() {
  const [items, setItems] = useState<Strategy[]>([]);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    fetch(`${apiBase}/api/strategies`).then(r => r.json()).then(d => setItems(d.items ?? [])).catch(() => {});
  }, [apiBase]);

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Strategies</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 120px 120px', gap: 8, fontSize: 13 }}>
        <div style={{ opacity: 0.7 }}>Name</div>
        <div style={{ opacity: 0.7 }}>Env</div>
        <div style={{ opacity: 0.7 }}>Status</div>
        {items.map((s) => (
          <>
            <div>{s.name}</div>
            <div>{s.env}</div>
            <div>{s.status}</div>
          </>
        ))}
      </div>
    </div>
  );
}

