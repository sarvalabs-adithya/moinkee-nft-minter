"use client";

import { useEffect, useState, useMemo } from "react";

const EXPLORER_BASE = "https://dev.voyage.moi.technology/tx";

function ConfettiPiece({ delay, left, color }) {
  return (
    <div
      className="fixed w-2 h-2 rounded-sm pointer-events-none"
      style={{
        left: `${left}%`,
        top: "-10px",
        backgroundColor: color,
        animation: `confettiFall ${2 + Math.random() * 2}s linear ${delay}s forwards`,
        opacity: 0.8,
      }}
    />
  );
}

export default function MintSuccess({ txHash, metadataUri, image, name, onMintAnother }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(t);
  }, []);

  const colors = ["#a855f7", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6"];
  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.8,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
      })),
    []
  );

  return (
    <div className="fade-in">
      {confetti.map((p) => (
        <ConfettiPiece key={p.id} {...p} />
      ))}

      {showContent && (
        <div className="fade-in-up space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Minted!</h2>
            <p className="text-purple-300/60 text-sm">Your NFT is live on MOI devnet</p>
          </div>

          {image && (
            <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden glow-green border border-green-500/20">
              <img src={image} alt={name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-3">
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-green-400 mb-1.5">Metadata URI</p>
              <p className="text-green-300/80 text-xs font-mono break-all leading-relaxed">{metadataUri}</p>
            </div>

            <div className="glass rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-cyan-400 mb-1.5">Transaction Hash</p>
              <p className="text-cyan-300/80 text-xs font-mono break-all leading-relaxed">{txHash}</p>
              <a
                href={`${EXPLORER_BASE}/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group"
              >
                View on Voyage Explorer
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <button
            onClick={onMintAnother}
            className="w-full py-3 rounded-xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all text-sm font-medium"
          >
            Mint Another
          </button>
        </div>
      )}
    </div>
  );
}
