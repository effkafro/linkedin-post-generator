# Content Creator Pro - SOP

## 1. Produktvision & Differenzierung

### Vision
Standalone-Applikation zur automatisierten Generierung professioneller Social-Media-Posts mittels LLM. Multi-Plattform-fähig (aktuell: LinkedIn), mit personalisierbarem Voice-Profil als Kern-Differenzierungsmerkmal gegenüber generischen KI-Tools.

### Differenzierung vs. ChatGPT
1. **Voice Training:** Nutzer hinterlegen Profil (Name, Rolle, Expertise, Werte, Zielgruppe) + Beispiel-Posts. Das System lernt den individuellen Schreibstil.
2. **Plattform-Optimierung:** Posts werden nach plattformspezifischen Regeln (Zeichenlimit, Hashtag-Limit, Algorithmus-Best-Practices) optimiert.
3. **One-Click Refinement:** Vordefinierte Refine-Aktionen (kürzer, länger, formeller, lockerer) + Custom-Anweisungen per Freitext.
4. **Version History:** Jede Änderung wird versioniert, navigierbar über Version-Navigation.
5. **Multi-Mode Input:** Thema, URL-Scraping, oder Job-Posting-Modus.

---

## 2. Architektur-Überblick

### System-Architektur
```
Frontend (React/Vite)  →  Webhook (POST)  →  n8n Workflow  →  LLM (OpenRouter)
       ↕                                                          ↓
  Supabase (Auth + DB)                                    Response (JSON)
  localStorage (Fallback)
```

### Frontend-Architektur
```
src/
  App.tsx                              # Providers + AppShell
  types/                               # Zentrales Type-System
    post.ts, job.ts, source.ts, profile.ts, history.ts, database.ts, analytics.ts
  constants/                           # Konfiguration & Optionen
    tone.ts, style.ts, language.ts, job.ts, refine.ts, modes.ts, platform.ts
  utils/                               # Pure Utility Functions
    formatText.ts, urlValidation.ts, hashContent.ts, buildProfilePayload.ts
  lib/
    supabase.ts                        # Supabase Client
    api.ts                             # Webhook API Calls
    storage/                           # Storage Adapter Pattern
      types.ts, localStorageAdapter.ts, supabaseStorageAdapter.ts
  contexts/
    AuthContext.tsx                     # Auth State + Methods
    ProfileContext.tsx                  # Voice Profile State
  hooks/
    usePostGenerator.ts                # Post Generation + Versioning
    usePostHistory.ts                  # History CRUD (via Storage Adapters)
    useProfile.ts                      # Profile CRUD
    useAnalytics.ts                    # Dashboard Analytics (Scrape, Metrics, Trends)
    useCopyToClipboard.ts              # Clipboard Utility
  components/
    layout/   (AppShell, Sidebar, TopBar)
    auth/     (AuthModal, UserMenu)
    theme/    (theme-provider, mode-toggle)
    post/
      PostWorkspace.tsx                # Orchestrator
      input/  (InputPanel, ModeTabs, TopicInput, UrlInput, JobInput, SettingsRow, GenerateButton)
      output/ (OutputPanel, PostDisplay, VersionNav, RefinePanel, ActionBar)
      shared/ (HelpModal, GlassSelect)
    history/  (PostHistory, PostHistoryItem)
    profile/  (ProfilePage, ProfileForm, VoiceSettings, ExamplePosts, ProfileCompleteness)
    dashboard/ (DashboardPage, DashboardSetup, TimeRangeSelector, MetricsOverview,
                EngagementChart, PostFrequencyChart, TopPostsList, ScrapeStatus)
```

### Backend (n8n Workflow)
```
Webhook (POST)
  → Build Profile Context (Code-Node: baut profileContext String aus body.profile)
  → Switch (mode)
    → [topic] Chain LLM (System-Prompt mit profileContext-Prefix)
    → [url] HTTP Request → HTML Extract → Chain LLM (mit profileContext-Prefix)
    → [job] Switch (hasExistingPosting)
        → [true] HTTP Request → HTML Extract → Chain LLM (mit profileContext-Prefix)
        → [false] Chain LLM (manuelle Daten, mit profileContext-Prefix)
  → Respond to Webhook
```

