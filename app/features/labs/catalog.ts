export type LabDifficulty = "Fundamentos" | "Intermediário" | "Avançado";
export type LabCategory = "Detecção" | "Web" | "Forense" | "OSINT" | "Redes" | "Cloud";
export type LabArtifact = { label: string; title: string; content: string };

export type Lab = {
  id: string;
  slug: string;
  title: string;
  category: LabCategory;
  difficulty: LabDifficulty;
  duration: string;
  summary: string;
  scenario: string;
  objective: string;
  deliverable: string;
  safety: string;
  prerequisites: string[];
  checklist: string[];
  artifacts: LabArtifact[];
  visual:
    | "signal"
    | "session"
    | "timeline"
    | "source"
    | "network"
    | "cloud"
    | "report"
    | "triage";
  evidencePrompt: string;
  status: "open" | "soon";
  xp?: number;
  requiredActions?: string[];
};

export const labs: Lab[] = [
  {
    id: "signal-triage",
    slug: "triagem-de-sinais",
    title: "Triagem de sinais",
    category: "Detecção",
    difficulty: "Fundamentos",
    duration: "35 min",
    summary: "Diferencie um evento ruidoso de um sinal que merece investigação.",
    scenario:
      "Você recebeu um recorte anonimizado de eventos de autenticação. O objetivo é organizar o que observar antes de concluir que existe um incidente.",
    objective:
      "Produzir uma hipótese, indicar os três sinais mais relevantes e listar a primeira pergunta de validação.",
    deliverable: "Resumo de triagem com hipótese, sinais e próxima pergunta.",
    safety:
      "Use somente o conjunto simulado deste lab. Não execute varreduras, consultas ou testes em serviços externos.",
    prerequisites: [],
    checklist: [
      "Leia o contexto do cenário",
      "Classifique os eventos",
      "Escreva uma hipótese verificável",
      "Registre a evidência",
    ],
    artifacts: [
      {
        label: "EVENTO 01",
        title: "Autenticação aprovada",
        content:
          "08:41 · conta: operador.demo · origem: estação-lab-03 · MFA: confirmado",
      },
      {
        label: "EVENTO 02",
        title: "Tentativas recusadas",
        content:
          "08:43–08:45 · 6 tentativas · mesmo usuário fictício · origem: estação-lab-03",
      },
      {
        label: "EVENTO 03",
        title: "Acesso de suporte",
        content:
          "08:47 · conta: suporte.demo · origem: console-interno · ticket: LAB-184",
      },
    ],
    visual: "signal",
    evidencePrompt:
      "Qual sinal você priorizou, por quê, e qual dado confirmaria ou refutaria a hipótese?",
    status: "open",
  },
  {
    id: "web-session-review",
    slug: "revisao-de-sessao-web",
    title: "Revisão de sessão web",
    category: "Web",
    difficulty: "Fundamentos",
    duration: "45 min",
    summary:
      "Leia cabeçalhos e fluxos de sessão de um serviço fictício sem testar sistemas reais.",
    scenario:
      "Uma aplicação de demonstração apresenta uma sequência de requisições e respostas sanitizadas. Há decisões de segurança a justificar.",
    objective:
      "Apontar controles presentes, lacunas observáveis e uma recomendação proporcional ao risco.",
    deliverable: "Nota de revisão com três observações e uma recomendação.",
    safety:
      "O material é estático e simulado. Não reproduza tentativas de acesso contra domínios, contas ou aplicações fora do lab.",
    prerequisites: ["signal-triage"],
    checklist: [
      "Identifique o fluxo de sessão",
      "Observe os controles",
      "Descreva a lacuna",
      "Proponha uma correção",
    ],
    artifacts: [
      {
        label: "RESPOSTA A",
        title: "Criação de sessão",
        content: "Set-Cookie: session=redacted; Secure; HttpOnly; SameSite=Lax",
      },
      {
        label: "RESPOSTA B",
        title: "Área autenticada",
        content: "Cache-Control: no-store · frame-ancestors 'none'",
      },
      {
        label: "NOTA",
        title: "Fluxo de troca",
        content:
          "A alteração de e-mail exige sessão recente; o cenário não confirma reautenticação.",
      },
    ],
    visual: "session",
    evidencePrompt:
      "Qual controle reduziu mais risco no cenário e qual recomendação você priorizaria?",
    status: "open",
  },
  {
    id: "timeline-reconstruction",
    slug: "reconstrucao-de-linha-do-tempo",
    title: "Reconstrução de linha do tempo",
    category: "Forense",
    difficulty: "Intermediário",
    duration: "55 min",
    summary: "Reconstrua uma sequência usando artefatos de um incidente fictício.",
    scenario:
      "Arquivos de log e notas de operação foram propositalmente embaralhados. O trabalho é separar fato, inferência e lacuna.",
    objective: "Montar uma linha do tempo com confiança explícita para cada ponto.",
    deliverable: "Linha do tempo curta, com evidências e lacunas declaradas.",
    safety:
      "Nenhum artefato contém dados reais. Não tente correlacionar pessoas, organizações ou endereços externos.",
    prerequisites: ["signal-triage"],
    checklist: [
      "Ordene os artefatos",
      "Marque o grau de confiança",
      "Separe fato de hipótese",
      "Liste a principal lacuna",
    ],
    artifacts: [
      {
        label: "LOG A",
        title: "Arquivo criado",
        content: "09:12 · relatório-demo.zip criado no diretório de trabalho fictício",
      },
      {
        label: "NOTA B",
        title: "Contato operacional",
        content:
          "09:19 · analista registra falha de sincronização no ambiente de teste",
      },
      {
        label: "LOG C",
        title: "Sessão encerrada",
        content: "09:24 · sessão de operador.demo encerrada por expiração",
      },
    ],
    visual: "timeline",
    evidencePrompt:
      "Qual é o ponto mais incerto da sua linha do tempo e que evidência reduziria essa incerteza?",
    status: "open",
  },
  {
    id: "source-validation",
    slug: "validacao-de-fontes",
    title: "Validação de fontes",
    category: "OSINT",
    difficulty: "Intermediário",
    duration: "40 min",
    summary: "Avalie confiabilidade, contexto e limites de fontes pré-selecionadas.",
    scenario:
      "O dossiê apresenta fontes arquivadas e totalmente fictícias. Sua tarefa é explicar por que uma afirmação deve ou não entrar em um relatório.",
    objective: "Construir uma matriz simples de confiabilidade e contexto.",
    deliverable: "Decisão de uso para cada fonte e justificativa curta.",
    safety:
      "Use apenas as fontes disponibilizadas no cenário. Não colete dados pessoais nem investigue indivíduos reais.",
    prerequisites: ["signal-triage"],
    checklist: [
      "Leia a origem",
      "Verifique contexto",
      "Classifique confiabilidade",
      "Justifique a decisão",
    ],
    artifacts: [
      {
        label: "FONTE A",
        title: "Boletim simulado",
        content:
          "Publicado há 14 meses · autor identificado · sem fontes primárias anexadas",
      },
      {
        label: "FONTE B",
        title: "Registro arquivado",
        content: "Documento fictício · data verificável · metodologia explicitada",
      },
      {
        label: "FONTE C",
        title: "Captura sem contexto",
        content: "Origem e data ausentes · afirmação ampla · sem cadeia de custódia",
      },
    ],
    visual: "source",
    evidencePrompt:
      "Qual fonte você descartaria primeiro e qual foi o critério decisivo?",
    status: "open",
  },
  {
    id: "network-segmentation",
    slug: "leitura-de-segmentacao",
    title: "Leitura de segmentação",
    category: "Redes",
    difficulty: "Intermediário",
    duration: "50 min",
    summary:
      "Analise um diagrama de rede fictício e identifique caminhos que merecem contenção.",
    scenario:
      "Um diagrama sanitizado mostra zonas de uma organização fictícia. Nenhuma máquina, endereço ou serviço é acessível: a prática é exclusivamente de raciocínio arquitetural.",
    objective:
      "Apontar dois limites de confiança e propor uma medida de redução de exposição.",
    deliverable: "Mapa textual de zonas, fluxo permitido e principal exceção.",
    safety:
      "O cenário não autoriza descoberta, varredura ou acesso a redes externas. Trabalhe somente com o diagrama fornecido.",
    prerequisites: ["signal-triage"],
    checklist: [
      "Separe as zonas",
      "Localize o fluxo crítico",
      "Declare a confiança",
      "Proponha a contenção",
    ],
    artifacts: [
      {
        label: "ZONA 01",
        title: "Público",
        content: "Gateway fictício → serviço de demonstração · acesso controlado",
      },
      {
        label: "ZONA 02",
        title: "Operação",
        content: "Estações de teste → coletor interno · acesso por função",
      },
      {
        label: "ZONA 03",
        title: "Dados",
        content: "Repositório simulado → somente leitura para o cenário",
      },
    ],
    visual: "network",
    evidencePrompt:
      "Qual fluxo você revisaria primeiro e qual controle reduziria melhor a exposição?",
    status: "open",
  },
  {
    id: "cloud-access-review",
    slug: "revisao-de-acesso-cloud",
    title: "Revisão de acesso cloud",
    category: "Cloud",
    difficulty: "Intermediário",
    duration: "50 min",
    summary:
      "Avalie permissões e contexto de acesso em uma conta demonstrativa fictícia.",
    scenario:
      "O inventário representa uma conta cloud inventada, com funções e recursos genéricos. O desafio é aplicar menor privilégio sem interromper a operação descrita.",
    objective:
      "Encontrar uma permissão excessiva e explicar a alternativa de menor privilégio.",
    deliverable: "Decisão de acesso com justificativa e impacto esperado.",
    safety:
      "Não use credenciais, consoles ou provedores reais. Este lab não contém chaves, contas ou endpoints acessáveis.",
    prerequisites: ["web-session-review"],
    checklist: [
      "Leia a função",
      "Compare a necessidade",
      "Marque o excesso",
      "Descreva a redução",
    ],
    artifacts: [
      {
        label: "FUNÇÃO",
        title: "Leitor de relatórios",
        content: "Finalidade declarada: consultar relatórios de operação fictícios",
      },
      {
        label: "PERMISSÃO",
        title: "Escopo observado",
        content:
          "Leitura de relatórios + alteração ampla de configurações de demonstração",
      },
      {
        label: "RESTRIÇÃO",
        title: "Operação necessária",
        content: "A atividade descrita não exige modificação de recursos",
      },
    ],
    visual: "cloud",
    evidencePrompt:
      "Que permissão você reduziria, para qual escopo e por que a operação continuaria funcionando?",
    status: "open",
  },
  {
    id: "evidence-report",
    slug: "relato-de-evidencia",
    title: "Relato de evidência",
    category: "Forense",
    difficulty: "Fundamentos",
    duration: "30 min",
    summary:
      "Converta observações técnicas em um relato útil e responsável para pares.",
    scenario:
      "Você recebeu notas curtas de um exercício simulado. A tarefa é separar contexto, fato observado, incerteza e recomendação sem exagerar conclusões.",
    objective:
      "Produzir um relato que outra pessoa consiga revisar sem depender de contexto oculto.",
    deliverable: "Registro com fato, interpretação, lacuna e próximo passo seguro.",
    safety:
      "Não inclua nomes, dados pessoais, credenciais ou informações de qualquer ambiente real em sua evidência.",
    prerequisites: [],
    checklist: [
      "Separe observação de interpretação",
      "Declare a incerteza",
      "Reduza detalhes sensíveis",
      "Escreva o próximo passo",
    ],
    artifacts: [
      {
        label: "NOTA 01",
        title: "Observação",
        content: "O alerta fictício ocorreu duas vezes no mesmo turno de teste",
      },
      {
        label: "NOTA 02",
        title: "Contexto",
        content:
          "A alteração planejada no ambiente de demonstração ocorreu no mesmo período",
      },
      {
        label: "NOTA 03",
        title: "Lacuna",
        content: "Não há confirmação sobre o comportamento esperado após a alteração",
      },
    ],
    visual: "report",
    evidencePrompt:
      "Escreva uma frase de fato, uma de incerteza e um próximo passo seguro para os pares.",
    status: "open",
  },
  {
    id: "alert-quality",
    slug: "qualidade-de-alerta",
    title: "Qualidade de alerta",
    category: "Detecção",
    difficulty: "Avançado",
    duration: "60 min",
    summary:
      "Revise um alerta simulado para reduzir ruído sem apagar sinais importantes.",
    scenario:
      "Uma regra fictícia gera alertas demais em horários previsíveis. O trabalho é definir quais campos ajudariam a aumentar a precisão e quais hipóteses não devem ser assumidas.",
    objective: "Propor uma melhoria de contexto e uma métrica de acompanhamento.",
    deliverable: "Proposta de ajuste com critério de sucesso e risco residual.",
    safety:
      "Não adapte esta prática para burlar monitoramento. O foco é qualidade defensiva em dados totalmente simulados.",
    prerequisites: ["signal-triage", "evidence-report"],
    checklist: [
      "Meça o ruído",
      "Identifique contexto útil",
      "Evite suposições",
      "Defina a métrica",
    ],
    artifacts: [
      {
        label: "MÉTRICA",
        title: "Volume",
        content:
          "42 alertas simulados em uma janela; 35 associados a manutenção planejada",
      },
      {
        label: "CAMPO",
        title: "Contexto ausente",
        content: "O evento não informa se a atividade ocorreu em janela aprovada",
      },
      {
        label: "RISCO",
        title: "Cobertura",
        content: "Uma redução excessiva pode ocultar atividade fora da janela prevista",
      },
    ],
    visual: "triage",
    evidencePrompt:
      "Que contexto você adicionaria, como mediria a melhora e qual risco residual permaneceria?",
    status: "open",
  },
];

export function getLab(slug: string) {
  return labs.find((lab) => lab.slug === slug);
}
export function getLabById(id: string) {
  return labs.find((lab) => lab.id === id);
}

export function labSimulation(lab: Lab) {
  return {
    xp:
      lab.xp ||
      (lab.difficulty === "Avançado"
        ? 220
        : lab.difficulty === "Intermediário"
          ? 160
          : 120),
    requiredActions: lab.requiredActions || [
      "desktop.boot",
      "files.open",
      "terminal.inspect",
      "splunk.search",
    ],
  };
}
