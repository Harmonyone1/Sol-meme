"use client";

import { useEffect, useState } from 'react';
import TokenChart from '../../components/TokenChart';

export default function TradeDetail({ params }: { params: { id: string } }) {
  const [trade, setTrade] = useState<any>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const id = params.id;
  useEffect(() => {
    fetch(`${apiBase}/api/trades/${id}`).then(r => r.json()).then(setTrade).catch(() => {});
  }, [apiBase, id]);
  const mint = trade?.item?.mint ?? 'So11111111111111111111111111111111111111112';
  const entryTs = trade?.item?.createdAt ? Math.floor(new Date(trade.item.createdAt).getTime() / 1000) : undefined;
  const entryPrice = Number((trade?.item?.quoteJson as any)?.price ?? NaN);
  const exitPrice = Number((trade?.item?.realizedJson as any)?.price ?? NaN);
  const markers = entryTs ? [
    ...(Number.isFinite(entryPrice) ? [{ time: entryTs, position: 'belowBar' as const, color: '#4ade80', text: `Entry ${entryPrice.toFixed(4)}` }] : []),
    ...(Number.isFinite(exitPrice) ? [{ time: entryTs + 60, position: 'aboveBar' as const, color: '#f87171', text: `Exit ${exitPrice.toFixed(4)}` }] : []),
  ] : [];
  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Trade {id}</h1>
      <pre style={{ background: '#121622', padding: 12, border: '1px solid #1b1f2a', borderRadius: 8, fontSize: 12 }}>
        {JSON.stringify(trade?.item ?? {}, null, 2)}
      </pre>
      <TokenChart mint={mint} markers={markers} />
    </div>
  );
}
