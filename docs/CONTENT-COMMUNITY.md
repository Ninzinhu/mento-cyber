# Conteúdo e Comunidade

## Objetos de negócio

- **Artigo**: conteúdo editorial perene, criado pela equipe ou por autor aprovado.
- **Discussão**: conversa técnica criada por um membro autenticado.
- **Radar**: notícia importada como metadado de uma fonte externa; o MentoCyber
  guarda título, excerto curto, tags e URL original — não republica a matéria.
- **Newsletter**: inscrição com status de confirmação antes de qualquer envio.

## Publicação e proteção

Todas as escritas passam pela rota server-side `/api/community`; o navegador não
possui permissão de gravar coleções do conteúdo diretamente. Discussões têm
limite de tamanho, bloqueio temporário de cinco minutos entre novas publicações
e não aceitam links enquanto não houver fluxo de moderação.

## Radar automatizado

`/api/cron/news` agrega feeds RSS/Atom públicos, sanitiza HTML, limita o tamanho
do excerto e deduplica cada item pelo hash da URL de origem. As fontes iniciais
são CISA, Google Online Security, BleepingComputer, Krebs on Security e The
Hacker News.

No Vercel Hobby, a agenda configurada roda diariamente às 12:00 UTC. Planos Pro
podem alterar `vercel.json` para atualizações mais frequentes. Configure
`CRON_SECRET` com uma string aleatória de ao menos 16 caracteres no ambiente de
produção; a Vercel envia esse segredo no cabeçalho `Authorization` da cron.

## Newsletter

As inscrições entram em `newsletterSubscribers` com o status
`pending-confirmation`. Antes de habilitar o envio, conecte um provedor como
Resend ou Brevo, verifique o domínio remetente e implemente double opt-in e
cancelamento. Nunca use um e-mail inscrito para outros fins.
