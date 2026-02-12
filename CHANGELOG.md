# Changelog - Content Creator Pro

## [3.1.1] - History-Leak nach Logout behoben

### Bugfix: Cloud-Posts in localStorage nach Logout
- **Problem:** Beim Abmelden blieben Cloud-Posts im localStorage sichtbar. Nach Seiten-Refresh waren die Posts eines eingeloggten Users weiterhin fuer nicht-eingeloggte Besucher sichtbar.
- **Ursache:** Race-Condition zwischen zwei `useEffect`-Hooks in `usePostHistory`:
  1. Beim Logout wurde `user` auf `null` gesetzt
  2. Der Persistence-Effect (`!user && history.length > 0`) feuerte **vor** dem Load-Effect und schrieb die Cloud-History in localStorage
  3. Nach Refresh lud der Load-Effect die geleakten Posts aus localStorage
- **Fix:** Logout-Transition erkennen und localStorage bereinigen
  - **Load-Effect:** Erkennt Uebergang von eingeloggt → ausgeloggt via `previousUserIdRef`. Bei Logout: `clearLocalStorage()` + `setHistory([])` statt aus localStorage zu laden
  - **Persistence-Effect:** Zusaetzlicher Guard `previousUserIdRef.current === null` verhindert, dass der Effect waehrend des Logouts Cloud-Daten in localStorage schreibt

### Geaenderte Dateien
- `src/hooks/usePostHistory.ts` - Logout-Transition-Erkennung + Persistence-Guard

---

## [3.1.0] - Profil-Integration in Post-Generierung

### Profil als Kontext (NEU)
- **Toggle in SettingsRow:** "Mein Profil als Kontext verwenden" - nur sichtbar wenn eingeloggt + Profil vorhanden
- **Toggle persistent:** State in localStorage (`use-profile-context`), bleibt nach Reload erhalten
- **ProfilePayload:** Neues Interface (`types/profile.ts`) - schlankes Webhook-Format ohne DB-Metadaten
- **buildProfilePayload:** Neue Utility (`utils/buildProfilePayload.ts`) - konvertiert VoiceProfile + ExamplePost[] zu ProfilePayload
- **Profil bei Generate + Refine:** Profil-Kontext wird bei beiden Aktionen mitgesendet, damit die Stimme beim Ueberarbeiten erhalten bleibt
- **Completeness-Warnung:** Hinweis wenn Toggle aktiv aber Profil < 50% ausgefuellt

### n8n Workflow
- **Build Profile Context:** Neuer Code-Node zwischen Webhook und Switch Mode
  - Prueft ob `body.profile` im Request vorhanden ist
  - Baut `profileContext` String mit Autor-Profil, Expertise, Werten und Beispiel-Posts
  - Gibt leeren String zurueck wenn kein Profil (keine Aenderung am bestehenden Verhalten)
- **System-Prompt Injection:** Alle 4 Chain LLM Nodes (Topic, URL, Job URL, Job Manual) nutzen Expression `{{ $('Build Profile Context').item.json.profileContext || '' }}` als Prefix im System-Prompt
- **Verbindungen:** Webhook → Build Profile Context → Switch Mode (statt direkt Webhook → Switch Mode)

### Profil-Formular Bugfix
- **Fokus-Verlust behoben:** Tippen im Profilformular verlor nach jedem Buchstaben den Fokus
  - **Ursache 1:** `useEffect` Cleanup mit `[profile]` Dependency feuerte bei jedem optimistischen State-Update → sofortiger DB-Flush → `setSaving(true)` → Inputs disabled → Fokus weg
  - **Ursache 2:** `disabled={saving}` auf allen Text-Inputs liess Browser den Fokus entfernen
  - **Fix:** Optimistisches lokales Update + Debounced DB-Write (500ms), Cleanup nur bei Unmount (`[]`), `disabled` von allen Text-Inputs entfernt

### Geaenderte Dateien
- `src/types/profile.ts` - ProfilePayload Interface
- `src/utils/buildProfilePayload.ts` - NEU: Payload-Builder
- `src/hooks/usePostGenerator.ts` - profile in GenerateParams + refine()
- `src/hooks/useProfile.ts` - Optimistisches Update + Debounce + Fokus-Fix
- `src/components/post/PostWorkspace.tsx` - ProfileContext, Toggle, Payload-Orchestrierung
- `src/components/post/input/InputPanel.tsx` - 4 neue Props durchgereicht
- `src/components/post/input/SettingsRow.tsx` - Toggle-Switch UI
- `src/components/profile/ProfileForm.tsx` - disabled entfernt
- `src/components/profile/VoiceSettings.tsx` - disabled entfernt
- `src/components/profile/ProfilePage.tsx` - saving-Prop entfernt
- `n8n/linkedin_post_generator.json` - Build Profile Context Node + System-Prompt Expressions