### Storage Adapter Pattern
```typescript
interface StorageAdapter {
  loadHistory(limit?: number): Promise<HistoryItem[]>
  addItem(item: NewHistoryItem): Promise<HistoryItem | null>
  updateItem(id: string, updates: HistoryItemUpdate): Promise<void>
  removeItem(id: string): Promise<void>
  clearAll(): Promise<void>
}
```
- **Nicht eingeloggt:** `localStorageAdapter` (localStorage, max 50 Einträge)
- **Eingeloggt:** `supabaseStorageAdapter` (Cloud-Sync, RLS)
- **Login-Merge:** Lokale Posts werden in Cloud hochgeladen, localStorage geleert

---

## 3. User-Profil & Voice Training

### Datenmodell
```typescript
interface VoiceProfile {
  id: string
  user_id: string
  // Identität
  full_name: string
  job_title: string
  company: string
  industry: string
  bio: string
  // Voice
  expertise_topics: string[]         // z.B. ["KI", "Leadership"]
  tone_preferences: string[]         // z.B. ["casual", "educational"]
  target_audience: string            // z.B. "CTOs und Engineering-Leads"
  personal_values: string[]          // z.B. ["Transparenz", "Innovation"]
  positioning_statement: string      // z.B. "Ich helfe Startups beim Skalieren"
  // Präferenzen
  preferred_language: Language
  preferred_emojis: 'none' | 'minimal' | 'moderate'
  hashtag_style: 'branded' | 'trending' | 'niche'
  default_cta_style: string
  created_at: string
  updated_at: string
}

interface ExamplePost {
  id: string
  profile_id: string
  content: string
  platform: 'linkedin'              // erweiterbar
  performance_notes?: string
  created_at: string
}
```

### UI-Komponenten
- **ProfilePage:** Vollständige Profilbearbeitung (erreichbar über UserMenu)
- **ProfileForm:** Name, Jobtitel, Firma, Branche, Bio
- **VoiceSettings:** Expertise-Topics, Tonalität, Zielgruppe, Werte, Positionierung (Tag-basierte Eingabe)
- **ExamplePosts:** Beispiel-Posts hochladen/verwalten mit Performance-Notizen
- **ProfileCompleteness:** Fortschrittsanzeige (farbcodiert: rot < 30%, gelb < 70%, grün >= 70%)

### Integration in Post-Generierung

**Webhook-Erweiterung:** Optionales `profile`-Feld im Request:
```json
{
  "mode": "topic",
  "topic": "...",
  "tone": "casual",
  "profile": {
    "full_name": "Florian Krause",
    "job_title": "CTO",
    "company": "Acme GmbH",
    "expertise_topics": ["KI", "SaaS"],
    "target_audience": "CTOs",
    "positioning_statement": "...",
    "example_posts": ["Post 1...", "Post 2..."]
  }
}
```

**n8n System-Prompt Injection:**
```
## AUTHOR PROFILE & VOICE
Write as {{ profile.full_name }}, {{ profile.job_title }} at {{ profile.company }}.
Expertise: {{ profile.expertise_topics }}
Target audience: {{ profile.target_audience }}
Values: {{ profile.personal_values }}

## STYLE EXAMPLES (match voice & rhythm):
{{ example_posts }}
```

**UI-Toggle:** Checkbox in SettingsRow: "Mein Profil als Kontext verwenden"

---

## 4. Content-Generierung (Modi, Settings, Plattform-Regeln)

### Input-Modi

#### Thema (mode: topic)
- **Typ:** Textarea (mehrzeilig)
- **Pflichtfeld:** Ja
- **Placeholder:** "Beschreibe das Thema deines Posts..."
- **Beispiele:**
  - "KI im HR-Bereich und wie sie Recruiting verändert"
  - "Meine Learnings nach 5 Jahren als Startup-Gründer"

