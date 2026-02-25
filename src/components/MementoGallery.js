"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOINKEE_LOCATIONS } from "@/constants/gallery";
import PostCard from "./PostCard";

export default function MementoGallery({ selected, onSelect }) {
  const [activeRegion, setActiveRegion] = useState("All");

  const regions = useMemo(() => {
    const unique = [...new Set(MOINKEE_LOCATIONS.map((l) => l.region))];
    return ["All", ...unique.sort()];
  }, []);

  const filtered = useMemo(
    () =>
      activeRegion === "All"
        ? MOINKEE_LOCATIONS
        : MOINKEE_LOCATIONS.filter((l) => l.region === activeRegion),
    [activeRegion]
  );

  return (
    <section className="px-6 pb-32">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#4E31AA]/20 to-transparent" />
          <h2 className="text-sm font-mono text-white/25 uppercase tracking-[0.2em]">
            Tour Stops
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#4E31AA]/20 to-transparent" />
        </motion.div>

        {/* Region filter bar */}
        <div className="mb-8 -mx-6 px-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {regions.map((region) => {
              const isActive = activeRegion === region;
              const count =
                region === "All"
                  ? MOINKEE_LOCATIONS.length
                  : MOINKEE_LOCATIONS.filter((l) => l.region === region).length;

              return (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`
                    relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap
                    transition-all duration-300 border
                    ${
                      isActive
                        ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)] border-purple-400"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 border-white/10"
                    }
                  `}
                >
                  {region}
                  <span
                    className={`ml-1.5 text-[10px] ${
                      isActive ? "text-purple-200" : "text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid with layout animation */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((location, i) => (
                <PostCard
                  key={location.id}
                  location={location}
                  index={i}
                  isSelected={selected?.id === location.id}
                  onSelect={onSelect}
                />
              ))
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full py-20 text-center"
              >
                <p className="text-gray-500 text-sm">
                  No Moinkees visited this region yet.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
