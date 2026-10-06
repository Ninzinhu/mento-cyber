"use client";

import Link from "next/link";
import { Check, ChevronRight, RotateCcw, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  getLabReviewQueue,
  submitLabReview,
  type LabReviewItem,
} from "../../features/labs/lab-review";
import {
  observeCommunityMember,
  type CommunityMember,
} from "../../features/community/community-data";

export function LabReviewQueue() {
  const [member, setMember] = useState<CommunityMember | null>(null);
  const [queue, setQueue] = useState<LabReviewItem[]>([]);
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState<"accepted" | "adjust">("accepted");
  const [state, setState] = useState<"loading" | "ready" | "saving" | "error">(
    "loading",
  );
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    setState("loading");
    setNotice("");
    try {
      setQueue(await getLabReviewQueue());
      setState("ready");
    } catch (error) {
      setState("error");
      setNotice(
        error instanceof Error ? error.message : "Não foi possível carregar a fila.",
      );
    }
  };

  useEffect(
    () =>
      observeCommunityMember((next) => {
        setMember(next);
        if (next) void refresh();
        else {
          setQueue([]);
          setState("ready");
        }
      }),
    [],
  );

  const item = queue[0];
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item || feedback.trim().length < 40) {
      setNotice(
        "Escreva ao menos 40 caracteres para orientar quem enviou a evidência.",
      );
      return;
    }
    setState("saving");
    setNotice("");
    try {
      await submitLabReview(item.id, decision, feedback);
      setQueue((current) => current.slice(1));
      setFeedback("");
      setDecision("accepted");
      setState("ready");
      setNotice(
        decision === "accepted"
          ? "Evidência aceita. O lab foi concluído."
          : "Ajuste solicitado. A pessoa poderá reenviar a evidência.",
      );
    } catch (error) {
      setState("error");
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a revisão.",
      );
    }
  };

  return (
    <main className="labs-page lab-review-page">
      <header className="profile-topbar">
        <Link className="auth-brand" href="/">
          MENTO<span>CYBER</span>
        </Link>
        <nav>
          <Link href="/labs">Labs</Link>
          <Link href="/perfil">Perfil</Link>
        </nav>
      </header>
      <section className="review-intro">
        <div>
          <p className="auth-eyebrow">REVISÃO ENTRE PARES / CAMPO</p>
          <h1>Melhore a prática de alguém.</h1>
          <p>
            Leia o material sem identificar a pessoa. Decida pelo que foi demonstrado,
            não por quem enviou.
          </p>
        </div>
        <aside>
          <ShieldCheck size={21} aria-hidden="true" />
          <b>Critério de segurança</b>
          <span>Somente cenários e dados simulados entram na fila.</span>
        </aside>
      </section>
      {!member ? (
        <section className="review-gate">
          <p className="auth-eyebrow">ACESSO NECESSÁRIO</p>
          <h2>Entre para revisar evidências.</h2>
          <p>O acesso à fila exige uma conta ativa na comunidade.</p>
          <Link href="/entrar">
            Entrar <ChevronRight size={16} />
          </Link>
        </section>
      ) : state === "loading" ? (
        <section className="review-gate">
          <p>Preparando o próximo caso…</p>
        </section>
      ) : !item ? (
        <section className="review-empty">
          <Check size={24} aria-hidden="true" />
          <p className="auth-eyebrow">FILA LIMPA</p>
          <h2>Nenhuma evidência aguardando sua leitura.</h2>
          <p>
            Volte mais tarde ou conclua um lab para contribuir com a próxima revisão.
          </p>
          <div>
            <Link href="/labs">
              Explorar labs <ChevronRight size={16} />
            </Link>
            <button onClick={() => void refresh()} type="button">
              <RotateCcw size={15} /> Atualizar fila
            </button>
          </div>
        </section>
      ) : (
        <section className="review-workbench">
          <article className="review-evidence">
            <header>
              <span>LAB / {item.labTitle}</span>
              <b>{queue.length} na fila</b>
            </header>
            <div className="review-objective">
              <p className="auth-eyebrow">OBJETIVO DO CENÁRIO</p>
              <p>{item.objective}</p>
            </div>
            <div className="review-content">
              <p className="auth-eyebrow">EVIDÊNCIA ENVIADA</p>
              <p>{item.content}</p>
            </div>
          </article>
          <form className="review-decision" onSubmit={submit}>
            <p className="auth-eyebrow">SUA LEITURA</p>
            <h2>O que você conferiu?</h2>
            <ul>
              <li>Responde ao objetivo do cenário.</li>
              <li>Explica a decisão com contexto suficiente.</li>
              <li>Não expõe dados reais ou alvos externos.</li>
            </ul>
            <fieldset>
              <legend>Decisão</legend>
              <label className={decision === "accepted" ? "selected" : ""}>
                <input
                  checked={decision === "accepted"}
                  name="decision"
                  onChange={() => setDecision("accepted")}
                  type="radio"
                />
                <Check size={16} /> Aceitar evidência
              </label>
              <label className={decision === "adjust" ? "selected" : ""}>
                <input
                  checked={decision === "adjust"}
                  name="decision"
                  onChange={() => setDecision("adjust")}
                  type="radio"
                />
                <RotateCcw size={16} /> Pedir ajuste
              </label>
            </fieldset>
            <label className="review-feedback">
              Retorno para a pessoa
              <textarea
                maxLength={600}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Aponte o que está sólido ou explique qual informação falta para sustentar a conclusão."
                value={feedback}
              />
              <small>{feedback.trim().length}/600 — mínimo de 40 caracteres</small>
            </label>
            {notice && (
              <p className={`review-notice ${state === "error" ? "is-error" : ""}`}>
                {notice}
              </p>
            )}
            <button disabled={state === "saving"} type="submit">
              {state === "saving"
                ? "Registrando…"
                : decision === "accepted"
                  ? "Aceitar e concluir"
                  : "Solicitar ajuste"}
              <ChevronRight size={17} />
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
