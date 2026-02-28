import { ArrowLeft } from 'lucide-react'

interface PrivacyPageProps {
  onClose: () => void
}

export default function PrivacyPage({ onClose }: PrivacyPageProps) {
  return (
    <div className="min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-gradient">Datenschutzerklärung</span>
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
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Verantwortlicher</h2>
            <p className="text-muted-foreground">
              Verantwortlich im Sinne der DSGVO ist:<br />
              [TODO: Vor- und Nachname]<br />
              [TODO: Anschrift]<br />
              E-Mail: [TODO: E-Mail-Adresse]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Hosting</h2>
            <p className="text-muted-foreground">
              Diese Website wird bei [TODO: Hosting-Anbieter, z.B. Vercel, Netlify] gehostet.
              Die Server befinden sich [TODO: Standort der Server]. Details entnehmen Sie der
              Datenschutzerklärung des Hosting-Anbieters.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Supabase (Authentifizierung & Datenbank)</h2>
            <p className="text-muted-foreground">
              Wir nutzen Supabase (Supabase Inc., USA) für die Benutzerauthentifizierung und
              Datenspeicherung. Dabei werden folgende Daten verarbeitet:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>E-Mail-Adresse (bei Registrierung/Login)</li>
              <li>Profilinformationen (Name, Branche, Schreibstil-Präferenzen)</li>
              <li>Erstellte Posts und deren Versionen (Post-Historie)</li>
              <li>Hochgeladene LinkedIn-Analytics-Daten</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
              Supabase-Server befinden sich in der EU (Frankfurt, eu-central-1).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. KI-gestützte Inhaltserstellung</h2>
            <p className="text-muted-foreground">
              Zur Erstellung von Social-Media-Posts werden Ihre Eingaben (Thema, URL, Stil-Präferenzen)
              an einen KI-Dienst übermittelt. Die Verarbeitung erfolgt über einen selbst gehosteten
              n8n-Workflow. Es werden keine personenbezogenen Daten an den KI-Anbieter übermittelt,
              die über die zur Post-Erstellung notwendigen Inhalte hinausgehen.
            </p>
            <p className="text-muted-foreground mt-2">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Cookies und lokale Speicherung</h2>
            <p className="text-muted-foreground">
              Diese Anwendung verwendet ausschließlich technisch notwendige Cookies und lokale
              Speicherung (localStorage) für:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Authentifizierungs-Token (Supabase Session)</li>
              <li>Theme-Präferenz (Dark/Light Mode)</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Es werden keine Tracking- oder Analyse-Cookies eingesetzt.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Ihre Rechte</h2>
            <p className="text-muted-foreground">
              Sie haben gemäß DSGVO folgende Rechte:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Auskunft</strong> (Art. 15 DSGVO) — Welche Daten wir über Sie speichern</li>
              <li><strong>Berichtigung</strong> (Art. 16 DSGVO) — Korrektur unrichtiger Daten</li>
              <li><strong>Löschung</strong> (Art. 17 DSGVO) — Löschung Ihrer Daten</li>
              <li><strong>Einschränkung</strong> (Art. 18 DSGVO) — Einschränkung der Verarbeitung</li>
              <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) — Export Ihrer Daten</li>
              <li><strong>Widerspruch</strong> (Art. 21 DSGVO) — Widerspruch gegen die Verarbeitung</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter: [TODO: E-Mail-Adresse]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Beschwerderecht</h2>
            <p className="text-muted-foreground">
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
              Ihrer personenbezogenen Daten zu beschweren.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Aktualität</h2>
            <p className="text-muted-foreground">
              Stand dieser Datenschutzerklärung: [TODO: Datum eintragen]
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
