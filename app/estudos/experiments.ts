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
    eyebrow: "Dossiê de aprendizagem",
    headline: "Todo incidente começa com uma pergunta bem feita.",
    description:
      "Uma experiência organizada como um caso: hipótese, evidência e uma decisão que você consegue explicar.",
    cta: "Abrir dossiê",
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
      "Uma interface de observação: pouca distração, bastante contraste e uma trilha para aprender a notar.",
    cta: "Lançar sonda",
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
      "Uma proposta estrutural para apresentar trilhas, evidências e acompanhamento sem recorrer ao dashboard genérico.",
    cta: "Ver a matriz",
    type: "utility",
    notes: ["CONTEXTO", "AÇÃO", "REGISTRO"],
  },
  {
    slug: "vertice",
    number: "04",
    name: "Vértice",
    eyebrow: "Mapeamento de repertório",
    headline: "Carreira é um conjunto de conexões que você aprende a enxergar.",
    description:
      "Uma direção espacial e cartográfica, feita para explicar caminhos de estudo sem prometer uma rota única.",
    cta: "Mapear rotas",
    type: "catalog",
    notes: ["BASE", "DESVIO", "PRÓXIMO NÓ"],
  },
  {
    slug: "ritual",
    number: "05",
    name: "Ritual",
    eyebrow: "Estudo sem urgência falsa",
    headline: "Melhorar também é voltar ao que parecia simples.",
    description:
      "Uma landing serena para estudo recorrente: menos gamificação, mais atenção, repetição e memória.",
    cta: "Começar o ritual",
    type: "editorial",
    notes: ["PREPARAR", "PRATICAR", "REVISAR"],
  },
  {
    slug: "indice",
    number: "06",
    name: "Índice",
    eyebrow: "Biblioteca de campo",
    headline: "Repertório só serve quando você consegue encontrá-lo de novo.",
    description:
      "Uma interface de consulta com linguagem de arquivo, referências cruzadas e categorias legíveis.",
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
      "Uma página assertiva, assimétrica e verbal: para posicionar uma comunidade de quem pensa antes de apertar o botão.",
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
    eyebrow: "Ritual noturno",
    headline: "A noite também tem método.",
    description:
      "Uma proposta de navegação concentrada para turnos de estudo, revisão e autonomia.",
    cta: "Começar turno",
    type: "poster",
    notes: ["22:00", "FOCO", "SAÍDA"],
  },
  {
    slug: "convergencia",
    number: "10",
    name: "Convergência",
    eyebrow: "Aprendizagem entre pares",
    headline: "Quando o raciocínio circula, a defesa melhora.",
    description:
      "Uma direção para mentoria e comunidade que prioriza troca de evidências, revisão humana e memória coletiva.",
    cta: "Encontrar a turma",
    type: "manifest",
    notes: ["PARES", "REVISÃO", "MEMÓRIA"],
  },
];

export function getExperiment(slug: string) {
  return experiments.find((experiment) => experiment.slug === slug);
}
