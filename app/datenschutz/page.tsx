import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung — Maler Dorberth, Fürth/Burgfarrnbach.",
};

export default function DatenschutzPage() {
  return (
    <main className="pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto prose prose-neutral">
        <h1 className="text-3xl font-bold text-foreground mb-8">Datenschutzerklärung</h1>

        <div className="space-y-6 text-muted-foreground">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Datenschutz auf einen Blick</h2>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
              personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Verantwortliche Stelle</h2>
            <p>Malermeister Ralf Dorberth</p>
            <p>Gladiolenweg 41, 90768 Fürth</p>
            <p>Telefon: 0911 / 977 949 71</p>
            <p>E-Mail: maler-dorberth@t-online.de</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Datenerfassung auf dieser Website</h2>
            <p>
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber.
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen.
              Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der
              Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten
              (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Hosting</h2>
            <p>
              Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser
              Website erfasst werden, werden auf den Servern des Hosters gespeichert.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Ihre Rechte</h2>
            <p>
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger
              und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben
              außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
