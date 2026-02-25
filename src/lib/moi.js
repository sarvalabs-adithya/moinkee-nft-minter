import { MAS1AssetLogic } from "js-moi-sdk";
import { ASSET_ID, ADMIN_MNEMONIC, getProvider, getWallet } from "./utils";

export async function mintNFT(mnemonic, metadataCid) {
  const mn = mnemonic || ADMIN_MNEMONIC;
  const wallet = await getWallet(mn);
  const address = wallet.identifier.toHex();
  const mas1 = new MAS1AssetLogic(ASSET_ID, wallet);

  const metadata = {
    uri: new TextEncoder().encode(`ipfs://${metadataCid}`),
  };

  const ctx = mas1.mintWithMetadata(address, metadata);
  const response = await ctx.send();
  await response.wait();

  return { hash: response.hash, address };
}

export async function getTokenURI(mnemonic, tokenId) {
  const wallet = await getWallet(mnemonic);
  const mas1 = new MAS1AssetLogic(ASSET_ID, wallet);

  const ctx = mas1.GetStaticTokenMetadata(tokenId, "uri", new Uint8Array());
  const res = await ctx.call();
  const receipt = res.receipt ?? res;
  const outputs = receipt?.ix_operations?.[0]?.data?.outputs;

  if (!outputs || outputs === "0x") return null;

  const raw = new TextDecoder().decode(
    Buffer.from(outputs.replace(/^0x/, ""), "hex")
  );
  const match = raw.match(/(ipfs:\/\/[A-Za-z0-9]+)/);
  return match ? match[1] : raw;
}
