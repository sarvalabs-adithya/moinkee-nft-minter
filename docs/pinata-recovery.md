# Pinata IPFS Recovery System

## Why This Exists

This app mints NFTs on the MOI testnet. Testnet resets wipe all on-chain data. But every mint uploads its metadata JSON to IPFS via Pinata before writing to the chain. Since Pinata is independent infrastructure, those uploads survive any blockchain reset.

## How Minting Stores Data on Pinata

When a user mints a memento, the app builds a metadata JSON object containing the NFT name, description, image IPFS URI, owner wallet address, and event attributes (event name, location, date). This JSON is uploaded to Pinata, which pins it to IPFS and returns a CID — a permanent content-addressed identifier for that metadata.

## How Recovery Works

The recovery endpoint (`POST /api/recover`):

1. Queries the Pinata API to list all files pinned on the account
2. Filters for JSON metadata files only (excluding images and folders)
3. Iterates through each pinned metadata file and fetches its full JSON contents from the IPFS gateway
4. Collects every metadata object into an array and returns the result as a single JSON response

## How to Generate the Recovery File

Start the dev server, then run:

```bash
curl -X POST http://localhost:3000/api/recover --max-time 600 -o recovered.json
```

This produces `recovered.json` — a single file containing every minted memento. Each entry includes:

- **cid** — the IPFS content identifier for this metadata
- **uri** — the full `ipfs://` URI
- **datePinned** — when the metadata was uploaded to Pinata
- **name** — the memento name (e.g. "Adi's Cairo Web3 Summit Memento")
- **description** — the memento description
- **image** — the IPFS URI of the memento image
- **owner** — the wallet address that minted it
- **attributes** — event name, location, and date

Requires `PINATA_JWT` to be set in `.env.local`.

## How to Reload After a Testnet Reset

After the testnet resets, the blockchain is empty but the metadata is still on IPFS. To restore the tokens on-chain:

1. Generate a fresh `recovered.json` by running the recovery endpoint (or use a previously saved copy)
2. For each entry in `recovered.json`, call the mint endpoint with the existing CID — the metadata doesn't need to be re-uploaded since it's already pinned on Pinata
3. Each mint calls `mintWithMetadata` on the smart contract, passing the original CID as the metadata URI, which recreates the on-chain token pointing to the same IPFS metadata

The reload endpoint (`POST /api/reload`) automates this. It reads `recovered.json`, iterates through each token, and re-mints them to their original owner addresses using the existing metadata CIDs. No data is re-uploaded to Pinata — it reuses what's already there.

```bash
curl -X POST http://localhost:3000/api/reload --max-time 3600 -o reload-result.json
```

This will take time since each mint is an on-chain transaction. The result file shows which tokens were successfully re-minted and which failed.
