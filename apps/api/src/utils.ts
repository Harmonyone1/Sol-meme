export async function fetchJson(url: string, init?: RequestInit & { timeoutMs?: number }) {
  const { timeoutMs = 3000, ...rest } = init || {};
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...rest, signal: ac.signal });
    const data = await resp.json();
    return { ok: resp.ok, status: resp.status, data };
  } finally {
    clearTimeout(t);
  }
}

