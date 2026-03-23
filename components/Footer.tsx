"use client";

const SERVICES = [
  "Fassadengestaltung",
  "Wandgestaltung",
  "Anstrich & Tapete",
  "Spachteltechnik",
  "Nachtarbeit",
];

const LINKS = [
  { label: "Leistungen", href: "/services" },
  { label: "Über uns", href: "/about" },
  { label: "Kontakt", href: "/contact" },
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold tracking-tight mb-1">
              MALER DORBERTH
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-background/50 font-medium mb-4">
              Meisterbetrieb seit 1985
            </p>
            <p className="text-sm text-background/60 leading-relaxed">
              Ihr Maler aus Burgfarrnbach. Sämtliche Malerarbeiten im Innen- und
              Außenbereich — spezialisiert auf Nachtarbeit in Gastronomie und Gewerbe.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-background/40 mb-4">
              Leistungen
            </h4>
            <ul className="space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s}>
                  <a href="/services" className="text-sm text-background/60 hover:text-background transition-colors duration-300">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-background/40 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-background/60 hover:text-background transition-colors duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-background/40 mb-4">
              Kontakt
            </h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li>Gladiolenweg 41</li>
              <li>90768 Fürth / Burgfarrnbach</li>
              <li className="pt-2">
                <a href="tel:091197794971" className="hover:text-background transition-colors duration-300">
                  0911 / 977 949 71
                </a>
              </li>
              <li>
                <a href="tel:017297006033" className="hover:text-background transition-colors duration-300">
                  0172 / 970 60 33
                </a>
              </li>
              <li>
                <a href="mailto:maler-dorberth@t-online.de" className="hover:text-background transition-colors duration-300">
                  maler-dorberth@t-online.de
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-background/40 text-xs">
            &copy; {new Date().getFullYear()} Maler Dorberth. Alle Rechte vorbehalten.
          </p>
          <p className="text-background/30 text-xs">
            Gladiolenweg 41, 90768 Fürth / Burgfarrnbach
          </p>
        </div>
      </div>
    </footer>
  );
}
