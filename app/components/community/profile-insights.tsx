"use client";

import Link from "next/link";
import { BarChart3, BookOpen, Eye, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { observeCommunityMember } from "../../features/community/community-data";
import { communityAction } from "../../features/community/server-action";
import { SiteHeader } from "../shell/site-header";

type Insights = {
  xp: number;
  contributionCount: number;
  completedLabs: number;
  published: number;
  receivedReactions: number;
  reads: number;
  saved: number;
  followers: number;
};

export function ProfileInsights() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState("");
  useEffect(
    () =>
      observeCommunityMember((member) => {
        if (!member) return setInsights(null);
        void communityAction<Insights>("community.insights")
          .then(setInsights)
          .catch((reason) =>
            setError(
              reason instanceof Error
                ? reason.message
                : "Não foi possível carregar seus indicadores.",
            ),
          );
      }),
    [],
  );
  if (!insights && !error)
    return (
      <main className="profile-page">
        <SiteHeader compact />
        <p className="profile-loading">Calculando seus indicadores…</p>
      </main>
    );
  if (!insights)
    return (
      <main className="profile-page">
        <SiteHeader compact />
        <section className="profile-gate">
          <p className="auth-eyebrow">INSIGHTS PRIVADOS</p>
          <h1>Entre para acompanhar sua evolução.</h1>
          <Link className="profile-primary" href="/entrar">
            Entrar
          </Link>
          <p>{error}</p>
        </section>
      </main>
    );
  const cards = [
    [Trophy, `${insights.xp} XP`, "evolução acumulada"],
    [BookOpen, `${insights.published}`, "conteúdos publicados"],
    [Eye, `${insights.reads}`, "leituras registradas"],
    [Users, `${insights.followers}`, "pessoas seguindo você"],
  ] as const;
  return (
    <main className="profile-page insights-page">
      <SiteHeader compact />
      <section className="insights-hero">
        <p className="auth-eyebrow">PERFIL / INSIGHTS PRIVADOS</p>
        <h1>Veja o efeito da sua prática.</h1>
        <p>
          Indicadores pessoais para orientar seu próximo passo, sem ranking público ou
          pressão de performance.
        </p>
      </section>
      <section className="insights-grid">
        {cards.map(([Icon, value, label]) => (
          <article key={label}>
            <Icon size={18} />
            <b>{value}</b>
            <span>{label}</span>
          </article>
        ))}
      </section>
      <section className="insights-action">
        <BarChart3 size={20} />
        <div>
          <b>Próximo passo recomendado</b>
          <p>
            {insights.completedLabs === 0
              ? "Conclua seu primeiro lab para conectar prática técnica ao seu perfil."
              : insights.published === 0
                ? "Publique uma síntese curta de uma investigação ou aprendizado recente."
                : "Abra uma discussão para transformar sua leitura em troca com a comunidade."}
          </p>
        </div>
        <Link
          href={
            insights.completedLabs === 0
              ? "/labs"
              : insights.published === 0
                ? "/conteudos#publicar"
                : "/discussoes"
          }
        >
          Continuar →
        </Link>
      </section>
      <section className="insights-breakdown">
        <div>
          <span>LABS CONCLUÍDOS</span>
          <b>{insights.completedLabs}</b>
        </div>
        <div>
          <span>REGISTROS</span>
          <b>{insights.contributionCount}</b>
        </div>
        <div>
          <span>REAÇÕES RECEBIDAS</span>
          <b>{insights.receivedReactions}</b>
        </div>
        <div>
          <span>ITENS SALVOS</span>
          <b>{insights.saved}</b>
        </div>
      </section>
    </main>
  );
}
