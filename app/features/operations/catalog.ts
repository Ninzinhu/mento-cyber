export const operationSignals = [
  {
    id: "cve",
    title: "Vulnerabilidades críticas",
    detail: "CVEs com exploração ativa ou impacto em serviços expostos.",
    level: "alto",
  },
  {
    id: "ransomware",
    title: "Ransomware e extorsão",
    detail: "Campanhas, vazamentos e interrupções relevantes.",
    level: "alto",
  },
  {
    id: "identity",
    title: "Identidade e acesso",
    detail: "MFA, phishing, abuso de sessão e autenticação.",
    level: "médio",
  },
  {
    id: "cloud",
    title: "Cloud e SaaS",
    detail: "Mudanças de provedores, exposição e hardening.",
    level: "médio",
  },
];

export const practiceTracks = [
  {
    id: "soc",
    title: "SOC / Detecção",
    steps: ["Ler sinais", "Priorizar alerta", "Registrar evidência", "Revisar decisão"],
    tag: "SOC",
  },
  {
    id: "dfir",
    title: "DFIR",
    steps: [
      "Preservar contexto",
      "Construir linha do tempo",
      "Validar hipótese",
      "Comunicar impacto",
    ],
    tag: "DFIR",
  },
  {
    id: "hunter",
    title: "Threat Hunting",
    steps: [
      "Definir hipótese",
      "Escolher telemetria",
      "Buscar padrão",
      "Documentar resultado",
    ],
    tag: "Threat Hunting",
  },
  {
    id: "appsec",
    title: "AppSec",
    steps: [
      "Mapear superfície",
      "Ler achados",
      "Classificar risco",
      "Sugerir correção",
    ],
    tag: "AppSec",
  },
];

export const weeklyCases = [
  {
    id: "identity-shift",
    title: "Credenciais válidas, origem inesperada",
    summary:
      "Uma conta com MFA acessa um serviço em horário atípico. Separe mudança legítima de comprometimento.",
    signals: ["Novo ASN", "Token renovado", "Download administrativo"],
    xp: 160,
  },
  {
    id: "cloud-exposure",
    title: "Snapshot público em ambiente cloud",
    summary:
      "Um ativo aparentemente interno passa a responder em uma rota externa. Descubra a mudança e o possível impacto.",
    signals: ["Nova regra de rede", "Objeto enumerado", "Chave de serviço usada"],
    xp: 180,
  },
  {
    id: "endpoint-noise",
    title: "Execução legítima ou persistência?",
    summary:
      "Uma ferramenta comum aparece fora da janela de manutenção. Construa uma hipótese que possa ser refutada.",
    signals: ["Pai incomum", "Tarefa agendada", "Destino recorrente"],
    xp: 170,
  },
] as const;

export const weeklyCase =
  weeklyCases[Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % weeklyCases.length];
