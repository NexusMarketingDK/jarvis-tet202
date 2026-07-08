import { revalidatePath } from 'next/cache';
import { GlassCard } from '@/components/ui/GlassCard';
import { createClient } from '@/lib/supabase/server';

async function updateSettings(formData: FormData) {
  'use server';
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('settings')
    .update({
      language: formData.get('language') === 'en' ? 'en' : 'da',
      actions_enabled: formData.get('actions_enabled') === 'on',
      developer_mode: formData.get('developer_mode') === 'on',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  await supabase
    .from('voice_settings')
    .update({
      stt_enabled: formData.get('stt_enabled') === 'on',
      tts_enabled: formData.get('tts_enabled') === 'on',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  await supabase
    .from('profiles')
    .update({ full_name: String(formData.get('full_name') ?? '') })
    .eq('id', user.id);

  revalidatePath('/settings');
}

export default async function SettingsPage() {
  const supabase = createClient();
  const [{ data: settings }, { data: voice }, { data: profile }] = await Promise.all([
    supabase.from('settings').select('*').maybeSingle(),
    supabase.from('voice_settings').select('*').maybeSingle(),
    supabase.from('profiles').select('full_name').maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Indstillinger</h1>
        <p className="mt-1 text-sm text-slate-400">Profil, sikkerhed og voice.</p>
      </header>

      <form action={updateSettings} className="space-y-6">
        <GlassCard title="Profil">
          <label htmlFor="full_name" className="mb-1 block text-sm text-slate-400">
            Navn (Jarvis bruger det, når han taler til dig)
          </label>
          <input
            id="full_name"
            name="full_name"
            defaultValue={profile?.full_name ?? ''}
            className="w-full max-w-sm rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-arc/60"
          />
          <label htmlFor="language" className="mb-1 mt-4 block text-sm text-slate-400">
            Sprog
          </label>
          <select
            id="language"
            name="language"
            defaultValue={settings?.language ?? 'da'}
            className="w-full max-w-sm rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-arc/60"
          >
            <option value="da">Dansk</option>
            <option value="en">English</option>
          </select>
        </GlassCard>

        <GlassCard title="Sikkerhed">
          <Toggle
            name="actions_enabled"
            label="Tillad enhedshandlinger (global kill switch)"
            description="Slå fra for at blokere alle handlinger mod dine enheder."
            defaultChecked={settings?.actions_enabled ?? true}
          />
          <Toggle
            name="developer_mode"
            label="Developer mode"
            description="Viser rå JSON-actions og ekstra debug-info i chatten."
            defaultChecked={settings?.developer_mode ?? false}
          />
        </GlassCard>

        <GlassCard title="Voice">
          <Toggle
            name="stt_enabled"
            label="Taleinput (Whisper)"
            defaultChecked={voice?.stt_enabled ?? true}
          />
          <Toggle
            name="tts_enabled"
            label="Talesvar (ElevenLabs)"
            defaultChecked={voice?.tts_enabled ?? true}
          />
        </GlassCard>

        <button
          type="submit"
          className="rounded-lg bg-arc/90 px-6 py-2 text-sm font-medium text-slate-950 transition hover:bg-arc"
        >
          Gem indstillinger
        </button>
      </form>
    </div>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="mb-4 flex cursor-pointer items-start gap-3 last:mb-0">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 accent-arc"
      />
      <span>
        <span className="block text-sm text-slate-200">{label}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}
