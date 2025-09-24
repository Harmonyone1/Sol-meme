// Jupiter + RPC/Jito execution scaffolding

type QuoteParams = { inputMint: string; outputMint: string; amount: string; slippageBps: number };

export async function jupiterQuote(apiBase: string, params: QuoteParams) {
  const url = new URL('/v6/quote', apiBase);
  Object.entries({ ...params, swapMode: 'ExactIn' }).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error('quote failed');
  return r.json();
}

export async function jupiterSwap(apiBase: string, body: any) {
  const url = new URL('/v6/swap', apiBase);
  const r = await fetch(url.toString(), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('swap build failed');
  return r.json();
}

export function addPriorityFeeIx(txBase64: string, microLamports: number) {
  // TODO: decode, inject ComputeBudget setComputeUnitPrice, re-encode; placeholder
  return { txBase64, unitsPriceMicroLamports: microLamports };
}

export async function sendTransaction(_rpc: string, _txBase64: string) {
  // TODO: send via sendRawTransaction (or Jito) and confirm
  return { signature: 'stub' };
}

