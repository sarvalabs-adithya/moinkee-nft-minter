# Pinata IPFS Recovery System

## Why This Exists

This app mints NFTs on the MOI testnet. Testnet resets wipe all on-chain data — token IDs, ownership mappings, metadata URIs. But every mint uploads its metadata JSON to IPFS via Pinata before writing to the chain. Since Pinata is independent infrastructure, those uploads survive any blockchain reset.

## How Minting Works

When a user mints a memento, the app first uploads the metadata JSON (name, description, image URI, owner address, event attributes) to Pinata. Pinata pins it to IPFS and returns a CID (content identifier). That CID is then stored on-chain via the smart contract. The metadata lives on IPFS permanently, while the chain only holds a pointer to it.

## How Recovery Works

The recovery endpoint (`POST /api/recover`) bypasses the blockchain entirely:

1. Queries the Pinata API to list all files pinned on the account
2. Filters for JSON metadata files only (excluding images and folders)
3. Iterates through each pinned metadata file and fetches its contents from the IPFS gateway
4. Returns the complete list of all minted mementos with their CIDs, names, descriptions, images, owner addresses, event details, and pinned dates

## How to Run

```bash
curl -X POST http://localhost:3000/api/recover --max-time 600 -o recovered.json
```

Requires `PINATA_JWT` to be set in `.env.local`.

## What Persists and What Doesn't

| Data | Survives testnet reset? |
|---|---|
| Metadata (name, description, image, owner, attributes) | Yes — stored on Pinata/IPFS |
| NFT images | Yes — stored on Pinata/IPFS |
| On-chain token IDs | No — assigned by smart contract |
| Token-to-CID mapping | No — stored on blockchain |
| Token ownership ledger | No — stored on blockchain |
