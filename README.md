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
│   ├── PostGenerator.tsx    # Haupt-Formular
│   ├── PostHistory.tsx      # History-Liste
│   ├── AuthModal.tsx        # Login/Register
│   └── UserMenu.tsx         # User-Dropdown
├── contexts/
│   └── AuthContext.tsx      # Auth State
├── hooks/
│   ├── usePostGenerator.ts  # Post-Generierung
│   └── usePostHistory.ts    # History (Cloud/Local)
├── lib/
│   └── supabase.ts          # Supabase Client
├── types/
│   ├── history.ts           # History Types
│   └── database.ts          # Supabase Types
└── App.tsx                  # Main App

n8n/
└── linkedin_post_generator.json  # n8n Workflow

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

- **SOP:** `linkedin_post_generator_sop.md` - Vollständige Spezifikation
- **Changelog:** `CHANGELOG.md` - Alle Änderungen

## Roadmap

- [ ] Stripe Integration (Billing)
- [ ] Voice Training (eigener Schreibstil)
- [ ] Brand Profiles (mehrere Kunden)
- [ ] LinkedIn API (Direct Publish)
- [ ] Team Workspaces
- [ ] Analytics Dashboard

## Lizenz

Privat - Alle Rechte vorbehalten
