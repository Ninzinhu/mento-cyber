import Link from "next/link";
import { experiments } from "../features/missions/experiments";

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
  convergencia: "COMUNIDADE / PARES",
};

const trackIdentities: Record<string, { code: string; role: string; level: string }> = {
  caso: { code: "DF-01", role: "LEITURA COMPARTILHADA", level: "ABERTA" },
  sonda: { code: "BT-02", role: "OBSERVAÇÃO DE SINAIS", level: "EM GRUPO" },
  matriz: { code: "OP-03", role: "DECISÃO COM CONTEXTO", level: "ABERTA" },
  vertice: { code: "CR-04", role: "TROCA DE REPERTÓRIO", level: "ABERTA" },
  ritual: { code: "FN-05", role: "PRÁTICA RECORRENTE", level: "EM GRUPO" },
  indice: { code: "PS-06", role: "PESQUISA COLETIVA", level: "EM GRUPO" },
  contrapeso: { code: "GR-07", role: "CRITÉRIO E RISCO", level: "EM GRUPO" },
  rastro: { code: "IR-08", role: "INVESTIGAÇÃO ABERTA", level: "EM GRUPO" },
  turno: { code: "SC-09", role: "RODA DE TRIAGEM", level: "AVANÇADA" },
  convergencia: { code: "MT-10", role: "REVISÃO ENTRE PARES", level: "TODOS" },
};

export default function StudiesIndex() {
  return (
    <main className="academy-index" id="conteudo">
      <a className="skip-link" href="#trilhas">
        Pular para as trilhas
      </a>
      <header className="academy-header">
        <Link href="/" className="academy-brand">
          MENTO<span>CYBER</span>
        </Link>
        <nav aria-label="Navegação da comunidade">
          <a href="#trilhas">Missões</a>
          <a href="#como-funciona">Como participar</a>
          <a href="#acesso">Entrar na rede</a>
        </nav>
      </header>
      <section className="academy-hero">
        <div>
          <p className="academy-eyebrow">MAPA DA COMUNIDADE</p>
          <h1>Encontre onde sua leitura pode contribuir.</h1>
          <p>
            Dez frentes de prática para observar cenários, construir hipóteses e trocar
            evidências com a rede.
          </p>
          <a className="academy-primary" href="#trilhas">
            Ver missões <span>↓</span>
          </a>
        </div>
        <aside>
          <div className="academy-status">
            <span>PRÁTICAS ABERTAS</span>
            <strong>02</strong>
            <p>Missões que você já pode levar para conversa.</p>
          </div>
          <div className="academy-signal">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <small>OBSERVE. PRATIQUE. COMPARTILHE.</small>
        </aside>
      </section>
      <section className="academy-metrics" aria-label="Visão geral">
        <div>
          <b>10</b>
          <span>frentes para explorar</span>
        </div>
        <div>
          <b>3</b>
          <span>formatos de encontro</span>
        </div>
        <div>
          <b>1</b>
          <span>revisão entre pares</span>
        </div>
      </section>
      <section className="academy-catalog" id="trilhas">
        <div className="catalog-heading">
          <div>
            <p className="academy-eyebrow">MAPA DE MISSÕES</p>
            <h2>Escolha um tema para investigar junto.</h2>
          </div>
          <p>
            Não há uma rota única. Cada missão indica um contexto, uma prática e uma
            forma de compartilhar o que você observou.
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
                  <dt>DINÂMICA</dt>
                  <dd>Contexto + prática</dd>
                </div>
                <div>
                  <dt>ÁREA</dt>
                  <dd>{trackLabels[experiment.slug].split(" / ")[0]}</dd>
                </div>
              </dl>
              <Link href={`/estudos/${experiment.slug}`}>
                Ver prática <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="academy-method" id="como-funciona">
        <p className="academy-eyebrow">COMO PARTICIPAR</p>
        <div>
          <h2>Traga sua leitura. Leve novas perguntas.</h2>
          <ol>
            <li>
              <span>01</span>
              <strong>Chegue com contexto</strong>
              <p>Comece pelo cenário, pelos limites e pela pergunta em aberto.</p>
            </li>
            <li>
              <span>02</span>
              <strong>Pratique</strong>
              <p>Use as pistas para formular uma hipótese responsável.</p>
            </li>
            <li>
              <span>03</span>
              <strong>Compartilhe</strong>
              <p>Registre evidências e leve sua decisão para revisão entre pares.</p>
            </li>
          </ol>
        </div>
      </section>
      <footer className="academy-footer" id="acesso">
        <span className="academy-brand">
          MENTO<span>CYBER</span>
        </span>
        <p>
          Encontre uma missão, traga uma hipótese e ajude a construir a memória da rede.
        </p>
        <a href="mailto:contato@mentocyber.com">Quero acompanhar a comunidade →</a>
      </footer>
    </main>
  );
}
