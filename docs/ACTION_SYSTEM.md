# Action-systemet

Claude udfører **aldrig** selv kommandoer. Den returnerer kun strukturerede
JSON-actions via tool use, fx:

```json
{ "action": "open_url", "url": "https://youtube.com" }
```

```json
{ "action": "launch_application", "application": "spotify" }
```

## Forsvarslinjer

| # | Lag | Kontrol |
| --- | --- | --- |
| 1 | Claude-tool | `input_schema` begrænser action-typer til whitelisten |
| 2 | Server (`dispatchAction`) | Zod-validering + kill switch + ejerskabstjek af device + audit-log |
| 3 | Agent (`executeAction`) | Uafhængig Zod-validering + app-registry + `execFile` (aldrig shell-strenge) |
| 4 | Bruger | Actions med `requiresConfirmation` kræver klik i UI før dispatch |

## Whitelisten (V1)

Defineret i `shared/src/actions/schemas.ts` + `registry.ts`:

| Action | Risiko | Godkendelse |
| --- | --- | --- |
| `open_url` | lav | nej |
| `launch_application` | lav | nej |
| `close_application` | mellem | **ja** |
| `list_applications` | lav | nej |
| `get_system_info` | lav | nej |

## Sådan tilføjes en ny action

1. **Schema**: tilføj i `shared/src/actions/schemas.ts` og i den
   diskriminerede union `actionSchema`.
2. **Metadata**: tilføj i `ACTION_REGISTRY` (`registry.ts`) med risikoniveau
   og om den kræver godkendelse.
3. **Handler**: implementér i `agent/src/actions/handlers/` og registrér i
   `agent/src/actions/executor.ts` – TypeScript fejler, hvis handleren
   mangler, fordi handler-map'et er typet over unionen.
4. (Valgfrit) udvid Claude-toolets `input_schema` i
   `frontend/src/lib/server/ai/tools.ts` med nye felter.

## Livscyklus for en action

```
pending ──▶ dispatched ──▶ success
                       └─▶ error
        └─▶ rejected (validering fejlede / kill switch)
```

Alle overgange gemmes i `activity_logs` og vises på /activity-siden.