#### URL (mode: url)
- **Typ:** Text-Input mit URL-Validierung
- **Placeholder:** "https://example.com/blog-artikel"
- **Validierung:** Muss gültige URL sein (beginnt mit http:// oder https://)
- **Flow:** URL eingeben → System scrapt Artikel → LLM generiert Post basierend auf Inhalt
- **Source-Badge:** "Basierend auf: [Artikel-Titel]" mit Link zur Original-URL

#### Job-Posting (mode: job)
- **Übersicht:** Optimierte LinkedIn-Posts für Stellenausschreibungen
- **Sub-Optionen:**
  - Bestehende Stellenausschreibung (URL) oder manuelle Eingabe
  - Job-Sub-Stil, Candidate Persona, Branche, Standort, Remote
- Details siehe [Job-Posting Abschnitt](#job-posting-details) unten

### Settings

#### Ton (tone)
| Value | Label | Beschreibung |
|-------|-------|--------------|
| professional | Professional | Seriös, fachlich, business-orientiert |
| casual | Casual | Locker, authentisch, nahbar |
| inspirational | Inspirational | Motivierend, empowernd, positiv |
| educational | Educational | Lehrreich, informativ, How-to-Stil |

#### Stil (style)
| Value | Label | Beschreibung |
|-------|-------|--------------|
| story | Story | Persönliche Geschichte mit Lesson Learned |
| listicle | Listicle | Nummerierte Liste mit Key Points |
| question-hook | Question-Hook | Startet mit provokanter Frage |
| bold-statement | Bold-Statement | Startet mit mutiger These/Aussage |

#### Sprache (language)
| Value | Label |
|-------|-------|
| de | Deutsch |
| en | English |
| fr | Français |
| es | Español |
| it | Italiano |

### Plattform-Regeln
| Plattform | Max. Zeichen | Hashtag-Limit |
|-----------|-------------|---------------|
| LinkedIn | 3000 | 5 |

*(Erweiterbar für Twitter/X, Instagram, etc.)*

### Refine-Optionen

#### Quick-Actions
| Value | Label | Prompt |
|-------|-------|--------|
| shorter | Kürzer | Kürze den Post auf maximal 800 Zeichen... |
| longer | Länger | Erweitere den Post auf 1500-2000 Zeichen... |
| formal | Formeller | Schreibe den Post formeller und professioneller um... |
| casual | Lockerer | Schreibe den Post lockerer und persönlicher um... |

#### Custom Refine
- Freitextfeld unterhalb der Quick-Actions
- Placeholder: "z.B. Mehr Emojis hinzufügen..."
- Enter sendet ab, Textfeld wird nach Erfolg geleert

### Version History
- Jede Generierung und jedes Refinement erstellt eine neue Version
- Navigation über VersionNav (V1/V3 etc.)
- Versionen werden mit History-Items persistiert

---

## 5. Webhook API Spezifikation

### Endpoint
- **Method:** POST
- **Path:** `/webhook/linkedin-post-generator`
- **CORS:** `*` (alle Origins erlaubt)

### Request-Format

#### Standard (topic/url)
```json
{
  "mode": "topic | url | job",
  "topic": "Das Thema...",
  "url": "https://...",
  "tone": "professional | casual | inspirational | educational",
  "style": "story | listicle | question-hook | bold-statement",
  "language": "de | en | fr | es | it",
  "profile": { ... }
}
```

#### Job-Mode
```json
{
  "mode": "job",
  "jobConfig": {
    "hasExistingPosting": true,
    "jobUrl": "https://...",
    "jobSubStyle": "wir-suchen | kennt-jemanden | persoenlich | opportunity",
    "candidatePersona": "junior | senior | c-level | freelancer",
    "industry": "tech | finance | healthcare | marketing | hr | legal | other",
    "location": "Berlin",
    "remoteOption": true,
    "companyName": "Acme GmbH",
    "jobTitle": "Senior Developer",
    "benefits": ["..."],
    "requirements": ["..."]
  },
  "tone": "...",
  "style": "...",
  "language": "..."
}
```

#### Refine
```json
{
  "mode": "refine",
  "currentPost": "Der aktuelle Post...",
  "action": "shorter | longer | formal | casual | custom",
  "customInstruction": "Mehr Emojis hinzufügen",
  "tone": "...",
  "style": "...",
  "language": "..."
}
```

### Response-Format
```json
{
  "output": "Der generierte Post mit Hashtags...",
  "source": {
    "title": "Artikel-Titel",
    "excerpt": "Erste 200 Zeichen...",
    "url": "https://original-url.com"
  }
}
```

### Fehler-Response
```json
{
  "output": "Fehler bei der Generierung. Bitte versuche es erneut."
}
```

---

## 6. Backend (n8n Workflow)

### Workflow-Datei
`n8n/linkedin_post_generator.json`

### System-Prompt (Basis-Persona)
```
Du bist ein erfahrener LinkedIn-Copywriter mit 10+ Jahren Erfahrung im Personal Branding und Content Marketing.

## DEINE AUFGABE
Generiere einen Post basierend auf dem gegebenen Thema, Ton und Stil.

## FORMAT-REGELN
1. **Länge:** 800-1500 Zeichen (optimal für LinkedIn-Algorithmus)
2. **Hook:** Die erste Zeile MUSS Aufmerksamkeit erregen (erscheint im Feed)
3. **Struktur:** Nutze Absätze und Leerzeilen für Lesbarkeit
4. **Emojis:** Sparsam einsetzen (max. 3-5 pro Post)
5. **Hashtags:** Exakt 3-5 relevante Hashtags am Ende
6. **CTA:** Schließe mit einer Frage oder Aufforderung zur Interaktion

## TON-ANPASSUNG
- **Professional:** Faktenbasiert, Branchenjargon erlaubt, keine Slang-Ausdrücke
- **Casual:** Persönlich, "Ich"-Perspektive, authentische Sprache
- **Inspirational:** Emotionale Trigger, Metaphern, empowernde Sprache
- **Educational:** Klar strukturiert, Bullet Points erlaubt, Mehrwert-fokussiert

## STIL-ANPASSUNG
- **Story:** "Als ich vor X Jahren..." oder "Letzte Woche ist mir etwas passiert..."
- **Listicle:** "5 Dinge, die ich über X gelernt habe:" (dann nummerierte Liste)
- **Question-Hook:** "Was wäre, wenn...?" oder "Hast du dich jemals gefragt...?"
- **Bold-Statement:** "X ist tot." oder "Vergiss alles, was du über X weißt."

## OUTPUT
Gib NUR den fertigen Post aus. Keine Erklärungen, keine Einleitung.
```

### URL-Mode System-Prompt
```
Du bist ein erfahrener LinkedIn-Copywriter. Fasse den folgenden Artikel-Inhalt als Post zusammen.

## ARTIKEL-INFORMATIONEN
- Titel: {{ $json.title }}
- URL: {{ $json.url }}
- Inhalt: {{ $json.content }}

## AUFGABE
Erstelle einen Post, der die Kernaussagen des Artikels zusammenfasst und für Engagement optimiert ist.

[Rest der FORMAT-REGELN wie beim Topic-Mode]
```

### Job-Mode System-Prompts

#### Mit bestehender Stellenausschreibung (hasExistingPosting=true)
```
Du bist ein erfahrener LinkedIn-Copywriter, spezialisiert auf Recruiting-Posts.

## AUFGABE
Erstelle einen LinkedIn-Post, der die folgende Stellenausschreibung bewirbt.

## STELLENAUSSCHREIBUNG
Titel: {{ $json.source.title }}
URL: {{ $json.jobConfig.jobUrl }}
Inhalt: {{ $json.source.content }}

## STIL: {{ $json.jobConfig.jobSubStyle }}
- "wir-suchen": Klassischer Recruiting-Post. "Wir suchen ab sofort..."
- "kennt-jemanden": Netzwerk aktivieren. "Kennt jemand von euch..."
- "persoenlich": Storytelling. "In meinem Team suchen wir..."
- "opportunity": Benefits-first. "Diese Chance solltest du nicht verpassen..."

## ZIELGRUPPE: {{ $json.jobConfig.candidatePersona }}
- junior: Betone Mentoring, Lernkurve, Team-Kultur
- senior: Betone Verantwortung, technische Challenges, Impact
- c-level: Betone Strategie, Leadership, Vision
- freelancer: Betone Projekt-Scope, Flexibilität

## ZUSATZINFOS
- Branche: {{ $json.jobConfig.industry }}
- Standort: {{ $json.jobConfig.location || 'Nicht angegeben' }}
- Remote: {{ $json.jobConfig.remoteOption ? 'Ja' : 'Nein' }}

## FORMAT-REGELN
1. Hook: Erste Zeile MUSS Aufmerksamkeit erregen
2. Länge: 800-1500 Zeichen
3. Emojis: Sparsam (max. 3-5)
4. Hashtags: 3-5 relevante (#hiring #jobs + branchenspezifische)
5. CTA: Klare Handlungsaufforderung ("Link in den Kommentaren", "DM mich")

## OUTPUT
Gib NUR den fertigen LinkedIn-Post aus.
```

#### Ohne bestehende Stellenausschreibung (hasExistingPosting=false)
```
Du bist ein erfahrener LinkedIn-Copywriter, spezialisiert auf Recruiting-Posts.

## AUFGABE
Erstelle einen LinkedIn-Post für folgende Stelle:

## JOB-DETAILS
- Position: {{ $json.jobConfig.jobTitle }}
- Unternehmen: {{ $json.jobConfig.companyName }}
- Benefits: {{ $json.jobConfig.benefits?.join(', ') || 'Nicht angegeben' }}
- Requirements: {{ $json.jobConfig.requirements?.join(', ') || 'Nicht angegeben' }}
- Zusätzlicher Kontext: {{ $json.topic }}

## STIL: {{ $json.jobConfig.jobSubStyle }}
[... wie oben ...]

## ZIELGRUPPE: {{ $json.jobConfig.candidatePersona }}
[... wie oben ...]

## ZUSATZINFOS
[... wie oben ...]

## FORMAT-REGELN
[... wie oben ...]

## OUTPUT
Gib NUR den fertigen LinkedIn-Post aus.
```

### Scraping-Strategie (URL/Job-URL)
1. **Primär:** HTML `<article>` Tag oder `main` Element
2. **Fallback:** Meta-Tags (og:title, og:description)
3. **Fallback:** `<h1>` + `<p>` Tags

### Custom Refine Prompt
```
Überarbeite diesen Post nach folgender Anweisung:

ANWEISUNG: {{ customInstruction }}

POST:
{{ currentPost }}
```

---

## 7. Datenbank-Schema

### Supabase-Tabellen

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'creator', 'pro', 'team', 'agency')),
  posts_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

