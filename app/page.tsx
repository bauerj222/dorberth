"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import ScrollAnimation from "@/components/ScrollAnimation";

const fadeIn = {
  initial: { opacity: 0, y: 24, filter: "blur(4px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] },
};

const STATS = [
  { value: "1985", label: "Erfahrung seit" },
  { value: "40+", label: "Jahre Handwerk" },
  { value: "24/7", label: "Nachtarbeit" },
  { value: "100%", label: "Meisterqualität" },
];

const SERVICES = [
  {
    title: "Fassadengestaltung",
    description:
      "Professionelle Fassadengestaltung inkl. Fachwerk-Altbausanierung. Vom Neuanstrich bis zur kompletten Sanierung.",
  },
  {
    title: "Wandgestaltung",
    description:
      "Dekorative Techniken: Betonoptik, Rostoptik, Kupfer- und Marmortechniken. Einzigartige Oberflächen für jeden Raum.",
  },
  {
    title: "Anstrich & Tapete",
    description:
      "Sämtliche Malerarbeiten im Innenbereich. Von der klassischen Tapete bis zum hochwertigen Anstrich.",
  },
  {
    title: "Spachteltechnik",
    description:
      "Mikrozement, Sichtbeton und Spachtelarbeiten für moderne, fugenlose Oberflächen mit industriellem Charakter.",
  },
  {
    title: "Nachtarbeit",
    description:
      "Spezialisiert auf Arbeiten außerhalb der Geschäftszeiten. Gastronomie, Arztpraxen und Gewerbe — ohne Betriebsunterbrechung.",
  },
  {
    title: "Außenanstrich",
    description:
      "Wetterfeste Anstriche und Beschichtungen für Fassaden, Balkone und Außenbereiche. Langlebig und fachgerecht.",
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative z-10 bg-background min-h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-32 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          >
            <span className="inline-block rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary mb-6">
              Meisterbetrieb seit 1985
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
              Ihr Maler aus{" "}
              <span className="text-primary">Burgfarrnbach</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-md mb-10 leading-relaxed">
              Professionelle Maler- und Lackierarbeiten mit über 40 Jahren Erfahrung.
              Von Fassadengestaltung bis dekorativer Wandtechnik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-[0_4px_20px_rgba(0,128,128,0.15)] text-center"
                style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
              >
                Kostenloses Angebot
              </a>
              <a
                href="tel:091197794971"
                className="px-8 py-4 border border-foreground/20 text-foreground font-medium rounded-full hover:bg-foreground/5 hover:border-foreground/40 transition-all duration-500 text-center"
                style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
              >
                0911 / 977 949 71
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
            className="relative aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image
              src="/start_frame.png"
              alt="Maler Dorberth — Professionelle Malerarbeiten"
              fill
              priority
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Scroll Animation */}
      <ScrollAnimation />

      {/* Stats */}
      <section className="relative z-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-20 lg:py-28">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} {...fadeIn} transition={{ ...fadeIn.transition, delay: i * 0.1 }}>
                <div className="text-center py-8 px-4 border border-border/60 rounded-2xl bg-card/50">
                  <span className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight block">
                    {stat.value}
                  </span>
                  <p className="text-muted-foreground text-xs mt-2 font-medium uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="border-t border-border" />
      </div>

      {/* Services */}
      <section className="relative z-10 bg-background py-24 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeIn} className="mb-16">
            <span className="inline-block rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary mb-5">
              Leistungen
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground tracking-tight max-w-xl">
              Alles aus einer Hand
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg text-base lg:text-lg">
              Von der Fassade bis zur dekorativen Wandgestaltung — 40 Jahre Erfahrung in jedem Pinselstrich.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((service, i) => (
              <motion.div key={service.title} {...fadeIn} transition={{ ...fadeIn.transition, delay: i * 0.08 }}>
                <div className="group p-6 lg:p-8 rounded-2xl border border-border/60 bg-card/30 hover:bg-card/80 hover:border-border hover:shadow-lg transition-all duration-500" style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeIn} className="mt-12 text-center">
            <a href="/services" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300">
              Alle Leistungen ansehen
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section className="relative z-10 bg-card/40 border-y border-border py-24 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeIn}>
              <span className="inline-block rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary mb-5">
                Über uns
              </span>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground tracking-tight mb-6">
                Malermeister mit Leidenschaft
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Gegründet im Jahr 2000 von Malermeister Ralf Dorberth, blickt unser Betrieb
                auf über 40 Jahre Berufserfahrung seit 1985 zurück. Im Großraum Nürnberg-Fürth-Erlangen
                sind wir Ihr kompetenter Partner für sämtliche Malerarbeiten.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Unser Ziel ist es, Ihr Zuhause oder Ihr Objekt zu einem persönlichen Erlebnis
                zu machen. Ob klassischer Anstrich oder kreative Wandgestaltung — bei uns
                bekommen Sie Handwerk auf höchstem Niveau.
              </p>
              <a
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 border border-foreground/20 text-foreground text-sm font-medium rounded-full hover:bg-foreground/5 hover:border-foreground/40 transition-all duration-500"
                style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
              >
                Mehr über uns
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </motion.div>

            <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.2 }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border border-border/60 bg-background text-center">
                  <span className="text-3xl lg:text-4xl font-bold text-primary block">40+</span>
                  <span className="text-xs text-muted-foreground mt-1 block uppercase tracking-wider">Jahre</span>
                </div>
                <div className="p-6 rounded-2xl border border-border/60 bg-background text-center">
                  <span className="text-3xl lg:text-4xl font-bold text-primary block">5+</span>
                  <span className="text-xs text-muted-foreground mt-1 block uppercase tracking-wider">Techniken</span>
                </div>
                <div className="p-6 rounded-2xl border border-border/60 bg-background text-center">
                  <span className="text-3xl lg:text-4xl font-bold text-primary block">24/7</span>
                  <span className="text-xs text-muted-foreground mt-1 block uppercase tracking-wider">Nachtarbeit</span>
                </div>
                <div className="p-6 rounded-2xl border border-border/60 bg-background text-center">
                  <span className="text-3xl lg:text-4xl font-bold text-primary block">100%</span>
                  <span className="text-xs text-muted-foreground mt-1 block uppercase tracking-wider">Meister</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 bg-background py-24 lg:py-32 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground tracking-tight mb-5">
              Ihr Maler-Projekt starten
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Ob Fassade, Innenraum oder kreative Wandgestaltung — wir beraten Sie
              persönlich und unverbindlich.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/contact"
                className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-[0_4px_20px_rgba(0,128,128,0.15)]"
                style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
              >
                Kostenloses Angebot anfragen
              </a>
              <a
                href="tel:091197794971"
                className="px-8 py-4 border border-foreground/20 text-foreground font-medium rounded-full hover:bg-foreground/5 hover:border-foreground/40 transition-all duration-500"
                style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
              >
                0911 / 977 949 71
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
