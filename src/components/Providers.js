"use client";

import { WalletProvider } from "@/context/WalletContext";

export default function Providers({ children }) {
  return <WalletProvider>{children}</WalletProvider>;
}
