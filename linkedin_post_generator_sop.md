# LinkedIn Post Generator - SOP

## Zweck
Standalone-Applikation zur automatisierten Generierung professioneller LinkedIn-Posts mittels LLM. Der User gibt ein Thema, einen Ton und einen Stil vor - das System generiert einen optimierten Post mit Hashtags.

## Architektur

### Backend (n8n Workflow)
```
Webhook (POST) → Chain LLM → Respond to Webhook
```

### Frontend (React/Vite)
- Eingabeformular mit Thema-Textarea
- Dropdown-Selektoren für Ton und Stil
- Output-Bereich mit Copy-Funktion

---

## Webhook-Spezifikation

### Endpoint
- **Method:** POST
- **Path:** `/webhook/linkedin-post-generator`
- **CORS:** `*` (alle Origins erlaubt)

### Request-Format
```json
{
  "topic": "Das Thema des LinkedIn Posts (Pflichtfeld)",
  "tone": "professional | casual | inspirational | educational",
  "style": "story | listicle | question-hook | bold-statement",
  "language": "de | en | fr | es | it"
}
```

### Response-Format
```json
{
  "output": "Der generierte LinkedIn Post mit Hashtags..."
}
```

### Fehler-Response
```json
{
  "output": "Fehler bei der Generierung. Bitte versuche es erneut."
}
```

---

## Input-Felder Definition

### 1. Thema (topic)
- **Typ:** Textarea (mehrzeilig)
- **Pflichtfeld:** Ja
- **Placeholder:** "Beschreibe das Thema deines LinkedIn Posts..."
- **Beispiele:**
  - "KI im HR-Bereich und wie sie Recruiting verändert"
  - "Meine Learnings nach 5 Jahren als Startup-Gründer"
  - "Warum Remote Work die Zukunft ist"

### 2. Ton (tone)
- **Typ:** Dropdown/Select
- **Pflichtfeld:** Ja
- **Optionen:**
  | Value | Label | Beschreibung |
  |-------|-------|--------------|
  | professional | Professional | Seriös, fachlich, business-orientiert |
  | casual | Casual | Locker, authentisch, nahbar |
  | inspirational | Inspirational | Motivierend, empowernd, positiv |
  | educational | Educational | Lehrreich, informativ, How-to-Stil |

### 3. Stil (style)
- **Typ:** Dropdown/Select
- **Pflichtfeld:** Ja
- **Optionen:**
  | Value | Label | Beschreibung |
  |-------|-------|--------------|
  | story | Story | Persönliche Geschichte mit Lesson Learned |
  | listicle | Listicle | Nummerierte Liste mit Key Points |
  | question-hook | Question-Hook | Startet mit provokanter Frage |
  | bold-statement | Bold-Statement | Startet mit mutiger These/Aussage |

### 4. Sprache (language)
- **Typ:** Dropdown/Select
- **Pflichtfeld:** Ja
- **Default:** de
- **Optionen:**
  | Value | Label | Beschreibung |
  |-------|-------|--------------|
  | de | Deutsch | Post wird auf Deutsch generiert |
  | en | English | Post wird auf Englisch generiert |
  | fr | Français | Post wird auf Französisch generiert |
  | es | Español | Post wird auf Spanisch generiert |
  | it | Italiano | Post wird auf Italienisch generiert |

---

## System-Prompt (LinkedIn Copywriter Persona)

```
Du bist ein erfahrener LinkedIn-Copywriter mit 10+ Jahren Erfahrung im Personal Branding und Content Marketing.

## DEINE AUFGABE
Generiere einen LinkedIn-Post basierend auf dem gegebenen Thema, Ton und Stil.

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
Gib NUR den fertigen LinkedIn-Post aus. Keine Erklärungen, keine Einleitung.
```

---

## Frontend Requirements

### UI-Komponenten
1. **Header:** "LinkedIn Post Generator" mit Untertitel
2. **Thema-Textarea:** Auto-resize, Character Counter optional
3. **Dropdown-Row:** Ton und Stil nebeneinander
4. **Generate-Button:** Primärer CTA, disabled während Loading
5. **Output-Card:** Generierter Post mit Copy-Button
6. **Action-Buttons:** Copy + Neu Generieren

### States
- **idle:** Formular leer, kein Output
- **loading:** Spinner, Button disabled
- **success:** Output sichtbar, Copy möglich
- **error:** Toast/Alert mit Fehlermeldung

### UX-Details
- Loading-Spinner während Generierung
- Toast-Notification bei erfolgreichem Copy
- Error-Handling bei API-Fehlern
- Responsive Design (Mobile-first)

---

## Environment-Konfiguration

### Frontend (.env.local)
```
VITE_WEBHOOK_URL=https://[n8n-instance]/webhook/linkedin-post-generator
```

### Backend (n8n)
- OpenRouter API Key (in n8n Credentials)
- Model: claude-3.5-sonnet (oder vergleichbar)
- Temperature: 0.7 (kreativ aber konsistent)

---

## Post History Feature

### Übersicht
Die App speichert alle generierten Posts automatisch in einer Sidebar auf der linken Seite. Nutzer können frühere Posts wiederherstellen, um sie erneut zu bearbeiten oder als Vorlage zu verwenden.