---

## [3.0.0] - Codebase Restructuring & Voice Profile System

### Architektur-Refactoring
- **PostGenerator.tsx zerlegt:** 968-Zeilen-Monolith in ~12 fokussierte Komponenten aufgeteilt
  - `PostWorkspace.tsx` als Orchestrator (~140 Zeilen)
  - `input/`: InputPanel, ModeTabs, TopicInput, UrlInput, JobInput, SettingsRow, GenerateButton
  - `output/`: OutputPanel, PostDisplay, VersionNav, RefinePanel, ActionBar
  - `shared/`: GlassSelect, HelpModal
- **Type-System zentralisiert:** Zirkuläre Dependencies aufgelöst
  - `types/post.ts`, `types/job.ts`, `types/source.ts`, `types/profile.ts`
- **Constants extrahiert:** Inline-Definitionen in eigene Dateien
  - `constants/tone.ts`, `style.ts`, `language.ts`, `job.ts`, `refine.ts`, `modes.ts`, `platform.ts`
- **Utils extrahiert:** `formatText.ts`, `urlValidation.ts`, `hashContent.ts`
- **Storage Adapter Pattern:** `usePostHistory` von 395 auf ~140 Zeilen reduziert
  - `lib/storage/localStorageAdapter.ts` + `supabaseStorageAdapter.ts`
- **Layout reorganisiert:** Komponenten nach Feature gruppiert
  - `layout/`: AppShell, Sidebar, TopBar
  - `auth/`: AuthModal, UserMenu
  - `theme/`: theme-provider, mode-toggle
  - `history/`: PostHistory, PostHistoryItem
  - `profile/`: ProfilePage, ProfileForm, VoiceSettings, ExamplePosts, ProfileCompleteness

### Voice Training Profil-System (NEU)
- **VoiceProfile:** Name, Jobtitel, Firma, Branche, Bio, Expertise, Tonalität, Zielgruppe, Werte
- **ExamplePosts:** Beispiel-Posts mit Performance-Notizen hochladen
- **ProfileCompleteness:** Farbcodierte Fortschrittsanzeige
- **Supabase Migration:** `voice_profiles` + `example_posts` Tabellen mit RLS
- **ProfileContext:** State-Management für Profildaten
- **Zugang:** UserMenu > "Mein Profil"

### Auth-Verbesserungen
- **Auto-Profil-Erstellung:** `fetchOrCreateProfile` erstellt automatisch `profiles`-Eintrag beim ersten Login
- **Race Condition Fix:** `onAuthStateChange` als Single Source of Truth (ersetzt `getSession()`)
- **TopBar Fixed Positioning:** Controls immer sichtbar (z-50)

### Naming & Multi-Platform
- Header: "LinkedIn Post Generator" → "Content Creator"
- `platform.ts` Constants für zukünftige Multi-Platform-Unterstützung
- SOP umbenannt: `linkedin_post_generator_sop.md` → `content_creator_sop.md`

### Entfernt
- `ChatWindow.tsx` / `useChat.ts` — Redundant zur Freitext-Verfeinerung
- `PostGenerator.tsx` — Ersetzt durch modulare Komponenten

---

## [2.0.0] - SaaS Foundation + Job-Posting Mode

### Neue Features
- **Supabase Auth:** Email/Password Login, OAuth (Google, LinkedIn) vorbereitet
- **Cloud History:** Cross-Device Sync mit automatischer localStorage-Migration
- **Job-Posting Mode:** Optimierte Posts für Stellenausschreibungen
  - Mit URL (Scraping) oder manuelle Eingabe
  - Sub-Stile: "Wir suchen", "Kennt ihr jemanden?", "Persönliche Empfehlung", "Opportunity Pitch"
  - Candidate Persona: Junior, Senior, C-Level, Freelancer
  - Branche, Standort, Remote-Option
- **UserMenu:** Plan-Badge, Posts-Counter, Upgrade-Button

### Datenbank
- `profiles` Tabelle (User-Profil, Plan, Stats)
- `posts` Tabelle (generierte Inhalte, History)
- Row Level Security für alle Tabellen

---

## [1.0.0] - Initial Release

### Features
- Post-Generierung via n8n Webhook + LLM
- 3 Input-Modi: Thema, URL, Job
- 4 Tone-Optionen: Professional, Casual, Inspirational, Educational
- 4 Style-Optionen: Story, Listicle, Question-Hook, Bold-Statement
- 5 Sprachen: DE, EN, FR, ES, IT
- Refine: Kürzer, Länger, Formeller, Lockerer, Custom
- Version History mit Navigation
- Post History Sidebar (localStorage)
- Dark/Light Mode
- Responsive Design (Mobile-first)
