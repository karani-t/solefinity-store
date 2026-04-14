"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "./contexts/CartContext";
import { ToastProvider } from "./components/Toast";
import { LastLoginTracker } from "./components/LastLoginTracker";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <ToastProvider>
          <LastLoginTracker />
          {children}
        </ToastProvider>
      </CartProvider>
    </SessionProvider>
  );
}