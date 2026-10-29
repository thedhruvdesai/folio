/** Shared pricing engine — runs on the client (live estimate) and the server (Stripe amount). */

export type TierId = "ai" | "web" | "it";
export type ScopeId = "lite" | "standard" | "advanced";

export interface Tier {
  id: TierId;
  name: string;
  short: string;
  blurb: string;
  base: number; // AUD, ex-GST
  rate: number; // AUD per extra hour
  includedHours: number;
  timeline: [string, string, string]; // per scope
}

export const tiers: Tier[] = [
  {
    id: "ai",
    name: "Custom AI Integration",
    short: "AI Integration",
    blurb: "Custom chatbots, Claude workflows, n8n automations and AI-driven web apps.",
    base: 3500,
    rate: 165,
    includedHours: 20,
    timeline: ["2–3 weeks", "3–5 weeks", "6–8 weeks"],
  },
  {
    id: "web",
    name: "Full-Stack Web App",
    short: "Web App",
    blurb: "Next.js / React / TypeScript product build — UX research through to deployment.",
    base: 4800,
    rate: 150,
    includedHours: 32,
    timeline: ["3–4 weeks", "5–7 weeks", "8–12 weeks"],
  },
  {
    id: "it",
    name: "IT Support & Security Audit",
    short: "IT & Security",
    blurb: "Device diagnostics, iOS/Android, remote deployment and security hardening.",
    base: 1500,
    rate: 120,
    includedHours: 10,
    timeline: ["3–5 days", "1–2 weeks", "2–3 weeks"],
  },
];

export const scopes: { id: ScopeId; label: string; note: string; mult: number }[] = [
  { id: "lite", label: "Lite", note: "Focused MVP", mult: 1 },
  { id: "standard", label: "Standard", note: "Production-ready", mult: 1.4 },
  { id: "advanced", label: "Advanced", note: "Complex / multi-system", mult: 1.9 },
];

export interface Addon {
  id: string;
  label: string;
  price?: number;
  pct?: number;
}

export const addons: Addon[] = [
  { id: "wcag", label: "WCAG 2.2 accessibility audit", price: 950 },
  { id: "seo", label: "Analytics, SEO & local search setup", price: 750 },
  { id: "brand", label: "Brand & graphic design pack", price: 1200 },
  { id: "training", label: "Team handover & training session", price: 480 },
  { id: "priority", label: "Priority delivery", pct: 0.2 },
];

export const DEPOSIT_RATE = 0.3;
export const MAX_EXTRA_HOURS = 80;
export const GST_RATE = 0.1;

export interface QuoteInput {
  tier: TierId;
  scope: ScopeId;
  extraHours: number;
  addons: string[];
}

export interface QuoteLine {
  label: string;
  amount: number;
}

export interface Quote {
  tier: Tier;
  scope: (typeof scopes)[number];
  lines: QuoteLine[];
  subtotal: number;
  gst: number;
  total: number;
  deposit: number;
  timeline: string;
}

export function calculateQuote(input: QuoteInput, gstRegistered: boolean): Quote {
  const tier = tiers.find((t) => t.id === input.tier) ?? tiers[0];
  const scopeIdx = Math.max(0, scopes.findIndex((s) => s.id === input.scope));
  const scope = scopes[scopeIdx];

  const lines: QuoteLine[] = [];
  const base = Math.round(tier.base * scope.mult);
  lines.push({ label: `${tier.name} · ${scope.label}`, amount: base });

  if (input.extraHours > 0) {
    lines.push({ label: `${input.extraHours} extra hrs @ $${tier.rate}/hr`, amount: input.extraHours * tier.rate });
  }

  for (const a of addons) {
    if (!input.addons.includes(a.id) || a.price == null) continue;
    lines.push({ label: a.label, amount: a.price });
  }

  let subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const priority = addons.find((a) => a.id === "priority");
  if (priority?.pct && input.addons.includes(priority.id)) {
    const amt = Math.round(subtotal * priority.pct);
    lines.push({ label: `${priority.label} (+${priority.pct * 100}%)`, amount: amt });
    subtotal += amt;
  }

  const gst = gstRegistered ? Math.round(subtotal * GST_RATE) : 0;
  const total = subtotal + gst;
  const deposit = Math.round(total * DEPOSIT_RATE);

  return { tier, scope, lines, subtotal, gst, total, deposit, timeline: tier.timeline[scopeIdx] };
}

/** Validates untrusted input (e.g. API request body). */
export function sanitizeQuote(raw: unknown): QuoteInput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const tier = tiers.find((t) => t.id === r.tier)?.id;
  const scope = scopes.find((s) => s.id === r.scope)?.id;
  const hours = Number(r.extraHours);
  if (!tier || !scope || !Number.isFinite(hours)) return null;
  const ids = new Set(addons.map((a) => a.id));
  const list = Array.isArray(r.addons) ? r.addons.filter((a): a is string => typeof a === "string" && ids.has(a)) : [];
  return {
    tier,
    scope,
    extraHours: Math.min(MAX_EXTRA_HOURS, Math.max(0, Math.round(hours))),
    addons: [...new Set(list)],
  };
}

export const aud = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);
