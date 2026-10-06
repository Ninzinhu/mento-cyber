import Link from "next/link";
import { notFound } from "next/navigation";
import { ContributionForm } from "../../components/community/contribution-form";
import { experiments, getExperiment } from "../../features/missions/experiments";

const trainingProfiles: Record<
  string,
  { track: string; lab: string; deliverable: string; level: string; tool: string }
> = {
  caso: {
    track: "Defesa em comunidade",
    lab: "Triagem de alertas",
    deliverable: "Linha do tempo",
    level: "Aberta",
    tool: "Leitor de logs",
  },
  sonda: {
    track: "Sinais em conversa",
    lab: "Sinais fracos",
    deliverable: "Hipótese de investigação",
    level: "Em grupo",
    tool: "Mapa de eventos",
  },
  matriz: {
    track: "Decisão responsável",
    lab: "Decisão sob contexto",
    deliverable: "Registro técnico",
    level: "Aberta",
    tool: "Matriz de decisão",
  },
  vertice: {
    track: "Repertório em cyber",
    lab: "Mapa de competências",
    deliverable: "Plano de 90 dias",
    level: "Aberta",
    tool: "Navegador de trilhas",
  },
  ritual: {
    track: "Fundamentos recorrentes",
    lab: "Revisão deliberada",
    deliverable: "Caderno de prática",
    level: "Aberta",
    tool: "Plano de revisão",
  },
  indice: {
    track: "Pesquisa em defesa",
    lab: "Consulta de evidências",
    deliverable: "Biblioteca anotada",
    level: "Em grupo",
    tool: "Índice de fontes",
  },
  contrapeso: {
    track: "Risco e controles",
    lab: "Contexto de decisão",
    deliverable: "Justificativa de controle",
    level: "Em grupo",
    tool: "Quadro de risco",
  },
  rastro: {
    track: "Investigação de incidentes",
    lab: "Correlação de eventos",
    deliverable: "Relatório de incidente",
    level: "Em grupo",
    tool: "Linha de investigação",
  },
  turno: {
    track: "SOC e resposta",
    lab: "Triagem noturna",
    deliverable: "Escalonamento responsável",
    level: "Avançada",
    tool: "Fila de alertas",
  },
  convergencia: {
    track: "Revisão em comunidade",
    lab: "Revisão entre pares",
    deliverable: "Feedback técnico",
    level: "Para a rede",
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
      <a className="skip-link" href="#missao">
        Pular para a missão
      </a>
      <header className="cyber-topbar">
        <Link href="/estudos">← missões</Link>
        <span>
          MENTO<span>CYBER</span> / COMUNIDADE
        </span>
        <a href="#etapas">Ver etapas</a>
      </header>
      <div className="cyber-shell">
        <aside className="course-rail">
          <div className="rail-brand">
            MISSÃO
            <br />
            {experiment.number}
          </div>
          <nav aria-label="Navegação da missão">
            <a className="is-current" href="#missao">
              Missão atual
            </a>
            <a href="#etapas">Etapas</a>
            <a href="#evidencia">Evidências</a>
            <a href="#entrega">Entrega</a>
          </nav>
          <div className="rail-progress">
            <span>ROTEIRO</span>
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
              <p>FRENTE / {profile.track}</p>
              <h1>
                {experiment.name}: {experiment.headline}
              </h1>
            </div>
            <span className="level-chip">{profile.level}</span>
          </div>
          <div className="mission-grid">
            <article className="mission-card">
              <span className="card-kicker">PRÁTICA ABERTA · REDE ATIVA</span>
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
              <a className="scenario-link" href="#etapas">
                Ver pontos de conversa <span>→</span>
              </a>
            </article>
            <article className="checkpoint-card" id="etapas">
              <span className="card-kicker">PONTOS DE CONVERSA</span>
              <ol>
                {experiment.notes.map((note, index) => (
                  <li className={index === 0 ? "is-done" : ""} key={note}>
                    <span>0{index + 1}</span>
                    <div>
                      <strong>{note}</strong>
                      <small>
                        {index === 0
                          ? "Cenário lido e limites combinados"
                          : index === 1
                            ? "Analisar pistas e formular hipótese"
                            : "Registrar evidências para compartilhar"}
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
                Você não precisa “vencer” a prática. Precisa conseguir explicar o que
                observou e abrir espaço para outras leituras.
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
          <span className="card-kicker">PARA LEVAR À REDE</span>
          <h2>{profile.deliverable}</h2>
          <p>
            Um registro curto para tornar seu raciocínio visível e convidar revisão.
          </p>
          <ul>
            <li>Contexto e escopo</li>
            <li>Evidências relevantes</li>
            <li>Pergunta para os pares</li>
          </ul>
          <a href="#missao">Ver modelo de contribuição →</a>
          <Link href={`/estudos/${nextExperiment.slug}`}>
            Próxima missão: {nextExperiment.name} →
          </Link>
          <ContributionForm missionId={experiment.slug} />
        </aside>
      </div>
    </main>
  );
}
