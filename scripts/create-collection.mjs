/**
 * Admin Setup Script — Creates a MAS1 NFT collection with high supply.
 *
 * Usage:
 *   ADMIN_MNEMONIC="your twelve word seed phrase" node scripts/create-collection.mjs
 */

import { VoyageProvider, Wallet, OpType, AssetStandard } from "js-moi-sdk";

const MNEMONIC = process.env.ADMIN_MNEMONIC;

if (!MNEMONIC) {
  console.error(
    'ERROR: Set ADMIN_MNEMONIC env var.\n' +
    'Usage: ADMIN_MNEMONIC="word1 word2 ... word12" node scripts/create-collection.mjs'
  );
  process.exit(1);
}

async function main() {
  console.log("Connecting to MOI Devnet...");
  const provider = new VoyageProvider("devnet");

  const path = "m/44'/6174'/7020'/0/0";
  const wallet = await Wallet.fromMnemonic(MNEMONIC, path);
  wallet.connect(provider);

  const adminAddress = wallet.identifier.toHex();
  console.log("Admin address:", adminAddress);
  console.log("Creating MAS1 collection: MOINFT, max_supply: 1000000");

  // Build the asset creation interaction manually to control max_supply
  // Use MAS1AssetLogic.create() as base, then patch max_supply before sending
  const { MAS1AssetLogic } = await import("js-moi-sdk");
  const ctx = MAS1AssetLogic.create(wallet, "MOINFT", adminAddress, true);
  ctx.ctx.payload.max_supply = 1000000;

  const ix = await ctx.send();

  console.log("Tx hash:", ix.hash);
  console.log("Waiting for receipt...");

  const receipt = await ix.wait();
  const assetId = receipt.ix_operations?.[0]?.data?.asset_id;

  console.log("\n" + "=".repeat(60));
  console.log("Collection deployed successfully!");
  console.log("=".repeat(60));
  console.log("ASSET_ID:", assetId);
  console.log("Supply:   1,000,000");
  console.log("\nAdd this to .env.local:");
  console.log(`NEXT_PUBLIC_ASSET_ID=${assetId}`);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Deployment failed:", err.message ?? err);
  process.exit(1);
});