#### posts
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('topic', 'url', 'job')),
  topic TEXT,
  url TEXT,
  source JSONB,              -- { title, excerpt, url }
  job_config JSONB,          -- Job-spezifische Konfiguration
  tone TEXT NOT NULL,
  style TEXT NOT NULL,
  language TEXT DEFAULT 'de',
  content TEXT NOT NULL,
  char_count INTEGER,
  versions JSONB,            -- Serialisierte Version-History
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own posts" ON posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX posts_user_id_created_at_idx ON posts(user_id, created_at DESC);
```

#### voice_profiles
```sql
CREATE TABLE voice_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  job_title TEXT,
  company TEXT,
  industry TEXT,
  bio TEXT,
  expertise_topics TEXT[] DEFAULT '{}',
  tone_preferences TEXT[] DEFAULT '{}',
  target_audience TEXT,
  personal_values TEXT[] DEFAULT '{}',
  positioning_statement TEXT,
  preferred_language TEXT DEFAULT 'de',
  preferred_emojis TEXT DEFAULT 'minimal' CHECK (preferred_emojis IN ('none', 'minimal', 'moderate')),
  hashtag_style TEXT DEFAULT 'trending' CHECK (hashtag_style IN ('branded', 'trending', 'niche')),
  default_cta_style TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own voice profile" ON voice_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own voice profile" ON voice_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own voice profile" ON voice_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own voice profile" ON voice_profiles FOR DELETE USING (auth.uid() = user_id);
