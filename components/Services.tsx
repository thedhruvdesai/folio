"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Bot, CodeXml, MonitorSmartphone, type LucideIcon } from "lucide-react";
import type { TierId } from "@/lib/pricing";
import { useScrollTo } from "./SmoothScroll";
import { ease, SectionHeader } from "./ui";

interface Service {
  no: string;
  title: string;
  icon: LucideIcon;
  tags: string[];
  body: string;
  tier: TierId;
}

const services: Service[] = [
  {
    no: "01",
    title: "Desktop / Mobile Support",
    icon: MonitorSmartphone,
    tags: ["Hardware", "iOS / Android", "Remote Deploy", "Security"],
    body: "Professional technical diagnostics and IT support — from device rescue to secure remote deployment for small teams.",
    tier: "it",
  },
  {
    no: "02",
    title: "Web Dev / Design",
    icon: CodeXml,
    tags: ["Front-end / Back-end", "HCI (UX/UI)", "Graphic Design", "Next.js", "TypeScript", "React"],
    body: "Human-centred products engineered end to end: research-led UX, refined interfaces and fast, accessible builds.",
    tier: "web",
  },
  {
    no: "03",
    title: "AI Agents / Automation",
    icon: Bot,
    tags: ["Custom Chatbots", "Claude Workflows", "Process Automation", "n8n", "AI Web Apps"],
    body: "Custom chatbots, Claude workflows and n8n integrations that take repetitive work off your plate — and AI-driven web apps.",
    tier: "ai",
  },
];

export const selectTierEvent = "quote:select-tier";

function ServiceCard({ s, i }: { s: Service; i: number }) {
  const reduce = useReducedMotion();
  const scrollTo = useScrollTo();
  const Icon = s.icon;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.1, ease, delay: i * 0.12 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className="group relative flex min-h-[460px] flex-col overflow-hidden rounded-3xl border hairline bg-surface p-7 transition-[border-color,transform] duration-500 hover:-translate-y-1.5 hover:border-accent/50 md:p-9"
    >
      {/* cursor spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--mx) var(--my), var(--accent-soft), transparent 70%)" }}
      />

      <div className="relative flex items-start justify-between">
        <span className="font-mono text-sm tracking-widest text-accent">[ {s.no} / ]</span>
        <span className="grid size-14 place-items-center rounded-2xl border hairline transition-all duration-700 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
          <Icon className="size-6" strokeWidth={1.5} />
        </span>
      </div>

      <h3 className="relative mt-auto pt-16 text-[clamp(1.75rem,2.6vw,2.4rem)] font-medium leading-[1.02] tracking-[-0.03em]">
        {s.title}
      </h3>
      <p className="relative mt-4 leading-relaxed text-muted text-pretty">{s.body}</p>

      <ul className="relative mt-6 flex flex-wrap gap-1.5" aria-label={`${s.title} capabilities`}>
        {s.tags.map((t) => (
          <li key={t} className="rounded-full border hairline px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider text-muted transition-colors group-hover:border-accent/30">
            {t}
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent<TierId>(selectTierEvent, { detail: s.tier }));
          scrollTo("#quote");
        }}
        className="relative mt-8 flex items-center justify-between border-t hairline pt-5 text-left text-sm font-medium"
      >
        <span className="transition-colors group-hover:text-accent">Estimate this service</span>
        <span className="grid size-9 place-items-center rounded-full border hairline transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
          <ArrowUpRight className="size-4" />
        </span>
      </button>
    </motion.article>
  );
}

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-[1400px] scroll-mt-20 px-5 py-28 md:px-10 md:py-40">
      <SectionHeader
        index="01"
        label="Services"
        title="Three disciplines,"
        accent="one technologist."
        intro="Based on the Gold Coast and working with businesses across Australia — I bridge human-centred design, modern engineering and practical AI."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {services.map((s, i) => (
          <ServiceCard key={s.no} s={s} i={i} />
        ))}
      </div>
    </section>
  );
}
