import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { StackMarquee } from "@/components/StackMarquee";
import { Services } from "@/components/Services";
import { Booking } from "@/components/Booking";
import { QuoteEstimator } from "@/components/QuoteEstimator";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <StackMarquee />
        <Services />
        <Booking />
        <QuoteEstimator />
      </main>
      <Footer />
    </>
  );
}
