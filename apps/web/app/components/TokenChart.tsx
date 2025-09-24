"use client";

import { createChart, ColorType, ISeriesApi } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

type Point = { t: number; o: number; h: number; l: number; c: number };

export default function TokenChart({ mint }: { mint: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 240,
      layout: { background: { type: ColorType.Solid, color: '#121622' }, textColor: '#cfd3e0' },
      grid: { vertLines: { color: '#1b1f2a' }, horzLines: { color: '#1b1f2a' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#1b1f2a' },
      timeScale: { borderColor: '#1b1f2a' }
    });
    const series: ISeriesApi<'Candlestick'> = chart.addCandlestickSeries();

    async function load() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        const url = `${apiBase}/api/tokens/${mint}/ohlc?tf=1m&points=100`;
        const resp = await fetch(url);
        const data = await resp.json();
        const rows = (data.series as Point[]).map((p) => ({ time: Math.floor(p.t / 1000), open: p.o, high: p.h, low: p.l, close: p.c }));
        series.setData(rows);
      } catch (e) {
        // ignore
      }
    }
    load();

    const onResize = () => {
      if (!containerRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.remove();
    };
  }, [mint]);

  return (
    <div style={{ marginTop: 12, padding: 12, background: '#121622', border: '1px solid #1b1f2a', borderRadius: 8 }}>
      <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Token Chart (stub)</div>
      <div ref={containerRef} />
    </div>
  );
}

