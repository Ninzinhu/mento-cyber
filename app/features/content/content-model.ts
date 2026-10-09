export const contentKinds = ["article", "radar", "discussion"] as const;
export type ContentKind = (typeof contentKinds)[number];

export const contentTags = [
  "SOC",
  "DFIR",
  "Threat Hunting",
  "Detecção",
  "SIEM",
  "Splunk",
  "Blue Team",
  "Cloud Security",
  "AppSec",
  "Pentest",
  "OSINT",
  "GRC",
  "Carreira",
  "Ferramentas",
  "Pesquisa",
  "Incidentes",
  "Vulnerabilidades",
  "Privacidade",
  "Malware",
  "Golpes",
  "Vazamentos",
  "Ataques",
  "Segurança",
  "Tecnologia",
] as const;

export type ContentPost = {
  id: string;
  kind: ContentKind;
  title: string;
  slug: string;
  excerpt: string;
  body?: string;
  tags: string[];
  authorName: string;
  authorId?: string;
  sourceName?: string;
  sourceUrl?: string;
  region?: "Brasil" | "Global";
  imageUrl?: string;
  translations?: Record<string, { title: string; excerpt: string }>;
  publishedAt: string;
  readingMinutes?: number;
  reactionCount?: number;
  commentCount?: number;
  featured?: boolean;
};

export const starterPosts: ContentPost[] = [
  {
    id: "welcome-to-signal",
    kind: "article",
    title: "Como transformar alertas em investigação útil",
    slug: "transformar-alertas-em-investigacao",
    excerpt:
      "Um método simples para separar contexto, evidência, hipótese e próximo passo em uma operação defensiva.",
    body: "Alertas não são conclusões. Comece registrando o que foi observado, o contexto operacional, a hipótese mais simples e a evidência que a confirmaria ou refutaria. Esse registro permite que outro membro continue a análise sem depender de contexto oculto.",
    tags: ["SOC", "Detecção", "Blue Team"],
    authorName: "Equipe MentoCyber",
    publishedAt: "2026-10-09T10:00:00.000Z",
    readingMinutes: 4,
    featured: true,
  },
  {
    id: "discussion-first-playbook",
    kind: "discussion",
    title: "Qual dado vocês conferem primeiro ao receber um alerta de autenticação?",
    slug: "primeiro-dado-alerta-autenticacao",
    excerpt:
      "Compartilhe seu critério de priorização: origem, horário, identidade, MFA, histórico ou contexto de mudança.",
    tags: ["SOC", "Detecção"],
    authorName: "Comunidade",
    publishedAt: "2026-10-08T18:30:00.000Z",
    commentCount: 0,
  },
];

export function contentLabel(kind: ContentKind) {
  return kind === "article" ? "Artigo" : kind === "radar" ? "Notícia" : "Discussão";
}

export function formatContentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Agora";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}
