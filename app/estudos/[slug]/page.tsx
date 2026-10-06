import Link from "next/link";
import { notFound } from "next/navigation";
import { experiments, getExperiment } from "../experiments";

const trainingProfiles: Record<
  string,
  { track: string; lab: string; deliverable: string; level: string; tool: string }
> = {
  caso: {
    track: "Fundamentos de defesa",
    lab: "Triagem de alertas",
    deliverable: "Linha do tempo",
    level: "Base",
    tool: "Leitor de logs",
  },
  sonda: {
    track: "Telemetria e sinais",
    lab: "Sinais fracos",
    deliverable: "Hipótese de investigação",
    level: "Intermediário",
    tool: "Mapa de eventos",
  },
  matriz: {
    track: "Operação responsável",
    lab: "Decisão sob contexto",
    deliverable: "Registro técnico",
    level: "Base",
    tool: "Matriz de decisão",
  },
  vertice: {
    track: "Carreira em cyber",
    lab: "Mapa de competências",
    deliverable: "Plano de 90 dias",
    level: "Base",
    tool: "Navegador de trilhas",
  },
  ritual: {
    track: "Fundamentos recorrentes",
    lab: "Revisão deliberada",
    deliverable: "Caderno de prática",
    level: "Base",
    tool: "Plano de revisão",
  },
  indice: {
    track: "Pesquisa em defesa",
    lab: "Consulta de evidências",
    deliverable: "Biblioteca anotada",
    level: "Intermediário",
    tool: "Índice de fontes",
  },
  contrapeso: {
    track: "Risco e controles",
    lab: "Contexto de decisão",
    deliverable: "Justificativa de controle",
    level: "Intermediário",
    tool: "Quadro de risco",
  },
  rastro: {
    track: "Investigação de incidentes",
    lab: "Correlação de eventos",
    deliverable: "Relatório de incidente",
    level: "Intermediário",
    tool: "Linha de investigação",
  },
  turno: {
    track: "SOC e resposta",
    lab: "Triagem noturna",
    deliverable: "Escalonamento responsável",
    level: "Avançado",
    tool: "Fila de alertas",
  },
  convergencia: {
    track: "Mentoria em comunidade",
    lab: "Revisão entre pares",
    deliverable: "Feedback técnico",
    level: "Todos os níveis",
    tool: "Mesa de revisão",
  },
};

export function generateStaticParams() {
  return experiments.map(({ slug }) => ({ slug }));
}

export default async function StudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experiment = getExperiment(slug);

  if (!experiment) notFound();

  const profile = trainingProfiles[experiment.slug];
  const nextExperiment =
    experiments[
      (experiments.findIndex((item) => item.slug === slug) + 1) % experiments.length
    ];

  return (
    <main className={`cyber-lab cyber-${experiment.slug}`}>
      <header className="cyber-topbar">
        <Link href="/estudos">← laboratório</Link>
        <span>
          MENTO<span>CYBER</span> / ACADEMIA
        </span>
        <button type="button">ver rota</button>
      </header>
      <div className="cyber-shell">
        <aside className="course-rail">
          <div className="rail-brand">
            TRILHA
            <br />
            {experiment.number}
          </div>
          <nav aria-label="Navegação da trilha">
            <a className="is-current" href="#missao">
              Missão atual
            </a>
            <a href="#etapas">Etapas</a>
            <a href="#evidencia">Evidências</a>
            <a href="#entrega">Entrega</a>
          </nav>
          <div className="rail-progress">
            <span>PROGRESSO</span>
            <strong>
              02<span>/04</span>
            </strong>
            <div aria-label="Progresso de 50%">
              <i />
              <i />
            </div>
          </div>
        </aside>
        <section className="mission-workspace" id="missao">
          <div className="workspace-heading">
            <div>
              <p>TRILHA / {profile.track}</p>
              <h1>
                {experiment.name}: {experiment.headline}
              </h1>
            </div>
            <span className="level-chip">{profile.level}</span>
          </div>
          <div className="mission-grid">
            <article className="mission-card">
              <span className="card-kicker">MISSÃO 02 · LAB ABERTO</span>
              <h2>{profile.lab}</h2>
              <p>{experiment.description}</p>
              <div className="mission-meta">
                <span>
                  FERRAMENTA <b>{profile.tool}</b>
                </span>
                <span>
                  TEMPO <b>45–60 min</b>
                </span>
              </div>
              <button type="button">
                Iniciar cenário <span>→</span>
              </button>
            </article>
            <article className="checkpoint-card" id="etapas">
              <span className="card-kicker">CHECKPOINTS</span>
              <ol>
                {experiment.notes.map((note, index) => (
                  <li className={index === 0 ? "is-done" : ""} key={note}>
                    <span>0{index + 1}</span>
                    <div>
                      <strong>{note}</strong>
                      <small>
                        {index === 0
                          ? "Contexto lido e limites definidos"
                          : index === 1
                            ? "Analisar pistas e formular hipótese"
                            : "Registrar evidências e decisão"}
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          </div>
          <section className="evidence-strip" id="evidencia">
            <div>
              <span className="card-kicker">EVIDÊNCIA EM FOCO</span>
              <p>
                Você não precisa “vencer” o lab. Precisa conseguir explicar o que
                observou e por quê.
              </p>
            </div>
            <div className="evidence-sample">
              <span>evt-021</span>
              <span>origem: endpoint-07</span>
              <span>prioridade: revisar</span>
            </div>
          </section>
        </section>
        <aside className="delivery-panel" id="entrega">
          <span className="card-kicker">PRÓXIMA ENTREGA</span>
          <h2>{profile.deliverable}</h2>
          <p>
            Um artefato curto para demonstrar raciocínio técnico, não apenas conclusão.
          </p>
          <ul>
            <li>Contexto e escopo</li>
            <li>Evidências relevantes</li>
            <li>Próximo passo responsável</li>
          </ul>
          <a href="#missao">Ver modelo de entrega →</a>
          <Link href={`/estudos/${nextExperiment.slug}`}>
            Próxima trilha: {nextExperiment.name} →
          </Link>
        </aside>
      </div>
    </main>
  );
}
