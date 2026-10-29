"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleCheck, Lock, Mail, Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { addons, aud, calculateQuote, DEPOSIT_RATE, MAX_EXTRA_HOURS, scopes, tiers, type QuoteInput, type TierId } from "@/lib/pricing";
import { site } from "@/lib/site";
import { CheckoutModal } from "./CheckoutModal";
import { selectTierEvent } from "./Services";
import { AnimatedAUD } from "./AnimatedNumber";
import { btn, ease, Magnetic, Reveal, SectionHeader } from "./ui";

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  const id = `step-${n.replace(/\W/g, "")}`;
  return (
    <div role="group" aria-labelledby={id} className="border-t hairline pb-4 pt-7">
      <p id={id} className="label mb-5 flex items-center gap-3">
        <span className="text-accent">{n}</span> {title}
      </p>
      {children}
    </div>
  );
}

export function QuoteEstimator() {
  const [input, setInput] = useState<QuoteInput>({ tier: "web", scope: "standard", extraHours: 0, addons: [] });
  const [checkout, setCheckout] = useState(false);
  const [notice, setNotice] = useState<"success" | "cancelled" | null>(null);
  const quote = useMemo(() => calculateQuote(input, site.gstRegistered), [input]);
  const tier = quote.tier;

  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<TierId>).detail;
      setInput((s) => ({ ...s, tier: id }));
    };
    window.addEventListener(selectTierEvent, onSelect);
    // Returning from real Stripe Checkout
    const status = new URLSearchParams(window.location.search).get("checkout");
    if (status === "success" || status === "cancelled") {
      setNotice(status);
      history.replaceState(null, "", window.location.pathname + "#quote");
    }
    return () => window.removeEventListener(selectTierEvent, onSelect);
  }, []);

  const toggleAddon = (id: string) =>
    setInput((s) => ({ ...s, addons: s.addons.includes(id) ? s.addons.filter((a) => a !== id) : [...s.addons, id] }));

  const setHours = (h: number) => setInput((s) => ({ ...s, extraHours: Math.max(0, Math.min(MAX_EXTRA_HOURS, h)) }));

  const mailto = useMemo(() => {
    const body = [
      "Hi Dhruv,",
      "",
      "I'd like to discuss this estimate from dhruvdesai.com.au:",
      "",
      ...quote.lines.map((l) => `• ${l.label}: ${aud(l.amount)}`),
      quote.gst ? `• GST: ${aud(quote.gst)}` : "",
      `Estimated total: ${aud(quote.total)} AUD`,
      `Indicative timeline: ${quote.timeline}`,
      "",
      "About my project:",
      "",
    ].join("\n");
    return `mailto:${site.email}?subject=${encodeURIComponent(`Quote enquiry — ${tier.name}`)}&body=${encodeURIComponent(body)}`;
  }, [quote, tier.name]);

  return (
    <section id="quote" className="scroll-mt-20 border-t hairline">
      <div className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <SectionHeader
          index="03"
          label="Estimator"
          title="Scope your project in"
          accent="Australian dollars."
          intro="Transparent, market-aligned pricing — consulting from $120–$180 AUD/hr and project scopes from $1,500. Adjust the options to see a live estimate, then secure your start date with a 30% deposit."
        />

        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
              className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-accent/40 bg-accent-soft px-5 py-4 text-sm"
            >
              <span className="flex items-center gap-2">
                <CircleCheck className="size-4 text-accent" />
                {notice === "success"
                  ? "Payment received — thank you! I’ll be in touch shortly to confirm next steps."
                  : "Checkout cancelled — no payment was taken."}
              </span>
              <button aria-label="Dismiss" onClick={() => setNotice(null)}>
                <X className="size-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="space-y-2 lg:col-span-7">
            <Step n="i." title="Project tier">
              <div className="grid gap-3" role="radiogroup" aria-label="Project tier">
                {tiers.map((t) => {
                  const active = t.id === input.tier;
                  return (
                    <button
                      key={t.id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setInput((s) => ({ ...s, tier: t.id }))}
                      className={`relative flex items-start justify-between gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                        active ? "border-accent bg-accent-soft" : "hairline hover:border-accent/40"
                      }`}
                    >
                      <span>
                        <span className="block text-lg font-medium tracking-tight">{t.name}</span>
                        <span className="mt-1 block text-sm text-muted">{t.blurb}</span>
                        <span className="mt-3 block font-mono text-[11px] uppercase tracking-wider text-muted">
                          From {aud(t.base)} · {t.includedHours} hrs incl. · {aud(t.rate)}/hr after
                        </span>
                      </span>
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full border transition ${
                          active ? "border-accent bg-accent text-on-accent" : "hairline"
                        }`}
                      >
                        {active && <Check className="size-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step n="ii." title="Scope & complexity">
              <div className="relative grid grid-cols-3 rounded-full border hairline p-1" role="radiogroup" aria-label="Scope">
                {scopes.map((s) => {
                  const active = s.id === input.scope;
                  return (
                    <button
                      key={s.id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setInput((st) => ({ ...st, scope: s.id }))}
                      className={`relative z-10 rounded-full px-3 py-3 text-center text-sm transition-colors ${active ? "text-on-accent" : "text-muted hover:text-ink"}`}
                    >
                      {active && (
                        <motion.span layoutId="scope-pill" className="absolute inset-0 -z-10 rounded-full bg-accent" transition={{ duration: 0.5, ease }} />
                      )}
                      <span className="block font-medium">{s.label}</span>
                      <span className={`hidden text-[11px] sm:block ${active ? "opacity-80" : ""}`}>{s.note}</span>
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step n="iii." title="Additional consulting hours">
              <div className="flex items-center gap-4">
                <button aria-label="Remove 2 hours" onClick={() => setHours(input.extraHours - 2)} className="grid size-10 shrink-0 place-items-center rounded-full border hairline hover:border-accent hover:text-accent">
                  <Minus className="size-4" />
                </button>
                <input
                  type="range"
                  min={0}
                  max={MAX_EXTRA_HOURS}
                  step={2}
                  value={input.extraHours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  aria-label="Additional hours"
                  aria-valuetext={`${input.extraHours} hours`}
                  className="w-full"
                  style={{ ["--fill" as string]: `${(input.extraHours / MAX_EXTRA_HOURS) * 100}%` }}
                />
                <button aria-label="Add 2 hours" onClick={() => setHours(input.extraHours + 2)} className="grid size-10 shrink-0 place-items-center rounded-full border hairline hover:border-accent hover:text-accent">
                  <Plus className="size-4" />
                </button>
              </div>
              <p className="mt-3 flex justify-between text-sm text-muted">
                <span>
                  <span className="font-medium text-ink tabular-nums">{input.extraHours} hrs</span> @ {aud(tier.rate)}/hr
                </span>
                <span className="tabular-nums">{aud(input.extraHours * tier.rate)}</span>
              </p>
            </Step>

            <Step n="iv." title="Add-ons">
              <div className="grid gap-2 sm:grid-cols-2">
                {addons.map((a) => {
                  const on = input.addons.includes(a.id);
                  return (
                    <label
                      key={a.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-sm transition ${
                        on ? "border-accent bg-accent-soft" : "hairline hover:border-accent/40"
                      }`}
                    >
                      <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleAddon(a.id)} />
                      <span className={`grid size-5 shrink-0 place-items-center rounded-md border transition ${on ? "border-accent bg-accent text-on-accent" : "hairline"}`}>
                        {on && <Check className="size-3" />}
                      </span>
                      <span className="flex-1">{a.label}</span>
                      <span className="font-mono text-xs text-muted">{a.price ? `+${aud(a.price)}` : `+${(a.pct ?? 0) * 100}%`}</span>
                    </label>
                  );
                })}
              </div>
            </Step>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5">
            <aside className="rounded-3xl border hairline bg-surface p-7 md:p-9 lg:sticky lg:top-24" aria-label="Quote summary">
              <div className="flex items-center justify-between">
                <p className="label">Estimate summary</p>
                <p className="label">AUD</p>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                <AnimatePresence initial={false}>
                  {quote.lines.map((l) => (
                    <motion.li
                      key={l.label.replace(/\d+ extra/, "extra")}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease }}
                      className="flex justify-between gap-4"
                    >
                      <span className="text-muted">{l.label}</span>
                      <span className="tabular-nums">{aud(l.amount)}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              <div className="mt-6 space-y-2 border-t hairline pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="tabular-nums">{aud(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">GST (10%)</span>
                  <span className="tabular-nums">{site.gstRegistered ? aud(quote.gst) : "Not charged"}</span>
                </div>
              </div>

              <div className="mt-6 border-t hairline pt-6">
                <p className="label">Estimated total</p>
                <AnimatedAUD value={quote.total} className="mt-2 block text-[clamp(2.75rem,5vw,4rem)] font-medium leading-none tracking-[-0.04em]" />
                <p className="mt-3 text-sm text-muted">
                  Indicative timeline: <span className="text-ink">{quote.timeline}</span>
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-accent-soft px-5 py-4">
                <span className="text-sm">
                  Deposit due today <span className="text-muted">({DEPOSIT_RATE * 100}%)</span>
                </span>
                <AnimatedAUD value={quote.deposit} className="text-xl font-medium text-accent" />
              </div>

              <div className="mt-6 grid gap-3">
                <Magnetic strength={0.15}>
                  <button className={`${btn.primary} w-full`} onClick={() => setCheckout(true)}>
                    <Lock className="size-4" /> Review &amp; pay deposit
                  </button>
                </Magnetic>
                <a href={mailto} className={`${btn.ghost} w-full`}>
                  <Mail className="size-4" /> Email this quote
                </a>
              </div>

              <p className="mt-5 text-xs leading-relaxed text-muted">
                Estimate only, in AUD. Final scope and price are confirmed in writing after your free consultation.
                {site.gstRegistered ? " Prices include GST." : ""} ABN {site.abn}.
              </p>
            </aside>
          </Reveal>
        </div>
      </div>

      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} input={input} quote={quote} />
    </section>
  );
}
