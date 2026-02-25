/**
 * Quick getTDU script — derives address from mnemonic and fetches TDU (token balances).
 *
 * Usage:
 *   node scripts/getTdu.mjs
 *   MNEMONIC="word1 word2 ..." node scripts/getTdu.mjs
 */

import { VoyageProvider, Wallet } from "js-moi-sdk";

const DERIVATION_PATH = "m/44'/6174'/7020'/0/0";

const MNEMONIC =
  process.env.MNEMONIC ||
  "decrease crime flip open skull recall token secret refuse ten twist fury";

async function main() {
  console.log("Connecting to MOI Devnet...");
  const provider = new VoyageProvider("devnet");

  const wallet = await Wallet.fromMnemonic(MNEMONIC, DERIVATION_PATH);
  wallet.connect(provider);

  const address = wallet.identifier.toHex();
  console.log("\nAddress:", address);

  const tdu = await provider.getTDU(address);
  console.log("\nTDU (Token Definition Units) — balances per asset:");
  console.log("─".repeat(60));
  if (tdu.length === 0) {
    console.log("  (none)");
  } else {
    for (const entry of tdu) {
      const amount =
        typeof entry.amount === "bigint"
          ? entry.amount.toString()
          : String(entry.amount);
      console.log("  asset_id:", entry.asset_id);
      console.log("  amount:  ", amount);
      console.log("  —");
    }
  }
  console.log("─".repeat(60));
  console.log("Total entries:", tdu.length);
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
