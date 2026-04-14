"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function LastLoginTracker() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      // Track last login - This component ensures user login is tracked
      // Actual implementation would log to audit trail or use timestamps
      localStorage.setItem(
        `lastLogin_${session.user.id}`,
        new Date().toISOString()
      );
    }
  }, [session]);

  return null;
}
