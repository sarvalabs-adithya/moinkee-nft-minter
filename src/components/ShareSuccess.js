"use client";

import { useMemo } from "react";
import { Share2 } from "lucide-react";

const EXPLORER_BASE = "https://dev.voyage.moi.technology/tx";

function ConfettiPiece({ delay, left, color }) {
  return (
    <div
      className="fixed w-2 h-2 rounded-sm pointer-events-none z-[60]"
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

export default function ShareSuccess({ txHash, metadataUri, conference, travelerName }) {
  const colors = ["#4E31AA", "#00F0FF", "#22c55e", "#f59e0b", "#ec4899", "#7B5FD4"];
  const confetti = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.6,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
      })),
    []
  );

  const shareText = encodeURIComponent(
    `Just claimed my Moinkee World Tour memento from ${conference}! 🐒✨\n\nMinted on @maboroshi_moi devnet.\n\n#MoinkeeWorldTour #MOI`
  );
  const shareUrl = `https://x.com/intent/tweet?text=${shareText}`;

  return (
    <>
      {confetti.map((p) => (
        <ConfettiPiece key={p.id} {...p} />
      ))}

      <div className="fade-in-up space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/25 mb-3 stamp-in">
            <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">Memento Claimed!</h3>
          <p className="text-white/30 text-xs mt-1">
            Welcome to the World Tour, <span className="text-[#00F0FF]/60">{travelerName}</span>.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="glass rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-green-400/70 mb-1">Metadata</p>
            <p className="text-white/50 text-[11px] font-mono break-all leading-relaxed">{metadataUri}</p>
          </div>

          <div className="glass rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-[#00F0FF]/70 mb-1">Transaction</p>
            <p className="text-white/50 text-[11px] font-mono break-all leading-relaxed">{txHash}</p>
            <a
              href={`${EXPLORER_BASE}/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-[11px] text-[#00F0FF]/60 hover:text-[#00F0FF] transition-colors"
            >
              View on Voyage Explorer →
            </a>
          </div>
        </div>

        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 text-sm font-medium hover:bg-white/[0.08] hover:border-white/20 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Share on X
        </a>
      </div>
    </>
  );
}
