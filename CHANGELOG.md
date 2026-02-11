# Changelog - Content Creator Pro

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
