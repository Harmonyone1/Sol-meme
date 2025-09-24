export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#0b0d12', color: '#e6e8ef' }}>
        <header style={{ padding: '12px 16px', borderBottom: '1px solid #1b1f2a' }}>
          <strong>Solana Meme Bot</strong>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}

