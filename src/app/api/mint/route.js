import { mintNFT } from "@/lib/moi";

export async function POST(request) {
  try {
    const { metadataCid, mnemonic } = await request.json();
    if (!metadataCid) {
      return Response.json({ error: "metadataCid is required" }, { status: 400 });
    }
    const result = await mintNFT(mnemonic, metadataCid);
    return Response.json({ hash: result.hash, address: result.address });
  } catch (error) {
    return Response.json(
      { error: error.message || "Minting failed" },
      { status: 500 }
    );
  }
}