```

#### example_posts
```sql
CREATE TABLE example_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES voice_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  platform TEXT DEFAULT 'linkedin',
  performance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE example_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own example posts" ON example_posts
  FOR ALL USING (
    profile_id IN (SELECT id FROM voice_profiles WHERE user_id = auth.uid())
  );
```

### TypeScript Types

#### HistoryItem
```typescript
interface HistoryItem {
  id: string
  user_id?: string
  mode: InputMode                    // 'topic' | 'url' | 'job'
  topic: string
  url?: string
  source?: SourceInfo
  jobConfig?: JobConfig
  tone: Tone
  style: Style
  language: Language
  content: string
  createdAt: string
  charCount: number
  versions?: SerializedPostVersion[]
}
```

#### Job Types
```typescript
type JobSubStyle = 'wir-suchen' | 'kennt-jemanden' | 'persoenlich' | 'opportunity'
type CandidatePersona = 'junior' | 'senior' | 'c-level' | 'freelancer'
type Industry = 'tech' | 'finance' | 'healthcare' | 'marketing' | 'hr' | 'legal' | 'other'

interface JobConfig {
  hasExistingPosting: boolean
  jobUrl?: string
  jobSubStyle: JobSubStyle
  candidatePersona: CandidatePersona
  industry: Industry
  location?: string
  remoteOption: boolean
  companyName?: string
  jobTitle?: string
  benefits?: string[]
  requirements?: string[]
}
```

---

## 8. Frontend-Spezifikation

### UI States
- **idle:** Formular leer, kein Output
- **loading:** Spinner, Button disabled, Streaming-Indikator
- **success:** Output sichtbar, Copy/Refine/Chat möglich
- **error:** Error-Banner mit Fehlermeldung
- **refining:** Refine-Buttons disabled, Spinner auf aktivem Button

### Komponenten-Übersicht

#### Layout
- **AppShell:** TopBar + Sidebar + Main Content
- **TopBar:** Mobile Sidebar-Toggle, UserMenu, Theme-Toggle
- **Sidebar:** Desktop immer sichtbar (320px), Mobile Slide-in Drawer

#### Post Workspace
- **PostWorkspace:** Orchestrator - verwaltet Form-State, delegiert an Input/Output
- **InputPanel:** ModeTabs + aktives Input-Form + SettingsRow + GenerateButton
- **OutputPanel:** PostDisplay + VersionNav + RefinePanel + ActionBar

#### History Sidebar
- **PostHistory:** Header mit "Verlauf", "Neuer Post"-Button, Clear All, scrollbare Liste
- **PostHistoryItem:** Topic (truncated 40 Zeichen), Preview (80 Zeichen), relative Zeit, Zeichenanzahl, Delete bei Hover

#### Profil
- **ProfilePage:** Erreichbar über UserMenu → "Mein Profil"
- **ProfileCompleteness:** Fortschrittsbalken oben
- **ProfileForm + VoiceSettings + ExamplePosts:** Tabs oder Sections

### Responsive Design
- **Desktop (>= 1024px):** Sidebar links, Content rechts, max-w-3xl
- **Mobile (< 1024px):** Sidebar als Drawer, Hamburger-Button in TopBar

### Design System
- **Glass Morphism:** Zwei Ebenen nach Elevated Surface Pattern:
  - `glass-panel`: Fuer Seiten-Elemente (Cards, Input/Output Panels, Sidebar Desktop). ~60-65% Opazitaet, `blur(20px)`.
  - `glass-panel-elevated`: Fuer Overlays (Dropdowns, Modals, Popovers, mobile Sidebar). ~92% Opazitaet, `blur(24px)`, tieferer Schatten. Verhindert Content-Durchscheinen.
  - `glass-input`, `glass-button`: Input- und Button-Styles mit Inner-Shadow bzw. Primary-Glow.
- **Dark/Light Mode:** Via ThemeProvider (`.dark` Klasse + `data-theme`), `storageKey: 'vite-ui-theme'`. Tailwind v4 `dark:` Variant per `@custom-variant dark (&:where(.dark, .dark *))` aktiviert.
- **Segmented Control (ModeTabs):** Positionsabhaengige Rundung - aeussere Kanten folgen der Container-Kurve (`rounded-[10px]`), innere Kanten sind flacher (`rounded-md`).
- **Animations:** `animate-in`, `fade-in`, `slide-in-from-top-2`

---

## 9. Umgebung & Konfiguration

### Frontend (.env.local)
```
VITE_WEBHOOK_URL=https://[n8n-instance]/webhook/linkedin-post-generator
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
VITE_ANALYTICS_WEBHOOK_URL=https://[n8n-instance]/webhook/analytics/scrape
```

### Backend (n8n)
- **API Key:** OpenRouter API Key (in n8n Credentials)
- **Model:** claude-3.5-sonnet (oder vergleichbar)
- **Temperature:** 0.7 (kreativ aber konsistent)
- **Workflow JSONs:**
  - `n8n/linkedin_post_generator.json` (Post-Generierung)
  - `n8n/analytics_scrape_webhook.json` (On-Demand Scrape)
  - `n8n/analytics_scrape_cron.json` (Daily Cron Scraper)

### Auth
- **Provider:** Supabase Auth
- **Methoden:** Email/Password + OAuth (Google, LinkedIn)
- **States:** loading → unauthenticated (localStorage) | authenticated (Cloud-Sync)

### Auth Context
```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithOAuth: (provider: 'google' | 'linkedin_oidc') => Promise<void>
  signOut: () => Promise<void>
}
```

### History Sync Logic
1. **Login:** Cloud-Posts laden → mit localStorage mergen (deduplizieren nach Content-Hash) → neue lokale Posts hochladen → localStorage leeren
2. **Logout:** Logout-Transition wird erkannt (`previousUserIdRef`). localStorage wird geleert, History-State auf `[]` gesetzt. Verhindert, dass Cloud-Daten in localStorage leaken (Race-Condition-Schutz zwischen Persistence-Effect und Load-Effect).
3. **Generierung:** Eingeloggt → Supabase, nicht eingeloggt → localStorage
4. **Persistence-Guard:** Der localStorage-Persistence-Effect schreibt nur, wenn `previousUserIdRef.current === null` (d.h. User war bereits vorher ausgeloggt). Verhindert ungewolltes Schreiben waehrend der Logout-Transition.

### Commands
```
npm run dev      # Starte Frontend Dev Server
npm run build    # Build für Production
npm run preview  # Preview Production Build lokal
```

---

## 10. Pricing & Usage Limits

| Plan | Posts/Monat | Preis |
|------|-------------|-------|
| free | 5 | Kostenlos |
| creator | 50 | TBD |
| pro | unlimited | TBD |
| team | unlimited | TBD |
| agency | unlimited | TBD |

*(Stripe-Integration geplant)*

---

## 11. Social Media Analytics Dashboard

### Feature-Beschreibung
Dashboard zur Analyse der eigenen Social-Media-Performance. LinkedIn Analytics Import: User exportieren ihre Content Analytics als XLS/XLSX/CSV und laden die Datei im Dashboard hoch. Parsing erfolgt client-side mit SheetJS. Metriken: Impressions, Clicks, CTR, Engagement Rate, Reactions, Comments, Shares, Video Views.

### Architektur
```
Frontend (React)  →  File Upload (Drag & Drop)  →  SheetJS Parser (client-side)
       ↕                                                  ↕
  Supabase (company_pages, scraped_posts, scrape_runs)    UPSERT parsed data
