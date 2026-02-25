"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { FOLDER_CID } from "@/constants/gallery";

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export default function PostCard({ location, isSelected, onSelect, index }) {
  const imageUrl = `${IPFS_GATEWAY}/${FOLDER_CID}/${location.fileName}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className="group cursor-pointer"
      onClick={() => onSelect(location)}
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl transition-all duration-300
          ${isSelected
            ? "ring-4 ring-purple-500 glow-purple"
            : "ring-1 ring-white/[0.06] hover:ring-purple-500/40"
          }
        `}
      >
        {/* Postcard image */}
        <div className="relative h-44 overflow-hidden bg-[#1A1A2E]">
          <img
            src={imageUrl}
            alt={location.event}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect fill='%231A1A2E' width='400' height='240'/%3E%3Ctext fill='%234E31AA' font-family='system-ui' font-size='14' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EMoinkee%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D1A] via-transparent to-transparent" />

          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="stamp-in px-4 py-2 rounded-lg border-2 border-purple-400/80 bg-purple-500/20 backdrop-blur-sm rotate-[-6deg]">
                <span className="text-purple-200 text-xs font-bold uppercase tracking-widest">
                  Selected
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Postcard content */}
        <div className="p-4 bg-[#0D0D1A]/95 border-t border-white/5">
          <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-purple-300 transition-colors">
            {location.event}
          </h3>
          <div className="flex items-center gap-1 text-white/30 text-xs">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{location.location}</span>
          </div>
          <p className="text-white/25 text-[11px] mt-2 line-clamp-2">
            {location.description}
          </p>

          <button
            type="button"
            className={`
              mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-all duration-300
              ${isSelected
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-[#4E31AA]/10 text-[#7B5FD4] border border-[#4E31AA]/20 group-hover:bg-[#4E31AA]/20"
              }
            `}
          >
            {isSelected ? "✓ Selected" : "Select Memento"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
