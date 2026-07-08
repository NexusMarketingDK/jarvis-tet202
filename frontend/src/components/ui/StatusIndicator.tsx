export function StatusIndicator({ online, label }: { online: boolean; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span
        className={`h-2 w-2 rounded-full ${
          online ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'
        }`}
      />
      <span className={online ? 'text-emerald-300' : 'text-slate-500'}>
        {label ?? (online ? 'Online' : 'Offline')}
      </span>
    </span>
  );
}
