"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, CalendarCheck } from "lucide-react";
import { useRef, useState } from "react";
import { site } from "@/lib/site";
import { CalendlyEmbed, CalendlyFallback } from "./CalendlyEmbed";
import { Modal } from "./Modal";
import { useScrollTo } from "./SmoothScroll";
import { btn, ease, Magnetic } from "./ui";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

const lines: { text: string; accent?: boolean }[][] = [
  [{ text: "Engineering" }],
  [{ text: "Intelligent", accent: true }, { text: "Interfaces", accent: true }],
  [{ text: "&" }, { text: "Digital" }, { text: "Experiences." }],
];

const tags = [site.role.toUpperCase(), `LOC : ${site.locationShort.toUpperCase()}`, `AUTH : ABN ${site.abn}`];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const scrollTo = useScrollTo();
  const [booking, setBooking] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.75], ["blur(0px)", "blur(8px)"]);

  let wordIndex = 0;

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <HeroCanvas />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_20%,var(--bg)_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />

      <motion.div
        style={reduce ? undefined : { y, opacity, filter: blur }}
        className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-end px-5 pb-10 pt-32 md:px-10 md:pb-14"
      >
        <motion.p
          className="label mb-8 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          {site.title}
        </motion.p>

        <h1 className="text-[clamp(2.9rem,9.2vw,9.75rem)] font-medium leading-[0.9] tracking-[-0.055em]">
          <span className="sr-only">Engineering Intelligent Interfaces & Digital Experiences.</span>
          {lines.map((line, li) => (
            <span key={li} aria-hidden className="block">
              {line.map((w) => {
                const i = wordIndex++;
                return (
                  <span key={w.text} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0">
                    <motion.span
                      className={`inline-block ${w.accent ? "font-serif font-normal italic tracking-[-0.03em] text-accent" : ""}`}
                      initial={reduce ? false : { y: "110%", rotate: 4 }}
                      animate={{ y: "0%", rotate: 0 }}
                      transition={{ duration: 1.25, ease, delay: 0.25 + i * 0.08 }}
                    >
                      {w.text}
                    </motion.span>
                  </span>
                );
              })}
            </span>
          ))}
        </h1>

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
          <motion.ul
            className="flex flex-wrap gap-2 md:col-span-7"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 1 } } }}
          >
            {tags.map((t) => (
              <motion.li
                key={t}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
                className="rounded-full border hairline bg-bg/40 px-3.5 py-2 font-mono text-[10.5px] tracking-[0.14em] text-muted backdrop-blur-sm"
              >
                [ {t} ]
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            className="flex flex-wrap gap-3 md:col-span-5 md:justify-end"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.9, ease }}
          >
            <Magnetic>
              <button className={btn.accent} onClick={() => setBooking(true)}>
                <CalendarCheck className="size-4" />
                Book a Consultation
              </button>
            </Magnetic>
            <Magnetic>
              <a
                href="#services"
                className={btn.ghost}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#services");
                }}
              >
                Explore Services &amp; Quote
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          className="mt-14 hidden items-center justify-between border-t hairline pt-5 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          <span className="label flex items-center gap-2">
            <ArrowDown className="size-3.5 animate-bounce text-accent" /> Scroll to explore
          </span>
          <span className="label">Move your cursor across the field</span>
          <span className="label">{site.domain}</span>
        </motion.div>
      </motion.div>

      <Modal open={booking} onClose={() => setBooking(false)} title="Book a Consultation — Free of Charge" wide>
        <div className="p-3 sm:p-4">
          <CalendlyEmbed eager height={680} />
          <div className="px-3 pb-2 pt-4">
            <CalendlyFallback />
          </div>
        </div>
      </Modal>
    </section>
  );
}
