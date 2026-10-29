# dhruvdesai.com.au

Personal portfolio & consulting site for **Dhruv Desai** — AI Engineer | HCI Developer & Creative Technologist, Gold Coast QLD (ABN 45 707 909 198).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Lenis (inertial scroll) · Three.js / React Three Fiber · Lucide icons · self-hosted fonts (Inter Tight, Instrument Serif, JetBrains Mono).

## Run locally

```bash
npm install
cp .env.example .env.local   # then edit values
npm run dev                  # http://localhost:3000
npm run build && npm start   # production check
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CALENDLY_URL` | Your Calendly event link for the free consultation. |
| `NEXT_PUBLIC_GST_REGISTERED` | `true` adds 10% GST to quotes. Leave `false` until you're GST-registered. |
| `STRIPE_SECRET_KEY` | Optional. Empty = checkout stays a **test-mode simulation**. Set `sk_test_…` (then `sk_live_…`) to take real deposits via Stripe Checkout. |

## Project structure

```
app/
  layout.tsx           metadata, JSON-LD (ProfessionalService), no-flash theme script, providers
  page.tsx             section composition
  globals.css          design tokens (light/dark), grain, view-transition theme reveal
  api/checkout/route.ts  Stripe Checkout Session (server recalculates the amount)
  robots.ts · sitemap.ts · icon.svg
components/
  ThemeProvider.tsx    persistent theme + circular View Transition reveal
  SmoothScroll.tsx     Lenis provider + useScrollTo()
  Nav.tsx · ThemeToggle.tsx
  Hero.tsx · HeroCanvas.tsx   kinetic headline + GPU particle field (custom shader, mouse ripple)
  StackMarquee.tsx
  Services.tsx         3 service cards with cursor spotlight → preselect tier in estimator
  Booking.tsx · CalendlyEmbed.tsx   lazy, theme-matched Calendly inline embed + fallback link
  QuoteEstimator.tsx   AUD calculator (tiers, scope, hours, add-ons, GST, 30% deposit)
  CheckoutModal.tsx    Stripe-style mock card form (Luhn/expiry checks) or redirect to live Stripe
  Footer.tsx · Modal.tsx · ui.tsx · AnimatedNumber.tsx
lib/
  site.ts              all business details — edit here
  pricing.ts           shared pricing engine (client estimate + server charge)
```

## Pricing

Edit `lib/pricing.ts`. Defaults (ex-GST): AI Integration from $3,500 ($165/hr), Full-Stack Web App from $4,800 ($150/hr), IT Support & Security Audit from $1,500 ($120/hr); scope multipliers 1× / 1.4× / 1.9×.

## Deploy (Vercel)

1. Push to GitHub (e.g. `thedhruvdesai/dhruvdesai.com.au`).
2. Import the repo at vercel.com → add the env vars above → Deploy.
3. **Domains → Add `dhruvdesai.com.au`** and `www.dhruvdesai.com.au`, then at your .au registrar set:
   - `A  @  76.76.21.21`
   - `CNAME  www  cname.vercel-dns.com`

## Accessibility & performance notes

- Respects `prefers-reduced-motion` (disables Lenis, kinetic text, particle animation).
- WebGL canvas pauses when off-screen; DPR capped at 1.75.
- Keyboard-accessible dialogs (Esc to close, focus return), skip link, ARIA radio groups in the estimator.
- The mock checkout never transmits card data; card inputs use `autocomplete="off"` so browsers don't autofill real cards into the simulation.
