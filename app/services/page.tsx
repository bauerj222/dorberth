"use client";

import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 24, filter: "blur(4px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] },
};

const SERVICES = [
  {
    title: "Fassadengestaltung",
    description: "Professionelle Fassadengestaltung für Ihr Gebäude. Von der Fachwerk-Altbausanierung bis zum modernen Neuanstrich — wir bringen Ihre Fassade zum Strahlen. Wetterfeste Beschichtungen und langlebige Materialien sorgen für dauerhaften Schutz.",
  },
  {
    title: "Wandgestaltung — Beton-, Rost-, Kupfer- und Marmortechniken",
    description: "Einzigartige Oberflächen mit dekorativen Techniken. Betonoptik für den industriellen Look, Rosteffekte für rustikalen Charme, Kupfer- und Marmortechniken für zeitlose Eleganz. Jede Wand wird zum Kunstwerk.",
  },
  {
    title: "Anstrich & Tapete",
    description: "Sämtliche Malerarbeiten im Innenbereich. Von der klassischen Tapezierung bis zum hochwertigen Farbanstrich — präzise Ausführung und sauberes Arbeiten sind selbstverständlich.",
  },
  {
    title: "Spachteltechnik & Mikrozement",
    description: "Fugenlose Oberflächen mit modernem Charakter. Mikrozement, Sichtbetonoptik und Spachtelarbeiten für Wände, Böden und Treppen. Industriell, elegant und pflegeleicht.",
  },
  {
    title: "Nachtarbeit",
    description: "Spezialisiert auf Malerarbeiten außerhalb der Geschäftszeiten. Gastronomie, Arztpraxen und Gewerbeobjekte werden nachts renoviert — Ihr Betrieb läuft am nächsten Tag normal weiter. Kein Umsatzverlust, keine Störung.",
  },
  {
    title: "Außenanstrich & Fassadenschutz",
    description: "Wetterfeste Anstriche und Beschichtungen für Fassaden, Balkone, Geländer und Außenbereiche. Professionelle Untergrundvorbereitung und hochwertige Materialien für langlebigen Schutz.",
  },
];

export default function ServicesPage() {
  return (
    <main className="pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeIn}>
          <span className="inline-block rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary mb-5">
            Leistungen
          </span>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Unsere Leistungen
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-16">
            Sämtliche Malerarbeiten im Innen- und Außenbereich. Von der klassischen
            Renovierung bis zur kreativen Wandgestaltung — alles aus einer Hand.
          </p>
        </motion.div>

        <div className="space-y-6">
          {SERVICES.map((service, i) => (
            <motion.div key={service.title} {...fadeIn} transition={{ ...fadeIn.transition, delay: i * 0.08 }}>
              <div className="p-8 rounded-2xl border border-border/60 bg-card/30 hover:bg-card/80 hover:border-border transition-all duration-500">
                <h2 className="text-xl font-semibold text-foreground mb-3">{service.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeIn} className="mt-16 text-center">
          <a
            href="/contact"
            className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-[0_4px_20px_rgba(0,128,128,0.15)]"
          >
            Angebot anfragen
          </a>
        </motion.div>
      </div>
    </main>
  );
}
