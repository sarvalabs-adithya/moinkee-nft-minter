# Deploying to Vercel

## 1. Environment variables

In **Vercel** → your project → **Settings** → **Environment Variables**, add:

| Name | Value | Notes |
|------|--------|--------|
| `NEXT_PUBLIC_ASSET_ID` | `0x10030001969ff1e706bb5b094d142009576c8174e0911dfa2e3688c100000000` | Your MAS1 asset ID (from create-collection script). |
| `NEXT_PUBLIC_FOLDER_CID` | Your Pinata folder CID | Optional; app has a default. |
| `ADMIN_MNEMONIC` | Your 12-word mnemonic | **Paste the full phrase** (e.g. `word1 word2 ... word12`). No quotes. Used only on the server. |
| `PINATA_JWT` | Your Pinata JWT | From Pinata dashboard. |

**Important:** `ADMIN_MNEMONIC` must be the complete 12-word phrase. If mint/token APIs fail with "Invalid mnemonic" or "Failed to load wallet", the value was truncated — re-paste it in Vercel (one line, space-separated).

## 2. Redeploy after changing env vars

After adding or editing variables, trigger a new deployment (**Deployments** → **⋯** on latest → **Redeploy**), or push a new commit.

## 3. Timeouts

`vercel.json` sets a 15s max duration for `/api/mint`, `/api/tokens`, and `/api/pinata`. On the Hobby plan the hard limit is 10s; if mint or token listing times out, consider the Pro plan or reducing work in those routes.

## 4. Build

Build command is `next build`. Ensure all `NEXT_PUBLIC_*` variables are set before building so the client bundle gets the right values.
