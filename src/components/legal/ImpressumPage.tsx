import { ArrowLeft } from 'lucide-react'

interface ImpressumPageProps {
  onClose: () => void
}

export default function ImpressumPage({ onClose }: ImpressumPageProps) {
  return (
    <div className="min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-gradient">Impressum</span>
          </h1>
          <button
            onClick={onClose}
            className="glass-button h-10 px-4 text-sm font-medium inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>
        </div>

        <div className="glass-panel p-6 md:p-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Angaben gemäß § 5 DDG</h2>
            {/* TODO: Persönliche Daten eintragen */}
            <p className="text-muted-foreground">
              [TODO: Vor- und Nachname]<br />
              [TODO: Straße und Hausnummer]<br />
              [TODO: PLZ und Ort]<br />
              [TODO: Land]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Kontakt</h2>
            <p className="text-muted-foreground">
              E-Mail: [TODO: E-Mail-Adresse]<br />
              Telefon: [TODO: Telefonnummer (optional)]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p className="text-muted-foreground">
              [TODO: Vor- und Nachname]<br />
              [TODO: Anschrift wie oben]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Umsatzsteuer-ID</h2>
            <p className="text-muted-foreground">
              [TODO: USt-IdNr. gemäß § 27a UStG, falls vorhanden — andernfalls Abschnitt entfernen]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">EU-Streitschlichtung</h2>
            <p className="text-muted-foreground">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Haftung für Inhalte</h2>
            <p className="text-muted-foreground">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Haftung für Links</h2>
            <p className="text-muted-foreground">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
              Seiten verantwortlich.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
