import { Clock, MapPin, Video } from "lucide-react";
import { site } from "@/lib/site";
import { CalendlyEmbed, CalendlyFallback } from "./CalendlyEmbed";
import { Reveal, SectionHeader } from "./ui";

const points = [
  { icon: Clock, title: "30 minutes, no obligation", body: "A focused call to understand your goals, constraints and timeline." },
  { icon: Video, title: "Video or phone", body: "Meet online from anywhere in Australia, at a time that suits you." },
  { icon: MapPin, title: "Clear next steps", body: "You leave with a recommended approach and the next steps toward a written quote." },
];

export function Booking() {
  return (
    <section id="booking" className="scroll-mt-20 border-t hairline">
      <div className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <SectionHeader index="02" label="Consultation" title="Book a Consultation —" accent="free of charge." />
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-4">
            {points.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="flex gap-4 border-b hairline pb-8">
                  <p.icon className="mt-1 size-5 shrink-0 text-accent" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-medium tracking-tight">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <p className="text-sm text-muted">
                Prefer to talk now? Call{" "}
                <a href={site.phone.href} className="text-ink underline-offset-4 hover:text-accent hover:underline">
                  {site.phone.display}
                </a>
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-8">
            <div className="rounded-3xl border hairline bg-surface p-2 sm:p-3">
              <CalendlyEmbed height={720} />
            </div>
            <div className="mt-4">
              <CalendlyFallback />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
