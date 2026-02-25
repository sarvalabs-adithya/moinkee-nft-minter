"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, MapPin, Calendar, Hash } from "lucide-react";

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export default function ViewTokens({ mnemonic }) {
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [amount, setAmount] = useState(null);
  const [error, setError] = useState("");
  const [flipped, setFlipped] = useState(new Set());

  const toggleFlip = (tokenId) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(tokenId)) next.delete(tokenId);
      else next.add(tokenId);
      return next;
    });
  };

  const fetchTokens = useCallback(async () => {
    if (!mnemonic) return;
    setLoading(true);
    setError("");
    setTokens([]);

    try {
      const listRes = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list", mnemonic }),
      });
      if (!listRes.ok) throw new Error("Failed to fetch TDU");
      const { amount: count } = await listRes.json();
      setAmount(count);

      if (count === 0) {
        setLoading(false);
        return;
      }

      const fetched = [];
      for (let tokenId = 0; tokenId < count; tokenId++) {
        try {
          const metaRes = await fetch("/api/tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "metadata", mnemonic, tokenId }),
          });
          if (!metaRes.ok) continue;
          const { uri } = await metaRes.json();
          if (!uri) continue;

          const cid = uri.replace("ipfs://", "");
          const jsonRes = await fetch(`${IPFS_GATEWAY}/${cid}`);
          if (!jsonRes.ok) continue;
          const metadata = await jsonRes.json();

          fetched.push({ tokenId, uri, ...metadata });
        } catch {
          fetched.push({ tokenId, name: `Token #${tokenId}`, error: true });
        }
      }
      setTokens(fetched);
    } catch (err) {
      setError(err.message || "Failed to load tokens");
    } finally {
      setLoading(false);
    }
  }, [mnemonic]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  if (!mnemonic) return null;

  return (
    <section className="px-6 pb-24 pt-12" id="wallet-section">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#4E31AA]/30 to-transparent" />
          <h2 className="text-sm font-mono text-white/40 uppercase tracking-[0.25em]">
            My Mementos
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#4E31AA]/30 to-transparent" />
          <button
            onClick={fetchTokens}
            disabled={loading}
            className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-30"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading && tokens.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 text-white/30 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading your mementos...
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-8">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && amount === 0 && (
          <div className="text-center py-20">
            <p className="text-white/30 text-sm">No mementos yet. Mint your first one above!</p>
          </div>
        )}

        {tokens.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tokens.map((token, i) => {
              const imageUrl = token.image
                ? token.image.startsWith("ipfs://")
                  ? `${IPFS_GATEWAY}/${token.image.replace("ipfs://", "")}`
                  : token.image
                : null;
              const isFlipped = flipped.has(token.tokenId);

              return (
                <motion.div
                  key={token.tokenId}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex justify-center"
                >
                  <div
                    className="relative w-full max-w-[260px] aspect-[3/4] cursor-pointer [perspective:1200px]"
                    onClick={() => toggleFlip(token.tokenId)}
                  >
                    <div
                      className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
                      style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                    >
                      {/* Front — Postcard (NFT image) */}
                      <div
                        className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10 [backface-visibility:hidden]"
                        style={{ transform: "rotateY(0deg)" }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={token.name || `Token #${token.tokenId}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='533' viewBox='0 0 400 533'%3E%3Crect fill='%231A1A2E' width='400' height='533'/%3E%3Ctext fill='%234E31AA' font-family='system-ui' font-size='16' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EMemento%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1A1A2E] flex items-center justify-center">
                            <span className="text-[#4E31AA]/60 text-sm">Memento</span>
                          </div>
                        )}
                        {/* Postcard stamp hint */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-white/20 text-[10px] font-mono">
                          <span>Click to flip</span>
                        </div>
                      </div>

                      {/* Back — Name + metadata */}
                      <div
                        className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-[#1A1A2E] via-[#0D0D1A] to-[#1A1A2E] border border-white/10 p-6 flex flex-col justify-center"
                      >
                        <h3 className="text-white font-bold text-lg leading-tight mb-4 line-clamp-3">
                          {token.name || `Token #${token.tokenId}`}
                        </h3>
                        <div className="space-y-3 text-sm">
                          {token.attributes?.event && (
                            <div className="flex items-center gap-2 text-white/60">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#4E31AA]/80" />
                              <span className="truncate">{token.attributes.event}</span>
                            </div>
                          )}
                          {token.attributes?.location && (
                            <div className="flex items-center gap-2 text-white/50 text-xs">
                              <MapPin className="w-3 h-3 flex-shrink-0 text-cyan-500/60" />
                              <span>{token.attributes.location}</span>
                            </div>
                          )}
                          {token.attributes?.date && (
                            <div className="flex items-center gap-2 text-white/40 text-xs">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span>{token.attributes.date}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-auto pt-4 flex items-center gap-2 text-white/25 text-xs font-mono">
                          <Hash className="w-3 h-3" />
                          <span>Token #{token.tokenId}</span>
                        </div>
                        <p className="mt-2 text-white/15 text-[10px] font-mono">Click to flip back</p>
                      </div>
                    </div>

                    {/* Subtle glow */}
                    <div
                      className="absolute -inset-1 rounded-[1.25rem] bg-gradient-to-br from-purple-500/10 to-cyan-500/5 -z-10 blur-sm opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                      aria-hidden
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
