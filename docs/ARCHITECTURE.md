# Arkitektur

## Overblik

```
┌─────────────┐   HTTPS/SSE    ┌──────────────────────────┐
│   Browser    │ ─────────────▶ │  Next.js på Vercel        │
│  (frontend)  │ ◀───────────── │  UI + API-routes          │
└─────────────┘                └───────────┬──────────────┘
       │                                    │
       │ Supabase JS (RLS)                  │ Claude API (tool use)
       ▼                                    ▼
┌──────────────────────────────────────────────────────────┐
│                       Supabase                            │
│  Auth · Postgres (RLS) · Realtime broadcast-kanaler       │
└───────────────────────────┬──────────────────────────────┘
                            │ Realtime: device:<id>
                            ▼
                  ┌───────────────────┐
                  │  Lokal agent (PC) │
                  │  Node.js + TS     │
                  └───────────────────┘
```

## Nøglebeslutninger

### 1. Backend = Next.js Route Handlers (ikke en separat server)

Vercel deployer API-routes som serverless functions. Domænelogikken ligger
isoleret i `frontend/src/lib/server/` (AI, actions, crypto), så den kan
flyttes til en selvstændig service senere uden at røre UI-koden.

### 2. Supabase Realtime som agent-transport

Vercel functions kan ikke holde persistente WebSockets. I stedet abonnerer
agenten på en broadcast-kanal (`device:<device-id>`), og serveren broadcaster
validerede actions dertil. Fordele:

- Ingen åbne porte eller tunneler på brugerens PC.
- Auth og kryptering håndteres af Supabase.
- Resultater persisteres i `activity_logs`, så intet går tabt, selv om
  ingen lytter live.

### 3. Ét fælles action-schema (`@jarvis/shared`)

Server og agent validerer **uafhængigt** mod samme Zod-whitelist. En
kompromitteret serverroute kan derfor stadig ikke få agenten til at udføre
noget uden for whitelisten. Se [ACTION_SYSTEM.md](ACTION_SYSTEM.md).

### 4. Chat som agentisk loop

`runChatTurn` streamer tekst fra Claude og håndterer tool-kald
(`save_memory`, `execute_device_action`) i op til fire runder, så Jarvis kan
bekræfte over for brugeren, hvad der faktisk skete.

## Dataflow: "Jarvis, åbn YouTube"

1. Browser → `POST /api/chat` (SSE-stream åbnes).
2. Serveren henter historik + memories og kalder Claude med tools.
3. Claude svarer med tool-kaldet `execute_device_action { action: "open_url", url: "https://youtube.com" }`.
4. Serveren validerer mod whitelisten, tjekker kill switch, skriver
   `activity_logs` (pending) og broadcaster til `device:<id>`.
5. Agenten re-validerer, åbner browseren, opdaterer loggen (success) og
   broadcaster resultatet.
6. Claude får tool-resultatet og formulerer svaret, som streames til UI'et.

## Udvidelse

- **Ny action**: schema → registry → agent-handler (compile-fejl hvis ét led glemmes).
- **Ny skill**: nyt tool i `lib/server/ai/tools.ts` + håndtering i `chat-service.ts`.
- **Nyt AI-provider**: `chat-service.ts` er den eneste fil, der kender Anthropic-SDK'et.
- **Plugin-system (V3)**: plugins-tabellen findes allerede; plugins bliver
  serverside moduler, der registrerer ekstra tools.
