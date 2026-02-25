"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, ExternalLink, Check, Lock } from "lucide-react";
import { FOLDER_CID } from "@/constants/gallery";
import ConnectWallet from "./ConnectWallet";

const EXPLORER_BASE = "https://voyage.moi.technology/interaction";
const IPFS_GATEWAY = "https://ipfs.io/ipfs";

const LOG_LINES = [
  "> Initializing handshake...",
  "> Uploading metadata to IPFS...",
  "> Confirming block...",
];

export default function MintModal({ selected, onClose, mnemonic, walletState, onConnect, onDisconnect }) {
  const [travelerName, setTravelerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [mintedImageUrl, setMintedImageUrl] = useState("");
  const [mintedEvent, setMintedEvent] = useState("");
  const [typedLog, setTypedLog] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  const imageUrl = selected
    ? `${IPFS_GATEWAY}/${FOLDER_CID}/${selected.fileName}`
    : "";

  // Typewriter effect for system log
  useEffect(() => {
    if (!loading || currentLineIndex >= LOG_LINES.length) return;
    const line = LOG_LINES[currentLineIndex];
    if (currentCharIndex <= line.length) {
      const t = setTimeout(() => {
        setTypedLog((prev) => {
          const next = [...prev];
          if (!next[currentLineIndex]) next[currentLineIndex] = "";
          next[currentLineIndex] = line.slice(0, currentCharIndex);
          return next;
        });
        setCurrentCharIndex((i) => i + 1);
      }, 35);
      return () => clearTimeout(t);
    } else {
      setCurrentLineIndex((i) => i + 1);
      setCurrentCharIndex(0);
    }
  }, [loading, currentLineIndex, currentCharIndex]);

  const handleMint = async () => {
    if (!selected || !travelerName.trim() || !mnemonic) return;
    setError("");
    setLoading(true);
    setStepIndex(0);
    setTypedLog([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);

    try {
      setStepIndex(0);
      const year = new Date().getFullYear();
      const metadata = {
        name: `${travelerName.trim()}'s ${selected.event} Memento`,
        description: selected.description,
        image: `ipfs://${FOLDER_CID}/${selected.fileName}`,
        attributes: {
          event: selected.event,
          location: selected.location,
          date: String(year),
        },
      };

      setStepIndex(1);
      const pinataRes = await fetch("/api/pinata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });
      if (!pinataRes.ok) throw new Error("Failed to pin metadata to IPFS");
      const { IpfsHash: metadataCid } = await pinataRes.json();

      setStepIndex(2);
      const mintRes = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadataCid, mnemonic }),
      });
      if (!mintRes.ok) {
        const errData = await mintRes.json().catch(() => ({}));
        throw new Error(errData.error || "Mint failed");
      }
      const { hash } = await mintRes.json();

      setTxHash(hash);
      setMintedImageUrl(`${IPFS_GATEWAY}/${FOLDER_CID}/${selected.fileName}`);
      setMintedEvent(selected.event);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setStepIndex(0);
    }
  };

  const handleClose = () => {
    if (txHash) {
      setTxHash("");
      setTravelerName("");
      setMintedImageUrl("");
      setMintedEvent("");
      setError("");
      onClose?.();
    } else {
      onClose?.();
    }
  };

  if (!selected) return null;

  const year = new Date().getFullYear();
  const latLng =
    selected.lat != null && selected.lng != null
      ? `${Number(selected.lat).toFixed(4)}, ${Number(selected.lng).toFixed(4)}`
      : "—";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto overflow-x-auto"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl min-w-0 h-[600px] max-h-[90vh] flex overflow-hidden rounded-2xl bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 shadow-2xl"
          style={{ maxWidth: "min(1024px, calc(100vw - 2rem))" }}
        >
          {/* Left column — THE ART (60%) */}
          <div className="relative w-[60%] min-w-0 flex-shrink-0 min-h-0 bg-black overflow-hidden">
            <img
              src={imageUrl}
              alt={selected.event}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%231a1a2e' width='400' height='400'/%3E%3Ctext fill='%234E31AA' font-family='system-ui' font-size='14' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EArt%3C/text%3E%3C/svg%3E";
              }}
            />
            {/* Scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-80"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 0, 0, 0.15) 2px,
                  rgba(0, 0, 0, 0.15) 4px
                )`,
              }}
            />
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Right column — THE TERMINAL (40%) */}
          <div className="relative w-[40%] min-w-[280px] flex flex-col font-mono bg-[#0a0a0a]/95 border-l border-white/10 min-h-0 overflow-y-auto flex-shrink-0">
            {/* State: No wallet — Connect to mint */}
            {!mnemonic && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col flex-1 items-center justify-center p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">
                  MINTING TERMINAL // {selected.event}
                </p>
                <h3 className="text-xl font-bold text-white mb-2">
                  Connect your wallet
                </h3>
                <p className="text-white/40 text-sm mb-8 max-w-[240px]">
                  Connect your wallet to mint this memento and add it to your digital passport.
                </p>
                <div className="w-full max-w-[240px]">
                  <ConnectWallet
                    walletState={walletState}
                    onConnect={onConnect}
                    onDisconnect={onDisconnect}
                  />
                </div>
              </motion.div>
            )}

            {/* State C: Success */}
            {mnemonic && txHash && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col flex-1 items-center justify-center p-8 pb-12 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.25)]">
                  <Check className="w-10 h-10 text-emerald-400" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-emerald-400 tracking-wider mb-2">
                  MEMENTO SECURED
                </h3>
                <p className="text-white/40 text-sm mb-8">
                  Your digital passport is on the MOI network.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-[240px]">
                  <a
                    href={`${EXPLORER_BASE}/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/15 hover:border-white/30 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Explorer
                  </a>
                  <a
                    href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                      `I just collected the ${mintedEvent} Moinkee Memento on @MOINetwork! ✈️🐒 #MoinkeeTour`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/15 hover:border-white/30 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </a>
                </div>
                <button
                  onClick={handleClose}
                  className="mt-6 text-white/35 text-xs hover:text-white/60 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            )}

            {/* State B: Processing — System Log */}
            {mnemonic && !txHash && loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-1 flex-col justify-center p-8"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 mb-6">
                  System log
                </p>
                <div className="space-y-2 text-sm text-emerald-400/90">
                  {typedLog.map((line, i) => (
                    <div key={i} className="font-mono">
                      {line}
                      {i === typedLog.length - 1 && (
                        <span className="animate-pulse">▌</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* State A: Idle — Form + Mint */}
            {mnemonic && !txHash && !loading && (
              <motion.div
                initial={false}
                animate={{ opacity: 1 }}
                className="flex flex-col flex-1 min-h-0 p-8 pb-12"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-6 flex-shrink-0">
                  MINTING TERMINAL // {selected.event}
                </p>

                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 flex-shrink-0">
                  TRAVELER IDENTITY
                </label>
                <input
                  type="text"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value.slice(0, 48))}
                  placeholder="Your name or alias"
                  className="w-full flex-shrink-0 rounded-lg bg-white/5 border-l-4 border-purple-500 border border-white/10 border-l-purple-500 px-4 py-3.5 text-xl text-white placeholder-white/20 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                  disabled={loading}
                />

                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] uppercase tracking-wider text-white/30 flex-shrink-0">
                  <span>Date</span>
                  <span className="text-white/50">{year}</span>
                  <span>Lat / Lng</span>
                  <span className="text-white/50 font-mono">{latLng}</span>
                  <span>Network</span>
                  <span className="text-white/50">MOI Devnet</span>
                </div>

                {error && (
                  <div className="mt-4 flex-shrink-0 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                    <p className="text-red-400 text-xs font-mono">{error}</p>
                  </div>
                )}

                <div className="mt-8 pt-6 flex-shrink-0 pb-2">
                  <button
                    type="button"
                    onClick={handleMint}
                    disabled={!travelerName.trim()}
                    className="w-full h-14 rounded-xl font-semibold text-base font-mono bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Mint
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
