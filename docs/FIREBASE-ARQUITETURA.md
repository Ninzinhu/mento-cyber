# Firebase como plataforma do MVP

## Decisão

Firebase é a plataforma única do MVP e da homologação. Não há integração com Supabase,
PostgreSQL ou outro banco nesta fase. A escolha reduz serviços, contas e manutenção até que
a comunidade valide participação recorrente.

## Responsabilidades

| Necessidade | Serviço Firebase |
| --- | --- |
| Identidade | Firebase Authentication |
| Perfis, missões e contribuições | Cloud Firestore |
| Fotos e banners | URLs externas (Discord/CDN do membro) |
| Hospedagem, se Vercel/Cloudflare não forem usados | Firebase Hosting |
| Eventos de uso, se aprovados pela política de privacidade | Google Analytics for Firebase |

## Fronteira de código

As telas não chamam o SDK diretamente. A camada `app/features/community/community-data.ts` concentra:

- entrada e saída da comunidade;
- criação de perfil;
- registro de interesse;
- envio de contribuições;
- observação de sessão.

Essa fronteira preserva as telas e permite trocar o mecanismo de persistência mais tarde,
caso haja motivo concreto. A configuração e a inicialização ficam em
`app/features/community/firebase.ts`. O módulo `app/features/community/profile-data.ts`
concentra a leitura e atualização do perfil.

## Perfil e prática

Cada documento em `profiles/{uid}` guarda identidade, links, contadores, badges e IDs das
missões concluídas. O e-mail é usado para acesso e não é exibido pela interface de perfil.

Avatares e banners são URLs externas, por exemplo de Discord ou de um CDN do membro. O
MentoCyber não armazena esses arquivos; apenas renderiza a URL informada no perfil. A árvore
de missões é curada no código até que exista uma interface administrativa de curadoria.

## Custos e proteção

- Toda consulta de contribuições deve ter filtro e limite antes de ser adicionada à interface.
- Listeners em tempo real ficam restritos a telas que realmente precisam de atualização ao vivo.
- Regras do Firestore são obrigatórias; configuração pública do app não substitui regras.
- O MVP não usa Firebase Storage: URLs externas evitam custo e gestão de arquivos no projeto.
- Moderadores são definidos no documento de perfil pelo console ou por backend administrativo,
  nunca pelo navegador.

## Quando reavaliar

Reavaliar Firebase somente se houver necessidade comprovada de consultas relacionais pesadas,
relatórios financeiros complexos ou uma equipe que prefira operar um banco SQL. Até lá,
manter uma plataforma única reduz custo e risco operacional.
