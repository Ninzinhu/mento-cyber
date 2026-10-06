# Arquitetura de pastas

## Estrutura

```text
app/
├── components/
│   ├── behavior/       # comportamento transversal de interface
│   ├── community/      # entrada, interesse e contribuições de participantes
│   ├── hero/           # composição principal da home
│   ├── shell/          # cabeçalho e rodapé compartilhados
│   └── visuals/        # cenas e elementos visuais isolados
├── features/
│   ├── community/      # Firebase, sessão e operações de comunidade
│   └── missions/       # catálogo e domínio de missões
├── estudos/            # rotas públicas /estudos e /estudos/[slug]
├── layout.tsx          # shell raiz e metadados
├── page.tsx            # rota pública /
└── globals.css         # tokens e estilos globais
```

## Regras de organização

- **Rotas ficam próximas da URL:** apenas arquivos de rota residem em `app/` e `app/estudos/`.
- **Componentes não conhecem SDKs:** interface chama operações através de `features/community/community-data.ts`.
- **Firebase fica isolado:** configuração, sessão e persistência de comunidade não entram em páginas ou componentes visuais.
- **Dados de domínio ficam em features:** novas missões, tags, estados e regras de exibição pertencem a `features/missions/`.
- **Visualização é opcional:** Canvas/WebGL fica em `components/visuals/`, sem acoplar a cena às rotas.
- **Documentação acompanha a decisão:** mudanças de infraestrutura atualizam `docs/FIREBASE-*.md`; mudanças de interface atualizam `DESIGN.md` e `docs/EXPERIENCIA-HORIZON.md`.

## Onde adicionar novos itens

| Necessidade | Local |
| --- | --- |
| Nova página pública | `app/<rota>/page.tsx` |
| Componente visual reutilizável | `app/components/<categoria>/` |
| Regra de negócio ou integração | `app/features/<domínio>/` |
| Dados estáticos de missões | `app/features/missions/` |
| Documento de decisão | `docs/` |
| Configuração local não versionada | `.env.local` |

## Limites atuais

`features/community/community-data.ts` é a fronteira de acesso ao Firebase. Quando forem
adicionadas listagem de contribuições, moderação ou Storage, elas devem entrar nessa camada
ou em arquivos vizinhos dentro de `features/community/`, nunca diretamente em componentes.
