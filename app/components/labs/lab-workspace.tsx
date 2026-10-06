"use client";

import Link from "next/link";
import { CheckCircle2, LockKeyhole, Play, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import type { Lab } from "../../features/labs/catalog";
import {
  completeLab,
  getLabProgress,
  recordLabSimulationAction,
  startLab,
  type LabProgressStatus,
} from "../../features/labs/lab-progress";
import {
  observeCommunityMember,
  type CommunityMember,
} from "../../features/community/community-data";
import { LabDesktop } from "./lab-desktop";

export function LabWorkspace({ lab }: { lab: Lab }) {
  const [member, setMember] = useState<CommunityMember | null>(null);
  const [status, setStatus] = useState<LabProgressStatus | "new">("new");
  const [simulationActions, setSimulationActions] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(
    () =>
      observeCommunityMember((next) => {
        setMember(next);
        if (!next) {
          setStatus("new");
          setSimulationActions([]);
          return;
        }
        getLabProgress(next.uid)
          .then((items) => {
            const progress = items.find((item) => item.labId === lab.id);
            setStatus(progress?.status || "new");
            setSimulationActions(progress?.simulationActions || []);
          })
          .catch(() => setNotice("Não foi possível carregar seu estado neste lab."));
      }),
    [lab.id],
  );

  async function begin() {
    setPending(true);
    setNotice("");
    try {
      await startLab(lab.id);
      setStatus("active");
      setNotice("Estação liberada. Conclua os objetivos técnicos para ganhar XP.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível iniciar este lab.",
      );
    } finally {
      setPending(false);
    }
  }

  async function recordAction(actionId: string) {
    if (simulationActions.includes(actionId)) return;
    try {
      await recordLabSimulationAction(lab.id, actionId);
      setSimulationActions((current) => [...current, actionId]);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a operação.",
      );
    }
  }

  async function finishLab() {
    setPending(true);
    setNotice("");
    try {
      const result = await completeLab(lab.id);
      setStatus("completed");
      setNotice(`Operação concluída. +${result.xp} XP registrado no seu perfil.`);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a operação.",
      );
    } finally {
      setPending(false);
    }
  }

  const stateLabel =
    status === "new"
      ? "NÃO INICIADO"
      : status === "active"
        ? "EM OPERAÇÃO"
        : status === "completed"
          ? "CONCLUÍDO"
          : "LEGADO / EM REVISÃO";

  return (
    <main className="lab-workspace">
      <header className="profile-topbar">
        <Link className="auth-brand" href="/">
          MENTO<span>CYBER</span>
        </Link>
        <nav>
          <Link href="/labs">Labs</Link>
          <Link href="/perfil">Perfil</Link>
        </nav>
      </header>
      <Link className="lab-back" href="/labs">
        ← Voltar aos labs
      </Link>
      <section className="lab-workspace-head">
        <div>
          <p className="auth-eyebrow">
            {lab.category.toUpperCase()} / {lab.difficulty.toUpperCase()}
          </p>
          <h1>{lab.title}</h1>
          <p>{lab.summary}</p>
        </div>
        <dl>
          <div>
            <dt>DURAÇÃO</dt>
            <dd>{lab.duration}</dd>
          </div>
          <div>
            <dt>ESTADO</dt>
            <dd>{stateLabel}</dd>
          </div>
        </dl>
      </section>
      <div className="lab-workspace-grid">
        <section className="lab-brief">
          <p className="auth-eyebrow">CENÁRIO</p>
          <h2>Contexto controlado</h2>
          <p>{lab.scenario}</p>
          <div>
            <p className="auth-eyebrow">OBJETIVO</p>
            <strong>{lab.objective}</strong>
          </div>
        </section>
        <aside className="lab-safety">
          <ShieldAlert size={20} aria-hidden="true" />
          <div>
            <p className="auth-eyebrow">LIMITE DE SEGURANÇA</p>
            <strong>{lab.safety}</strong>
          </div>
        </aside>
      </div>
      <LabDesktop
        active={status === "active"}
        completedActions={simulationActions}
        completing={pending}
        lab={lab}
        onAction={recordAction}
        onComplete={finishLab}
      />
      {!member ? (
        <section className="lab-callout">
          <LockKeyhole size={18} />
          <div>
            <b>Entre para iniciar este lab.</b>
            <p>O acesso guarda sua conclusão e XP no perfil.</p>
          </div>
          <Link className="profile-primary" href="/entrar">
            Entrar
          </Link>
        </section>
      ) : status === "new" ? (
        <section className="lab-callout">
          <Play size={18} />
          <div>
            <b>Pronto para abrir a estação?</b>
            <p>O PC simulado será liberado para esta operação.</p>
          </div>
          <button
            className="profile-primary"
            disabled={pending}
            onClick={begin}
            type="button"
          >
            {pending ? "Iniciando…" : "Iniciar lab"}
          </button>
        </section>
      ) : status !== "active" && status !== "completed" ? (
        <section className="lab-callout">
          <Play size={18} />
          <div>
            <b>Este lab mudou para o modo simulado.</b>
            <p>
              Abra a estação para concluir pela operação prática e receber XP
              automático.
            </p>
          </div>
          <button
            className="profile-primary"
            disabled={pending}
            onClick={begin}
            type="button"
          >
            {pending ? "Abrindo…" : "Abrir estação"}
          </button>
        </section>
      ) : status === "completed" ? (
        <section className="lab-evidence">
          <p className="lab-review-state">
            <CheckCircle2 size={16} /> Operação concluída. O XP já foi registrado
            automaticamente.
          </p>
        </section>
      ) : null}
      {notice && (
        <p className="lab-notice" aria-live="polite">
          {notice}
        </p>
      )}
    </main>
  );
}
