import Link from "next/link";
import { experiments } from "./experiments";

const trackLabels: Record<string, string> = {
  caso: "DEFESA / FUNDAMENTOS",
  sonda: "BLUE TEAM / TELEMETRIA",
  matriz: "OPERAÇÃO / MÉTODO",
  vertice: "CARREIRA / ROTA",
  ritual: "FUNDAMENTOS / REVISÃO",
  indice: "PESQUISA / FONTES",
  contrapeso: "GRC / DECISÃO",
  rastro: "IR / INVESTIGAÇÃO",
  turno: "SOC / TRIAGEM",
  convergencia: "MENTORIA / PARES",
};

const trackIdentities: Record<string, { code: string; role: string; level: string }> = {
  caso: { code: "DF-01", role: "ANALISTA DE DEFESA", level: "INÍCIO" },
  sonda: { code: "BT-02", role: "CAÇA A SINAIS", level: "INTERMEDIÁRIO" },
  matriz: { code: "OP-03", role: "OPERADOR DE CONTEXTO", level: "INÍCIO" },
  vertice: { code: "CR-04", role: "NAVEGADOR DE CARREIRA", level: "INÍCIO" },
  ritual: { code: "FN-05", role: "PRÁTICA DE BASE", level: "INÍCIO" },
  indice: { code: "PS-06", role: "PESQUISA APLICADA", level: "INTERMEDIÁRIO" },
  contrapeso: { code: "GR-07", role: "DECISÃO E RISCO", level: "INTERMEDIÁRIO" },
  rastro: { code: "IR-08", role: "INVESTIGAÇÃO", level: "INTERMEDIÁRIO" },
  turno: { code: "SC-09", role: "OPERAÇÃO SOC", level: "AVANÇADO" },
  convergencia: { code: "MT-10", role: "REVISÃO ENTRE PARES", level: "TODOS" },
};

export default function StudiesIndex() {
  return (
    <main className="academy-index">
      <header className="academy-header">
        <Link href="/" className="academy-brand">
          MENTO<span>CYBER</span>
        </Link>
        <nav aria-label="Navegação da academia">
          <a href="#trilhas">Trilhas</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#acesso">Acessar</a>
        </nav>
      </header>
      <section className="academy-hero">
        <div>
          <p className="academy-eyebrow">ACADEMIA / DEFESA DIGITAL APLICADA</p>
          <h1>
            Escolha uma trilha.
            <br />
            Construa <em>evidência.</em>
          </h1>
          <p>
            Formação para quem quer entender sistemas, investigar cenários e justificar
            decisões técnicas — com base, laboratório e revisão humana.
          </p>
          <a className="academy-primary" href="#trilhas">
            Explorar trilhas <span>↓</span>
          </a>
        </div>
        <aside>
          <div className="academy-status">
            <span>AGORA EM CAMPO</span>
            <strong>02</strong>
            <p>Labs guiados prontos para praticar.</p>
          </div>
          <div className="academy-signal">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <small>UMA ESCOLA DE PRÁTICA, NÃO UMA COLEÇÃO DE VÍDEOS.</small>
        </aside>
      </section>
      <section className="academy-metrics" aria-label="Visão geral">
        <div>
          <b>10</b>
          <span>rotas para testar</span>
        </div>
        <div>
          <b>3</b>
          <span>formatos de prática</span>
        </div>
        <div>
          <b>1</b>
          <span>entrega por missão</span>
        </div>
      </section>
      <section className="academy-catalog" id="trilhas">
        <div className="catalog-heading">
          <div>
            <p className="academy-eyebrow">CATÁLOGO DE ROTAS</p>
            <h2>Encontre o ponto de partida.</h2>
          </div>
          <p>
            Não há uma rota única. Cada trilha indica o contexto, o tipo de prática e a
            entrega que comprova seu aprendizado.
          </p>
        </div>
        <div className="track-grid">
          {experiments.map((experiment) => (
            <article className="track-card" key={experiment.slug}>
              <div className="track-card-top">
                <span className="track-code">
                  {trackIdentities[experiment.slug].code}
                </span>
                <b>{trackIdentities[experiment.slug].level}</b>
              </div>
              <div className="track-signature" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <p className="track-role">{trackIdentities[experiment.slug].role}</p>
              <h3>{experiment.name}</h3>
              <p>{experiment.description}</p>
              <dl>
                <div>
                  <dt>FORMATO</dt>
                  <dd>4 módulos + 1 lab</dd>
                </div>
                <div>
                  <dt>ÁREA</dt>
                  <dd>{trackLabels[experiment.slug].split(" / ")[0]}</dd>
                </div>
              </dl>
              <Link href={`/estudos/${experiment.slug}`}>
                Abrir missão <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="academy-method" id="como-funciona">
        <p className="academy-eyebrow">COMO FUNCIONA</p>
        <div>
          <h2>Aprenda como o trabalho acontece.</h2>
          <ol>
            <li>
              <span>01</span>
              <strong>Contexto</strong>
              <p>Você começa pelo cenário e pelos limites.</p>
            </li>
            <li>
              <span>02</span>
              <strong>Investigação</strong>
              <p>O lab apresenta pistas e checkpoints.</p>
            </li>
            <li>
              <span>03</span>
              <strong>Entrega</strong>
              <p>Você registra evidências e decisão.</p>
            </li>
          </ol>
        </div>
      </section>
      <footer className="academy-footer" id="acesso">
        <span className="academy-brand">
          MENTO<span>CYBER</span>
        </span>
        <p>
          Escolha uma rota, faça o primeiro lab e veja se esse tipo de trabalho é para
          você.
        </p>
        <a href="mailto:contato@mentocyber.com">Quero receber os próximos labs →</a>
      </footer>
    </main>
  );
}
