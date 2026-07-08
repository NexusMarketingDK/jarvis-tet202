import { revalidatePath } from 'next/cache';
import { Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { createClient } from '@/lib/supabase/server';

async function deleteMemory(formData: FormData) {
  'use server';
  const id = formData.get('id');
  if (typeof id !== 'string') return;
  const supabase = createClient();
  await supabase.from('memories').delete().eq('id', id);
  revalidatePath('/memory');
}

export default async function MemoryPage() {
  const supabase = createClient();
  const { data: memories } = await supabase
    .from('memories')
    .select('id, category, key, value, importance')
    .order('importance', { ascending: false })
    .order('updated_at', { ascending: false });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Hukommelse</h1>
        <p className="mt-1 text-sm text-slate-400">
          Alt hvad Jarvis husker om dig. Sig fx “husk at jeg hedder Tony” i chatten – eller slet
          minder her.
        </p>
      </header>

      <GlassCard>
        {(memories ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">Jarvis har ikke gemt noget endnu.</p>
        ) : (
          <ul className="divide-y divide-line">
            {(memories ?? []).map((memory) => (
              <li key={memory.id} className="flex items-center gap-4 py-3">
                <span className="w-24 shrink-0 rounded-full bg-arc-soft px-2 py-0.5 text-center text-xs text-arc">
                  {memory.category}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200">{memory.key}</p>
                  <p className="truncate text-sm text-slate-400">{memory.value}</p>
                </div>
                <span className="text-xs text-slate-500">vigtighed {memory.importance}/5</span>
                <form action={deleteMemory}>
                  <input type="hidden" name="id" value={memory.id} />
                  <button
                    type="submit"
                    aria-label="Slet minde"
                    className="text-slate-500 transition hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
