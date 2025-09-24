export default function Page() {
  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        {['PNL Today', 'Open Positions', 'Win Rate', 'Avg Slip'].map((k) => (
          <div key={k} style={{ padding: 12, background: '#121622', border: '1px solid #1b1f2a', borderRadius: 8 }}>
            <div style={{ opacity: 0.7, fontSize: 12 }}>{k}</div>
            <div style={{ fontSize: 16 }}>—</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: 12, background: '#121622', border: '1px solid #1b1f2a', borderRadius: 8 }}>
        <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Live Feed</div>
        <div style={{ fontSize: 13 }}>Connect API + WS to see events here.</div>
      </div>
    </div>
  );
}

