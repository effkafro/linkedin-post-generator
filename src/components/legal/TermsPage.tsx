import { ArrowLeft } from 'lucide-react'

interface TermsPageProps {
  onClose: () => void
}

export default function TermsPage({ onClose }: TermsPageProps) {
  return (
    <div className="min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-gradient">Nutzungsbedingungen</span>
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
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Geltungsbereich</h2>
            <p className="text-muted-foreground">
              Diese Nutzungsbedingungen gelten für die Nutzung der Webanwendung „Content Creator Pro"
              (nachfolgend „Dienst"), betrieben von [TODO: Betreibername]. Mit der Registrierung und
              Nutzung des Dienstes akzeptieren Sie diese Bedingungen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Leistungsbeschreibung</h2>
            <p className="text-muted-foreground">
              Der Dienst bietet folgende Funktionen:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>KI-gestützte Erstellung von Social-Media-Posts</li>
              <li>Verwaltung und Versionierung erstellter Inhalte</li>
              <li>Analyse von LinkedIn-Performance-Daten</li>
              <li>Persönliches Profil mit Schreibstil-Konfiguration</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Die generierten Inhalte dienen als Vorschläge. Die Verantwortung für veröffentlichte
              Inhalte liegt ausschließlich beim Nutzer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Nutzerkonto</h2>
            <p className="text-muted-foreground">
              Für die Nutzung des Dienstes ist eine Registrierung erforderlich. Sie sind verpflichtet,
              Ihre Zugangsdaten vertraulich zu behandeln und für alle Aktivitäten unter Ihrem Konto
              verantwortlich. Informieren Sie uns umgehend bei Verdacht auf unbefugte Nutzung.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Nutzungsrechte an generierten Inhalten</h2>
            <p className="text-muted-foreground">
              Die mit dem Dienst erstellten Inhalte dürfen Sie frei verwenden und veröffentlichen.
              Sie tragen die alleinige Verantwortung für die Inhalte, die Sie auf Basis der
              KI-Vorschläge veröffentlichen, insbesondere hinsichtlich Urheberrecht, Markenrecht
              und Persönlichkeitsrecht.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Verbotene Nutzung</h2>
            <p className="text-muted-foreground">
              Es ist untersagt, den Dienst für folgende Zwecke zu nutzen:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Erstellung rechtswidriger, diskriminierender oder irreführender Inhalte</li>
              <li>Spam oder automatisierte Massenveröffentlichungen</li>
              <li>Verletzung von Rechten Dritter</li>
              <li>Manipulation oder Reverse Engineering des Dienstes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Haftungsbeschränkung</h2>
            <p className="text-muted-foreground">
              Der Dienst wird „wie besehen" bereitgestellt. Wir übernehmen keine Gewähr für die
              Richtigkeit, Vollständigkeit oder Eignung der KI-generierten Inhalte. Die Haftung für
              leichte Fahrlässigkeit ist ausgeschlossen, soweit keine wesentlichen Vertragspflichten
              betroffen sind. Die Haftung ist in diesem Fall auf den vorhersehbaren, vertragstypischen
              Schaden begrenzt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Verfügbarkeit</h2>
            <p className="text-muted-foreground">
              Wir bemühen uns um eine hohe Verfügbarkeit des Dienstes, können jedoch keine
              ununterbrochene Erreichbarkeit garantieren. Wartungsarbeiten und technische Störungen
              können zu vorübergehenden Einschränkungen führen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Änderungen der Nutzungsbedingungen</h2>
            <p className="text-muted-foreground">
              Wir behalten uns vor, diese Nutzungsbedingungen jederzeit zu ändern. Über wesentliche
              Änderungen werden registrierte Nutzer per E-Mail informiert. Die fortgesetzte Nutzung
              des Dienstes nach Inkrafttreten der Änderungen gilt als Zustimmung.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Kündigung</h2>
            <p className="text-muted-foreground">
              Sie können Ihr Konto jederzeit löschen. Wir behalten uns das Recht vor, Nutzerkonten
              bei Verstoß gegen diese Nutzungsbedingungen zu sperren oder zu löschen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Anwendbares Recht und Gerichtsstand</h2>
            <p className="text-muted-foreground">
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist
              [TODO: Ort eintragen], sofern der Nutzer Kaufmann, juristische Person des öffentlichen
              Rechts oder öffentlich-rechtliches Sondervermögen ist.
            </p>
          </section>

          <section>
            <p className="text-muted-foreground">
              Stand: [TODO: Datum eintragen]
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
