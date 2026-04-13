# Pinata IPFS Recovery System

## Why This Exists

This app mints NFTs on the MOI **testnet**. Testnet resets wipe all on-chain data — token IDs, ownership mappings, metadata URIs. But every mint uploads its metadata JSON to **IPFS via Pinata** before writing to the chain. Since Pinata is independent infrastructure, those uploads survive any blockchain reset.

This recovery system uses Pinata as the source of truth to restore all historical mint data.

---

## How Minting Pins Data to Pinata

When a user mints a memento, the app uploads the metadata JSON to Pinata before interacting with the blockchain. This happens in `/api/pinata`:

### `src/app/api/pinata/route.js`

```js
import axios from "axios";

export async function POST(request) {
  const PINATA_JWT = process.env.PINATA_JWT;

  if (!PINATA_JWT || PINATA_JWT.trim() === "") {
    const allKeys = Object.keys(process.env)
      .filter((k) => k.startsWith("PINATA"))
      .join(", ");
    console.error("[Pinata] PINATA_JWT is not set. Available PINATA* keys:", allKeys || "none");
    return Response.json(
      {
        error: "Pinata is not configured. Set PINATA_JWT in environment variables.",
        debug: `Found keys: ${allKeys || "none"}`,
      },
      { status: 503 }
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file) {
        return Response.json({ error: "No file provided" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const pinataForm = new FormData();
      const blob = new Blob([buffer], { type: file.type });
      pinataForm.append("file", blob, file.name);

      const pinataMetadata = JSON.stringify({ name: file.name });
      pinataForm.append("pinataMetadata", pinataMetadata);

      const pinataOptions = JSON.stringify({ cidVersion: 1 });
      pinataForm.append("pinataOptions", pinataOptions);

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        pinataForm,
        {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
          },
          maxBodyLength: Infinity,
        }
      );

      return Response.json({ IpfsHash: response.data.IpfsHash }, { status: 200 });
    }

    if (contentType.includes("application/json")) {
      const body = await request.json();

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          pinataContent: body,
          pinataMetadata: { name: body.name || "metadata.json" },
          pinataOptions: { cidVersion: 1 },
        },
        {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            "Content-Type": "application/json",
          },
        }
      );

      return Response.json({ IpfsHash: response.data.IpfsHash }, { status: 200 });
    }

    return Response.json({ error: "Unsupported content type" }, { status: 415 });
  } catch (error) {
    console.error("[Pinata Error]", error.response?.status, error.response?.data || error.message);
    const message = error.response?.data?.error?.details || error.response?.data?.error || error.message || "Upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
```

This route handles two types of uploads:

- **Image files** (`multipart/form-data`) — sent to Pinata's `pinFileToIPFS` endpoint. The image is pinned and a CID (content identifier) is returned.
- **Metadata JSON** (`application/json`) — sent to Pinata's `pinJSONToIPFS` endpoint. The JSON contains the NFT name, description, image IPFS URI, owner address, and event attributes. Pinata pins it and returns a CID.

Both use CID version 1 and authenticate via the `PINATA_JWT` environment variable. The returned CID is then passed to the smart contract's `mintWithMetadata()` function, which stores `ipfs://{cid}` on-chain.

The key point: **Pinata stores the full metadata independently of the blockchain.** Even if the chain resets, every pinned file remains accessible via its CID.

---

## How Recovery Works

The recovery endpoint queries the Pinata API to list all pinned files, filters for metadata JSONs, and fetches each one from IPFS.

### `src/app/api/recover/route.js`

