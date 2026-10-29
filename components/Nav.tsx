"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navLinks, site } from "@/lib/site";
import { useScrollTo } from "./SmoothScroll";
import { ThemeToggle } from "./ThemeToggle";
import { ease } from "./ui";

export function Nav() {
  const scrollTo = useScrollTo();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 400 && y > prev && !open);
  });

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    scrollTo(href);
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.5, ease }}
      >
        <div
          className={`mx-auto flex max-w-[1400px] items-center justify-between px-5 transition-all duration-500 md:px-10 ${
            scrolled ? "py-3" : "py-5"
          }`}
        >
          <a href="#top" onClick={(e) => go(e, "#top")} className="group flex items-center gap-3" aria-label={`${site.name} — home`}>
            <span className="grid size-10 place-items-center rounded-full border hairline font-serif text-xl italic text-accent transition group-hover:rotate-[360deg] group-hover:border-accent duration-700">
              dd
            </span>
            <span className="hidden text-sm font-medium tracking-tight sm:block">
              Dhruv Desai<span className="text-accent">.</span>
            </span>
          </a>

          <nav
            aria-label="Primary"
            className={`hidden items-center gap-1 rounded-full border px-2 py-1.5 transition-all duration-500 md:flex ${
              scrolled ? "hairline bg-bg/70 backdrop-blur-xl" : "border-transparent"
            }`}
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="rounded-full px-4 py-2 text-sm text-muted transition hover:bg-accent-soft hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="grid size-10 place-items-center rounded-full border hairline md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
            <a
              href="#booking"
              onClick={(e) => go(e, "#booking")}
              className="hidden rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition hover:bg-accent hover:text-on-accent md:inline-flex"
            >
              Let&apos;s talk
            </a>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end bg-bg px-6 pb-12 pt-28 md:hidden"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease }}
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {navLinks.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  className="border-b hairline py-4 text-5xl font-medium tracking-tight"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease }}
                >
                  <span className="label mr-4 align-middle text-accent">0{i + 1}</span>
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <div className="mt-10 space-y-1 text-sm text-muted">
              <p>{site.email}</p>
              <p>{site.phone.display}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
