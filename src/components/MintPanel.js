"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Sparkles, Lock } from "lucide-react";
import { FOLDER_CID } from "@/constants/gallery";

const EXPLORER_BASE = "https://voyage.moi.technology/interaction";
const IPFS_GATEWAY = "https://ipfs.io/ipfs";

const STEPS = [
  "Generating Metadata...",
  "Uploading to IPFS...",
  "Minting on MOI...",
];

export default function MintPanel({ selected, onClearSelection, mnemonic }) {
  const [travelerName, setTravelerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [mintedImageUrl, setMintedImageUrl] = useState("");
  const [mintedEvent, setMintedEvent] = useState("");

  const handleMint = async () => {
    if (!selected || !travelerName.trim() || !mnemonic) return;
    setError("");
    setLoading(true);
    setStepIndex(0);

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

  const handleReset = () => {
    setTxHash("");
    setTravelerName("");
    setMintedImageUrl("");
    setMintedEvent("");
    setError("");
    onClearSelection?.();
  };

  // Success state
  if (txHash) {
    const shareText = encodeURIComponent(
      `I just collected the ${mintedEvent} Moinkee Memento on @MOINetwork! ✈️🐒 #MoinkeeTour`
    );
    const shareUrl = `https://x.com/intent/tweet?text=${shareText}`;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-[#4E31AA]/20"
        >
          <div className="max-w-lg mx-auto px-6 py-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 mb-3">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Memento minted!</h3>
              <p className="text-white/40 text-sm">Your digital passport is on the MOI network.</p>
            </div>

            <div className="rounded-xl overflow-hidden bg-[#0D0D1A]/80 border border-white/5 mb-4">
              <img
                src={mintedImageUrl}
                alt="Minted memento"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect fill='%231A1A2E' width='400' height='200'/%3E%3Ctext fill='%234E31AA' font-family='system-ui' font-size='14' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EMemento%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            <div className="flex gap-3">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white/80 text-sm font-medium hover:bg-white/[0.1] hover:border-white/20 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share on X
              </a>
              <a
                href={`${EXPLORER_BASE}/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center py-3 rounded-xl bg-[#4E31AA]/20 border border-[#4E31AA]/30 text-[#7B5FD4] text-sm font-medium hover:bg-[#4E31AA]/30 transition-all"
              >
                View on Explorer
              </a>
            </div>

            <button
              onClick={handleReset}
              className="w-full mt-3 py-2.5 rounded-xl text-white/40 text-sm hover:text-white/60 hover:bg-white/5 transition-all"
            >
              Mint another
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // No wallet connected
  if (!mnemonic) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 py-4 px-6 text-center">
        <div className="inline-flex items-center gap-2 text-white/25 text-sm">
          <Lock className="w-3.5 h-3.5" />
          Connect your wallet to mint mementos.
        </div>
      </div>
    );
  }

  // No selection
  if (!selected) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 py-4 px-6 text-center">
        <p className="text-white/20 text-sm">Select a location above to mint your memento.</p>
      </div>
    );
  }

  // Form state
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-[#4E31AA]/20"
    >
      <div className="max-w-lg mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/50 text-sm font-mono">{selected.event} · {selected.location}</span>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-white/30 hover:text-white/60 text-xs"
          >
            Change location
          </button>
        </div>

        <label className="block text-[10px] font-mono text-[#4E31AA] uppercase tracking-widest mb-2">
          Traveler Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={travelerName}
          onChange={(e) => setTravelerName(e.target.value.slice(0, 48))}
          placeholder="Your name or alias"
          className="w-full rounded-xl bg-[#0D0D1A]/80 border border-[#4E31AA]/20 px-4 py-3 text-white placeholder-white/20 text-sm mb-4 transition-all"
          disabled={loading}
        />

        {loading && (
          <div className="flex items-center gap-3 mb-4 py-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= stepIndex ? "bg-purple-500" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-purple-300">{STEPS[stepIndex]}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleMint}
          disabled={loading || !travelerName.trim()}
          className={`
            w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2
            ${loading || !travelerName.trim()
              ? "bg-[#4E31AA]/20 text-white/40 cursor-not-allowed"
              : "bg-gradient-to-r from-[#4E31AA] to-[#7B5FD4] text-white shadow-lg shadow-[#4E31AA]/25 hover:shadow-[#4E31AA]/40"
            }
          `}
        >
          <Sparkles className="w-4 h-4" />
          Mint My Memento
        </button>
      </div>
    </motion.div>
  );
}
