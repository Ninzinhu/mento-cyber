export type LabDifficulty = "Fundamentos" | "Intermediário" | "Avançado";
export type LabCategory = "Detecção" | "Web" | "Forense" | "OSINT" | "Redes" | "Cloud";
export type LabArtifact = { label: string; title: string; content: string };
export type LabChallenge = {
  prompt: string;
  placeholder: string;
  hint: string;
};

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
  {
    id: "proxy-shadow",
    slug: "sombra-no-proxy",
    title: "Sombra no proxy",
    category: "Detecção",
    difficulty: "Intermediário",
    duration: "45 min",
    summary: "Encontre uma transferência fora do padrão em telemetria web sintética.",
    scenario:
      "O time de SOC recebeu um recorte de logs de proxy de uma organização fictícia. Há tráfego legítimo de atualização misturado com uma transferência que merece validação.",
    objective:
      "Diferenciar atualização esperada de download incomum e registrar a primeira pergunta de escopo.",
    deliverable:
      "Nota de triagem com o comportamento priorizado e o dado de confirmação.",
    safety:
      "Analise somente os logs locais disponibilizados. Nenhum URL, domínio ou arquivo deste lab existe fora da simulação.",
    prerequisites: ["signal-triage"],
    checklist: [
      "Leia o recorte do proxy",
      "Compare volume e horário",
      "Priorize o desvio",
      "Registre a pergunta de escopo",
    ],
    artifacts: [
      {
        label: "PROXY 01",
        title: "Atualização esperada",
        content:
          "09:02 · workstation-11 · atualização aprovada · 18 MB · janela de manutenção",
      },
      {
        label: "PROXY 02",
        title: "Transferência fora do padrão",
        content:
          "09:07 · workstation-17 · download incomum · 242 MB · sem ticket associado",
      },
      {
        label: "PROXY 03",
        title: "Navegação operacional",
        content:
          "09:09 · workstation-17 · portal interno fictício · 36 KB · acesso habitual",
      },
    ],
    visual: "triage",
    evidencePrompt:
      "Que transferência você priorizaria, qual contexto falta e qual fonte local ajudaria a confirmar o escopo?",
    status: "open",
    xp: 170,
  },
  {
    id: "inbox-quarantine",
    slug: "caixa-de-entrada-em-quarentena",
    title: "Caixa de entrada em quarentena",
    category: "Detecção",
    difficulty: "Fundamentos",
    duration: "35 min",
    summary:
      "Faça triagem de uma mensagem suspeita usando cabeçalhos totalmente fictícios.",
    scenario:
      "Uma caixa de quarentena de demonstração contém um pedido de alteração cadastral. O conteúdo é inofensivo; a investigação é sobre sinais de autenticidade e contexto.",
    objective:
      "Decidir se a mensagem deve permanecer isolada e indicar a justificativa mais forte.",
    deliverable: "Decisão de quarentena com um sinal observado e uma ação segura.",
    safety:
      "Não responda, encaminhe, abra links ou pesquise remetentes reais. A mensagem é estática e criada para treinamento.",
    prerequisites: ["signal-triage"],
    checklist: [
      "Leia o cabeçalho simulado",
      "Compare remetente e domínio",
      "Identifique o sinal de risco",
      "Escolha uma ação segura",
    ],
    artifacts: [
      {
        label: "E-MAIL 01",
        title: "Remetente exibido",
        content: "Financeiro MentoLabs <financeiro@mentolabs.example>",
      },
      {
        label: "E-MAIL 02",
        title: "Return-Path",
        content:
          "<financeiro@mentolabs-support.example> · domínio semelhante ao exibido",
      },
      {
        label: "E-MAIL 03",
        title: "Contexto da solicitação",
        content:
          "Pedido fora do fluxo habitual e sem número de chamado de demonstração",
      },
    ],
    visual: "source",
    evidencePrompt:
      "Qual sinal sustenta manter a mensagem em quarentena e qual canal seguro você usaria para validar a solicitação?",
    status: "open",
    xp: 130,
  },
  {
    id: "endpoint-drift",
    slug: "desvio-no-endpoint",
    title: "Desvio no endpoint",
    category: "Forense",
    difficulty: "Intermediário",
    duration: "55 min",
    summary:
      "Reconstrua uma sequência de endpoint a partir de eventos sintéticos de operação.",
    scenario:
      "A telemetria de endpoint de um parque fictício registra uma sequência fora da janela de manutenção. O objetivo é decidir qual estação requer contenção antes de qualquer hipótese de causa.",
    objective:
      "Identificar o endpoint prioritário e separar o que é fato do que ainda precisa de coleta.",
    deliverable:
      "Recomendação de contenção com o endpoint, a evidência e a lacuna principal.",
    safety:
      "Não há binários, memória, hosts ou endpoints reais neste cenário. Trabalhe apenas com as evidências apresentadas.",
    prerequisites: ["timeline-reconstruction", "proxy-shadow"],
    checklist: [
      "Ordene os eventos",
      "Localize a estação prioritária",
      "Separe fato de hipótese",
      "Defina a contenção proporcional",
    ],
    artifacts: [
      {
        label: "ENDPOINT 01",
        title: "Execução fora de janela",
        content:
          "22:14 · workstation-17 · processo de manutenção simulado iniciado fora da janela aprovada",
      },
      {
        label: "ENDPOINT 02",
        title: "Alteração de contexto",
        content:
          "22:16 · workstation-17 · tarefa de teste criada sem ticket correlacionado",
      },
      {
        label: "ENDPOINT 03",
        title: "Telemetria complementar",
        content:
          "22:18 · workstation-08 · rotina aprovada concluída durante manutenção",
      },
    ],
    visual: "timeline",
    evidencePrompt:
      "Qual endpoint deve ser contido primeiro, qual evento sustenta a decisão e que evidência ainda falta?",
    status: "open",
    xp: 190,
  },
  {
    id: "service-key-review",
    slug: "revisao-de-chave-de-servico",
    title: "Revisão de chave de serviço",
    category: "Cloud",
    difficulty: "Avançado",
    duration: "60 min",
    summary:
      "Conduza a primeira resposta a uma credencial de demonstração exposta em log.",
    scenario:
      "Um coletor de logs fictício detectou uma credencial de serviço redigida em uma saída de automação. A prática foca em contenção, rotação e redução de exposição, não em uso de credenciais.",
    objective:
      "Definir a primeira medida de contenção e a sequência mínima de verificação para o proprietário do serviço.",
    deliverable:
      "Plano curto de resposta: contenção imediata, validação de uso e acompanhamento.",
    safety:
      "A chave é fictícia e inutilizável. Não use, crie, teste ou procure credenciais reais fora deste ambiente.",
    prerequisites: ["cloud-access-review", "evidence-report"],
    checklist: [
      "Classifique a exposição",
      "Escolha a contenção imediata",
      "Defina a validação de uso",
      "Registre o acompanhamento",
    ],
    artifacts: [
      {
        label: "AUDIT 01",
        title: "Detecção de segredo",
        content: "13:03 · pipeline-demo · padrão de chave redigido em saída de teste",
      },
      {
        label: "AUDIT 02",
        title: "Uso mais recente",
        content: "12:41 · service-reporting-demo · leitura de relatório permitida",
      },
      {
        label: "AUDIT 03",
        title: "Escopo declarado",
        content: "A identidade de serviço só precisa consultar relatórios sintéticos",
      },
    ],
    visual: "cloud",
    evidencePrompt:
      "Que medida vem primeiro, como validar impacto e qual mudança reduz a exposição futura?",
    status: "open",
    xp: 240,
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
      "challenge.solve",
    ],
  };
}

