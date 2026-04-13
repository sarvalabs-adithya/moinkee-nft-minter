import { MAS1AssetLogic } from "js-moi-sdk";
import { ASSET_ID, ADMIN_MNEMONIC, getWallet } from "@/lib/utils";
import { getAssetInfo } from "@/lib/moi";

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

async function getTokenMetadataURI(mas1, tokenId) {
  try {
    const ctx = mas1.GetStaticTokenMetadata(tokenId, "uri");
    const res = await ctx.call();
    if (res.receipt?.status !== 0) return null;
    const outputs = res.receipt?.ix_operations?.[0]?.data?.outputs;
    if (!outputs || outputs === "0x") return null;
    const raw = new TextDecoder().decode(
      Buffer.from(outputs.replace(/^0x/, ""), "hex")
    );
    const match = raw.match(/(ipfs:\/\/[A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function fetchIPFSJson(uri) {
  const cid = uri.replace("ipfs://", "");
  const res = await fetch(`${IPFS_GATEWAY}/${cid}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function POST() {
  try {
    const assetInfo = await getAssetInfo();
    const supply = parseInt(assetInfo.circulating_supply, 10);

    if (!supply || supply <= 0) {
      return Response.json({ tokens: [], supply: 0, message: "No tokens minted yet" });
    }

    const wallet = await getWallet(ADMIN_MNEMONIC);
    const mas1 = new MAS1AssetLogic(ASSET_ID, wallet);

    const tokens = [];
    const errors = [];

    for (let tokenId = 0; tokenId < supply; tokenId++) {
      const uri = await getTokenMetadataURI(mas1, tokenId);
      if (!uri) {
        errors.push({ tokenId, reason: "no URI found" });
        continue;
      }

      const metadata = await fetchIPFSJson(uri);
      if (!metadata) {
        errors.push({ tokenId, uri, reason: "IPFS fetch failed" });
        tokens.push({ tokenId, uri, metadata: null });
        continue;
      }

      tokens.push({ tokenId, uri, ...metadata });
    }

    return Response.json({
      supply,
      retrieved: tokens.length,
      errors: errors.length > 0 ? errors : undefined,
      tokens,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Snapshot failed" },
      { status: 500 }
    );
  }
}
