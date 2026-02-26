import { MAS1AssetLogic } from "js-moi-sdk";
import { ASSET_ID, ADMIN_MNEMONIC, getProvider, getWallet } from "./utils";

export async function mintNFT(mnemonic, metadataCid) {
  const adminWallet = await getWallet(ADMIN_MNEMONIC);
  const mas1 = new MAS1AssetLogic(ASSET_ID, adminWallet);

  const recipientWallet = await getWallet(mnemonic || ADMIN_MNEMONIC);
  const recipientAddress = (await recipientWallet.getIdentifier()).toHex();

  const metadata = {
    uri: new TextEncoder().encode(`ipfs://${metadataCid}`),
  };

  const mintCtx = mas1.mintWithMetadata(recipientAddress, metadata);
  const mintRes = await mintCtx.send();
  const mintReceipt = await mintRes.wait();

  if (mintReceipt.status !== 0) {
    const errHex = mintReceipt.ix_operations?.[0]?.data?.error;
    let detail = "on-chain execution failed";
    if (errHex && errHex !== "0x") {
      detail = Buffer.from(errHex.replace(/^0x/, ""), "hex")
        .toString("utf8")
        .replace(/[^\x20-\x7E]/g, " ")
        .trim();
    }
    throw new Error(`Mint failed: ${detail}`);
  }

  return { hash: mintRes.hash, address: recipientAddress };
}

export async function getTokenURI(mnemonic, tokenId) {
  const wallet = await getWallet(mnemonic);
  const mas1 = new MAS1AssetLogic(ASSET_ID, wallet);

  const ctx = mas1.GetStaticTokenMetadata(tokenId, "uri");
  const res = await ctx.call();
  const receipt = res.receipt ?? res;

  if (receipt?.status !== 0) return null;

  const outputs = receipt?.ix_operations?.[0]?.data?.outputs;
  if (!outputs || outputs === "0x") return null;

  const raw = new TextDecoder().decode(
    Buffer.from(outputs.replace(/^0x/, ""), "hex")
  );
  const match = raw.match(/(ipfs:\/\/[A-Za-z0-9_-]+)/);
  return match ? match[1] : raw;
}
