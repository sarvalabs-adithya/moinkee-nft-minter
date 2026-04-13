import { MAS1AssetLogic } from "js-moi-sdk";
import { ASSET_ID, ADMIN_MNEMONIC, getWallet } from "@/lib/utils";
import axios from "axios";

const PINATA_JWT = process.env.PINATA_JWT;
const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export async function POST() {
  try {
    if (!PINATA_JWT) {
      return Response.json({ error: "PINATA_JWT not configured" }, { status: 500 });
    }

    // Step 1: Recover all metadata from Pinata
    const pinataRes = await axios.get(
      "https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000",
      { headers: { Authorization: `Bearer ${PINATA_JWT}` } }
    );

    const metadataPins = pinataRes.data.rows.filter(
      (pin) => pin.mime_type === "application/json"
    );

    // Step 2: Re-mint each token on-chain using the existing CID
    const adminWallet = await getWallet(ADMIN_MNEMONIC);
    const mas1 = new MAS1AssetLogic(ASSET_ID, adminWallet);

    const results = [];
    const errors = [];

    for (const pin of metadataPins) {
      const cid = pin.ipfs_pin_hash;

      // Fetch metadata to get the owner address
      let owner;
      try {
        const res = await fetch(`${IPFS_GATEWAY}/${cid}`, {
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const metadata = await res.json();
          owner = metadata.owner;
        }
      } catch {
        // If we can't fetch metadata, mint to admin
      }

      // Use the original owner if available, otherwise mint to admin
      const recipient = owner && owner.startsWith("0x") && owner.length > 10
        ? owner
        : (await adminWallet.getIdentifier()).toHex();

      try {
        const metadata = {
          uri: new TextEncoder().encode(`ipfs://${cid}`),
        };

        const mintCtx = mas1.mintWithMetadata(recipient, metadata);
        const mintRes = await mintCtx.send();
        const mintReceipt = await mintRes.wait();

        if (mintReceipt.status !== 0) {
          errors.push({ cid, name: pin.metadata?.name, reason: "mint failed on-chain" });
          continue;
        }

        results.push({
          cid,
          name: pin.metadata?.name,
          owner: recipient,
          txHash: mintRes.hash,
        });
      } catch (e) {
        errors.push({ cid, name: pin.metadata?.name, reason: e.message });
      }
    }

    return Response.json({
      total: metadataPins.length,
      minted: results.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      results,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Reload failed" },
      { status: 500 }
    );
  }
}
