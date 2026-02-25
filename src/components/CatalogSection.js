"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { MOINKEE_LOCATIONS, FOLDER_CID } from "@/constants/gallery";

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function CatalogSection({ onSelect }) {
  const [activeRegion, setActiveRegion] = useState("All");

  const regions = useMemo(() => {
    const unique = [
      ...new Set(
        MOINKEE_LOCATIONS.filter((l) => l.id !== "base").map((l) => l.region)
      ),
    ];
    return ["All", ...unique.sort()];
  }, []);

  const filtered = useMemo(() => {
    const all = MOINKEE_LOCATIONS.filter((l) => l.id !== "base");
    return activeRegion === "All"
      ? all
      : all.filter((l) => l.region === activeRegion);
  }, [activeRegion]);

  return (
    <section className="relative min-h-screen py-20 px-6 bg-gradient-to-b from-black via-[#16213E] to-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
          >
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Global Memento
            </span>{" "}
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Collection
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-white/25 text-sm mt-4 max-w-md mx-auto font-mono"
          >
            {MOINKEE_LOCATIONS.length} stops across every continent. Select to mint.
          </motion.p>
        </div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-10 overflow-x-auto scrollbar-hide -mx-6 px-6"
        >
          <div className="flex gap-2 min-w-max justify-center pb-2">
            {regions.map((region) => {
              const isActive = activeRegion === region;
              const count =
                region === "All"
                  ? MOINKEE_LOCATIONS.filter((l) => l.id !== "base").length
                  : MOINKEE_LOCATIONS.filter((l) => l.region === region).length;

              return (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`
                    px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest
                    transition-all duration-300 whitespace-nowrap border
                    ${
                      isActive
                        ? "bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-[0_0_14px_rgba(124,58,237,0.25)]"
                        : "bg-white/[0.04] text-white/35 hover:text-white/55 hover:bg-white/[0.07] border-white/10"
                    }
                  `}
                >
                  {region}
                  <span
                    className={`ml-1.5 text-[9px] ${
                      isActive ? "text-purple-400/70" : "text-white/20"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((loc, i) => (
            <CatalogCard
              key={loc.id}
              location={loc}
              index={i}
              onSelect={onSelect}
            />
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-24 text-center">
              <p className="text-white/25 text-sm font-mono">
                No Moinkees visited this region yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CatalogCard({ location, index, onSelect }) {
  const imageUrl = `${IPFS_GATEWAY}/${FOLDER_CID}/${location.fileName}`;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="group cursor-pointer"
      onClick={() => onSelect?.(location)}
    >
      <div
        className="
          relative overflow-hidden rounded-2xl border border-white/10
          bg-black/40 backdrop-blur-sm
          transition-all duration-300
          hover:scale-[1.02] hover:border-purple-500/40
          hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]
        "
      >
        {/* Image with blurred bg fill */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#0a0a18]">
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
          />
          <img
            src={imageUrl}
            alt={location.event}
            loading="lazy"
            className="relative w-full h-full object-contain z-10"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect fill='%230a0a18' width='400' height='500'/%3E%3Ctext fill='%234E31AA' font-family='monospace' font-size='12' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' opacity='0.4'%3EIMAGE_UNAVAILABLE%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10 pointer-events-none" />
        </div>

        {/* Info bar */}
        <div className="relative z-10 p-4 -mt-14 bg-gradient-to-t from-black via-black/90 to-transparent">
          <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
            {location.event}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1 text-white/30 text-[11px]">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{location.location}</span>
            </div>
            <div className="flex items-center gap-1 text-purple-400/70 text-[10px] font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-3 h-3" />
              Mint
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