```

### Datenbank-Tabellen

#### company_pages
```sql
CREATE TABLE company_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'linkedin',
  page_url TEXT NOT NULL,
  page_name TEXT,
  page_avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, page_url)
);
-- RLS: Users can CRUD own pages only
```

#### scraped_posts
```sql
CREATE TABLE scraped_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_page_id UUID NOT NULL REFERENCES company_pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'linkedin',
  external_id TEXT,
  content TEXT,
  post_url TEXT,
  posted_at TIMESTAMPTZ,
  reactions_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  engagement_total INTEGER GENERATED ALWAYS AS (reactions_count + comments_count + shares_count) STORED,
  media_type TEXT NOT NULL DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'video', 'carousel')),
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC NOT NULL DEFAULT 0,
  engagement_rate NUMERIC NOT NULL DEFAULT 0,
  video_views INTEGER NOT NULL DEFAULT 0,
  source_type TEXT NOT NULL DEFAULT 'import',
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_page_id, external_id)
);
-- Unique index for deduplication: (user_id, post_url) WHERE post_url IS NOT NULL
-- RLS: Users can read/insert/update own posts only
```

#### scrape_runs
```sql
CREATE TABLE scrape_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_page_id UUID NOT NULL REFERENCES company_pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error')),
  posts_found INTEGER DEFAULT 0,
  posts_new INTEGER DEFAULT 0,
  posts_updated INTEGER DEFAULT 0,
  error_message TEXT,
  run_type TEXT NOT NULL DEFAULT 'import',
  file_name TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
