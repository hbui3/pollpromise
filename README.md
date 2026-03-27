# PollPromise

**Mehr Teilnehmer. Guter Zweck. Win-Win.**

PollPromise ist eine kostenlose Open-Source-Plattform, die Forschenden hilft, mehr Teilnehmer fuer ihre Umfragen zu gewinnen -- durch Spenden an gemeinnuetzige Organisationen als Anreiz.

## Das Problem

Wer kennt es nicht: Du hast eine grossartige Studie, aber zu wenig Teilnehmer. E-Mails werden ignoriert, Social-Media-Posts gehen unter, und die Deadline rueckt naeher.

## Die Loesung

Mit PollPromise bietest du Teilnehmern eine echte Gegenleistung: Pro ausgefuellter Umfrage wird an eine gemeinnuetzige Organisation gespendet. Keine Bestechung -- eine gute Tat.

## Features

- **100% kostenlos** -- Keine Gebuehren, keine Provision
- **Kein Account noetig** -- Alles funktioniert ueber Links
- **Transparent** -- Spendenbelege oeffentlich einsehbar
- **Datenschutzfreundlich** -- Keine Cookies, minimale Datenerhebung, DSGVO/DSG-konform
- **55.000+ Organisationen** -- Durchsuchbare Datenbank via betterplace.org
- **Flexibel** -- Verifizierung per Abschluss-Code oder Screenshot

## Wie es funktioniert

1. **Kampagne erstellen** -- Umfrage-Link, Organisation und Spendenbudget festlegen
2. **Link teilen** -- Teilnehmer fuellen die Umfrage aus und verifizieren ihre Teilnahme
3. **Spende ausloesen** -- Am Ende wird die Gesamtsumme an die Organisation gespendet

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **Hosting:** Vercel (Frontend), Supabase (DB, EU/Irland)
- **Orga-Datenbank:** betterplace.org API (woechentlicher Sync via Cron)

## Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Environment Variables anlegen (siehe .env.example)
cp .env.example .env.local

# Entwicklungsserver starten
npm run dev
```

Die App laeuft auf [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Beschreibung |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key |
| `NEXT_PUBLIC_BASE_URL` | Oeffentliche URL der App |
| `IP_SALT` | Geheimer Salt fuer IP-Hashing |
| `CRON_SECRET` | Secret fuer Cron-Job-Authentifizierung |

## Datenbank

Das Schema befindet sich in `supabase/schema.sql`. Fuer den initialen Import der betterplace.org-Organisationen:

```bash
node scripts/import-betterplace.mjs
```

Der woechentliche Sync laeuft automatisch ueber einen Vercel Cron Job (konfiguriert in `vercel.json`).

## Disclaimer

PollPromise wickelt **keine Spenden oder Zahlungen** ab. Die Plattform dient ausschliesslich der Organisation und Dokumentation von Spendenkampagnen. Spenden werden direkt durch die jeweiligen Kampagnen-Ersteller an die genannten Organisationen ueberwiesen.

PollPromise uebernimmt **keine Haftung** fuer:
- Die tatsaechliche Durchfuehrung von Spenden durch Kampagnen-Ersteller
- Die Richtigkeit der Angaben zu Spendenorganisationen
- Inhalte externer Umfragen, die ueber die Plattform verlinkt werden

Die gelisteten Organisationen stammen teilweise aus der oeffentlichen Datenbank von betterplace.org. PollPromise steht in keiner geschaeftlichen Verbindung zu diesen Organisationen.

## Lizenz

MIT License -- siehe [LICENSE](LICENSE)
