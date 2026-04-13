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
