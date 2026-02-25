import { getTokenURI } from "@/lib/moi";
import { ASSET_ID, getProvider, getWallet } from "@/lib/utils";

export async function POST(request) {
  try {
    const { action, mnemonic, tokenId } = await request.json();

    if (!mnemonic) {
      return Response.json({ error: "mnemonic is required" }, { status: 400 });
    }

    if (action === "list") {
      const wallet = await getWallet(mnemonic);
      const address = wallet.identifier.toHex();
      const provider = getProvider();
      const tdu = await provider.getTDU(address);
      const match = tdu.find((t) => t.asset_id === ASSET_ID);
      return Response.json({
        asset_id: ASSET_ID,
        amount: match ? Number(match.amount) : 0,
      });
    }

    if (action === "metadata") {
      if (tokenId === undefined || tokenId === null) {
        return Response.json({ error: "tokenId is required" }, { status: 400 });
      }
      const uri = await getTokenURI(mnemonic, tokenId);
      return Response.json({ uri });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return Response.json(
      { error: error.message || "Token query failed" },
      { status: 500 }
    );
  }
}
