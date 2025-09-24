// Mint info & token extensions via JSON-RPC (placeholder)

export type MintInfo = {
  freezeAuthority: boolean;
  clawback: boolean;
  transferFee: boolean;
  mintAuthorityRenounced: boolean;
};

export async function fetchMintInfo(_rpc: string, _mint: string): Promise<MintInfo> {
  // TODO: implement via getAccountInfo + decode SPL Token extensions
  return { freezeAuthority: false, clawback: false, transferFee: false, mintAuthorityRenounced: true };
}