### Datenstruktur
```typescript
interface HistoryItem {
  id: string              // UUID
  topic: string           // Original Topic
  tone: Tone              // Tone-Setting
  style: Style            // Style-Setting
  content: string         // Generierter Content
  createdAt: string       // ISO Timestamp
  charCount: number       // Zeichenanzahl
}
```

### Speicherung
- **localStorage Key:** `linkedin-post-history`
- **Max. Einträge:** 50 (älteste werden automatisch entfernt)
- **Auto-Save:** Bei jeder erfolgreichen Generierung

### UI-Komponenten

#### Sidebar (Desktop)
- **Breite:** 320px (w-80)
- **Position:** Links, immer sichtbar
- **Inhalt:** Header mit "Verlauf", Clear All Button, scrollbare Liste

#### Sidebar (Mobile < 1024px)
- **Trigger:** Toggle-Button oben links (Clock-Icon)
- **Verhalten:** Slide-in Drawer von links
- **Backdrop:** Halbtransparentes Overlay
- **Schließen:** X-Button, Backdrop-Klick, oder Escape-Taste

#### History-Eintrag
- Topic (truncated auf 40 Zeichen)
- Content-Preview (truncated auf 80 Zeichen)
- Relative Zeit (z.B. "vor 5 Min.")
- Zeichenanzahl
- Delete-Button (erscheint bei Hover)

### Funktionen
1. **Restore:** Klick auf Eintrag lädt Topic, Tone, Style und Content ins Formular
2. **Delete:** Einzelnen Eintrag löschen
3. **Clear All:** Alle Einträge löschen

### States
- **empty:** "Noch keine Posts generiert" mit Icon
- **filled:** Liste der History-Einträge
- **loading:** Kein spezieller State (synchron via localStorage)

---

## URL → Post Feature

### Übersicht
Zusätzlich zur manuellen Themeneingabe können Nutzer eine Blog- oder Artikel-URL eingeben. Das System scrapt den Artikel-Inhalt und generiert daraus einen LinkedIn-Post.

### User Flow
1. User wählt Tab "URL" (statt "Thema")
2. User gibt Blog-URL ein
3. System scraped Artikel (Titel, Text)
4. User sieht Preview: "Gefundener Inhalt: [Titel]..."
5. User wählt Ton + Stil wie gewohnt
6. LLM generiert Post basierend auf Artikel-Content
7. User kann refinen, kopieren, speichern

### UI-Änderungen

#### Tab-Umschalter
- **Optionen:** "Thema" | "URL"
- **Position:** Oberhalb des Input-Bereichs
- **Verhalten:** Wechselt zwischen Topic-Textarea und URL-Input
- **Erweiterbar:** Später: "YouTube" | "PDF"

