import { NextResponse } from "next/server";
import { calculateQuote, sanitizeQuote } from "@/lib/pricing";
import { site } from "@/lib/site";

/** Tells the client whether real Stripe Checkout is configured. */
export async function GET() {
  return NextResponse.json({ live: Boolean(process.env.STRIPE_SECRET_KEY) });
}

/**
 * Creates a Stripe Checkout Session for the 30% deposit.
 * The amount is always recalculated on the server from the selected options — the client total is never trusted.
 */
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });

  const body = (await req.json().catch(() => null)) as { quote?: unknown; email?: unknown } | null;
  const input = sanitizeQuote(body?.quote);
  if (!input) return NextResponse.json({ error: "Invalid quote" }, { status: 400 });

  const q = calculateQuote(input, site.gstRegistered);
  const origin = req.headers.get("origin") ?? site.url;
  const email = typeof body?.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ? body.email : undefined;

  const params = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "aud",
    "line_items[0][price_data][unit_amount]": String(q.deposit * 100),
    "line_items[0][price_data][product_data][name]": `30% project deposit — ${q.tier.name} (${q.scope.label})`,
    "line_items[0][price_data][product_data][description]": `Estimated project total ${q.total} AUD. ${site.name} · ABN ${site.abn}`,
    success_url: `${origin}/?checkout=success#quote`,
    cancel_url: `${origin}/?checkout=cancelled#quote`,
    "metadata[tier]": input.tier,
    "metadata[scope]": input.scope,
    "metadata[extra_hours]": String(input.extraHours),
    "metadata[addons]": input.addons.join(","),
    "metadata[estimated_total_aud]": String(q.total),
  });
  if (email) params.set("customer_email", email);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !data.url) {
    return NextResponse.json({ error: data.error?.message ?? "Could not start checkout" }, { status: 502 });
  }
  return NextResponse.json({ url: data.url });
}
