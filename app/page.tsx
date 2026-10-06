import { InterestForm } from "./components/community/interest-form";
import { HorizonHero } from "./components/hero/horizon-hero";
import { SiteFooter, SiteHeader } from "./components/shell/site-chrome";

const libraryItems = [
  [
    "01",
    "Mapa de referências para começar em defesa",
    "Um ponto de partida para organizar fundamentos, ferramentas e perguntas úteis.",
    "ABERTO",
  ],
  [
    "02",
    "Checklist coletivo de hardening para Windows",
    "Uma lista prática que a comunidade revisa para fortalecer ambientes reais.",
    "ABERTO",
  ],
  [
    "03",
    "Leitura de log: o que merece conversa?",
    "Um ponto de partida para levantar hipóteses e compará-las com outras pessoas.",
    "EM CONSTRUÇÃO",
  ],
];

const tracks = [
  [
    "FRENTE 01",
    "Fundamentos",
    "Para quem quer construir repertório e participar das primeiras conversas.",
    ["Linux e redes", "Fundamentos de segurança", "Carreira e portfólio"],
  ],
  [
    "FRENTE 02",
    "Blue Team",
    "Para investigar sinais, comparar leituras e discutir respostas responsáveis.",
    ["Logs e telemetria", "SIEM e investigação", "Relatório de incidente"],
  ],
  [
    "FRENTE 03",
    "Cloud & GRC",
    "Para trocar critérios sobre risco, controles e ambientes em transformação.",
    ["Controles em cloud", "Gestão de risco", "Segurança aplicada"],
  ],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <main id="conteudo">
        <HorizonHero />
        <div className="wrap index">
          {[
            ["01 / BASE", "Referências que permanecem abertas"],
            ["02 / MISSÕES", "Práticas para fazer com contexto"],
            ["03 / PARES", "Hipóteses que circulam e melhoram"],
            ["04 / REDE", "Encontros, revisões e memória coletiva"],
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
              Referências que ajudam você a chegar com contexto nas conversas. Sem
              barreira de entrada e sem promessa de atalho.
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
            <div className="kicker">Frentes de prática</div>
            <h2>Encontre um tema e traga sua leitura.</h2>
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
            <div className="kicker">Como participamos</div>
            <h2>
              Aprender é<br />
              conseguir <em>agir.</em>
            </h2>
            <p className="section-lead">
              O foco não é acumular conteúdo. É entender o cenário, formular uma
              hipótese, registrar evidências e colocá-las em conversa de forma
              responsável.
            </p>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Contexto",
                "Você recebe um cenário, limites e perguntas claras antes de tocar em qualquer ferramenta.",
              ],
              [
                "02",
                "Investigação",
                "A prática apresenta pistas e checkpoints para você construir uma linha de raciocínio.",
              ],
              [
                "03",
                "Troca",
                "Você compartilha decisões, evidências e próximos passos para revisão entre pares.",
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
        <section id="rede" className="wrap section">
          <div className="section-head">
            <div>
              <div className="kicker">A comunidade</div>
              <h2>Chegue com curiosidade. Fique pela troca.</h2>
            </div>
            <p className="section-lead">
              A MentoCyber nasce aberta: referências públicas, missões para praticar e
              encontros para quem quer pensar junto, sem hierarquia de sala de aula.
            </p>
          </div>
          <div className="offer">
            <article className="offer-card">
              <div className="eyebrow">BASE ABERTA</div>
              <h3>Chegar com contexto</h3>
              <p>Para consultar referências e começar uma conversa bem situada.</p>
              <ul>
                <li>Referências e checklists</li>
                <li>Casos para observar</li>
                <li>Atualizações da rede</li>
              </ul>
              <a className="outline" href="#acesso">
                Ver a base aberta
              </a>
            </article>
            <article className="offer-card featured">
              <div className="eyebrow">REDE DE PRÁTICA</div>
              <h3>Participar dos encontros</h3>
              <p>
                Para levar uma hipótese, revisar entregas e contribuir com outras
                pessoas.
              </p>
              <ul>
                <li>Encontros entre pares</li>
                <li>Missões compartilhadas</li>
                <li>Revisão e memória coletiva</li>
              </ul>
              <a className="action" href="#acesso">
                Acompanhar a comunidade
              </a>
            </article>
          </div>
        </section>
        <section id="acesso" className="closing">
          <div className="wrap">
            <div className="kicker orange-kicker">CONVITE ABERTO</div>
            <h2>Defesa melhora quando o raciocínio circula.</h2>
            <p>
              Receba as próximas missões abertas e os encontros em que a rede vai se
              reunir.
            </p>
            <InterestForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
