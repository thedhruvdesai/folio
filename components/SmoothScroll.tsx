"use client";

import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const LenisCtx = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisCtx);

/** Smooth-scrolls to a selector (e.g. "#quote"); falls back to native scrolling. */
export function useScrollTo() {
  const lenis = useLenis();
  return useCallback(
    (target: string) => {
      const el = document.querySelector<HTMLElement>(target);
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: -64, duration: 1.6 });
      else el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", target);
    },
    [lenis],
  );
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ lerp: 0.085, smoothWheel: true, autoRaf: true });
    setLenis(instance);
    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}
