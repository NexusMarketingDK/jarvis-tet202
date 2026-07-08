'use client';

import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';

/** Microphone toggle styled as Jarvis' glowing voice orb. */
export function VoiceOrb({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      aria-label={active ? 'Stop optagelse' : 'Start taleinput'}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
        active
          ? 'border-arc bg-arc-soft text-arc animate-pulseGlow'
          : 'border-line text-slate-400 hover:border-arc/50 hover:text-arc'
      }`}
    >
      <Mic size={17} />
    </motion.button>
  );
}
