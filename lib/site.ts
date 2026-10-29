export const site = {
  name: "Dhruv Desai",
  title: "AI Engineer | HCI Developer & Creative Technologist",
  role: "Creative Technologist & Consultant",
  domain: "dhruvdesai.com.au",
  url: "https://dhruvdesai.com.au",
  location: "Gold Coast, QLD, Australia",
  locationShort: "Gold Coast, QLD",
  abn: "45 707 909 198",
  phone: { display: "+61 432 781 706", href: "tel:+61432781706" },
  email: "dhruv.desai1706@gmail.com",
  calendly: process.env.NEXT_PUBLIC_CALENDLY_URL || "" /* Calendly link from the dhruv.desai1706@gmail.com account */,
  gstRegistered: process.env.NEXT_PUBLIC_GST_REGISTERED === "true",
} as const;

export const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#booking", label: "Book" },
  { href: "#quote", label: "Quote" },
  { href: "#contact", label: "Contact" },
] as const;
