"use client";

import { createContext, useContext, useState, useEffect } from "react";

const WalletContext = createContext(null);

const STORAGE_KEY = "moinkee_wallet";

export function WalletProvider({ children }) {
  const [walletState, setWalletState] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setWalletState(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (walletState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(walletState));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [walletState, hydrated]);

  const connect = (state) => setWalletState(state);
  const disconnect = () => setWalletState(null);

  return (
    <WalletContext.Provider value={{ walletState, connect, disconnect, hydrated }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
