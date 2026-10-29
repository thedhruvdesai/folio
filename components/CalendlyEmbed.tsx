"use client";

import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/lib/site";
import { useTheme } from "./ThemeProvider";

/** Lazy, theme-aware Calendly inline embed with a direct-link fallback. */
export function CalendlyEmbed({ height = 700, eager = false }: { height?: number; eager?: boolean }) {
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(eager);
  const [loaded, setLoaded] = useState(false);
  const [host, setHost] = useState<string>(site.domain);

  useEffect(() => {
    setHost(window.location.hostname);
    if (eager || !ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { rootMargin: "400px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [eager]);

  const src = useMemo(() => {
    if (!site.calendly) return "";
    const dark = theme === "dark";
    const u = new URL(site.calendly);
    u.searchParams.set("embed_domain", host);
    u.searchParams.set("embed_type", "Inline");
    u.searchParams.set("hide_gdpr_banner", "1");
    u.searchParams.set("background_color", dark ? "121211" : "fdfcf9");
    u.searchParams.set("text_color", dark ? "ede9e1" : "0d0d0d");
    u.searchParams.set("primary_color", dark ? "d4a857" : "8a5a19");
    return u.toString();
  }, [theme, host]);

  useEffect(() => setLoaded(false), [src]);

  if (!site.calendly) {
    return (
      <div className="grid w-full place-items-center rounded-2xl bg-surface p-10 text-center" style={{ height: Math.min(height, 420) }}>
        <div>
          <p className="label">Booking</p>
          <p className="mt-3 text-2xl font-medium tracking-tight">Request a free consultation</p>
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent("Free consultation request")}`}
            className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent"
          >
            {site.email}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-2xl" style={{ height }}>
      {(!loaded || !inView) && (
        <div className="absolute inset-0 grid place-items-center bg-surface">
          <div className="flex flex-col items-center gap-3 text-muted">
            <LoaderCircle className="size-6 animate-spin text-accent" />
            <span className="label">Loading calendar</span>
          </div>
        </div>
      )}
      {inView && (
        <iframe
          key={src}
          src={src}
          title="Book a free consultation with Dhruv Desai on Calendly"
          className="h-full w-full"
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      )}
      <noscript>
        <a href={site.calendly}>Open the booking page</a>
      </noscript>
    </div>
  );
}

export function CalendlyFallback() {
  if (!site.calendly) return null;
  return (
    <a
      href={site.calendly}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-muted underline-offset-4 transition hover:text-accent hover:underline"
    >
      Calendar not loading? Open the scheduling page <ArrowUpRight className="size-3.5" />
    </a>
  );
}
