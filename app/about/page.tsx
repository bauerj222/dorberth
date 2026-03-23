"use client";

import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 24, filter: "blur(4px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] },
};

export default function AboutPage() {
  return (
    <main className="pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeIn}>
          <span className="inline-block rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary mb-5">
            Über uns
          </span>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Malermeister mit Leidenschaft
          </h1>
        </motion.div>

        <motion.div {...fadeIn} className="space-y-6 text-muted-foreground leading-relaxed text-lg mb-16">
          <p>
            Maler Dorberth wurde im Jahr 2000 von Malermeister Ralf Dorberth gegründet.
            Mit Berufserfahrung seit 1985 blicken wir auf über 40 Jahre Handwerk zurück —
            und diese Erfahrung spiegelt sich in jedem Projekt wider.
          </p>
          <p>
            Im Großraum Nürnberg-Fürth-Erlangen sind wir Ihr kompetenter Partner für
            sämtliche Malerarbeiten im Innen- und Außenbereich. Unser Ziel ist es,
            Ihr Zuhause oder Ihr Objekt zu einem persönlichen Erlebnis zu machen.
          </p>
          <p>
            Besonders stolz sind wir auf unsere Spezialisierung: dekorative Wandtechniken
            wie Betonoptik, Rostoptik, Kupfer- und Marmortechniken verwandeln gewöhnliche
            Räume in außergewöhnliche Erlebnisse. Und mit unserem Nachtarbeit-Service
            renovieren wir Gastronomie, Arztpraxen und Gewerbeobjekte ohne
            Betriebsunterbrechung.
          </p>
        </motion.div>

        <motion.div {...fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { value: "1985", label: "Erfahrung seit" },
            { value: "2000", label: "Gegründet" },
            { value: "40+", label: "Jahre Handwerk" },
            { value: "100%", label: "Meisterqualität" },
          ].map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl border border-border/60 bg-card/50 text-center">
              <span className="text-3xl font-bold text-primary block">{stat.value}</span>
              <span className="text-xs text-muted-foreground mt-1 block uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div {...fadeIn} className="p-8 rounded-2xl border border-border/60 bg-card/30">
          <h2 className="text-xl font-semibold text-foreground mb-4">Kontakt</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Malermeister Ralf Dorberth</p>
              <p>Gladiolenweg 41</p>
              <p>90768 Fürth / Burgfarrnbach</p>
            </div>
            <div>
              <p><a href="tel:091197794971" className="hover:text-primary transition-colors">0911 / 977 949 71</a></p>
              <p><a href="tel:017297006033" className="hover:text-primary transition-colors">0172 / 970 60 33</a></p>
              <p><a href="mailto:maler-dorberth@t-online.de" className="hover:text-primary transition-colors">maler-dorberth@t-online.de</a></p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
