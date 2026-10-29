const stack = [
  "React", "Next.js", "TypeScript", "Node.js", "Claude API", "n8n", "AWS", "Three.js",
  "Python", "Docker", "Figma", "WCAG 2.2", "iOS / Android", "REST APIs",
];

export function StackMarquee() {
  const items = [...stack, ...stack];
  return (
    <div className="relative overflow-hidden border-y hairline py-6" aria-label="Technology stack">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />
      <ul className="flex w-max animate-marquee gap-12 hover:[animation-play-state:paused]">
        {items.map((s, i) => (
          <li
            key={i}
            aria-hidden={i >= stack.length}
            className="flex items-center gap-12 whitespace-nowrap text-2xl font-medium tracking-tight text-muted md:text-3xl"
          >
            {s}
            <span className="font-serif text-accent">✦</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
