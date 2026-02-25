# `getTDU` does not return token IDs for MAS1 (NFT) assets

**Labels:** `enhancement`, `api`

## Problem

The `getTDU(id)` method on `BaseProvider` currently returns an array of `{ asset_id, amount }` pairs:

```typescript
// base-provider.ts L138-156
public async getTDU(id: string, options?: Options): Promise<TDU[]> {
    const params: AccountParamsBase = { id, options: options ?? defaultOptions };
    const response = await this.execute("moi.TDU", params);
    const tdu: Array<TDUResponse> = this.processResponse(response);

    return tdu.map((asset: TDUResponse) => ({
        asset_id: asset.asset_id,
        amount: hexToBN(asset.amount),
    }));
}
```

For **MAS1 (non-fungible) assets**, `amount` tells us *how many* tokens an address owns, but there is no way to retrieve *which* `token_id`s they hold. The current `TDU` interface:

```typescript
interface TDU {
    asset_id: string;
    amount: number | bigint;
}
```

...lacks a `token_ids` field (or equivalent) for non-fungible asset standards.

## Impact

Without token ID enumeration, developers building NFT applications on MOI cannot:

- Display a user's owned NFTs (gallery / portfolio view)
- Fetch metadata for each owned token (requires knowing the `token_id` to call `GetStaticTokenMetadata`)
- Build transfer/burn UIs that let users select from their owned tokens
- Index or cache NFT ownership without maintaining a separate off-chain database

The only current workaround is to manually track every `token_id` at mint time from the interaction receipt and persist it in an external store — which defeats the purpose of querying on-chain state.

## Proposed Solution

**Option A — Extend the `TDU` response for non-fungible assets:**

```typescript
interface TDU {
    asset_id: string;
    amount: number | bigint;
    token_ids?: (number | bigint)[];  // populated for MAS1 assets
}
```

This would require the `moi.TDU` RPC endpoint to optionally include token IDs when the asset is non-fungible.

**Option B — Add a dedicated method:**

```typescript
provider.getOwnedTokens(address: string, assetId: string, options?: Options): Promise<(number | bigint)[]>
```

A new RPC call (e.g., `moi.OwnedTokens`) that returns the list of token IDs an address holds for a given MAS1/MAS2 asset.

**Option C — Add enumeration to `MAS1AssetLogic`:**

```typescript
mas1.getOwnedTokenIds(address: string): InteractionContext
```

An asset-level query method, similar to ERC-721's `tokenOfOwnerByIndex`.

## Environment

- `js-moi-sdk`: `0.7.0-rc6`
- `js-moi-providers`: (bundled)
- Network: MOI Devnet

## Additional Context

`MAS1AssetLogic` exposes `isOwner(tokenId, address)` for point lookups, but no enumeration. Combined with `getTDU` only returning counts, there is currently no SDK path to list owned NFT token IDs without an off-chain index.
