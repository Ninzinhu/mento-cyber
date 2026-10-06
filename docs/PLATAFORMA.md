# MentoCyber — estrutura da comunidade

## Proposta

MentoCyber é uma comunidade de prática em cibersegurança. Ela reúne pessoas que querem
observar cenários, compartilhar hipóteses, revisar evidências e construir memória coletiva
para defesa digital responsável. O produto não vende cursos nem posiciona participantes como
alunos; materiais e missões existem para tornar a troca mais qualificada.

## Pilares de produto

| Camada | Objetivo | Primeira versão |
| --- | --- | --- |
| Base aberta | Dar contexto para qualquer pessoa chegar à conversa | Referências, glossário, checklists e casos anotados |
| Missões | Criar um foco compartilhado de prática | Cenários, pistas, perguntas e registros curtos |
| Rede | Manter a troca humana recorrente | Encontros, revisão entre pares e memória de decisões |
| Sustentação | Financiar a operação sem virar vitrine de curso | Apoio voluntário, patrocínio ético e ofertas para organizações |

## Objetos essenciais

- Pessoa, perfil, interesses e consentimentos
- Frente de prática, missão, pista e contexto
- Hipótese, evidência, comentário e revisão entre pares
- Encontro, inscrição, pauta e memória coletiva
- Recurso aberto, anotação e versão
- Organização apoiadora, contribuição e transparência financeira

## Stack para a primeira versão

- **Web:** Next.js, TypeScript, Motion, Lenis e uma camada WebGL opcional com React Three Fiber.
- **Dados:** Cloud Firestore como banco único do MVP, com regras e índices versionados.
- **Identidade:** Firebase Authentication com e-mail/senha e perfis simples; login social pode entrar depois.
- **Discussões:** inicialmente links para Discord/Matrix; depois tópicos e revisões no próprio produto.
- **Arquivos:** Cloudflare R2 para referências públicas e anexos moderados.
- **Observabilidade:** Sentry, PostHog e logs estruturados.
- **E-mail:** Resend para avisos de encontros, missões e retorno de revisão.

## Sustentação financeira

Se houver cobrança, ela deve financiar encontros, infraestrutura e moderação — não bloquear
o conhecimento básico nem simular uma matrícula. Para o Brasil, Mercado Pago pode receber
Pix e cartão; Stripe permanece uma opção para apoio internacional. Qualquer integração usa
webhooks assinados e deixa claros benefício, valor e destino da contribuição.

## Próximas entregas

1. Definir o manifesto de participação e o código de conduta.
2. Publicar a base aberta e a primeira missão com um espaço de comentários moderado.
3. Conectar Firebase Auth, perfis e interesse por frentes de prática.
4. Criar calendário de encontros e registro público de decisões.
5. Medir participação, retorno de revisão e saúde da moderação antes de expandir recursos.
