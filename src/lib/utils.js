import { VoyageProvider, Wallet } from "js-moi-sdk";

export const ASSET_ID = process.env.NEXT_PUBLIC_ASSET_ID;
export const ADMIN_MNEMONIC = process.env.ADMIN_MNEMONIC;
export const DERIVATION_PATH = "m/44'/6174'/7020'/0/0";

export function getProvider() {
  return new VoyageProvider("devnet");
}

export async function getWallet(mnemonic) {
  const provider = getProvider();
  const wallet = await Wallet.fromMnemonic(mnemonic, DERIVATION_PATH);
  wallet.connect(provider);
  return wallet;
}
