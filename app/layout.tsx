import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { site } from "@/lib/site";

const description =
  "Dhruv Desai — AI Engineer, HCI Developer & Creative Technologist on the Gold Coast, QLD. AI agents & automation, Next.js web apps, and IT support for Australian businesses.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Dhruv Desai — AI Engineer & Creative Technologist | Gold Coast, QLD",
    template: "%s · Dhruv Desai",
  },
  description,
  keywords: [
    "AI Engineer Gold Coast",
    "AI automation Gold Coast",
    "web developer Gold Coast",
    "Next.js developer Australia",
    "n8n automation consultant",
    "IT support Gold Coast",
    "Creative Technologist",
    "HCI developer",
  ],
  authors: [{ name: site.name, url: site.url }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: site.url,
    siteName: site.name,
    title: "Dhruv Desai — Engineering Intelligent Interfaces",
    description,
  },
  twitter: { card: "summary_large_image", title: "Dhruv Desai — AI Engineer & Creative Technologist", description },
  formatDetection: { telephone: true, email: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Runs before paint: applies the stored/system theme so there is no flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.style.colorScheme=t}catch(e){document.documentElement.classList.add('dark')}})()`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: `${site.name} — ${site.role}`,
  url: site.url,
  email: site.email,
  telephone: "+61432781706",
  founder: { "@type": "Person", name: site.name, jobTitle: site.title },
  address: { "@type": "PostalAddress", addressLocality: "Gold Coast", addressRegion: "QLD", addressCountry: "AU" },
  areaServed: ["Gold Coast", "Brisbane", "Australia"],
  taxID: `ABN ${site.abn}`,
  priceRange: "$$",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="bg-bg text-ink">
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
