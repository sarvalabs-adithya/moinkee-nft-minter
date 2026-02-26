"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X } from "lucide-react";

export default function ConnectWallet({ walletState, onConnect, onDisconnect }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setError("");
    setLoading(true);
    try {
      const { Wallet: MoiWallet } = await import("js-moi-sdk");
      const wallet = await MoiWallet.fromMnemonic(
        trimmed,
        "m/44'/6174'/7020'/0/0"
      );
      const id = await wallet.getIdentifier();
      const address = id.toHex();
      onConnect({ mnemonic: trimmed, address });
      setShowModal(false);
      setInput("");
    } catch (err) {
      setError("Invalid mnemonic. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (walletState) {
    const short = `${walletState.address.slice(0, 8)}...${walletState.address.slice(-6)}`;
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4E31AA]/10 border border-[#4E31AA]/20">
          <Wallet className="w-3 h-3 text-[#7B5FD4]" />
          <span className="text-[11px] font-mono text-[#7B5FD4]">{short}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="text-white/30 hover:text-white/60 text-[10px] transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4E31AA]/15 border border-[#4E31AA]/25 text-[#7B5FD4] text-xs font-medium hover:bg-[#4E31AA]/25 transition-all"
      >
        <Wallet className="w-3.5 h-3.5" />
        Connect Wallet
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong glow-purple w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold text-base">Connect Wallet</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-white/30 text-xs mb-4 leading-relaxed">
                Enter your 12-word MOI mnemonic to connect. This is a devnet demo
                — your mnemonic is sent to the server for signing.
              </p>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="word1 word2 word3 ... word12"
                rows={3}
                className="w-full rounded-xl bg-[#0D0D1A]/80 border border-[#4E31AA]/20 px-4 py-3 text-white placeholder-white/20 text-sm font-mono resize-none mb-3 transition-all"
                disabled={loading}
              />

              {error && (
                <div className="mb-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2">
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={loading || !input.trim()}
                className={`
                  w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2
                  ${loading || !input.trim()
                    ? "bg-[#4E31AA]/20 text-white/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#4E31AA] to-[#7B5FD4] text-white shadow-lg shadow-[#4E31AA]/25 hover:shadow-[#4E31AA]/40"
                  }
                `}
              >
                {loading ? "Connecting..." : "Connect"}
              </button>
            </motion.div>
          </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
