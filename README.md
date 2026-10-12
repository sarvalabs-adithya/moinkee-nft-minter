# Moinkee World Tour mementos

A Next.js site where visitors mint a memento NFT on MOI devnet: a photo from a Moinkee event, pinned to IPFS through Pinata, minted from the site's own wallet into the visitor's devnet wallet. A Three.js globe shows where the tour went.

**Status (October 2026):** live at moinkee-nft-minter.vercel.app on Vercel, code unchanged since February 2026, programme inactive. Devnet only. The chain SDK pinned here (js-moi-sdk 0.7.0-rc8) predates the devnet 0.13.0 upgrade, which changed asset ids and fees, so test one mint before relying on the site.

## Pick it up

Nothing here is tied to the previous owner once you have your own wallet, collection and Pinata account.

1. **A minting wallet.** Any MOI devnet wallet. Create one in MOI Wallet, fund it at the Voyage faucet (https://voyage.moi.technology/faucet/), keep its 12 words.
2. **A collection.** From the repo, with the wallet's words in the environment:

   ```bash
   ADMIN_MNEMONIC="word1 ... word12" node scripts/create-collection.mjs
   ```

   It prints the asset id. That is `NEXT_PUBLIC_ASSET_ID`.
3. **A Pinata account.** Make an API key with pinning rights and copy its JWT. Pinata holds every image and every token's metadata; the gallery and the recovery flow read from it.
4. **The environment.** Copy `.env.example` to `.env.local` and fill the four values. On Vercel, set the same four under the project's Environment Variables (see `docs/VERCEL.md`), then redeploy; the `NEXT_PUBLIC_` ones are baked in at build.
5. **Run or deploy.** `npm install` and `npm run dev` locally. For production, push to `main`: the Vercel project builds it. There is no CI; run `npm run lint` yourself.

## After a devnet reset

A reset wipes the collection and every minted token. Pinata keeps the metadata, so the mementos can be minted again to their owners.

1. Create a new collection (step 2 above), set the new `NEXT_PUBLIC_ASSET_ID` on Vercel, redeploy.
2. On your own machine, follow `docs/pinata-recovery.md`: set `RECOVERY_SECRET` in `.env.local`, start the dev server, call `/api/recover` to pull every pinned metadata file, then `/api/reload` to mint each one again. The three recovery routes refuse to run unless the secret is set and sent in the `x-recovery-secret` header, and the secret must never be set on Vercel: the reload route mints from the admin wallet.

## How a mint works

The visitor uploads a photo and fills the details; `/api/pinata` pins the image and a metadata JSON to Pinata; `/api/mint` mints the token from the admin wallet to the visitor's address. The visitor's wallet is a devnet wallet they paste into the site, so this is a demo flow for test funds only; never use a real wallet with it. `/api/tokens` lists a wallet's mementos by reading each token's metadata URI from the chain (`docs/getTDU-token-ids-issue.md` explains the SDK limit this works around).

## Files worth knowing

- `scripts/create-collection.mjs`: creates the MAS1 collection from `ADMIN_MNEMONIC`.
- `scripts/getTdu.mjs`: prints a wallet's token balances (reads `MNEMONIC`).
- `src/lib/utils.js`: the provider (devnet), the admin wallet and the derivation path.
- `src/lib/moi.js`: mint, token reads, asset info.
- `src/constants/gallery.js`: the gallery images, keyed to `NEXT_PUBLIC_FOLDER_CID`.
- `docs/VERCEL.md`: hosting and environment. `docs/pinata-recovery.md`: the reset recovery.

## What has to move when the owner changes

- The Vercel project (or deploy the repo fresh on a company Vercel account and set the four variables).
- The Pinata account, or re-pin its files under a new one: the CIDs stay the same, so the gallery and recovery keep working as long as the files are pinned somewhere.
- The repo itself. The wallet does not need to move; make a new one and a new collection.
