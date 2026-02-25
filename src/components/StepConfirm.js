"use client";

import NFTCard from "./NFTCard";

export default function StepConfirm({
  preview,
  name,
  description,
  beneficiary,
  loading,
  loadingStatus,
  error,
  onMint,
  onBack,
}) {
  return (
    <div className="slide-in-right space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Review & Mint</h2>
        <p className="text-sm text-purple-300/50">
          Hover the card to see metadata. Ready? Hit mint.
        </p>
      </div>

      <div className="py-4">
        <NFTCard image={preview} name={name} description={description} />
      </div>

      {beneficiary.trim() && (
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-[10px] uppercase tracking-widest text-cyan-400">Minting to</p>
            <p className="text-xs font-mono text-cyan-300/70 truncate">{beneficiary}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-3.5 rounded-xl border border-purple-500/20 text-purple-300 hover:bg-purple-500/5 transition-all text-sm font-medium disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={onMint}
          disabled={loading}
          className={`
            flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden
            ${
              loading
                ? "bg-purple-900/40 text-purple-300"
                : "bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 hover:from-purple-500 hover:via-purple-400 hover:to-cyan-400 text-white shadow-lg shadow-purple-500/25"
            }
          `}
        >
          {loading && <div className="absolute inset-0 shimmer" />}
          <span className="relative">
            {loading ? loadingStatus : "Mint NFT"}
          </span>
        </button>
      </div>
    </div>
  );
}