-- RLS: Users can read/insert/update own runs only
```

### Datenquelle: LinkedIn Content Analytics Export
- User exportiert Daten aus LinkedIn: Profil → Analytics → Inhalt → Exportieren
- Unterstuetzte Formate: XLS, XLSX, CSV
- Spalten-Mapping fuer EN + DE LinkedIn-UI (automatische Erkennung)
- Parser: `src/utils/linkedinExportParser.ts` (SheetJS-basiert)
- Deduplizierung: Bei erneutem Import werden bestehende Posts anhand der Post-URL aktualisiert

### Dashboard UI States
| State | Beschreibung |
|-------|-------------|
| setup | Keine Daten importiert → DashboardSetup zeigt File Upload (Drag & Drop) |
| loading | Daten werden aus Supabase geladen → Spinner |
| loaded | Dashboard mit Charts, KPIs (Engagement + Impressions), Top/Worst Posts |
| error | Fehler beim Laden/Parsen → Error-Banner |
| importing | Import laeuft → Upload-Zone zeigt Spinner |

### Dashboard Komponenten
```
src/components/dashboard/
  DashboardPage.tsx          # Container (wie ProfilePage)
  DashboardSetup.tsx         # Onboarding: Drag-and-Drop File Upload
  TimeRangeSelector.tsx      # 7d | 30d | 90d | Alle
  MetricsOverview.tsx        # 4+4 KPI-Karten (Engagement + Impressions)
  EngagementChart.tsx        # recharts AreaChart (stacked)
  PostFrequencyChart.tsx     # recharts BarChart (Posts/Woche)
  TopPostsList.tsx           # Top 5 + Bottom 5 Posts
  ScrapeStatus.tsx           # Letzter Import + "Neue Datei importieren" Button
