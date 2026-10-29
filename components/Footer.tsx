"use client";

import { ArrowUp, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { useScrollTo } from "./SmoothScroll";
import { Magnetic, Reveal } from "./ui";

export function Footer() {
  const scrollTo = useScrollTo();
  const year = new Date().getFullYear();

  const contacts = [
    { icon: Phone, label: "Call", value: site.phone.display, href: site.phone.href },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: MapPin, label: "Location", value: site.location },
  ];

  return (
    <footer id="contact" className="relative scroll-mt-20 overflow-hidden border-t hairline">
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-28 md:px-10 md:pt-40">
        <Reveal>
          <p className="label">
            <span className="text-accent">04</span> — Contact
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-8 text-[clamp(2.75rem,9vw,9rem)] font-medium leading-[0.9] tracking-[-0.05em]">
            Let&apos;s build something <span className="font-serif font-normal italic text-accent">intelligent.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap gap-3">
            <Magnetic>
              <a
                href={`mailto:${site.email}`}
                className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-base font-medium text-bg transition hover:bg-accent hover:text-on-accent"
              >
                {site.email}
                <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:rotate-45" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={site.phone.href}
                className="group inline-flex items-center gap-3 rounded-full border hairline px-7 py-4 text-base font-medium transition hover:border-accent hover:text-accent"
              >
                <Phone className="size-4" /> {site.phone.display}
              </a>
            </Magnetic>
          </div>
        </Reveal>

        <div className="mt-24 grid gap-px overflow-hidden rounded-3xl border hairline bg-line sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c) => {
            const ext = "external" in c && c.external;
            const inner = (
              <>
                <c.icon className="size-4 text-accent" strokeWidth={1.5} />
                <p className="label mt-6">{c.label}</p>
                <p className="mt-1.5 break-words text-sm">{c.value}</p>
              </>
            );
            return c.href ? (
              <a
                key={c.label}
                href={c.href}
                {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="block bg-bg p-6 transition-colors hover:bg-surface"
              >
                {inner}
              </a>
            ) : (
              <div key={c.label} className="bg-bg p-6">
                {inner}
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t hairline pt-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name} · {site.role}
          </p>
          <p className="font-mono text-xs tracking-wider">ABN {site.abn}</p>
          <button
            onClick={() => scrollTo("#top")}
            className="group inline-flex items-center gap-2 self-start transition hover:text-accent md:self-auto"
          >
            Back to top
            <span className="grid size-8 place-items-center rounded-full border hairline transition group-hover:-translate-y-1 group-hover:border-accent">
              <ArrowUp className="size-3.5" />
            </span>
          </button>
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap text-center font-serif text-[22vw] italic leading-[0.75] tracking-[-0.04em] text-ink/[0.04]"
      >
        Dhruv Desai
      </p>
    </footer>
  );
}
