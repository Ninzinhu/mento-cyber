# Conteúdo e Comunidade

## Objetos de negócio

- **Artigo**: conteúdo editorial perene, criado pela equipe ou por autor aprovado.
- **Discussão**: conversa técnica criada por um membro autenticado.
- **Notícia**: item importado como metadado de uma fonte externa; o MentoCyber
  guarda título, excerto curto, tags e URL original — não republica a matéria.
- **Newsletter**: inscrição com status de confirmação antes de qualquer envio.

## Publicação e proteção

Todas as escritas passam pela rota server-side `/api/community`; o navegador não
possui permissão de gravar coleções do conteúdo diretamente. Discussões têm
limite de tamanho, bloqueio temporário de cinco minutos entre novas publicações
e não aceitam links enquanto não houver fluxo de moderação.

## Notícias automatizadas

### Sincronização manual

Com o Next.js e os emuladores ativos, execute `npm run news:sync`. O comando
chama a sincronização local em `http://localhost:3000/api/cron/news`. Para disparar a
instância publicada pelo PowerShell, informe a URL e o segredo antes de chamar
o script: `$env:NEWS_CRON_URL="https://seu-dominio/api/cron/news"; $env:CRON_SECRET="seu-segredo"; npm run news:sync`.

`/api/cron/news` agrega feeds RSS/Atom públicos, sanitiza HTML, limita o tamanho
do excerto e deduplica cada item pelo hash da URL de origem. As fontes iniciais
são CISA, Google Online Security, BleepingComputer, Krebs on Security e The
Hacker News. O catálogo também inclui fontes brasileiras e internacionais de
segurança, ataques, vazamentos, malware, golpes e tecnologia. Fontes gerais de
tecnologia passam por filtro de assunto antes da publicação.

Cada item é deduplicado pela URL canônica e pelo título normalizado. O sistema
armazena apenas os metadados e direciona o leitor à publicação original.
Quando o RSS não fornece mídia, o coletor consulta metadados Open Graph somente
em domínios de fontes previamente aprovadas; falhas de imagem recebem um visual
de fallback no card.

## Tradução no site

Na página de uma notícia, membros autenticados podem traduzir o título e o
resumo para o idioma do navegador. A integração é server-side e usa
`GOOGLE_TRANSLATE_API_KEY` ou uma instância configurada em `LIBRETRANSLATE_URL`;
essas credenciais nunca são enviadas ao navegador. A matéria completa continua
na fonte original.

No Vercel Hobby, a agenda configurada roda diariamente às 12:00 UTC. Planos Pro
podem alterar `vercel.json` para atualizações mais frequentes. Configure
`CRON_SECRET` com uma string aleatória de ao menos 16 caracteres no ambiente de
produção; a Vercel envia esse segredo no cabeçalho `Authorization` da cron.

## Newsletter

As inscrições entram em `newsletterSubscribers` com o status
`pending-confirmation`. Antes de habilitar o envio, conecte um provedor como
Resend ou Brevo, verifique o domínio remetente e implemente double opt-in e
cancelamento. Nunca use um e-mail inscrito para outros fins.