```

### Hook: useAnalytics
```typescript
// State: companyPage, posts, loading, importing, importError, timeRange, lastRun
// Methods: importFile(file), refreshData()
// Computed (useMemo): metrics, impressionMetrics, trends, postFrequency, topPosts, worstPosts
// Outlier-Erkennung: mean +/- 2*stddev
```

### Navigation
- Startseite ist die HomePage mit Auswahl zwischen "Content Creator" und "Dashboard"
- AppView: 'home' | 'workspace' | 'profile' | 'dashboard', Default: 'home'
- Home-Button (Home-Icon) in TopBar navigiert zurueck zur Startseite
- Dashboard/Profile "Zurueck" navigiert zurueck zur Startseite
- Dashboard und Profil weiterhin ueber UserMenu erreichbar

---

## Anhang: Job-Posting Details {#job-posting-details}

### Job-Sub-Stile
| Value | Label | Beschreibung |
|-------|-------|--------------|
| wir-suchen | "Wir suchen" | Klassisch, direkt. "Wir suchen ab sofort..." |
| kennt-jemanden | "Kennt ihr jemanden?" | Netzwerk aktivieren. "Kennt jemand von euch..." |
| persoenlich | "Persönliche Empfehlung" | Storytelling. "In meinem Team suchen wir..." |
| opportunity | "Opportunity Pitch" | Benefits-fokussiert. "Diese Chance solltest du nicht verpassen..." |

### Candidate Persona
| Value | Label | Anpassung im Post |
|-------|-------|-------------------|
| junior | Junior / Berufseinsteiger | Mentoring, Lernmöglichkeiten, Team-Kultur betonen |
| senior | Senior / Erfahren | Verantwortung, Impact, technische Challenges betonen |
| c-level | C-Level / Management | Strategie, Leadership, Unternehmensvision betonen |
| freelancer | Freelancer / Consultant | Projektdetails, Flexibilität, Tagessatz-Hinweise |

### Branchen
| Value | Label | Hashtag-Beispiele |
|-------|-------|-------------------|
| tech | Tech & IT | #tech #coding #developer |
| finance | Finance & Banking | #finance #banking #fintech |
| healthcare | Healthcare & Pharma | #healthcare #pharma #medtech |
| marketing | Marketing & Creative | #marketing #creative #digital |
| hr | HR & People | #hr #recruiting #peopleops |
| legal | Legal & Compliance | #legal #compliance #law |
| other | Andere Branche | Generische Job-Hashtags |
