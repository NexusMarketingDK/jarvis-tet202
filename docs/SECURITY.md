# Sikkerhed

## Trusselsmodel

Den lokale agent kan starte programmer på brugerens PC. Angrebsfladerne er:

1. **Prompt injection** – en manipuleret samtale får Claude til at foreslå en
   skadelig handling.
2. **Kompromitteret cloud** – serveren sender en handling, brugeren ikke har
   bedt om.
3. **Kanal-spoofing** – en fremmed sender beskeder på device-kanalen.

## Kontroller

### Agenten udfører aldrig vilkårlig kode

- Kun actions i den fælles Zod-whitelist (`@jarvis/shared`); alt andet
  afvises med status `rejected`.
- Programmer startes kun via app-registret – aldrig fra frie strenge.
- Alle OS-kald bruger `execFile` med argument-arrays; brugerinput
  interpoleres aldrig ind i shell-strenge.
- Agenten re-validerer alle indkomne beskeder, uanset hvad serveren har gjort.

### Alle actions valideres, logges og kan slås fra

- Serveren validerer og skriver et audit-spor i `activity_logs`
  (pending → dispatched → success/error/rejected).
- `settings.actions_enabled` er en global kill switch, der tjekkes før hvert dispatch.
- Actions markeret `requiresConfirmation` (fx `close_application`) dispatches
  først, når brugeren klikker "Godkend" i chatten.

### Data

- RLS på alle tabeller: `auth.uid() = user_id`.
- API-nøgler krypteres med AES-256-GCM (`JARVIS_ENCRYPTION_KEY`) før de
  gemmes; ciphertext kan ikke læses fra browseren (ingen SELECT-policy).
- Service-role-nøglen findes kun i server-miljøet på Vercel.
- Agenten logger ind som brugeren selv – den kan aldrig se andres data.

## Rapportering

Fund en sårbarhed? Åbn et privat issue eller kontakt vedligeholderen direkte.
