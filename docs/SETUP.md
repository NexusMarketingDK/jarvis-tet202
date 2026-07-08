# Opsætning

## Forudsætninger

- Node.js ≥ 20
- En [Supabase](https://supabase.com)-konto
- En [Anthropic API-nøgle](https://console.anthropic.com)
- (Valgfrit) OpenAI-nøgle til Whisper og ElevenLabs-nøgle til talesvar

## 1. Supabase

1. Opret et nyt projekt.
2. Kør `supabase/migrations/0001_initial_schema.sql` i SQL-editoren
   (eller `supabase db push` med CLI'en).
3. Aktivér Realtime for `activity_logs` (se `supabase/README.md`).
4. Notér **Project URL**, **anon key** og **service_role key** fra
   *Project Settings → API*.

## 2. Frontend (lokalt)

```bash
cp frontend/.env.example frontend/.env.local
# udfyld: Supabase-nøgler, ANTHROPIC_API_KEY og JARVIS_ENCRYPTION_KEY
npm install
npm run dev
```

Åbn http://localhost:3000, opret en konto og log ind.

## 3. Deploy til Vercel

1. Importér repoet i Vercel og sæt **Root Directory** til `frontend/`.
2. Tilføj miljøvariablerne fra `.env.example` under *Settings → Environment
   Variables* (service-role-nøglen kun som server-variabel).
3. Deploy.

## 4. Lokal agent (Windows)

```powershell
npm install          # fra repo-roden
cd agent
copy .env.example .env   # udfyld Supabase-URL, anon key, email/adgangskode
npm run dev
```

Enheden dukker op under **Enheder** i web-appen. Prøv derefter i chatten:

> Jarvis, åbn youtube.com

## Fejlsøgning

| Symptom | Løsning |
| --- | --- |
| "Ingen enheder online" | Kører agenten? Tjek dens konsol for login-fejl. |
| Chat svarer med fejl | Er `ANTHROPIC_API_KEY` sat i frontend-miljøet? |
| Voice giver 501 | `OPENAI_API_KEY`/`ELEVENLABS_API_KEY` er ikke sat – valgfrit i V1. |
| Actions afvises | Er kill switch slået fra under Indstillinger → Sikkerhed? |
