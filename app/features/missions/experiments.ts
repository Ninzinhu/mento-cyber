export type Experiment = {
  slug: string;
  number: string;
  name: string;
  eyebrow: string;
  headline: string;
  description: string;
  cta: string;
  type: "editorial" | "poster" | "utility" | "catalog" | "manifest";
  notes: [string, string, string];
};

export const experiments: Experiment[] = [
  {
    slug: "caso",
    number: "01",
    name: "Caso",
    eyebrow: "Dossiê para conversa",
    headline: "Todo incidente começa com uma pergunta bem feita.",
    description:
      "Uma prática organizada como um caso: hipótese, evidência e uma decisão que a rede consegue revisar.",
    cta: "Abrir prática",
    type: "editorial",
    notes: ["HIPÓTESE", "EVIDÊNCIA", "DECISÃO"],
  },
  {
    slug: "sonda",
    number: "02",
    name: "Sonda",
    eyebrow: "Leitura de sinais fracos",
    headline: "Antes do alerta, existe um padrão.",
    description:
      "Uma prática de observação: pouca distração, bastante contraste e espaço para comparar o que cada pessoa notou.",
    cta: "Observar sinais",
    type: "poster",
    notes: ["COLETAR", "COMPARAR", "APONTAR"],
  },
  {
    slug: "matriz",
    number: "03",
    name: "Matriz",
    eyebrow: "Método em três planos",
    headline: "Prática não é clicar. É conseguir sustentar a escolha.",
    description:
      "Uma proposta estrutural para organizar contextos, evidências e conversa sem recorrer ao dashboard genérico.",
    cta: "Ver a matriz",
    type: "utility",
    notes: ["CONTEXTO", "AÇÃO", "REGISTRO"],
  },
  {
    slug: "vertice",
    number: "04",
    name: "Vértice",
    eyebrow: "Mapa de repertório",
    headline: "Carreira é um conjunto de conexões que você aprende a enxergar.",
    description:
      "Uma direção espacial e cartográfica para visualizar conexões sem prometer uma rota única.",
    cta: "Mapear conexões",
    type: "catalog",
    notes: ["BASE", "DESVIO", "PRÓXIMO NÓ"],
  },
  {
    slug: "ritual",
    number: "05",
    name: "Ritual",
    eyebrow: "Prática sem urgência falsa",
    headline: "Melhorar também é voltar ao que parecia simples.",
    description:
      "Uma prática recorrente: menos gamificação, mais atenção, repetição e memória compartilhada.",
    cta: "Começar o ritual",
    type: "editorial",
    notes: ["PREPARAR", "PRATICAR", "REVISAR"],
  },
  {
    slug: "indice",
    number: "06",
    name: "Índice",
    eyebrow: "Arquivo de campo",
    headline: "Repertório só serve quando você consegue encontrá-lo de novo.",
    description:
      "Um espaço de consulta com referências cruzadas, categorias legíveis e anotações que a rede preserva.",
    cta: "Consultar índice",
    type: "catalog",
    notes: ["FONTE", "ANOTAÇÃO", "USO"],
  },
  {
    slug: "contrapeso",
    number: "07",
    name: "Contrapeso",
    eyebrow: "Manifesto de defesa",
    headline: "Velocidade sem contexto é só barulho.",
    description:
      "Uma conversa assertiva sobre atrito, critério e cuidado antes de apertar o botão.",
    cta: "Ler o manifesto",
    type: "manifest",
    notes: ["ATRITO", "CRITÉRIO", "CUIDADO"],
  },
  {
    slug: "rastro",
    number: "08",
    name: "Rastro",
    eyebrow: "Linha de investigação",
    headline: "Uma evidência só ganha valor quando encontra contexto.",
    description:
      "Uma composição de rastros e conexões para tornar visível a sequência entre descoberta, análise e relato.",
    cta: "Seguir o rastro",
    type: "utility",
    notes: ["ORIGEM", "CORRELAÇÃO", "RELATO"],
  },
  {
    slug: "turno",
    number: "09",
    name: "Turno",
    eyebrow: "Roda noturna",
    headline: "A noite também tem método.",
    description:
      "Uma proposta de navegação concentrada para encontros de revisão, observação e autonomia.",
    cta: "Entrar na roda",
    type: "poster",
    notes: ["22:00", "FOCO", "SAÍDA"],
  },
  {
    slug: "convergencia",
    number: "10",
    name: "Convergência",
    eyebrow: "Revisão entre pares",
    headline: "Quando o raciocínio circula, a defesa melhora.",
    description:
      "Uma frente para pessoas que priorizam troca de evidências, revisão humana e memória coletiva.",
    cta: "Encontrar a rede",
    type: "manifest",
    notes: ["PARES", "REVISÃO", "MEMÓRIA"],
  },
];

export function getExperiment(slug: string) {
  return experiments.find((experiment) => experiment.slug === slug);
}