```js
import axios from "axios";

const PINATA_JWT = process.env.PINATA_JWT;
const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export async function POST() {
  try {
    if (!PINATA_JWT) {
      return Response.json({ error: "PINATA_JWT not configured" }, { status: 500 });
    }

    // Step 1: List all pinned files from Pinata
    const pinataRes = await axios.get(
      "https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000",
      { headers: { Authorization: `Bearer ${PINATA_JWT}` } }
    );

    const allPins = pinataRes.data.rows;

    // Step 2: Filter to only JSON metadata files (not images/folders)
    const metadataPins = allPins.filter(
      (pin) => pin.mime_type === "application/json"
    );

    // Step 3: Fetch each metadata JSON from IPFS
    const tokens = [];
    const errors = [];

    for (const pin of metadataPins) {
      try {
        const res = await fetch(`${IPFS_GATEWAY}/${pin.ipfs_pin_hash}`, {
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
          errors.push({ cid: pin.ipfs_pin_hash, name: pin.metadata?.name, reason: "IPFS fetch failed" });
          continue;
        }
        const metadata = await res.json();
        tokens.push({
          cid: pin.ipfs_pin_hash,
          uri: `ipfs://${pin.ipfs_pin_hash}`,
          datePinned: pin.date_pinned,
          ...metadata,
        });
      } catch (e) {
        errors.push({ cid: pin.ipfs_pin_hash, name: pin.metadata?.name, reason: e.message });
      }
    }

    return Response.json({
      totalPinned: allPins.length,
      metadataFiles: metadataPins.length,
      retrieved: tokens.length,
      errors: errors.length > 0 ? errors : undefined,
      tokens,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Recovery failed" },
      { status: 500 }
    );
  }
}
```

### Step-by-step breakdown:

1. **List all pins** — calls `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000` with the JWT token. This returns every file pinned on the account: images, metadata JSONs, folders.

2. **Filter for metadata** — filters by `mime_type === "application/json"`. This excludes image files and the gallery folder, leaving only the metadata JSONs that were created at mint time.

3. **Fetch from IPFS** — for each metadata CID, fetches the full JSON from the public IPFS gateway (`https://ipfs.io/ipfs/{cid}`). Each JSON contains:
   ```json
   {
     "name": "Adi's Cairo Web3 Summit Memento",
     "description": "From the pyramids to the protocol...",
     "image": "ipfs://bafybeig.../Cairo.jpg",
     "owner": "0x0000000052c4ff2b...",
     "attributes": {
       "event": "Cairo Web3 Summit",
       "location": "Cairo, EG",
       "date": "2026"
     }
   }
   ```

4. **Return everything** — returns the complete array of recovered tokens with their CIDs, pinned dates, and full metadata.

---

## How to Run Recovery

```bash
curl -X POST http://localhost:3000/api/recover --max-time 600 -o recovered.json
```

### Output format

```json
{
  "totalPinned": 71,
  "metadataFiles": 70,
  "retrieved": 70,
  "tokens": [
    {
      "cid": "bafkreibbdwt4yy4hkyaiw6awvngvzfzlhkwi4zjssfainuj3rebljsygma",
      "uri": "ipfs://bafkreibbdwt4yy4hkyaiw6awvngvzfzlhkwi4zjssfainuj3rebljsygma",
      "datePinned": "2026-03-09T14:03:38.753Z",
      "name": "Adi's Cairo Web3 Summit Memento",
      "description": "...",
      "image": "ipfs://bafybeig.../Cairo.jpg",
      "owner": "0x0000000052c4ff2b...",
      "attributes": { "event": "Cairo Web3 Summit", "location": "Cairo, EG", "date": "2026" }
    }
  ]
}
```

---

## Environment Variables Required

| Variable | Purpose |
|---|---|
| `PINATA_JWT` | Authenticates with the Pinata API for both uploading (pinning) and listing (recovery) |

---

## What Persists and What Doesn't

| Data | Where it lives | Survives testnet reset? |
|---|---|---|
| Metadata JSON (name, description, image, owner, attributes) | Pinata / IPFS | Yes |
| NFT images | Pinata / IPFS | Yes |
| On-chain token IDs | MOI blockchain | No |
| Token-to-CID mapping | MOI blockchain | No |
| Token ownership ledger | MOI blockchain | No |

The recovery endpoint reconstructs everything except on-chain token IDs, which are assigned by the smart contract and lost on reset.
