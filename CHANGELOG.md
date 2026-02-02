# Changelog - LinkedIn Post Generator

## [2.0.0] - Phase 1: SaaS Foundation + Job-Posting Mode

### Übersicht
Diese Version erweitert den LinkedIn Post Generator um:
1. **Supabase-Integration** für Auth und Cloud-Storage
2. **Job-Posting Mode** für Recruiter/HR-Teams
3. **User Authentication** mit Email/Password und OAuth

---

## Neue Features

### 1. Authentifizierung (Supabase Auth)
- **Email/Password Login** - Klassische Registrierung und Anmeldung
- **OAuth Support** - Google und LinkedIn Login vorbereitet
- **User Profile** - Plan-Anzeige, Posts-Counter, Avatar
- **Session Management** - Automatische Session-Persistenz

### 2. Cloud History (Supabase Database)
- **Cross-Device Sync** - Posts werden in der Cloud gespeichert
- **Automatische Migration** - Lokale Posts werden bei erstem Login hochgeladen
- **Fallback auf localStorage** - Funktioniert auch ohne Login
- **Row Level Security** - User sehen nur eigene Daten

### 3. Job-Posting Mode (Recruiter-Features)
- **Zwei Eingabe-Modi:**
  - Mit URL: Stellenausschreibung wird gescrapt
  - Manuell: Jobtitel, Firma, Benefits, Requirements eingeben
- **Job-Sub-Stile:**
  - "Wir suchen" - Klassisch, direkt
  - "Kennt ihr jemanden?" - Netzwerk aktivieren
  - "Persönliche Empfehlung" - Storytelling
  - "Opportunity Pitch" - Benefits-fokussiert
- **Candidate Persona:**
  - Junior / Berufseinsteiger
  - Senior / Erfahren
  - C-Level / Management
  - Freelancer / Consultant
- **Zusätzliche Optionen:**
  - Branche (Tech, Finance, Healthcare, etc.)
  - Standort
  - Remote möglich (Toggle)

---

## Neue Dateien

### Frontend (src/)

#### `src/lib/supabase.ts`
Supabase Client Initialisierung mit optionaler Konfiguration.
```typescript
export const supabase = createSupabaseClient()
export const isSupabaseConfigured = !!supabase
```

#### `src/contexts/AuthContext.tsx`
React Context für Authentication State Management.
- `user` - Aktueller User oder null
- `profile` - User-Profil mit Plan und Stats
- `signIn()`, `signUp()`, `signOut()`
- `signInWithOAuth()` - Google/LinkedIn

#### `src/components/AuthModal.tsx`
Login/Register Modal mit:
- OAuth Buttons (Google, LinkedIn)
- Email/Password Formular
- Registrierung mit Name
- Error/Success Messages

#### `src/components/UserMenu.tsx`
Dropdown-Menü für eingeloggte User:
- Avatar/Initials
- Plan-Badge (Free, Pro, etc.)
- Posts-Counter mit Limit-Anzeige
- Upgrade-Button (Free Users)
- Logout-Button

#### `src/types/database.ts`
TypeScript-Typen für Supabase Database:
- `Database` - Vollständiges DB-Schema
- `PostRow`, `ProfileRow` - Tabellen-Typen
- `JobConfig`, `SourceInfo` - JSON-Felder
- `JobSubStyle`, `CandidatePersona`, `Industry`

### Backend (supabase/)

#### `supabase/schema.sql`
Vollständiges Datenbank-Schema:
```sql
-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  posts_this_month INTEGER DEFAULT 0,
  ...
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  mode TEXT NOT NULL,  -- 'topic' | 'url' | 'job'
  topic TEXT,
  url TEXT,
  source JSONB,
  job_config JSONB,
  tone TEXT NOT NULL,
  style TEXT NOT NULL,
  language TEXT DEFAULT 'de',
  content TEXT NOT NULL,
  ...
);
```

### Konfiguration

