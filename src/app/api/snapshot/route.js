import { MAS1AssetLogic } from "js-moi-sdk";
import { ASSET_ID, ADMIN_MNEMONIC, getWallet } from "@/lib/utils";
import { getAssetInfo } from "@/lib/moi";

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

async function getTokenMetadataURI(mas1, tokenId) {
  try {
    const ctx = mas1.GetStaticTokenMetadata(tokenId, "uri");
    const res = await ctx.call();
    const status = res.receipt?.status;
    if (status !== 0) return { error: `status=${status}` };
    const outputs = res.receipt?.ix_operations?.[0]?.data?.outputs;
    if (!outputs || outputs === "0x") return { error: "empty outputs" };
    const raw = new TextDecoder().decode(
      Buffer.from(outputs.replace(/^0x/, ""), "hex")
    );
    const match = raw.match(/(ipfs:\/\/[A-Za-z0-9_-]+)/);
    if (match) return { uri: match[1] };
    return { error: `no ipfs match in: ${raw.substring(0, 100)}` };
  } catch (e) {
    return { error: e.message?.substring(0, 100) || "unknown error" };
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
    const tokenCount = parseInt(assetInfo.dynamic_metadata?.__token_count__ ?? "0", 16);
    const circulatingSupply = parseInt(assetInfo.circulating_supply ?? "0", 16);

    if (!tokenCount || tokenCount <= 0) {
      return Response.json({ tokens: [], tokenCount: 0, circulatingSupply, message: "No tokens minted yet" });
    }

    const wallet = await getWallet(ADMIN_MNEMONIC);
    const mas1 = new MAS1AssetLogic(ASSET_ID, wallet);

    const tokens = [];
    const errors = [];

    for (let tokenId = 0; tokenId < tokenCount; tokenId++) {
      const result = await getTokenMetadataURI(mas1, tokenId);
      if (result.error) {
        // Only keep first 50 errors with details to avoid huge response
        if (errors.length < 50) {
          errors.push({ tokenId, reason: result.error });
        }
        continue;
      }

      const { uri } = result;
      const metadata = await fetchIPFSJson(uri);
      if (!metadata) {
        errors.push({ tokenId, uri, reason: "IPFS fetch failed" });
        tokens.push({ tokenId, uri, metadata: null });
        continue;
      }

      tokens.push({ tokenId, uri, ...metadata });
    }

    return Response.json({
      tokenCount,
      circulatingSupply,
      retrieved: tokens.length,
      totalErrors: errors.length + (tokenCount - tokens.length - errors.length),
      sampleErrors: errors.length > 0 ? errors : undefined,
      tokens,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Snapshot failed" },
      { status: 500 }
    );
  }
}
