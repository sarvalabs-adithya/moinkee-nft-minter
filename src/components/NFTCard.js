"use client";

export default function NFTCard({ image, name, description }) {
  if (!image) return null;

  return (
    <div className="flip-card w-full max-w-[280px] aspect-[3/4] mx-auto">
      <div className="flip-card-inner relative w-full h-full">
        {/* Front */}
        <div className="flip-card-front absolute inset-0 glass glow-purple rounded-2xl overflow-hidden">
          <div className="relative w-full h-[70%]">
            <img
              src={image}
              alt={name || "NFT Preview"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c18] via-transparent to-transparent" />
          </div>
          <div className="p-4">
            <h3 className="text-white font-semibold text-base truncate">
              {name || "Untitled"}
            </h3>
            <p className="text-purple-400 text-xs mt-1 font-mono">MOI NFT</p>
          </div>
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-[10px] text-purple-300 font-mono">
            MAS1
          </div>
        </div>

        {/* Back */}
        <div className="flip-card-back absolute inset-0 glass glow-cyan rounded-2xl overflow-hidden p-5 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-cyan-400 mb-2">Metadata</p>
            <h3 className="text-white font-semibold text-lg mb-3">
              {name || "Untitled"}
            </h3>
            <p className="text-sm text-purple-200/70 leading-relaxed line-clamp-4">
              {description || "No description provided."}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span className="text-xs text-purple-300">Standard: MAS1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-xs text-cyan-300">Network: MOI Devnet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-green-300">Storage: IPFS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
