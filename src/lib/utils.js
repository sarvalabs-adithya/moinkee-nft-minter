import { VoyageProvider, Wallet } from "js-moi-sdk";

export const ASSET_ID = process.env.NEXT_PUBLIC_ASSET_ID;
const rawAdmin = process.env.ADMIN_MNEMONIC || "";
export const ADMIN_MNEMONIC = rawAdmin.replace(/^["']|["']$/g, "").trim();
export const DERIVATION_PATH = "m/44'/6174'/7020'/0/0";

export function getProvider() {
  return new VoyageProvider("devnet");
}

export async function getWallet(mnemonic) {
  if (!mnemonic || typeof mnemonic !== "string" || mnemonic.trim().split(/\s+/).length < 12) {
    console.error("[getWallet] Invalid mnemonic:", JSON.stringify(mnemonic)?.substring(0, 50));
    throw new Error("Invalid mnemonic");
  }
  const provider = getProvider();
  const wallet = await Wallet.fromMnemonic(mnemonic.trim(), DERIVATION_PATH);
  wallet.connect(provider);
  return wallet;
}
