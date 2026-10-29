"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CircleCheck, CreditCard, LoaderCircle, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { aud, type Quote, type QuoteInput } from "@/lib/pricing";
import { site } from "@/lib/site";
import { Modal } from "./Modal";
import { btn, ease } from "./ui";

/* ---------- card helpers (simulation only — nothing leaves the browser) ---------- */
const digits = (s: string) => s.replace(/\D/g, "");
const formatCard = (s: string) => digits(s).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExp = (s: string) => {
  const d = digits(s).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
};
function luhn(num: string) {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (dbl && (n *= 2) > 9) n -= 9;
    sum += n;
    dbl = !dbl;
  }
  return num.length >= 13 && sum % 10 === 0;
}
function brand(num: string) {
  if (/^4/.test(num)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(num)) return "Mastercard";
  if (/^3[47]/.test(num)) return "Amex";
  return null;
}
function expValid(v: string) {
  const d = digits(v);
  if (d.length !== 4) return false;
  const m = Number(d.slice(0, 2));
  const y = 2000 + Number(d.slice(2));
  if (m < 1 || m > 12) return false;
  const now = new Date();
  return y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1);
}

type Stage = "form" | "processing" | "success";

const field =
  "w-full bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-muted/60 focus:bg-accent-soft transition-colors";

