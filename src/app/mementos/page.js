"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, ArrowLeft, Lock, ExternalLink, Share2,
  Globe, MapPin, Calendar, Shield, Zap, Award, Star,
} from "lucide-react";
import Link from "next/link";
import ConnectWallet from "@/components/ConnectWallet";
import { useWallet } from "@/context/WalletContext";
import { FOLDER_CID, MOINKEE_LOCATIONS } from "@/constants/gallery";

const IPFS_GATEWAY = "https://ipfs.io/ipfs";
const TOTAL_STOPS = MOINKEE_LOCATIONS.length;

const REGION_BADGES = {
  Asia: { icon: Globe, label: "Asia Explorer", color: "text-cyan-400" },
  Europe: { icon: Star, label: "Euro Trekker", color: "text-blue-400" },
  "North America": { icon: Zap, label: "NA Pioneer", color: "text-amber-400" },
  LatAm: { icon: Award, label: "LatAm Traveler", color: "text-emerald-400" },
  MENA: { icon: Shield, label: "MENA Voyager", color: "text-orange-400" },
  Africa: { icon: Globe, label: "Africa Scout", color: "text-pink-400" },
};

export default function MementosPage() {
  const { walletState, connect, disconnect, hydrated } = useWallet();
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);

  const fetchTokens = useCallback(async () => {
    if (!walletState?.mnemonic) return;
    setLoading(true);
    setError("");
    setTokens([]);

    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "owned", mnemonic: walletState.mnemonic }),
      });
      if (!res.ok) throw new Error("Failed to fetch tokens");
      const { tokens: owned } = await res.json();
      setTokens(owned || []);
    } catch (err) {
      setError(err.message || "Failed to load tokens");
    } finally {
      setLoading(false);
    }
  }, [walletState?.mnemonic]);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const ownedIds = useMemo(() => {
    const set = new Set();
    tokens.forEach((t) => {
      if (t.attributes?.event) {
        const match = MOINKEE_LOCATIONS.find((l) => l.event === t.attributes.event);
        if (match) set.add(match.id);
      }
    });
    return set;
  }, [tokens]);

  const ownedRegions = useMemo(() => {
    const regions = new Set();
    ownedIds.forEach((id) => {
      const loc = MOINKEE_LOCATIONS.find((l) => l.id === id);
      if (loc) regions.add(loc.region);
    });
    return regions;
  }, [ownedIds]);

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    const loc = MOINKEE_LOCATIONS.find((l) => l.id === activeId);
    if (!loc) return null;
    const owned = ownedIds.has(activeId);
    const token = owned
      ? tokens.find((t) => t.attributes?.event === loc.event)
      : null;
    return { ...loc, owned, token };
  }, [activeId, ownedIds, tokens]);

  const pct = TOTAL_STOPS > 0 ? Math.round((ownedIds.size / TOTAL_STOPS) * 100) : 0;

  return (
    <div className="h-screen flex flex-col bg-[#08080f] overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a14] via-[#08080f] to-[#0c0a18]" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="flex-shrink-0 h-12 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center px-5 gap-4 z-30">
        <Link href="/" className="flex items-center gap-2 text-white/35 hover:text-white/60 transition-colors text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-mono">Globe</span>
        </Link>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <img src="/moi.png" alt="MOI" className="w-6 h-6 rounded object-contain" />
          <span className="text-xs font-mono text-white/50 tracking-wider uppercase">Cyberdeck Inventory</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {walletState?.mnemonic && (
            <button onClick={fetchTokens} disabled={loading} className="p-1.5 rounded text-white/25 hover:text-white/60 transition-all disabled:opacity-30">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
          <ConnectWallet
            walletState={walletState}
            onConnect={connect}
            onDisconnect={() => { disconnect(); setTokens([]); setActiveId(null); }}
            hydrated={hydrated}
          />
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left — Inventory grid (40%) */}
        <div className="w-[40%] flex flex-col border-r border-white/5 min-h-0">
          {/* Player stats bar */}
          <div className="flex-shrink-0 px-5 py-4 border-b border-white/5 bg-black/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/30">
                Traveler Level
              </span>
              <span className="text-[10px] font-mono text-purple-400/80">
                {ownedIds.size} / {TOTAL_STOPS}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(REGION_BADGES).map(([region, badge]) => {
                const earned = ownedRegions.has(region);
                const Icon = badge.icon;
                return (
                  <div
                    key={region}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider transition-all ${
                      earned
                        ? `bg-white/5 border border-white/10 ${badge.color}`
                        : "bg-transparent border border-white/[0.04] text-white/15"
                    }`}
                    title={badge.label}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden lg:inline">{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
            {loading && tokens.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-400/40" />
              </div>
            )}
            {error && (
              <div className="m-2 rounded-lg bg-red-500/10 border border-red-500/20 p-2">
                <p className="text-red-400 text-[10px] font-mono">{error}</p>
              </div>
            )}
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-1.5">
              {MOINKEE_LOCATIONS.map((loc) => {
                const owned = ownedIds.has(loc.id);
                const isActive = activeId === loc.id;
                const imgUrl = `${IPFS_GATEWAY}/${FOLDER_CID}/${loc.fileName}`;
                return (
                  <motion.button
                    key={loc.id}
                    onClick={() => setActiveId(loc.id)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                      isActive
                        ? "ring-2 ring-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.35)]"
                        : owned
                          ? "ring-1 ring-purple-500/40 hover:ring-purple-500/80 hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                          : "ring-1 ring-dashed ring-white/[0.06] hover:ring-white/15"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={loc.event}
                      className={`w-full h-full object-cover transition-all ${
                        owned ? "" : "grayscale brightness-[0.3]"
                      }`}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                    {!owned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Lock className="w-3 h-3 text-white/20" />
                      </div>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="slot-highlight"
                        className="absolute inset-0 border-2 border-purple-400 rounded-lg pointer-events-none"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — Inspector (60%) */}
        <div className="w-[60%] flex items-center justify-center min-h-0 overflow-hidden bg-[#0a0a12]">
          <AnimatePresence mode="wait">
            {!activeItem ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center px-8"
              >
                {/* Wireframe globe */}
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 rounded-full border border-white/[0.06] animate-spin" style={{ animationDuration: "20s" }} />
                  <div className="absolute inset-3 rounded-full border border-dashed border-white/[0.04] animate-spin" style={{ animationDuration: "30s", animationDirection: "reverse" }} />
                  <div className="absolute inset-6 rounded-full border border-white/[0.03]" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.04] -translate-x-1/2" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.04] -translate-y-1/2" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white/10" />
                  </div>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20 mb-2">
                  Select a memento to analyze
                </p>
                <p className="text-white/10 text-xs max-w-[240px]">
                  Click any slot on the left to inspect its details.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col w-full h-full overflow-y-auto"
              >
                {/* Artwork */}
                <div className="relative flex-shrink-0 w-full flex justify-center bg-black/40 border-b border-white/5">
                  <div className="relative max-h-[420px] w-full">
                    <img
                      src={`${IPFS_GATEWAY}/${FOLDER_CID}/${activeItem.fileName}`}
                      alt={activeItem.event}
                      className={`w-full h-full max-h-[420px] object-contain ${
                        activeItem.owned ? "" : "grayscale brightness-50"
                      }`}
                    />
                    {/* Scanlines */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-60"
                      style={{
                        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)",
                      }}
                    />
                    {/* Status badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-md backdrop-blur-md text-[9px] font-mono uppercase tracking-wider ${
                      activeItem.owned
                        ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                        : "bg-white/5 border border-white/10 text-white/30"
                    }`}>
                      {activeItem.owned ? "Collected" : "Locked"}
                    </div>
                    {/* Passport stamp if owned */}
                    {activeItem.owned && (
                      <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full border-2 border-dashed border-purple-400/40 flex flex-col items-center justify-center -rotate-12 opacity-70">
                        <span className="text-[7px] font-mono uppercase text-purple-400/80 tracking-wider">Verified</span>
                        <span className="text-[9px] font-mono font-bold text-purple-400">2026</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details panel */}
                <div className="flex-1 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-white mb-1">{activeItem.event}</h2>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <MapPin className="w-3 h-3" />
                        <span>{activeItem.location}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                      activeItem.owned ? "text-purple-400 bg-purple-500/10" : "text-white/20 bg-white/5"
                    }`}>
                      {activeItem.region}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-white/30 text-xs leading-relaxed mb-6">
                    {activeItem.description}
                  </p>

                  {/* Floating metadata */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-white/25 block mb-1">Date</span>
                      <span className="text-white/60 text-sm font-mono">2026</span>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-white/25 block mb-1">Coordinates</span>
                      <span className="text-white/60 text-xs font-mono">
                        {activeItem.lat?.toFixed(2)}, {activeItem.lng?.toFixed(2)}
                      </span>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-white/25 block mb-1">Network</span>
                      <span className="text-white/60 text-xs font-mono">MOI Devnet</span>
                    </div>
                    {activeItem.token && (
                      <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-white/25 block mb-1">Token ID</span>
                        <span className="text-white/60 text-xs font-mono">#{activeItem.token.tokenId}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {activeItem.owned ? (
                      <>
                        <a
                          href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                            `I collected the ${activeItem.event} Moinkee Memento on @MOINetwork! ✈️🐒 #MoinkeeTour`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                          Share Flex
                        </a>
                        {activeItem.token?.tokenId != null && (
                          <a
                            href={`https://voyage.moi.technology/interaction/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 hover:text-white/80 transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Explorer
                          </a>
                        )}
                      </>
                    ) : (
                      <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm font-medium hover:bg-white/10 hover:text-white/70 transition-all"
                      >
                        <Globe className="w-4 h-4" />
                        Go to Mint
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
