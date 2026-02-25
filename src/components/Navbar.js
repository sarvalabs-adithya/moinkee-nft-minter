"use client";

import { MapPin, Wallet } from "lucide-react";
import Link from "next/link";
import ConnectWallet from "./ConnectWallet";

export default function Navbar({ walletState, onConnect, onDisconnect }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/30 backdrop-blur-xl border-b border-cyan-500/8">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/moi.png" alt="MOI" className="w-8 h-8 rounded-lg object-contain" />
          <span className="text-sm font-bold tracking-tight">
            <span className="text-white/80">Moinkee</span>{" "}
            <span className="text-white/25">World Tour</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-white/20 font-mono">
            <MapPin className="w-3 h-3" />
            <span>50 stops</span>
            <span className="mx-1 text-cyan-500/30">|</span>
            <span>2026</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/8 border border-emerald-500/15">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400/60">devnet</span>
          </div>

          <Link
            href="/mementos"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4E31AA]/10 border border-[#4E31AA]/20 text-[#7B5FD4] text-[11px] font-medium hover:bg-[#4E31AA]/20 transition-all"
          >
            <Wallet className="w-3 h-3" />
            My Mementos
          </Link>

          <ConnectWallet
            walletState={walletState}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        </div>
      </div>
    </nav>
  );
}
