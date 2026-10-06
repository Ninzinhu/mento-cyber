# Firebase Emulator Suite — desenvolvimento local

Este modo isola Auth e Firestore do projeto Firebase real. Dados criados aqui existem apenas no computador local.

## 1. Crie `.env.local`

Mantenha as variáveis públicas existentes do Firebase e acrescente:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=localhost
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
```

`FIREBASE_PROJECT_ID` pode receber o mesmo valor de `NEXT_PUBLIC_FIREBASE_PROJECT_ID`. Nenhuma chave privada é necessária neste modo.

## 2. Inicie em dois terminais

```powershell
npm run emulators
```

Em outro terminal:

```powershell
npm run dev
```

Abra `http://localhost:3000`. O painel do Emulator Suite fica em `http://127.0.0.1:4000`.

## 3. Teste o fluxo

1. Cadastre uma conta de teste em `/cadastro`.
2. Abra `/labs` e entre em um lab sem pré-requisito.
3. Marque o roteiro e envie uma evidência.
4. Cadastre uma segunda conta de teste em uma janela anônima para revisar em `/labs/revisar`.

Não envie `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`, hosts de emulador ou credenciais locais para a Vercel.
