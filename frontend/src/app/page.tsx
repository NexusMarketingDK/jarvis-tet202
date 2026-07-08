'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Blocks,
  Brain,
  Cpu,
  MessageSquare,
  Mic,
  ShieldCheck,
} from 'lucide-react';

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Intelligent chat',
    body: 'Skriv med Jarvis i realtid – streaming, markdown og kodeblokke. Drevet af Claude.',
  },
  {
    icon: Mic,
    title: 'Stemmestyring',
    body: 'Tal til Jarvis med wake word “Jarvis”. Whisper lytter, ElevenLabs svarer.',
  },
  {
    icon: Brain,
    title: 'Langtidshukommelse',
    body: 'Jarvis husker dine projekter, præferencer og arbejdsgange på tværs af samtaler.',
  },
  {
    icon: Cpu,
    title: 'Styr din PC',
    body: 'Åbn hjemmesider og programmer via en sikker lokal agent – kun whitelistede handlinger.',
  },
  {
    icon: Blocks,
    title: 'Skills & plugins',
    body: 'Byg videre med skills og plugins: browser, kalender, GitHub, Home Assistant og mere.',
  },
  {
    icon: ShieldCheck,
    title: 'Sikkerhed først',
    body: 'Alt logges, alt kan slås fra, og AI’en udfører aldrig noget uden din godkendelse.',
  },
];

const FLOW = ['Tal eller skriv', 'Claude tænker', 'JSON-handling', 'Lokal agent', 'Resultat'];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function Landing() {
  return (
    <main className="relative overflow-hidden">
      {/* Top navigation */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-arc/40 bg-arc-soft">
            <span className="text-sm font-semibold text-arc">J</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">Jarvis</span>
        </div>
        <Link
          href="/login"
          className="rounded-lg border border-line px-4 py-2 text-sm text-slate-300 transition hover:border-arc/50 hover:text-arc"
        >
          Log ind
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-16 text-center sm:pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-arc/40 bg-arc-soft animate-pulseGlow"
        >
          <span className="text-4xl font-semibold text-arc">J</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl"
        >
          Mød Jarvis
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 max-w-xl text-lg text-slate-400"
        >
          Din personlige AI-assistent, der kombinerer en cloud-baseret AI med en lokal agent –
          så du kan tale, skrive og få tingene gjort på din computer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-xl bg-arc/90 px-6 py-3 text-sm font-medium text-slate-950 shadow-glow transition hover:bg-arc"
          >
            Kom i gang
            <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-line px-6 py-3 text-sm text-slate-300 transition hover:border-arc/50 hover:text-arc"
          >
            Se funktioner
          </a>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-arc/30 bg-arc-soft text-arc">
                <feature.icon size={20} />
              </div>
              <h3 className="text-base font-medium text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-sm font-medium uppercase tracking-widest text-slate-500">
          Sådan virker det
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {FLOW.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="glass rounded-full px-5 py-2 text-sm text-slate-200"
              >
                {step}
              </motion.div>
              {index < FLOW.length - 1 && <ArrowRight size={16} className="text-arc/60" />}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl px-8 py-12"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Klar til at møde din assistent?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
            Opret en konto på et øjeblik og få Jarvis op at køre.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-arc/90 px-6 py-3 text-sm font-medium text-slate-950 shadow-glow transition hover:bg-arc"
          >
            Log ind eller opret konto
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-slate-600">
        Jarvis · Din personlige AI-assistent
      </footer>
    </main>
  );
}
