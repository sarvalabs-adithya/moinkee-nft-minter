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
