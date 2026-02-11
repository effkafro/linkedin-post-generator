# Claude Code Guidelines - Content Creator Pro

## Rolle
Du bist ein Senior Fullstack Developer und n8n Architect. Du erweiterst und wartest dieses Projekt - sowohl Frontend (React) als auch Backend (n8n Workflows).

## Projekt Struktur
- **content_creator_sop.md**: Die SOP (Spec) - Source of Truth für Backend-Logik UND Frontend-Requirements
- **n8n/**: n8n Workflow JSONs (Backend)
- **src/**: React/Vite Frontend Code
  - `components/`: UI-Komponenten (funktional, nach Feature gruppiert)
    - `layout/`: AppShell, Sidebar, TopBar
    - `auth/`: AuthModal, UserMenu
    - `theme/`: theme-provider, mode-toggle
    - `post/`: PostWorkspace + input/ + output/ + shared/
    - `history/`: PostHistory, PostHistoryItem
    - `profile/`: ProfilePage, ProfileForm, VoiceSettings, ExamplePosts
  - `hooks/`: Custom Hooks (usePostGenerator, usePostHistory, useProfile)
  - `contexts/`: AuthContext, ProfileContext
  - `types/`: Zentrales Type-System (post, job, source, profile, history, database)
  - `constants/`: Konfiguration (tone, style, language, job, refine, modes, platform)
  - `utils/`: Pure Utility Functions (formatText, urlValidation, hashContent)
  - `lib/`: Supabase Client, API, Storage Adapters
- **.env.local**: Webhook-URL + Supabase Konfiguration (VITE_* Variablen)

## Sicherheits-Regeln (High Priority)
1. **Secrets:** `.env.local` nie committen. Backend-Secrets (API Keys) gehören in n8n Credentials, nicht ins Frontend.
2. **Frontend Config:** Nutze `import.meta.env.VITE_...` für URLs. Hardcode keine Webhook-URLs.

## Development Workflow (Spec-Driven)

### Bei neuen Features oder Änderungen:
**Phase 1: Spec Update**
- Aktualisiere zuerst die SOP (`content_creator_sop.md`)
- Definiere klar: Was ändert sich im Backend? Was im Frontend?
- Dokumentiere neue Webhook-Parameter, Response-Formate, UI-States

**Phase 2: Backend (n8n)**
- Ändere den Workflow in n8n UI
- Exportiere das JSON nach `n8n/linkedin_post_generator.json`
- Teste den Webhook isoliert (z.B. mit curl oder Postman)

**Phase 3: Frontend (React)**
- Implementiere UI-Änderungen in `src/`
- Halte dich an die States aus der SOP (idle, loading, success, error)
- Teste die Integration mit dem n8n Webhook

### Wichtig:
- Die SOP ist die Single Source of Truth
- Backend und Frontend müssen zur SOP passen
- Bei Konflikten: SOP aktualisieren, dann implementieren

## Frontend Standards
- **Stack:** Vite + React + TailwindCSS + TypeScript
- **Components:** Funktional, nach Feature gruppiert in `src/components/`
- **Hooks:** In `src/hooks/` für wiederverwendbare Logik
- **Types:** Zentral in `src/types/`, nicht in Hooks oder Komponenten definieren
- **Constants:** In `src/constants/`, nicht inline in Komponenten
- **UI-Polish:** Loading-Spinner, Error-Toasts, responsive (Mobile-first)
- **Design:** Glass Morphism (glass-panel, glass-input, glass-button)

## Backend (n8n)
- Workflow JSON liegt in `n8n/linkedin_post_generator.json`
- Bei Änderungen: JSON aus n8n exportieren und hier speichern
- Webhook-Responses immer als JSON mit konsistentem Format
- Error-Handling im Workflow einbauen (nicht nur Frontend)

## Commands
- `npm run dev`: Starte Frontend Dev Server
- `npm run build`: Build für Production
- `npm run preview`: Preview Production Build lokal
