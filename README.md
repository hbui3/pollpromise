# PollPromise

**Mehr Teilnehmer. Guter Zweck. Win-Win.**

PollPromise ist eine kostenlose Open-Source-Plattform, die Forschenden hilft, mehr Teilnehmer für ihre Umfragen zu gewinnen – durch Spenden an gemeinnützige Organisationen als Anreiz.

## Das Problem

Wer kennt es nicht: Du hast eine großartige Studie, aber zu wenig Teilnehmer. E-Mails werden ignoriert, Social-Media-Posts gehen unter, und die Deadline rückt näher.

## Die Lösung

Mit PollPromise bietest du Teilnehmern eine echte Gegenleistung: Pro ausgefüllter Umfrage wird an eine gemeinnützige Organisation gespendet. Keine Bestechung – eine gute Tat.

## Features

- **100% kostenlos** – Keine Gebühren, keine Provision
- **Kein Account nötig** – Alles funktioniert über Links
- **Transparent** – Spendenbelege öffentlich einsehbar
- **Datenschutzfreundlich** – Keine Cookies, minimale Datenerhebung, DSGVO/DSG-konform
- **55.000+ Organisationen** – Durchsuchbare Datenbank via betterplace.org
- **Flexibel** – Verifizierung per Abschluss-Code oder Screenshot

## Wie es funktioniert

1. **Kampagne erstellen** – Umfrage-Link, Organisation und Spendenbudget festlegen
2. **Link teilen** – Teilnehmer füllen die Umfrage aus und verifizieren ihre Teilnahme
3. **Spende auslösen** – Am Ende wird die Gesamtsumme an die Organisation gespendet

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **Hosting:** Vercel (Frontend), Supabase (DB, EU/Irland)
- **Orga-Datenbank:** betterplace.org API (wöchentlicher Sync via Cron)

## Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Environment Variables anlegen (siehe .env.example)
cp .env.example .env.local

# Entwicklungsserver starten
npm run dev
```

Die App läuft auf [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Beschreibung |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key |
| `NEXT_PUBLIC_BASE_URL` | Öffentliche URL der App |
| `IP_SALT` | Geheimer Salt für IP-Hashing |
| `CRON_SECRET` | Secret für Cron-Job-Authentifizierung |

## Datenbank

Das Schema befindet sich in `supabase/schema.sql`. Für den initialen Import der betterplace.org-Organisationen:

```bash
node scripts/import-betterplace.mjs
```

Der wöchentliche Sync läuft automatisch über einen Vercel Cron Job (konfiguriert in `vercel.json`).

## Disclaimer

PollPromise wickelt **keine Spenden oder Zahlungen** ab. Die Plattform dient ausschließlich der Organisation und Dokumentation von Spendenkampagnen. Spenden werden direkt durch die jeweiligen Kampagnen-Ersteller an die genannten Organisationen überwiesen.

PollPromise übernimmt **keine Haftung** für:
- Die tatsächliche Durchführung von Spenden durch Kampagnen-Ersteller
- Die Richtigkeit der Angaben zu Spendenorganisationen
- Inhalte externer Umfragen, die über die Plattform verlinkt werden

Die gelisteten Organisationen stammen teilweise aus der öffentlichen Datenbank von betterplace.org. PollPromise steht in keiner geschäftlichen Verbindung zu diesen Organisationen.

## Lizenz

MIT License – siehe [LICENSE](LICENSE)
