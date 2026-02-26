import { MAS1AssetLogic } from "js-moi-sdk";
import { ASSET_ID, getProvider, getWallet } from "@/lib/utils";

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
  const res = await fetch(`${IPFS_GATEWAY}/${cid}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  return res.json();
}

export async function POST(request) {
  try {
    const { action, mnemonic } = await request.json();

    if (action === "owned") {
      if (!mnemonic) {
        return Response.json({ error: "mnemonic is required" }, { status: 400 });
      }

      const userWallet = await getWallet(mnemonic);
      const userAddress = (await userWallet.getIdentifier()).toHex();
      const provider = getProvider();

      const tdu = await provider.getTDU(userAddress);
      const nftEntries = tdu.filter((t) => t.asset_id === ASSET_ID);

      if (nftEntries.length === 0) {
        return Response.json({ tokens: [], userAddress });
      }

      const mas1 = new MAS1AssetLogic(ASSET_ID, userWallet);

      const tokens = [];
      for (const entry of nftEntries) {
        const tokenId = entry.token_id;
        const uri = await getTokenMetadataURI(mas1, tokenId);
        if (!uri) continue;

        const metadata = await fetchIPFSJson(uri);
        if (!metadata) continue;

        tokens.push({ tokenId, uri, ...metadata });
      }

      return Response.json({ tokens, userAddress });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return Response.json(
      { error: error.message || "Token query failed" },
      { status: 500 }
    );
  }
}
