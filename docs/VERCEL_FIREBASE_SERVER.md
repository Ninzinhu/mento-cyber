# Firebase seguro via Next.js na Vercel

O navegador usa Firebase Auth para criar e renovar a sessão. Toda gravação no Firestore passa por `POST /api/community`, que valida o Firebase ID token e usa o Firebase Admin SDK no servidor.

## Variáveis privadas na Vercel

Cadastre em **Project → Settings → Environment Variables**, tanto para Preview quanto Production:

```
FIREBASE_PROJECT_ID=comunidade-cyber
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@comunidade-cyber.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
```

Gere a chave em Firebase Console → Configurações do projeto → Contas de serviço → **Gerar nova chave privada**. Ela é secreta: não a envie ao Git, não a coloque em variáveis `NEXT_PUBLIC_*` e não a compartilhe no navegador.

As variáveis `NEXT_PUBLIC_FIREBASE_*` continuam necessárias apenas para autenticação no navegador. Elas não são credenciais privilegiadas.

## O que foi protegido

- criação e atualização de perfil;
- XP implícito, contagem, conclusão de missões e badges;
- favoritos e estado de missão;
- seguir, salvar, bloquear e denunciar;
- convites e suas transições de estado;
- cadastro de interesse.

As regras em `firestore.rules` agora negam qualquer escrita do browser. A conta de serviço do Admin SDK vive apenas na Vercel e executa as validações na API.
