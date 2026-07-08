# Jarvis 🤖

Personlig AI-assistent inspireret af Iron Mans Jarvis: en cloudbaseret AI
(Claude) kombineret med en lokal Windows-agent, der kan åbne hjemmesider,
starte programmer og læse systeminfo – altid via et whitelisted,
brugergodkendt action-system.

## Struktur

| Mappe | Indhold |
| --- | --- |
| `frontend/` | Next.js-app (UI + API-routes/Vercel Functions) |
| `agent/` | Lokal Node.js-agent til Windows |
| `shared/` | Fælles TypeScript-pakke: action-whitelist (Zod), realtime-protokol, typer |
| `supabase/` | Databaseskema, RLS-policies og migrationer |
| `docs/` | Arkitektur-, sikkerheds- og setup-dokumentation |
| `scripts/` | Hjælpescripts |

## Kom hurtigt i gang

1. **Supabase**: Opret et projekt og kør `supabase/migrations/0001_initial_schema.sql`.
2. **Frontend**: `cp frontend/.env.example frontend/.env.local`, udfyld nøglerne, og:

   ```bash
   npm install
   npm run dev
   ```

3. **Agent** (på din Windows-PC): `copy agent\.env.example agent\.env`, udfyld, og:

   ```bash
   npm run dev:agent
   ```

Detaljeret guide: [docs/SETUP.md](docs/SETUP.md).

## Kerneprincipper

- **AI'en udfører aldrig noget selv.** Claude returnerer kun strukturerede
  JSON-actions; server og agent validerer dem uafhængigt mod samme whitelist.
- **Alt logges.** Hver action ender i `activity_logs` med status og output.
- **Alt kan slås fra.** Global kill switch i Indstillinger.
- **Modulært.** Nye actions, programmer og skills tilføjes ét sted ad gangen –
  se [docs/ACTION_SYSTEM.md](docs/ACTION_SYSTEM.md).

## Dokumentation

- [Arkitektur](docs/ARCHITECTURE.md)
- [Action-systemet](docs/ACTION_SYSTEM.md)
- [Sikkerhed](docs/SECURITY.md)
- [Opsætning](docs/SETUP.md)
- [Roadmap](docs/ROADMAP.md)

## Licens

MIT – se [LICENSE](LICENSE).
