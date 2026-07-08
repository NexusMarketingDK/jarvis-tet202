# Supabase

Database schema, RLS policies and migrations for Jarvis.

## Apply the migration

Using the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Or paste `migrations/0001_initial_schema.sql` into the SQL editor in the
Supabase dashboard.

## Realtime

The agent transport uses Supabase Realtime **broadcast** channels
(`device:<device-id>`), which require no table configuration. The frontend
additionally subscribes to `activity_logs` changes; enable Realtime for that
table under *Database → Replication* (or run):

```sql
alter publication supabase_realtime add table public.activity_logs;
```

## Security model

- Every table has RLS: `auth.uid() = user_id`.
- `api_keys` are write-only from the browser; ciphertext is only readable via
  the service-role key on the server. Keys are encrypted (AES-256-GCM) before
  they are stored.
- `settings.actions_enabled` is the global kill switch checked before any
  device action is dispatched.