const challenges: Record<string, LabChallenge> = {
  "signal-triage": {
    prompt: "Qual estação concentra as tentativas recusadas que merecem triagem?",
    placeholder: "Informe o identificador da estação",
    hint: "Compare a origem dos eventos de autenticação.",
  },
  "web-session-review": {
    prompt: "Que controle precisa ser confirmado antes de permitir a troca de e-mail?",
    placeholder: "Descreva o controle de sessão",
    hint: "Leia a nota sobre o fluxo de troca.",
  },
  "timeline-reconstruction": {
    prompt: "Qual ocorrência registrada explica a principal lacuna na linha do tempo?",
    placeholder: "Descreva o evento incerto",
    hint: "Busque a observação que não tem confirmação posterior.",
  },
  "source-validation": {
    prompt: "Qual fonte deve ficar fora do relatório por não ter origem nem data?",
    placeholder: "Informe a fonte",
    hint: "Procure a captura sem contexto.",
  },
  "network-segmentation": {
    prompt: "Qual zona deve ter o fluxo revisado primeiro para reduzir exposição?",
    placeholder: "Informe a zona",
    hint: "Observe onde estão as estações e o coletor interno.",
  },
  "cloud-access-review": {
    prompt: "Qual princípio deve guiar a redução da permissão ampla?",
    placeholder: "Informe o princípio de acesso",
    hint: "A atividade declarada é apenas de consulta.",
  },
  "evidence-report": {
    prompt:
      "Qual elemento obrigatório impede que uma observação vire conclusão exagerada?",
    placeholder: "Informe o elemento do relato",
    hint: "O relato deve declarar o que ainda não é conhecido.",
  },
  "alert-quality": {
    prompt:
      "Qual contexto de mudança deve ser correlacionado antes de reduzir o alerta?",
    placeholder: "Informe o contexto necessário",
    hint: "Os alertas recorrentes coincidem com uma atividade planejada.",
  },
  "proxy-shadow": {
    prompt: "Qual comportamento no proxy deve ser priorizado para investigação?",
    placeholder: "Descreva o comportamento observado",
    hint: "Compare o volume e o tipo de transferência com o padrão do caso.",
  },
  "inbox-quarantine": {
    prompt: "Qual sinal no remetente justifica manter a mensagem em quarentena?",
    placeholder: "Descreva o sinal do remetente",
    hint: "Compare o domínio exibido com o domínio informado no cabeçalho.",
  },
  "endpoint-drift": {
    prompt:
      "Qual endpoint concentra o encadeamento de eventos que precisa de contenção?",
    placeholder: "Informe o nome do endpoint",
    hint: "A sequência começa com uma execução fora do horário de manutenção.",
  },
  "service-key-review": {
    prompt: "Qual é a primeira medida para uma chave de serviço exposta em log?",
    placeholder: "Descreva a medida imediata",
    hint: "Reduzir privilégio não resolve uma credencial já exposta.",
  },
};

export function labChallenge(lab: Lab): LabChallenge {
  return (
    challenges[lab.id] || {
      prompt: "Qual evidência você priorizaria neste cenário?",
      placeholder: "Registre sua conclusão",
      hint: "Use apenas os artefatos fornecidos.",
    }
  );
}
