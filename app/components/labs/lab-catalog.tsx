"use client";

import Link from "next/link";
import { Filter, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  labs,
  type LabCategory,
  type LabDifficulty,
} from "../../features/labs/catalog";
import { getLabProgress, type LabProgress } from "../../features/labs/lab-progress";
import {
  observeCommunityMember,
  type CommunityMember,
} from "../../features/community/community-data";

const categories: Array<LabCategory | "Todos"> = [
  "Todos",
  "Detecção",
  "Web",
  "Forense",
  "OSINT",
  "Redes",
  "Cloud",
];
const difficulties: Array<LabDifficulty | "Todas"> = [
  "Todas",
  "Fundamentos",
  "Intermediário",
  "Avançado",
];
const stateFor = (labId: string, progress: LabProgress[]) =>
  progress.find((item) => item.labId === labId)?.status || "new";

function LabCardArt({ visual }: { visual: string }) {
  return (
    <div aria-hidden="true" className={`lab-card-art art-${visual}`}>
      <i />
      <i />
      <i />
      <b />
    </div>
  );
}

export function LabCatalog() {
  const [member, setMember] = useState<CommunityMember | null>(null);
  const [progress, setProgress] = useState<LabProgress[]>([]);
  const [category, setCategory] = useState<LabCategory | "Todos">("Todos");
  const [difficulty, setDifficulty] = useState<LabDifficulty | "Todas">("Todas");
  useEffect(
    () =>
      observeCommunityMember((next) => {
        setMember(next);
        if (!next) {
          setProgress([]);
          return;
        }
        getLabProgress(next.uid)
          .then(setProgress)
          .catch(() => setProgress([]));
      }),
    [],
  );
  const visible = useMemo(
    () =>
      labs.filter(
        (lab) =>
          (category === "Todos" || lab.category === category) &&
          (difficulty === "Todas" || lab.difficulty === difficulty),
      ),
    [category, difficulty],
  );
  return (
    <main className="labs-page labs-catalog-page">
      <header className="profile-topbar">
        <Link className="auth-brand" href="/">
          MENTO<span>CYBER</span>
        </Link>
        <nav>
          <Link href="/estudos">Missões</Link>
          <Link href="/perfil">Perfil</Link>
        </nav>
      </header>
      <section className="labs-catalog-intro">
        <div>
          <p className="auth-eyebrow">AMBIENTE DE PRÁTICA / LABS</p>
          <h1>Investigue cenários, não sistemas reais.</h1>
          <p>
            Labs guiados por evidência, com escopo declarado e materiais simulados. Seu
            progresso é registrado no servidor.
          </p>
        </div>
        <aside>
          <ShieldCheck size={22} aria-hidden="true" />
          <b>Escopo seguro</b>
          <span>Sem alvos externos ou coleta de dados reais.</span>
        </aside>
      </section>
      <section className="labs-toolbar" aria-label="Filtros dos laboratórios">
        <Filter size={17} aria-hidden="true" />
        <label>
          Área
          <select
            onChange={(event) =>
              setCategory(event.target.value as LabCategory | "Todos")
            }
            value={category}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Dificuldade
          <select
            onChange={(event) =>
              setDifficulty(event.target.value as LabDifficulty | "Todas")
            }
            value={difficulty}
          >
            {difficulties.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <span>{visible.length} labs disponíveis</span>
      </section>
      <section className="labs-grid" aria-label="Laboratórios disponíveis">
        {visible.map((lab, index) => {
          const state = stateFor(lab.id, progress);
          const locked = lab.prerequisites.some(
            (requirement) => !["completed"].includes(stateFor(requirement, progress)),
          );
          return (
            <article className="lab-card" key={lab.id}>
              <div className="lab-card-meta">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{lab.category}</b>
                <small>{lab.duration}</small>
              </div>
              <LabCardArt visual={lab.visual} />
              <h2>{lab.title}</h2>
              <p>{lab.summary}</p>
              <footer>
                <span className={`lab-state lab-state-${state}`}>
                  {state === "new"
                    ? "Disponível"
                    : state === "active"
                      ? "Em andamento"
                      : state === "completed"
                        ? "Concluído"
                        : "Legado / revisão"}
                </span>
                {locked ? (
                  <span className="lab-lock">
                    <LockKeyhole size={13} />
                    Pré-requisito
                  </span>
                ) : (
                  <Link href={`/labs/${lab.slug}`}>
                    {state === "new" ? "Ver cenário" : "Continuar"} <i>→</i>
                  </Link>
                )}
              </footer>
            </article>
          );
        })}
      </section>
      {!member && (
        <p className="labs-signin-note">
          Entre na comunidade para iniciar labs e enviar evidências.
        </p>
      )}
    </main>
  );
}
