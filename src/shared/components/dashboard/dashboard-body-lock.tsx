"use client";

import { useEffect } from "react";

/**
 * Locks the document root to prevent a second native scrollbar from appearing
 * alongside the dashboard's own overflow-y-auto scroll container.
 */
export function DashboardBodyLock() {
  useEffect(() => {
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, []);

  return null;
}
