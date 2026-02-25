"use client";

export default function StepDetails({
  name,
  setName,
  description,
  setDescription,
  beneficiary,
  setBeneficiary,
  onNext,
  onBack,
}) {
  const canProceed = name.trim().length > 0;

  return (
    <div className="slide-in-right space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">NFT Details</h2>
        <p className="text-sm text-purple-300/50">Name your creation and add a description</p>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-purple-300 uppercase tracking-wider">
              Name <span className="text-red-400">*</span>
            </label>
            <span className="text-[10px] text-purple-500/50 font-mono">{name.length}/64</span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 64))}
            placeholder="e.g. Moinkee #001"
            className="w-full rounded-xl bg-[#0a0a18]/80 border border-purple-700/30 px-4 py-3 text-white placeholder-purple-600/40 text-sm transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-purple-300 uppercase tracking-wider">
              Description
            </label>
            <span className="text-[10px] text-purple-500/50 font-mono">{description.length}/256</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 256))}
            placeholder="Tell the story behind this NFT..."
            rows={3}
            className="w-full rounded-xl bg-[#0a0a18]/80 border border-purple-700/30 px-4 py-3 text-white placeholder-purple-600/40 text-sm resize-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-purple-300 uppercase tracking-wider mb-2">
            Mint To
            <span className="ml-2 text-[10px] normal-case tracking-normal text-purple-500/40 font-normal">
              optional — defaults to admin wallet
            </span>
          </label>
          <input
            type="text"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            placeholder="0x... recipient address"
            className="w-full rounded-xl bg-[#0a0a18]/80 border border-purple-700/30 px-4 py-3 text-white placeholder-purple-600/40 text-sm font-mono transition-all"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-purple-500/20 text-purple-300 hover:bg-purple-500/5 transition-all text-sm font-medium"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`
            flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300
            ${
              canProceed
                ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/20"
                : "bg-purple-900/20 text-purple-500/40 cursor-not-allowed"
            }
          `}
        >
          Review
        </button>
      </div>
    </div>
  );
}
