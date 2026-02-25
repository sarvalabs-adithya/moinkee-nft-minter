"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import HoloGlobe from "@/components/HoloGlobe";
import HoverProjection from "@/components/HoverProjection";
import CatalogSection from "@/components/CatalogSection";
import MintPanel from "@/components/MintPanel";
import MintModal from "@/components/MintModal";

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [walletState, setWalletState] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <>
      {/* ── Full-screen globe background ── */}
      <HoloGlobe
        onHover={setHoveredItem}
        onSelect={setSelected}
        activeRegion="All"
      />

      {/* ── Navbar ── */}
      <Navbar
        walletState={walletState}
        onConnect={setWalletState}
        onDisconnect={() => setWalletState(null)}
      />

      {/* ── Title overlay ── */}
      <div className="fixed top-20 left-6 z-10 pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400/60" />
            <span className="holo-readout">Digital Passport Collection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            <span className="text-white/90">Moinkee</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              World Tour
            </span>
          </h1>
          <p className="text-white/20 text-xs mt-3 max-w-[240px] font-mono leading-relaxed">
            Hover a marker to preview. Click to mint your memento on MOI.
          </p>
        </motion.div>
      </div>

      {/* ── Holographic projection on hover ── */}
      <HoverProjection item={hoveredItem} />

      {/* ── "View Full Collection" CTA ── */}
      {!selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20"
        >
          <button
            onClick={() => {
              const el = document.getElementById("catalog-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="group flex items-center gap-2.5 px-6 py-3 rounded-full
              bg-white/10 backdrop-blur-md border border-white/20
              text-white text-xs font-bold uppercase tracking-widest
              transition-all duration-300
              hover:bg-white/20 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(0,247,255,0.15)]"
          >
            View Full Collection
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </motion.div>
      )}

      {/* ── Mint: modal when selected, bottom panel when no selection ── */}
      <div id="mint-panel">
        {selected ? (
          <MintModal
            selected={selected}
            onClose={() => setSelected(null)}
            mnemonic={walletState?.mnemonic}
            walletState={walletState}
            onConnect={setWalletState}
            onDisconnect={() => setWalletState(null)}
          />
        ) : (
          <MintPanel
            selected={null}
            onClearSelection={() => {}}
            mnemonic={walletState?.mnemonic}
          />
        )}
      </div>

      {/* ── Below-fold content ── */}
      <div className="relative z-10 mt-[100vh]">
        {/* Gradient transition from globe into catalog */}
        <div className="h-32 bg-gradient-to-b from-transparent to-black" />

        {/* Catalog grid */}
        <div id="catalog-section">
          <CatalogSection onSelect={setSelected} />
        </div>

        {/* Footer */}
        <div className="bg-black">
          <footer className="pb-24 pt-6 text-center">
            <div className="h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent mb-6" />
            <p className="text-white/15 text-xs">
              Built on{" "}
              <a
                href="https://moi.technology"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-500/30 hover:text-cyan-500/60 transition-colors"
              >
                MOI
              </a>
              {" "}· MAS1 · IPFS via Pinata
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