#### `.env.example`
Template für Environment Variables:
```
VITE_WEBHOOK_URL=https://...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

---

## Geänderte Dateien

### `src/App.tsx`
- **Struktur geändert:** `AppContent` Komponente für Hooks
- **AuthProvider** umschließt jetzt die gesamte App
- **UserMenu** in der Top-Bar hinzugefügt
- **AuthModal** für Login/Register

### `src/hooks/usePostHistory.ts`
- **Supabase-Integration:** Sync mit Cloud wenn eingeloggt
- **Automatische Migration:** localStorage → Cloud bei Login
- **Optimistic Updates:** Sofortige UI-Updates
- **Fallback:** localStorage wenn nicht eingeloggt

### `src/hooks/usePostGenerator.ts`
- **Neue Typen:** `JobSubStyle`, `CandidatePersona`, `Industry`
- **Job-Mode Validierung:** Prüft jobConfig Parameter
- **Erweiterte generate():** Sendet jobConfig an Webhook

### `src/components/PostGenerator.tsx`
- **Neuer Tab "Job"** neben Thema und URL
- **Job-Formular:**
  - Toggle "Stellenausschreibung vorhanden?"
  - URL-Input oder manuelle Felder
  - Job-Sub-Stil Dropdown
  - Candidate Persona Dropdown
  - Branche, Standort, Remote-Toggle
- **Erweiterte Props:** jobConfig in initialState und onPostGenerated

### `src/types/history.ts`
- **Neuer Mode:** `'job'` hinzugefügt
- **JobConfig Interface:** Alle Job-spezifischen Felder
- **Re-exports:** JobSubStyle, CandidatePersona, Industry

### `linkedin_post_generator_sop.md`
- **Job-Mode Dokumentation:** User Flow, Sub-Stile, Personas
- **Webhook-Spec erweitert:** jobConfig Parameter
- **System-Prompts:** Job URL und Job Manual Prompts
- **Supabase-Architektur:** Schema, RLS, Auth States

### `n8n/linkedin_post_generator.json`
- **Neuer Switch-Case:** `mode === 'job'`
- **Switch Job Type:** hasExistingPosting true/false
- **Job URL Pfad:** Fetch → Extract → Set → LLM → Respond
- **Job Manual Pfad:** Set → LLM → Respond
- **Neue LLM Nodes:** Chain LLM (Job URL), Chain LLM (Job Manual)
- **Job-spezifische Prompts:** Mit Stil/Persona/Branche Anpassungen

---

## Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  App.tsx                                                     │
│    └── AuthProvider (Context)                                │
│         └── ThemeProvider                                    │
│              └── AppContent                                  │
│                   ├── UserMenu ←── useAuth()                 │
│                   ├── Sidebar                                │
│                   │    └── PostHistory ←── usePostHistory()  │
│                   ├── PostGenerator ←── usePostGenerator()   │
│                   └── AuthModal                              │
├─────────────────────────────────────────────────────────────┤
│  Hooks                                                       │
│    ├── useAuth() ←── Supabase Auth                          │
│    ├── usePostHistory() ←── Supabase DB / localStorage      │
│    └── usePostGenerator() ←── n8n Webhook                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      n8n Workflow                            │
├─────────────────────────────────────────────────────────────┤
│  Webhook                                                     │
│    └── Switch Mode                                           │
│         ├── [url] → Fetch → Extract → LLM → Respond         │
│         ├── [topic] → LLM → Respond                         │
│         └── [job] → Switch Job Type                         │
│                      ├── [URL] → Fetch → Extract → LLM      │
│                      └── [Manual] → Set → LLM → Respond     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                              │
├─────────────────────────────────────────────────────────────┤
│  Auth                                                        │
│    ├── Email/Password                                        │
│    └── OAuth (Google, LinkedIn)                              │
│                                                              │
│  Database                                                    │
│    ├── profiles (user data, plan, stats)                    │
│    └── posts (generated content, history)                   │
│                                                              │
│  Row Level Security                                          │
│    └── Users see only their own data                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup-Anleitung

### 1. Supabase Projekt erstellen
1. Gehe zu https://supabase.com und erstelle ein neues Projekt
2. Kopiere die Project URL und den anon key

### 2. Datenbank-Schema anwenden
1. Gehe zu SQL Editor in Supabase
2. Füge den Inhalt von `supabase/schema.sql` ein
3. Führe das SQL aus

### 3. Environment Variables setzen
```bash
# .env.local
VITE_WEBHOOK_URL=https://dein-n8n.com/webhook/linkedin-post-generator
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
```

### 4. n8n Workflow importieren
1. Öffne n8n
2. Importiere `n8n/linkedin_post_generator.json`
3. Konfiguriere die OpenRouter Credentials
4. Aktiviere den Workflow

### 5. App starten
```bash
npm install
npm run dev
```

---

## Pricing-Modell (vorbereitet)

| Plan | Posts/Monat | Features |
|------|-------------|----------|
| Free | 5 | Basis-Features |
| Creator | 50 | Cloud Sync, Alle Stile |
| Pro | Unlimited | Direct Publish, Analytics |
| Team | Unlimited | Collaboration, Approval |
| Agency | Unlimited | White-Label, API |

---

## Nächste Schritte (Phase 2+)

1. **Stripe Integration** - Billing für Pro/Team Plans
2. **Voice Training** - Eigenen Schreibstil trainieren
3. **Brand Profiles** - Mehrere Kunden/Marken verwalten
4. **LinkedIn API** - Direct Publish, Scheduling
5. **Analytics Dashboard** - Engagement-Statistiken
6. **Team Workspaces** - Multi-User Collaboration
