"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
      {/* Decorative grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(78,49,170,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(78,49,170,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4E31AA]/10 border border-[#4E31AA]/20 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span className="text-xs font-mono text-[#00F0FF]/80 tracking-wider uppercase">
            Digital Passport Collection
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          <span className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
            Collect the
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#4E31AA] via-[#7B5FD4] to-[#00F0FF] bg-clip-text text-transparent">
            World Tour.
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-base sm:text-lg text-white/35 max-w-xl mx-auto leading-relaxed"
        >
          Claim your permanent proof of attendance with Moinkee.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 flex items-center justify-center gap-6 text-xs text-white/20"
        >
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4E31AA]" />
            MAS1 Standard
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
            IPFS Metadata
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            MOI Devnet
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
