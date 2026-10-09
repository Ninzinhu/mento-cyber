"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

const SignalField = dynamic(
  () => import("../visuals/signal-field").then((module) => module.SignalField),
  {
    ssr: false,
    loading: () => <div className="signal-field-fallback" aria-hidden="true" />,
  },
);

const metrics = [
  ["10", "FRENTES ATIVAS"],
  ["02", "PRÁTICAS ABERTAS"],
  ["01", "ENCONTRO DA SEMANA"],
];

export function HorizonHero() {
  const reducedMotion = useReducedMotion();
  const initial = reducedMotion ? false : { opacity: 0, y: 18 };

  return (
    <section id="inicio" className="horizon-hero" aria-labelledby="horizon-title">
      <div className="horizon-hero-copy">
        <motion.p
          className="horizon-label"
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          MENTOCYBER / COMUNIDADE DE PRÁTICA EM DEFESA DIGITAL
        </motion.p>
        <motion.h1
          id="horizon-title"
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reducedMotion ? 0 : 0.08 }}
        >
          Pratique decisões de defesa antes que o incidente aconteça.
        </motion.h1>
        <motion.p
          className="horizon-description"
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reducedMotion ? 0 : 0.16 }}
        >
          Radar de sinais, casos simulados e revisão entre pares para transformar
          curiosidade em decisão técnica justificável.
        </motion.p>
        <motion.div
          className="horizon-actions"
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reducedMotion ? 0 : 0.24 }}
        >
          <Link className="horizon-primary" href="/operacoes">
            Explorar operações <span aria-hidden="true">↗</span>
          </Link>
          <Link className="horizon-secondary" href="/labs">
            Abrir caso da semana
          </Link>
        </motion.div>
        <div className="horizon-proof" aria-label="O que está disponível">
          <span>Radar Brasil</span>
          <span>Caso da semana</span>
          <span>Trilhas por função</span>
        </div>
      </div>

      <motion.div
        className="horizon-visual"
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: reducedMotion ? 0 : 0.15 }}
      >
        <div className="horizon-grid" />
        <SignalField />
        <span className="visual-axis axis-x" />
        <span className="visual-axis axis-y" />
        <span className="visual-readout readout-a">SIGNAL / LIVE</span>
        <span className="visual-readout readout-b">MODE / PRACTICE</span>
      </motion.div>

      <aside className="horizon-control" aria-label="Estado da plataforma">
        <div className="control-heading">
          <span>REDE ATIVA</span>
          <i aria-label="Comunidade disponível" />
        </div>
        <div className="control-status">
          <span>MISSÃO EM DESTAQUE</span>
          <strong>Triagem de alertas</strong>
          <p>Fundamentos de defesa · 45–60 min</p>
        </div>
        <dl>
          {metrics.map(([value, label]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <Link href="/operacoes">
          Abrir central <span aria-hidden="true">→</span>
        </Link>
      </aside>
    </section>
  );
}