export function CheckoutModal({
  open,
  onClose,
  input,
  quote,
}: {
  open: boolean;
  onClose: () => void;
  input: QuoteInput;
  quote: Quote;
}) {
  const [live, setLive] = useState<boolean | null>(null);
  const [stage, setStage] = useState<Stage>("form");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [ref, setRef] = useState("");
  const [f, setF] = useState({ email: "", card: "", exp: "", cvc: "", name: "", postcode: "" });

  useEffect(() => {
    if (!open) return;
    setStage("form");
    setError(null);
    setTouched(false);
    fetch("/api/checkout")
      .then((r) => r.json())
      .then((d: { live?: boolean }) => setLive(Boolean(d.live)))
      .catch(() => setLive(false));
  }, [open]);

  const num = digits(f.card);
  const errors = {
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) && "Enter a valid email",
    card: !luhn(num) && "Card number is invalid",
    exp: !expValid(f.exp) && "Expiry is invalid or in the past",
    cvc: !/^\d{3,4}$/.test(f.cvc) && "CVC must be 3–4 digits",
    name: f.name.trim().length < 2 && "Enter the cardholder name",
    postcode: !/^\d{4}$/.test(f.postcode) && "Australian postcodes have 4 digits",
  };
  const firstError = Object.values(errors).find(Boolean) as string | undefined;

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (k === "card") v = formatCard(v);
    if (k === "exp") v = formatExp(v);
    if (k === "cvc") v = digits(v).slice(0, 4);
    if (k === "postcode") v = digits(v).slice(0, 4);
    setF((s) => ({ ...s, [k]: v }));
    setError(null);
  };

  async function payMock(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (firstError) return;
    setStage("processing");
    await new Promise((r) => setTimeout(r, 1800));
    if (num === "4000000000000002") {
      setStage("form");
      setError("Your card was declined. (Simulated decline — try 4242 4242 4242 4242.)");
      return;
    }
    setRef(`DD-${Date.now().toString(36).toUpperCase().slice(-6)}`);
    setStage("success");
  }

  async function payLive() {
    setStage("processing");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote: input, email: f.email }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!data.url) throw new Error(data.error ?? "Checkout unavailable");
      window.location.href = data.url;
    } catch (err) {
      setStage("form");
      setError(err instanceof Error ? err.message : "Checkout unavailable");
    }
  }

  const show = (k: keyof typeof errors) => touched && errors[k];

  return (
    <Modal open={open} onClose={onClose} title="Secure checkout" wide>
      <div className="grid md:grid-cols-[1fr_1.15fr]">
        {/* Order summary */}
        <div className="border-b hairline p-6 md:border-b-0 md:border-r md:p-8">
          <p className="label">{site.name} · ABN {site.abn}</p>
          <h3 className="mt-4 text-2xl font-medium tracking-tight">{quote.tier.name}</h3>
          <p className="text-sm text-muted">
            {quote.scope.label} scope · {quote.timeline}
          </p>
          <ul className="mt-6 space-y-2.5 text-sm">
            {quote.lines.map((l) => (
              <li key={l.label} className="flex justify-between gap-4">
                <span className="text-muted">{l.label}</span>
                <span className="tabular-nums">{aud(l.amount)}</span>
              </li>
            ))}
            {quote.gst > 0 && (
              <li className="flex justify-between gap-4">
                <span className="text-muted">GST (10%)</span>
                <span className="tabular-nums">{aud(quote.gst)}</span>
              </li>
            )}
          </ul>
          <div className="mt-5 flex justify-between border-t hairline pt-4 text-sm">
            <span>Estimated project total</span>
            <span className="tabular-nums">{aud(quote.total)}</span>
          </div>
          <div className="mt-6 rounded-2xl bg-accent-soft p-5">
            <p className="label">Due today — 30% deposit</p>
            <p className="mt-1 text-4xl font-medium tracking-tight text-accent tabular-nums">{aud(quote.deposit)}</p>
            <p className="mt-2 text-xs text-muted">Balance invoiced at agreed milestones. Deposit terms are confirmed in your written quote.</p>
          </div>
        </div>

        {/* Payment */}
        <div className="relative p-6 md:p-8">
          <AnimatePresence mode="wait">
            {stage === "success" ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease }}
                className="flex min-h-[420px] flex-col items-center justify-center text-center"
              >
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                  className="grid size-20 place-items-center rounded-full bg-accent text-on-accent"
                >
                  <CircleCheck className="size-10" strokeWidth={1.5} />
                </motion.span>
                <h3 className="mt-6 text-2xl font-medium tracking-tight">Deposit simulated successfully</h3>
                <p className="mt-2 font-mono text-sm text-accent">Ref {ref}</p>
                <p className="mt-4 max-w-sm text-sm text-muted">
                  This was a test-mode simulation — no real payment was taken and no card details left your browser. Book your
                  free consultation to lock in the project.
                </p>
                <button className={`${btn.primary} mt-8`} onClick={onClose}>
                  Done
                </button>
              </motion.div>
            ) : live ? (
              <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[420px] flex-col justify-center">
                <ShieldCheck className="size-8 text-accent" strokeWidth={1.5} />
                <h3 className="mt-4 text-2xl font-medium tracking-tight">Pay securely with Stripe</h3>
                <p className="mt-2 text-sm text-muted">
                  You&apos;ll be redirected to Stripe&apos;s hosted checkout to pay the {aud(quote.deposit)} deposit. Card details are
                  handled by Stripe and never touch this site.
                </p>
                <label className="mt-6 block overflow-hidden rounded-xl border hairline">
                  <span className="sr-only">Email for receipt</span>
                  <input className={field} type="email" autoComplete="email" placeholder="Email for receipt (optional)" value={f.email} onChange={set("email")} />
                </label>
                {error && <p className="mt-3 text-sm text-red-500" role="alert">{error}</p>}
                <button className={`${btn.accent} mt-6 w-full`} onClick={payLive} disabled={stage === "processing"}>
                  {stage === "processing" ? <LoaderCircle className="size-4 animate-spin" /> : <Lock className="size-4" />}
                  Continue to Stripe — {aud(quote.deposit)}
                  <ArrowUpRight className="size-4" />
                </button>
              </motion.div>
            ) : (
              <motion.form key="mock" onSubmit={payMock} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Pay with card</p>
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Test mode
                  </span>
                </div>

                <div className="rounded-xl border border-dashed hairline p-3 text-xs leading-relaxed text-muted">
                  Simulation only — no real charge. Use <span className="font-mono text-ink">4242 4242 4242 4242</span>, any future
                  expiry and any CVC. <span className="font-mono text-ink">4000 0000 0000 0002</span> simulates a decline.
                </div>

                <div>
                  <label htmlFor="co-email" className="label mb-2 block">Email</label>
                  <div className="overflow-hidden rounded-xl border hairline">
                    <input id="co-email" className={field} type="email" autoComplete="off" placeholder="you@company.com.au" value={f.email} onChange={set("email")} aria-invalid={!!show("email")} />
                  </div>
                </div>

                <div>
                  <span className="label mb-2 block">Card information</span>
                  <div className="divide-y hairline overflow-hidden rounded-xl border hairline [&>*]:border-line">
                    <div className="relative">
                      <input aria-label="Card number" className={`${field} pr-24 font-mono`} inputMode="numeric" autoComplete="off" placeholder="1234 1234 1234 1234" value={f.card} onChange={set("card")} aria-invalid={!!show("card")} />
                      <span className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-xs text-muted">
                        {brand(num) ?? ""} <CreditCard className="size-4" />
                      </span>
                    </div>
                    <div className="grid grid-cols-2 divide-x hairline [&>*]:border-line">
                      <input aria-label="Expiry date (MM / YY)" className={`${field} font-mono`} inputMode="numeric" autoComplete="off" placeholder="MM / YY" value={f.exp} onChange={set("exp")} aria-invalid={!!show("exp")} />
                      <input aria-label="CVC" className={`${field} font-mono`} inputMode="numeric" autoComplete="off" placeholder="CVC" value={f.cvc} onChange={set("cvc")} aria-invalid={!!show("cvc")} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <div>
                    <label htmlFor="co-name" className="label mb-2 block">Cardholder name</label>
                    <div className="overflow-hidden rounded-xl border hairline">
                      <input id="co-name" className={field} autoComplete="off" placeholder="Full name" value={f.name} onChange={set("name")} aria-invalid={!!show("name")} />
                    </div>
                  </div>
                  <div className="w-28">
                    <label htmlFor="co-pc" className="label mb-2 block">Postcode</label>
                    <div className="overflow-hidden rounded-xl border hairline">
                      <input id="co-pc" className={`${field} font-mono`} inputMode="numeric" autoComplete="off" placeholder="4217" value={f.postcode} onChange={set("postcode")} aria-invalid={!!show("postcode")} />
                    </div>
                  </div>
                </div>
                <p className="-mt-2 text-xs text-muted">Country: Australia</p>

                <AnimatePresence>
                  {(error || (touched && firstError)) && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-red-600 dark:text-red-400" role="alert">
                      {error ?? firstError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button type="submit" className={`${btn.accent} w-full py-4`} disabled={stage === "processing" || live === null}>
                  {stage === "processing" ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" /> Pay {aud(quote.deposit)} deposit
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
                  <ShieldCheck className="size-3.5" /> Powered by a Stripe-style simulation · 256-bit TLS on the live site
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
