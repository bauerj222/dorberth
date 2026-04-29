import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#008080",
};

export const metadata: Metadata = {
  title: {
    default: "Maler Dorberth — Ihr Maler aus Burgfarrnbach | Meisterbetrieb seit 1985",
    template: "%s | Maler Dorberth",
  },
  description:
    "Malermeister Ralf Dorberth in Fürth/Burgfarrnbach. Fassadengestaltung, Wandgestaltung, Anstrich & Tapete — spezialisiert auf Nachtarbeit in Gastronomie und Gewerbe.",
  keywords:
    "Maler, Malermeister, Fürth, Burgfarrnbach, Nürnberg, Erlangen, Fassadengestaltung, Wandgestaltung, Betonoptik, Rostoptik, Spachteltechnik, Nachtarbeit, Anstrich, Tapete",
  authors: [{ name: "Maler Dorberth" }],
  creator: "Maler Dorberth",
  publisher: "Maler Dorberth",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Maler Dorberth",
    title: "Maler Dorberth — Ihr Maler aus Burgfarrnbach",
    description:
      "Malermeister Ralf Dorberth. Fassadengestaltung, Wandgestaltung, Anstrich & Tapete — spezialisiert auf Nachtarbeit.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maler Dorberth — Meisterbetrieb seit 1985",
    description:
      "Malermeister in Fürth/Burgfarrnbach. Fassaden, Wandgestaltung, Nachtarbeit.",
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "#maler-dorberth",
  name: "Maler Dorberth",
  description:
    "Malermeister Ralf Dorberth in Fürth/Burgfarrnbach. Sämtliche Malerarbeiten im Innen- und Außenbereich, spezialisiert auf Nachtarbeit in Gastronomie, Arztpraxen und Gewerbe.",
  url: "https://www.maler-dorberth.de",
  telephone: "+49-911-97794971",
  email: "maler-dorberth@t-online.de",
  foundingDate: "2000",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Gladiolenweg 41",
    addressLocality: "Fürth",
    postalCode: "90768",
    addressRegion: "Bayern",
    addressCountry: "DE",
  },
  founder: {
    "@type": "Person",
    name: "Ralf Dorberth",
    jobTitle: "Malermeister",
  },
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fassadengestaltung" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Wandgestaltung" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Anstrich & Tapete" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Spachteltechnik & Mikrozement" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Nachtarbeit" } },
  ],
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: { "@type": "GeoCoordinates", latitude: 49.4783, longitude: 10.9536 },
    geoRadius: "30000",
  },
  priceRange: "$$",
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "08:00", closes: "16:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday"], opens: "08:00", closes: "13:00" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <Navigation />
        {children}
        <Footer />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
