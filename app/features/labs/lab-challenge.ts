import "server-only";

const answerRules: Record<string, string[]> = {
  "signal-triage": ["estacao-lab-03", "estação-lab-03"],
  "web-session-review": ["reautenticacao", "reautenticação"],
  "timeline-reconstruction": ["sincronizacao", "sincronização"],
  "source-validation": ["fonte c"],
  "network-segmentation": ["operacao", "operação"],
  "cloud-access-review": ["menor privilegio", "menor privilégio"],
  "evidence-report": ["incerteza"],
  "alert-quality": ["janela aprovada"],
  "proxy-shadow": ["download incomum"],
  "inbox-quarantine": ["dominio semelhante", "domínio semelhante"],
  "endpoint-drift": ["workstation-17"],
  "service-key-review": ["revogar o token", "revogar token"],
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();
}

export function validatesLabChallenge(labId: string, answer: string) {
  const normalizedAnswer = normalize(answer);
  const matches = answerRules[labId] || [];
  return matches.some((match) => normalizedAnswer.includes(normalize(match)));
}
