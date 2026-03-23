import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum — Maler Dorberth, Malermeister Ralf Dorberth, Fürth/Burgfarrnbach.",
};

export default function ImpressumPage() {
  return (
    <main className="pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto prose prose-neutral">
        <h1 className="text-3xl font-bold text-foreground mb-8">Impressum</h1>

        <div className="space-y-6 text-muted-foreground">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Angaben gemäß § 5 TMG</h2>
            <p>Malermeister Ralf Dorberth</p>
            <p>Gladiolenweg 41</p>
            <p>90768 Fürth</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Kontakt</h2>
            <p>Telefon: 0911 / 977 949 71</p>
            <p>Mobil: 0172 / 970 60 33</p>
            <p>E-Mail: maler-dorberth@t-online.de</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Steuernummer</h2>
            <p>218/212/00668</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Berufsbezeichnung</h2>
            <p>Malermeister (verliehen in der Bundesrepublik Deutschland)</p>
            <p>Zuständige Kammer: Handwerkskammer Mittelfranken</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen
              Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind
              wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte
              fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
              rechtswidrige Tätigkeit hinweisen.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
              keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
              Gewähr übernehmen.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
