"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      touchMultiplier: 1,
    });

    return () => lenis.destroy();
  }, []);

  return children;
}
