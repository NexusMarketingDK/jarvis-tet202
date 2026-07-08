# Jarvis Local Agent

Node.js-tjeneste, der kører på din Windows-PC og udfører **whitelistede**
actions sendt fra Jarvis-cloud'en via Supabase Realtime.

## Sikkerhedsmodel

- Udfører **aldrig** vilkårlig kode eller shell-strenge – kun actions fra
  whitelisten i `@jarvis/shared`, valideret med Zod ved modtagelse.
- Programmer startes/lukkes kun via app-registret (`src/apps/registry.ts`).
- Alle resultater skrives til `activity_logs` (fuldt revisionsspor).
- Agenten er logget ind som *din* bruger; RLS begrænser den til dine rækker.

## Kom i gang

```bash
# fra repo-roden
npm install

cd agent
copy .env.example .env   # udfyld værdierne
npm run dev
```

Agenten registrerer sig selv under **Enheder** i web-appen og markerer sig
online/offline automatisk (heartbeat hvert minut).

## Understøttede actions (V1)

| Action | Beskrivelse |
| --- | --- |
| `open_url` | Åbn en http(s)-URL i standardbrowseren |
| `launch_application` | Start et whitelisted program (spotify, vscode, chrome, …) |
| `close_application` | Luk et whitelisted program (kræver godkendelse i UI) |
| `list_applications` | List tilgængelige programmer |
| `get_system_info` | CPU, RAM, OS og oppetid |

## Tilføj et nyt program

Tilføj en linje i `src/apps/registry.ts` – intet andet. Nøglen er det navn,
Jarvis bruger i `launch_application`.

## Tilføj en ny action

1. Schema i `shared/src/actions/schemas.ts` + metadata i `registry.ts`.
2. Handler i `src/actions/handlers/`.
3. Registrér den i `src/actions/executor.ts` (TypeScript fejler, hvis du glemmer det).
