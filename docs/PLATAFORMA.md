# MentoCyber — estrutura da plataforma

## Proposta

MentoCyber é uma plataforma de formação prática em cibersegurança para pessoas que querem sair do estudo passivo e demonstrar habilidade em cenários reais. A experiência combina conteúdos gratuitos para aquisição, trilhas premium para progressão e prática guiada em laboratórios e simulações.

## Pilares de produto

| Camada | Objetivo | Conteúdo inicial |
| --- | --- | --- |
| Descoberta gratuita | Mostrar valor e captar o lead | Guia de carreira, fundamentos Linux, quiz de perfil e roadmap de entrada |
| Academia premium | Conduzir uma jornada mensurável | Trilhas Blue Team, Red Team, Cloud e GRC, mentorias e certificados |
| Prática | Transformar teoria em evidência | Labs guiados, CTFs, investigação de incidentes e relatórios |
| Comunidade | Aumentar retenção | Comunidade, eventos ao vivo, desafios e feedback de mentores |

## Stack recomendada para a versão de produção

- **Web:** Next.js + TypeScript + Tailwind CSS + shadcn/ui.
- **Backend:** Next.js Route Handlers em Cloudflare Workers ou Vercel Functions.
- **Dados:** PostgreSQL (Neon/Supabase) + Prisma/Drizzle.
- **Identidade:** Clerk ou Supabase Auth, com login social e controle de papéis (aluno, mentor, admin).
- **Vídeo e arquivos:** Cloudflare R2 para materiais; Mux ou Vimeo para vídeo protegido.
- **Labs:** máquinas efêmeras isoladas em CTFd + Docker/Kubernetes, com VPN/browser-based access e encerramento automático.
- **Observabilidade:** Sentry, PostHog e logs estruturados.
- **E-mail/CRM:** Resend + Brevo/HubSpot para onboarding e recuperação de checkout.

## Pagamentos

Para o Brasil, integrar **Mercado Pago** (Pix, cartão e boleto) como principal meio de pagamento. Manter **Stripe** para cartões internacionais e assinaturas globais. Ambos devem usar webhooks assinados; a liberação de acesso ocorre somente após confirmação server-to-server do pagamento.

Modelos sugeridos: curso avulso, assinatura mensal/anual, mentoria em turma e pacote corporativo. Registrar pedidos, faturas, eventos de webhook e concessões de acesso de forma auditável; nunca confiar apenas no retorno do navegador.

## Entidades essenciais

- Usuário, perfil, papel e consentimentos
- Produto, preço, assinatura e pedido
- Curso, módulo, aula e recurso
- Trilha, etapa, progresso e certificado
- Lab, sessão, limite de tempo e submissão
- Simulação, cenário, evidência e relatório
- Mentoria, turma, encontro e inscrição

## Próximas entregas técnicas

1. Definir identidade visual, primeira trilha e oferta comercial.
2. Criar autenticação, catálogo conectado ao banco e área do aluno.
3. Configurar Mercado Pago/Stripe em ambiente de teste, com webhooks e controle de acesso.
4. Criar o primeiro lab isolado e uma simulação de resposta a incidente.
5. Implantar analytics, políticas LGPD, termos e operação de suporte.
