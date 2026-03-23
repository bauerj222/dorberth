"use client";

import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 24, filter: "blur(4px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] },
};

export default function ContactPage() {
  return (
    <main className="pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeIn}>
          <span className="inline-block rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary mb-5">
            Kontakt
          </span>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Sprechen Sie uns an
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-16">
            Ob Fassade, Innenraum oder kreative Wandgestaltung — wir beraten Sie persönlich und unverbindlich.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div {...fadeIn} className="space-y-6">
            <div className="p-8 rounded-2xl border border-border/60 bg-card/30">
              <h2 className="text-lg font-semibold text-foreground mb-4">Adresse</h2>
              <p className="text-muted-foreground">Malermeister Ralf Dorberth</p>
              <p className="text-muted-foreground">Gladiolenweg 41</p>
              <p className="text-muted-foreground">90768 Fürth / Burgfarrnbach</p>
            </div>

            <div className="p-8 rounded-2xl border border-border/60 bg-card/30">
              <h2 className="text-lg font-semibold text-foreground mb-4">Erreichbarkeit</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <span className="text-foreground font-medium">Telefon:</span>{" "}
                  <a href="tel:091197794971" className="hover:text-primary transition-colors">0911 / 977 949 71</a>
                </p>
                <p>
                  <span className="text-foreground font-medium">Mobil:</span>{" "}
                  <a href="tel:017297006033" className="hover:text-primary transition-colors">0172 / 970 60 33</a>
                </p>
                <p>
                  <span className="text-foreground font-medium">Email:</span>{" "}
                  <a href="mailto:maler-dorberth@t-online.de" className="hover:text-primary transition-colors">maler-dorberth@t-online.de</a>
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.15 }}>
            <div className="p-8 rounded-2xl border border-border/60 bg-card/30 h-full">
              <h2 className="text-lg font-semibold text-foreground mb-4">Büroöffnungszeiten</h2>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Montag — Donnerstag</span>
                  <span className="text-foreground font-medium">8:00 — 16:30 Uhr</span>
                </div>
                <div className="flex justify-between">
                  <span>Freitag</span>
                  <span className="text-foreground font-medium">8:00 — 13:00 Uhr</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-sm">Termine nach Absprache — auch außerhalb der Bürozeiten.</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-foreground mb-2">Einsatzgebiet</h3>
                <p className="text-muted-foreground text-sm">
                  Großraum Nürnberg-Fürth-Erlangen und Umgebung
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
