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
  "style": "story | listicle | question-hook | bold-statement"
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