#### URL-Input
- **Typ:** Text-Input mit URL-Validierung
- **Placeholder:** "https://example.com/blog-artikel"
- **Validierung:** Muss gültige URL sein (beginnt mit http:// oder https://)
- **Error-State:** "Bitte gib eine gültige URL ein"

#### Source-Badge (im Output)
- **Position:** Unterhalb des generierten Posts
- **Inhalt:** "Basierend auf: [Artikel-Titel]" mit Link zur Original-URL
- **Nur sichtbar:** Bei mode=url

---

## Webhook-Spezifikation (Erweitert)

### Request-Format (Erweitert)
```json
{
  "mode": "topic | url | job",     // Art der Eingabe
  "topic": "Das Thema...",         // Bei mode=topic
  "url": "https://...",            // Bei mode=url
  "tone": "professional | casual | inspirational | educational",
  "style": "story | listicle | question-hook | bold-statement",
  "language": "de | en | fr | es | it",  // Zielsprache des Posts

  // Job-Mode spezifische Felder (nur bei mode=job)
  "jobConfig": {
    "hasExistingPosting": true,    // Hat User bestehende Stellenausschreibung?
    "jobUrl": "https://...",       // URL zur Stellenausschreibung (wenn hasExistingPosting=true)
    "jobSubStyle": "wir-suchen | kennt-jemanden | persoenlich | opportunity",
    "candidatePersona": "junior | senior | c-level | freelancer",
    "industry": "tech | finance | healthcare | marketing | hr | legal | other",
    "location": "Berlin",          // Optional
    "remoteOption": true,
    "companyName": "Acme GmbH",    // Optional, wenn hasExistingPosting=false
    "jobTitle": "Senior Developer", // Optional, wenn hasExistingPosting=false
    "benefits": ["..."],           // Optional
    "requirements": ["..."]        // Optional
  }
}
```

### Response-Format (Erweitert)
```json
{
  "output": "Der generierte LinkedIn Post mit Hashtags...",
  "source": {                      // Bei mode=url oder mode=job mit jobUrl
    "title": "Artikel-Titel",
    "excerpt": "Erste 200 Zeichen des Artikels...",
    "url": "https://original-url.com"
  }
}
```

---

## Backend (n8n) - URL Mode

### Workflow-Erweiterung
```
Webhook (POST)
  → Switch (mode == "url" oder "topic")
    → [topic] Chain LLM (wie bisher)
    → [url] HTTP Request (URL abrufen)
             → HTML Extract (Titel + Content)
             → Set (Daten strukturieren)
             → Chain LLM (Content → Post)
  → Respond to Webhook
```

### Scraping-Strategie
1. **Primär:** HTML `<article>` Tag oder `main` Element
2. **Fallback:** Meta-Tags (og:title, og:description)
3. **Fallback:** `<h1>` + `<p>` Tags

### Angepasster System-Prompt für URL-Mode
```
Du bist ein erfahrener LinkedIn-Copywriter. Fasse den folgenden Artikel-Inhalt als LinkedIn-Post zusammen.

## ARTIKEL-INFORMATIONEN
- Titel: {{ $json.title }}
- URL: {{ $json.url }}
- Inhalt: {{ $json.content }}

## AUFGABE
Erstelle einen LinkedIn-Post, der die Kernaussagen des Artikels zusammenfasst und für LinkedIn-Engagement optimiert ist.

[Rest der FORMAT-REGELN wie beim Topic-Mode]
```

---

## Datenstruktur (Erweitert)

### HistoryItem (Erweitert)
```typescript
interface HistoryItem {
  id: string
  user_id?: string              // Supabase User ID (null für localStorage/anonyme User)
  mode: 'topic' | 'url' | 'job'
  topic: string                 // Bei mode=topic/job
  url?: string                  // Bei mode=url
  source?: {                    // Bei mode=url
    title: string
    excerpt: string
    url: string
  }
  // Job-spezifische Felder (mode=job)
  jobConfig?: {
    hasExistingPosting: boolean   // Hat der User eine bestehende Stellenausschreibung?
    jobUrl?: string               // URL zur Stellenausschreibung (wenn hasExistingPosting=true)
    jobSubStyle: JobSubStyle      // wir-suchen | kennt-jemanden | persoenlich | opportunity
    candidatePersona: CandidatePersona  // junior | senior | c-level | freelancer
    industry: Industry
    location?: string
    remoteOption: boolean
    companyName?: string
    jobTitle?: string
    benefits?: string[]
    requirements?: string[]
  }
  tone: Tone
  style: Style
  language: Language            // Zielsprache (de, en, fr, es, it)
  content: string
  createdAt: string
  charCount: number
}
```

### Neue Typen für Job-Posting
```typescript
type JobSubStyle = 'wir-suchen' | 'kennt-jemanden' | 'persoenlich' | 'opportunity'
type CandidatePersona = 'junior' | 'senior' | 'c-level' | 'freelancer'
type Industry = 'tech' | 'finance' | 'healthcare' | 'marketing' | 'hr' | 'legal' | 'other'
```

---

## Job-Posting Mode

### Übersicht
Der Job-Posting Mode ermöglicht es Recruitern und HR-Teams, optimierte LinkedIn-Posts für Stellenausschreibungen zu generieren.

### User Flow
1. User wählt Tab "Job"
2. User entscheidet: "Stellenausschreibung vorhanden?" (Ja/Nein)
3. **Wenn JA:** User gibt URL zur Stellenausschreibung ein + optionaler Kontext
4. **Wenn NEIN:** User gibt Jobtitel, Firma, Benefits, Requirements manuell ein
5. User wählt Job-Sub-Stil und Candidate Persona
6. User wählt optionale Felder (Branche, Standort, Remote)
7. System generiert optimierten Job-Post

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

### System-Prompt für Job-Mode

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

---

## Supabase Integration

### Architektur
Die App nutzt Supabase für:
1. **Authentifizierung** - Email/Password + OAuth (Google, LinkedIn)
2. **Cloud-Storage** - Post-History synchronisiert über Geräte
3. **Row Level Security** - User sehen nur eigene Daten

### Environment Variables
```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
```

### Datenbank-Schema

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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own posts" ON posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Index für Performance
CREATE INDEX posts_user_id_created_at_idx ON posts(user_id, created_at DESC);
```

### Auth States
- **loading:** Auth-Status wird geprüft
- **unauthenticated:** User nicht eingeloggt (localStorage-Mode)
- **authenticated:** User eingeloggt (Cloud-Sync aktiv)

### Frontend Components

#### AuthContext
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

#### History Sync Logic
```typescript
// usePostHistory.ts erweitert
1. Wenn User einloggt:
   - Lade Cloud-Posts
   - Merge mit localStorage-Posts (deduplizieren nach content-hash)
   - Uploade neue lokale Posts in Cloud
   - Lösche localStorage

2. Wenn User ausloggt:
   - Wechsle zu localStorage-Mode
   - Cloud-Posts werden nicht mehr angezeigt

3. Wenn User generiert:
   - Wenn eingeloggt: Speichere in Supabase
   - Wenn nicht eingeloggt: Speichere in localStorage
```

### Usage Limits (für spätere Stripe-Integration)
| Plan | Posts/Monat |
|------|-------------|
| free | 5 |
| creator | 50 |
| pro | unlimited |
| team | unlimited |
| agency | unlimited |
