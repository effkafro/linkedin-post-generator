# LinkedIn Post Generator

KI-gestützte Generierung professioneller LinkedIn-Posts mit verschiedenen Tönen, Stilen und einem speziellen Job-Posting Mode für Recruiter.

## Features

### Post-Generierung
- **3 Modi:** Thema, URL (Artikel zusammenfassen), Job (Stellenausschreibungen)
- **4 Töne:** Professional, Casual, Inspirational, Educational
- **4 Stile:** Story, Listicle, Question-Hook, Bold-Statement
- **5 Sprachen:** Deutsch, English, Français, Español, Italiano

### Job-Posting Mode (Recruiter)
- URL zur Stellenausschreibung eingeben ODER manuell Details erfassen
- **Sub-Stile:** "Wir suchen", "Kennt ihr jemanden?", "Persönliche Empfehlung", "Opportunity Pitch"
- **Zielgruppen:** Junior, Senior, C-Level, Freelancer
- **Optionen:** Branche, Standort, Remote-Toggle

### Voice Training Profil
- Persoenliches Profil hinterlegen (Name, Rolle, Expertise, Werte, Zielgruppe)
- Beispiel-Posts hochladen fuer Stil-Analyse
- Toggle "Mein Profil als Kontext verwenden" bei der Post-Generierung
- KI schreibt in deiner Stimme und Perspektive

### Cloud Features (optional)
- User-Authentifizierung (Email/Password, Google, LinkedIn)
- Post-History in der Cloud synchronisiert
- Cross-Device Sync

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS
- **Backend:** n8n Workflow mit OpenRouter/Claude
- **Auth & DB:** Supabase (optional)

## Quick Start

### 1. Repository klonen
```bash
git clone <repo-url>
cd linkedin-post-generator
npm install
```

### 2. Environment einrichten
```bash
cp .env.example .env.local
```

Bearbeite `.env.local`:
```env
# Pflicht: n8n Webhook URL
VITE_WEBHOOK_URL=https://dein-n8n.com/webhook/linkedin-post-generator

# Optional: Supabase für Auth & Cloud-Sync
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
```

### 3. n8n Workflow importieren
1. Öffne n8n
2. Importiere `n8n/linkedin_post_generator.json`
3. Konfiguriere OpenRouter API Key
4. Aktiviere den Workflow

### 4. App starten
```bash
npm run dev
```

Öffne http://localhost:5173

## Supabase Setup (optional)

Für Auth und Cloud-Sync:

### 1. Supabase Projekt erstellen
- Gehe zu https://supabase.com
- Erstelle ein neues Projekt

### 2. Datenbank-Schema anwenden
- Öffne SQL Editor in Supabase
- Führe `supabase/schema.sql` aus

### 3. OAuth konfigurieren (optional)
- Google: Authentication → Providers → Google
- LinkedIn: Authentication → Providers → LinkedIn (OIDC)

### 4. Environment Variables setzen
Kopiere Project URL und anon key in `.env.local`

## Projektstruktur

```
src/
├── components/
│   ├── layout/              # AppShell, Sidebar, TopBar
│   ├── auth/                # AuthModal, UserMenu
│   ├── theme/               # theme-provider, mode-toggle
│   ├── post/
│   │   ├── PostWorkspace.tsx # Orchestrator
│   │   ├── input/           # InputPanel, ModeTabs, TopicInput, UrlInput, JobInput, SettingsRow
│   │   ├── output/          # OutputPanel, PostDisplay, VersionNav, RefinePanel, ActionBar
│   │   └── shared/          # GlassSelect, HelpModal
│   ├── history/             # PostHistory, PostHistoryItem
│   └── profile/             # ProfilePage, ProfileForm, VoiceSettings, ExamplePosts
├── contexts/
│   ├── AuthContext.tsx       # Auth State + Methods
│   └── ProfileContext.tsx    # Voice Profile State
├── hooks/
│   ├── usePostGenerator.ts   # Post-Generierung + Versioning
│   ├── usePostHistory.ts     # History CRUD (Storage Adapters)
│   └── useProfile.ts         # Profile CRUD (optimistic + debounced)
├── types/                    # Zentrales Type-System (post, job, source, profile, history)
├── constants/                # Konfiguration (tone, style, language, job, refine)
├── utils/                    # Pure Functions (formatText, urlValidation, buildProfilePayload)
├── lib/
│   ├── supabase.ts           # Supabase Client
│   └── storage/              # Storage Adapter Pattern
└── App.tsx                   # Providers + AppShell

n8n/
└── linkedin_post_generator.json  # n8n Workflow (inkl. Build Profile Context Node)

supabase/
└── schema.sql               # DB Schema + RLS
```

## Commands

```bash
npm run dev      # Dev-Server starten
npm run build    # Production Build
npm run preview  # Build lokal testen
npm run lint     # ESLint
```

## Dokumentation

- **SOP:** `content_creator_sop.md` - Vollstaendige Spezifikation
- **Changelog:** `CHANGELOG.md` - Alle Änderungen

## Roadmap

- [ ] Stripe Integration (Billing)
- [x] Voice Training (eigener Schreibstil)
- [ ] Brand Profiles (mehrere Kunden)
- [ ] LinkedIn API (Direct Publish)
- [ ] Team Workspaces
- [ ] Analytics Dashboard

## Lizenz

Privat - Alle Rechte vorbehalten
