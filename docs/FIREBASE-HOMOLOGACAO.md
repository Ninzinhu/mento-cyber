# Firebase — homologação inicial

## Decisão

Firebase é a plataforma única da homologação e do MVP: Authentication para participantes e Cloud Firestore
para perfis, interesse pela rede e contribuições às missões. A escolha reduz a operação
inicial; migrar para PostgreSQL/Supabase só faz sentido quando filtros, relatórios ou
relações mais complexas se tornarem prioridade.

## O que o repositório já entrega

- SDK modular do Firebase instalado.
- Rotas de entrar, registro, perfil e labs com árvore de missões.
- Foto, banner, bio, links sociais, badges e conquistas por membro.
- Formulário público de interesse pela comunidade.
- Formulário autenticado de contribuição em cada missão.
- Regras de acesso em `firestore.rules`.
- Índices iniciais para contribuições em `firestore.indexes.json`.
- Exemplo de variáveis em `.env.example`.

## Passos no console Firebase

1. O projeto ativo é `comunidade-cyber`; o app Web e a configuração local já existem.
2. Em Authentication, ative **E-mail/senha**.
3. Em Firestore Database, mantenha o banco em modo de produção. As regras de perfil já foram publicadas.
4. Não é necessário criar bucket no Storage: foto e banner são URLs externas, como Discord ou outro CDN.
5. Em Authentication → Settings → Authorized domains, inclua o domínio de homologação da Vercel/Cloudflare.
6. Crie manualmente o documento do primeiro moderador em `profiles/{uid}` e altere `role` para `moderator`.

## Variáveis obrigatórias

Copie `.env.example` para `.env.local` e preencha:

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Esses identificadores são públicos por natureza no SDK Web; o controle de acesso real está
nas regras do Firestore. Nunca inclua chaves de conta de serviço no navegador ou no Git.

## Modelo de dados

| Coleção | Quem lê | Quem escreve |
| --- | --- | --- |
| `profiles` | pessoa autenticada | pessoa dona do perfil; papel imutável pelo cliente |
| `missions` | público quando `visibility = public` | moderador |
| `contributions` | pessoa autenticada | autor da contribuição; moderação edita/revisa |
| `interestRequests` | moderador | qualquer visitante, somente criação |

## Teste de aceite

1. Crie uma conta e confirme que nasce um documento em `profiles` com papel `member`.
2. Envie um e-mail pelo formulário da home e confira `interestRequests`.
3. Entre, abra uma missão e envie contribuição com pelo menos 20 caracteres.
4. Verifique que a contribuição recebe `authorId` igual ao UID e status `pending-review`.
5. Com uma conta comum, tente alterar documento de outro perfil ou missão no console: a regra deve negar.
6. Informe URLs públicas de foto e banner e confirme a renderização no perfil.
7. Teste o deploy de homologação com o domínio autorizado no Firebase Auth.

## Publicação de homologação

- **Vercel:** importe o repositório, configure as mesmas variáveis em Preview e conecte um domínio de preview.
- **Cloudflare Pages:** use `npm run build`, configure as variáveis em Preview e autorize o domínio no Firebase.
- Em ambos, cada variável `NEXT_PUBLIC_*` precisa estar presente no ambiente de preview antes do build.
