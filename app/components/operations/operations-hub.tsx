"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ContentNav } from "../content/content-hub";
import {
  operationSignals,
  practiceTracks,
  weeklyCase,
} from "../../features/operations/catalog";
import { getContentPosts } from "../../features/content/content-data";
import { observeCommunityMember } from "../../features/community/community-data";
import { getCommunityProfile } from "../../features/community/profile-data";
import { communityAction } from "../../features/community/server-action";
import type { ContentPost } from "../../features/content/content-model";

export function OperationsHub() {
  const [signedIn, setSignedIn] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [watching, setWatching] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<
    Array<{ id: string; title: string; postId: string; signalIds: string[] }>
  >([]);
  const [trackProgress, setTrackProgress] = useState<Record<string, string[]>>({});
  const [notice, setNotice] = useState("");
  const [room, setRoom] = useState("");
  const [goal, setGoal] = useState("");
  useEffect(() => {
    void getContentPosts().then(setPosts);
    return observeCommunityMember((member) => {
      setSignedIn(Boolean(member));
      if (!member) {
        setWatching([]);
        setAlerts([]);
        setTrackProgress({});
        return;
      }
      void getCommunityProfile(member.uid).then((profile) =>
        setTags([...profile.specialties, ...profile.stack]),
      );
      void communityAction<{
        watchlist: string[];
        alerts: Array<{
          id: string;
          title: string;
          postId: string;
          signalIds: string[];
        }>;
        progress: Array<{ trackId: string; completedSteps: string[] }>;
      }>("operations.dashboard").then((data) => {
        setWatching(data.watchlist || []);
        setAlerts(data.alerts || []);
        setTrackProgress(
          Object.fromEntries(
            (data.progress || []).map((item) => [item.trackId, item.completedSteps]),
          ),
        );
      });
    });
  }, []);
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    const expansions: Record<string, string[]> = {
      phishing: ["golpes", "identidade", "mfa", "credencial"],
      cve: ["vulnerabilidades", "exploit", "patch"],
      siem: ["soc", "splunk", "detecção"],
      ransomware: ["incidentes", "vazamentos", "extorsão"],
      cloud: ["cloud security", "s3", "saas"],
    };
    const terms = value
      ? [
          ...new Set([
            value,
            ...value.split(/\s+/).flatMap((term) => expansions[term] || []),
          ]),
        ]
      : [];
    return terms.length
      ? posts
          .filter((post) => {
            const haystack =
              `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase();
            return terms.some((term) => haystack.includes(term));
          })
          .slice(0, 6)
      : [];
  }, [posts, query]);
  const brazilRadar = useMemo(
    () =>
      posts
        .filter((post) => post.kind === "radar" && post.region === "Brasil")
        .slice(0, 3),
    [posts],
  );
  const readiness = Math.min(
    100,
    new Set(tags).size * 8 +
      (posts.some((post) => post.kind === "discussion") ? 16 : 0),
  );
  async function watch(id: string) {
    if (!signedIn) return setNotice("Entre para salvar uma watchlist.");
    const next = watching.includes(id)
      ? watching.filter((item) => item !== id)
      : [...watching, id];
    try {
      await communityAction("operations.watchlist.update", { ids: next });
      setWatching(next);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível salvar.");
    }
  }
  async function submitRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signedIn) return setNotice("Entre para abrir uma sala.");
    try {
      await communityAction("operations.room.create", { subject: room });
      setRoom("");
      setNotice("Sala criada. Compartilhe o contexto sem dados sensíveis.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível abrir a sala.",
      );
    }
  }
  async function toggleTrackStep(trackId: string, step: number) {
    if (!signedIn) return setNotice("Entre para registrar o avanço da trilha.");
    const current = trackProgress[trackId] || [];
    const id = String(step + 1);
    const completedSteps = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    try {
      await communityAction("operations.track.progress", { trackId, completedSteps });
      setTrackProgress((previous) => ({ ...previous, [trackId]: completedSteps }));
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível registrar o passo.",
      );
    }
  }
  async function submitGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signedIn) return setNotice("Entre para registrar seu objetivo.");
    try {
      await communityAction("operations.mentorship.goal", { goal });
      setGoal("");
      setNotice("Objetivo salvo. Ele ajuda a indicar trilhas e mentores.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível salvar o objetivo.",
      );
    }
  }
  return (
    <main className="content-page operations-page">
      <ContentNav />
      <section className="operations-hero">
        <p className="auth-eyebrow">OPERAÇÕES / PRÁTICA GUIADA</p>
        <h1>Do sinal à decisão, em uma só base.</h1>
        <p>
          Radar de risco, prática aplicada e pessoas certas para continuar a
          investigação.
        </p>
        <div>
          <a href="#caso">Resolver caso da semana</a>
          <a href="#trilhas">Escolher trilha</a>
        </div>
      </section>
      <section className="operations-grid" aria-label="Mapa de operações">
        <div className="operations-map">
          <p className="auth-eyebrow">MAPA DE OPERAÇÕES</p>
          <h2>Sinais que pedem contexto.</h2>
          {operationSignals.map((signal) => (
            <article key={signal.id}>
              <span className={`operation-level ${signal.level}`} />
              <div>
                <b>{signal.title}</b>
                <p>{signal.detail}</p>
              </div>
              <button onClick={() => watch(signal.id)} type="button">
                {watching.includes(signal.id) ? "Acompanhando" : "Acompanhar"}
              </button>
            </article>
          ))}
        </div>
        <aside className="operations-readiness">
          <p className="auth-eyebrow">PRONTIDÃO PROFISSIONAL</p>
          <strong>{readiness}%</strong>
          <p>
            {signedIn
              ? "Baseado nas competências e atividades visíveis do seu perfil."
              : "Entre para gerar uma leitura privada baseada no seu perfil."}
          </p>
          <div>
            <span style={{ width: `${readiness}%` }} />
          </div>
          <Link href="/perfil/configuracoes">Completar perfil →</Link>
        </aside>
      </section>
      {alerts.length > 0 && (
        <section className="operations-alerts" aria-label="Alertas da watchlist">
          <p className="auth-eyebrow">SUA WATCHLIST / NOVOS SINAIS</p>
          <h2>Há leituras novas para sua investigação.</h2>
          <div>
            {alerts.slice(0, 3).map((alert) => (
              <Link
                key={alert.id}
                href={`/noticias/${alert.postId.replace("radar_", "radar-")}`}
              >
                <span>{alert.signalIds.join(" · ")}</span>
                <b>{alert.title}</b>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="operations-search">
        <label>
          Busca na comunidade
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: phishing Microsoft 365, CVE, SIEM"
          />
        </label>
        {results.length > 0 && (
          <div>
            {results.map((post) => (
              <Link
                key={post.id}
                href={
                  post.kind === "radar"
                    ? `/noticias/${post.slug}`
                    : post.kind === "discussion"
                      ? `/discussoes/${post.slug}`
                      : `/artigos/${post.slug}`
                }
              >
                <b>{post.title}</b>
                <span>{post.tags.join(" · ")}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="weekly-case" id="caso">
        <div>
          <p className="auth-eyebrow">CASO DA SEMANA / {weeklyCase.xp} XP</p>
          <h2>{weeklyCase.title}</h2>
          <p>{weeklyCase.summary}</p>
          <ul>
            {weeklyCase.signals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
          <Link href="/labs">Abrir estação simulada →</Link>
        </div>
        <aside>
          <b>O que entregar</b>
          <ol>
            <li>Hipótese verificável</li>
            <li>Três sinais priorizados</li>
            <li>Próximo dado de validação</li>
          </ol>
        </aside>
      </section>
      <section className="tracks" id="trilhas">
        <p className="auth-eyebrow">TRILHAS DE INVESTIGAÇÃO</p>
        <h2>Aprenda por função, não por catálogo.</h2>
        <div>
          {practiceTracks.map((track) => (
            <article key={track.id}>
              <span>{track.tag}</span>
              <h3>{track.title}</h3>
              <ol>
                {track.steps.map((step, index) => (
                  <li key={step}>
                    <button
                      className={
                        trackProgress[track.id]?.includes(String(index + 1))
                          ? "is-complete"
                          : ""
                      }
                      onClick={() => toggleTrackStep(track.id, index)}
                      type="button"
                    >
                      {trackProgress[track.id]?.includes(String(index + 1))
                        ? "✓"
                        : String(index + 1).padStart(2, "0")}
                    </button>
                    {step}
                  </li>
                ))}
              </ol>
              <span className="track-progress">
                {trackProgress[track.id]?.length || 0}/4 passos registrados
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="operations-community">
        <form onSubmit={submitRoom}>
          <p className="auth-eyebrow">SALA TEMPORÁRIA</p>
          <h2>Abra uma análise compartilhada.</h2>
          <input
            minLength={12}
            maxLength={140}
            value={room}
            onChange={(event) => setRoom(event.target.value)}
            placeholder="Ex.: impacto de CVE em VPN corporativa"
            required
          />
          <button type="submit">Abrir sala</button>
        </form>
        <form onSubmit={submitGoal}>
          <p className="auth-eyebrow">MENTORIA POR OBJETIVO</p>
          <h2>Onde você quer chegar?</h2>
          <input
            minLength={12}
            maxLength={180}
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="Ex.: quero atuar em SOC nível júnior"
            required
          />
          <button type="submit">Salvar objetivo</button>
        </form>
      </section>
      <section className="brazil-radar">
        <p className="auth-eyebrow">RADAR BRASIL</p>
        <h2>O que afeta o ecossistema local.</h2>
        <div>
          {brazilRadar.map((post) => (
            <Link key={post.id} href={`/noticias/${post.slug}`}>
              <small>{post.sourceName || "Notícias MentoCyber"}</small>
              <b>{post.title}</b>
              <span>{post.tags.join(" · ")}</span>
            </Link>
          ))}
        </div>
        <Link href="/noticias">Ver todas as notícias →</Link>
      </section>
      <section className="operations-brief">
        <p className="auth-eyebrow">BRIEFING / POR QUE IMPORTA</p>
        <h2>Use o radar para decidir o que fazer, não só o que ler.</h2>
        <p>
          Cada notícia, discussão ou caso é conectada a impacto, evidência e próxima
          ação defensiva.
        </p>
        <Link href="/noticias">Abrir notícias →</Link>
      </section>
      {notice && (
        <p className="operations-notice" aria-live="polite">
          {notice}
        </p>
      )}
    </main>
  );
}
