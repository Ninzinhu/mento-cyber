import { BrandLab } from "./components/brand-lab";
import { SiteFooter, SiteHeader } from "./components/site-chrome";

const libraryItems = [
  [
    "01",
    "Mapa de estudos para sua primeira vaga",
    "Um roteiro de 90 dias para organizar fundamentos, projetos e candidatura.",
    "ABERTO",
  ],
  [
    "02",
    "Checklist de hardening para Windows",
    "Uma lista prática para revisar configurações essenciais de um ambiente.",
    "ABERTO",
  ],
  [
    "03",
    "Leitura de log: o que merece investigação?",
    "Exercício inicial de análise de evidências para quem quer seguir em defesa.",
    "EM PREPARO",
  ],
];

const tracks = [
  [
    "TRILHA 01",
    "Fundamentos",
    "Para quem está construindo o vocabulário e o raciocínio da área.",
    ["Linux e redes", "Fundamentos de segurança", "Carreira e portfólio"],
  ],
  [
    "TRILHA 02",
    "Blue Team",
    "Para quem quer detectar, analisar e responder a incidentes.",
    ["Logs e telemetria", "SIEM e investigação", "Relatório de incidente"],
  ],
  [
    "TRILHA 03",
    "Cloud & GRC",
    "Para quem quer atuar em ambientes modernos e decisões de risco.",
    ["Controles em cloud", "Gestão de risco", "Segurança aplicada"],
  ],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section id="inicio" className="wrap hero">
          <div>
            <div className="kicker">Escola de cibersegurança aplicada</div>
            <h1>
              Estudo com
              <br />
              <em>direção.</em>
              <br />
              Prática com prova.
            </h1>
            <p>
              MentoCyber é para quem quer construir repertório técnico, aprender a
              investigar e se preparar para atuar em segurança — com materiais claros,
              desafios responsáveis e feedback humano.
            </p>
            <div className="hero-actions">
              <a className="action" href="#biblioteca">
                Ver conteúdos gratuitos
              </a>
              <a className="outline" href="#turmas">
                Conhecer as turmas
              </a>
            </div>
          </div>
          <aside className="field-note">
            <div className="label">CADERNO DE CAMPO / 01</div>
            <strong>
              Conhecimento só vira habilidade quando você consegue explicar a decisão
              tomada.
            </strong>
            <p>
              Cada trilha combina base técnica, contexto de negócio e uma entrega que
              pode fazer parte do seu portfólio.
            </p>
          </aside>
        </section>
        <div className="wrap index">
          {[
            ["01 / BASE", "Conteúdos que abrem a rota"],
            ["02 / TRILHA", "Progressão por competência"],
            ["03 / PRÁTICA", "Casos, labs e relatórios"],
            ["04 / TURMA", "Mentoria e revisão humana"],
          ].map(([label, text]) => (
            <div className="index-item" key={label}>
              <b>{label}</b>
              <strong>{text}</strong>
            </div>
          ))}
        </div>
        <section id="biblioteca" className="wrap section">
          <div className="section-head">
            <div>
              <div className="kicker">Biblioteca aberta</div>
              <h2>Comece pelo que é útil hoje.</h2>
            </div>
            <p className="section-lead">
              Materiais curtos para orientar os primeiros passos e ajudar você a
              entender se a área faz sentido para sua carreira. Sem conta, sem promessa
              vazia.
            </p>
          </div>
          <div className="content-list">
            {libraryItems.map(([number, title, description, status]) => (
              <article className="content-row" key={number}>
                <div className="number">{number}</div>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <span className="status">{status}</span>
              </article>
            ))}
          </div>
        </section>
        <section id="trilhas" className="section route">
          <div className="wrap">
            <div className="kicker">Trilhas de formação</div>
            <h2>Uma sequência pensada para o trabalho real.</h2>
            <div className="route-grid">
              {tracks.map(([label, title, description, topics]) => (
                <article className="route-card" key={label as string}>
                  <b>{label as string}</b>
                  <h3>{title as string}</h3>
                  <p>{description as string}</p>
                  <ul>
                    {(topics as string[]).map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="pratica" className="wrap section practice">
          <div>
            <div className="kicker">Método MentoCyber</div>
            <h2>
              Aprender é<br />
              conseguir <em>agir.</em>
            </h2>
            <p className="section-lead">
              O foco não é completar telas. É entender o cenário, formular uma hipótese,
              registrar evidências e comunicar uma decisão técnica de forma responsável.
            </p>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Contexto",
                "Você recebe um cenário, limites e objetivos claros antes de tocar em qualquer ferramenta.",
              ],
              [
                "02",
                "Investigação",
                "O lab apresenta pistas e checkpoints para você construir uma linha de raciocínio.",
              ],
              [
                "03",
                "Entrega",
                "Você registra decisões, evidências e próximos passos em um relatório simples e objetivo.",
              ],
            ].map(([number, title, description]) => (
              <article className="step" key={number}>
                <div className="step-no">{number}</div>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="turmas" className="wrap section">
          <div className="section-head">
            <div>
              <div className="kicker">Acesso</div>
              <h2>Comece aberto. Avance em turma.</h2>
            </div>
            <p className="section-lead">
              A primeira versão da MentoCyber é propositalmente simples: conteúdo aberto
              para explorar e turmas pequenas para quem precisa de acompanhamento.
            </p>
          </div>
          <div className="offer">
            <article className="offer-card">
              <div className="eyebrow">BIBLIOTECA</div>
              <h3>Explorar</h3>
              <p>Para reconhecer a rota e estudar no seu ritmo.</p>
              <ul>
                <li>Roadmaps e checklists</li>
                <li>Exercícios de base</li>
                <li>Novos materiais por e-mail</li>
              </ul>
              <a className="outline" href="#acesso">
                Quero começar
              </a>
            </article>
            <article className="offer-card featured">
              <div className="eyebrow">PRIMEIRA TURMA</div>
              <h3>Mentoria prática</h3>
              <p>Para aplicar a trilha com encontros ao vivo e revisão de entregas.</p>
              <ul>
                <li>Encontros em grupo</li>
                <li>Casos e desafios semanais</li>
                <li>Comunidade e feedback</li>
              </ul>
              <a className="action" href="#acesso">
                Entrar na lista de interesse
              </a>
            </article>
          </div>
        </section>
        <section id="acesso" className="closing">
          <div className="wrap">
            <div className="kicker orange-kicker">COMEÇO RESPONSÁVEL</div>
            <h2>Construa uma carreira que sabe justificar cada decisão.</h2>
            <p>
              Receba os primeiros conteúdos da MentoCyber e o aviso quando a primeira
              turma abrir.
            </p>
            <a
              className="action"
              href="mailto:contato@mentocyber.com?subject=Lista%20de%20interesse%20-%20MentoCyber"
            >
              Quero entrar na lista
            </a>
          </div>
        </section>
        <BrandLab />
      </main>
      <SiteFooter />
    </>
  );
}
