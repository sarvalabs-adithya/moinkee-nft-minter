"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FOLDER_CID } from "@/constants/gallery";

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export default function HoverProjection({ item }) {
  if (!item) return null;

  const imageUrl = `${IPFS_GATEWAY}/${FOLDER_CID}/${item.fileName}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-20 right-6 z-30 w-[340px] sm:w-[400px] lg:w-[460px] pointer-events-none"
      >
        <div className="relative bg-black/65 backdrop-blur-2xl border border-cyan-500/25 rounded-sm shadow-[0_0_40px_rgba(0,247,255,0.12),0_0_80px_rgba(0,247,255,0.04)] overflow-hidden">
          {/* Corner brackets */}
          <div className="holo-corner holo-corner--tl" />
          <div className="holo-corner holo-corner--tr" />
          <div className="holo-corner holo-corner--bl" />
          <div className="holo-corner holo-corner--br" />

          {/* Persistent scanlines overlay */}
          <div className="absolute inset-0 scanlines z-20" />

          {/* One-shot scan sweep */}
          <div className="absolute inset-0 scanline-sweep z-20" />

          {/* Header readout */}
          <div className="px-5 pt-5 pb-3 border-b border-cyan-500/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="holo-readout">
                SIGNAL LOCKED
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide leading-tight">
              {item.event}
            </h3>
            <p className="text-white/35 text-xs mt-0.5">{item.location}</p>
          </div>

          {/* Image */}
          <div className="relative flex items-center justify-center bg-black/40 max-h-[360px] overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <img
              src={imageUrl}
              alt={item.event}
              className="w-full h-auto max-h-[360px] object-contain opacity-90"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='460' height='460' viewBox='0 0 460 460'%3E%3Crect fill='%23050510' width='460' height='460'/%3E%3Ctext fill='%2300f7ff' font-family='monospace' font-size='12' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' opacity='0.4'%3EIMAGE_UNAVAILABLE%3C/text%3E%3C/svg%3E";
              }}
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Data readouts */}
          <div className="px-5 py-4 space-y-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              <ReadoutRow label="LAT" value={item.lat?.toFixed(4)} />
              <ReadoutRow label="LNG" value={item.lng?.toFixed(4)} />
              <ReadoutRow label="REGION" value={item.region} />
              <ReadoutRow label="STATUS" value="AVAILABLE" highlight />
            </div>

            <div className="pt-3 border-t border-cyan-500/10 mt-3">
              <p className="text-white/25 text-[10px] leading-relaxed line-clamp-2 font-mono">
                {item.description}
              </p>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ReadoutRow({ label, value, highlight }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="holo-readout">{label}</span>
      <span className="flex-1 border-b border-dotted border-cyan-500/10" />
      <span
        className={`font-mono text-[11px] tracking-wide ${
          highlight ? "text-emerald-400/80" : "text-cyan-300/70"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
