# Experiência visual inspirada em HorizonX

## Intenção

A referência é o template “Intelligence Evolve” da HorizonX: uma landing de cyber
defense de alto contraste, com motion monocromático, métricas operacionais e controles
compactos. A MentoCyber reutiliza apenas esses princípios de interação e hierarquia; não
usa código, fontes, vídeo ou identidade visual da referência. O produto é uma comunidade
de prática, não uma escola ou uma vitrine de cursos.

## Direção adotada

- Hero em três áreas: convite à comunidade, visualização de sinal e estado da rede.
- Preto, cinza e branco; sem neon, gradiente decorativo ou glassmorphism.
- Dados de treino reais no layout: labs abertos, rotas, próxima prática e duração.
- Movimento breve para orientar a entrada; o conteúdo não fica condicionado à animação.

## Dependências instaladas

| Pacote | Papel | Onde é usado |
| --- | --- | --- |
| `motion` | Entrada do hero e futuras transições por scroll | `horizon-hero.tsx` |
| `lenis` | Scroll suave opcional | `smooth-scroll.tsx` |
| `three` | Runtime WebGL | dependência da cena |
| `@react-three/fiber` | Canvas declarativo em React | `signal-field.tsx` |
| `@react-three/drei` | Adaptação de qualidade por performance | `signal-field.tsx` |

## Performance e acessibilidade

- O Canvas é um componente cliente separado e carregado dinamicamente, sem SSR.
- A cena não usa arquivos 3D nem texturas; ela é formada apenas por geometria simples.
- `PerformanceMonitor` reduz o device pixel ratio em máquinas com queda de desempenho.
- Com `prefers-reduced-motion: reduce`, o objeto deixa de girar e o Lenis não é iniciado.
- A cena é decorativa e fica fora da árvore de acessibilidade; título, estado e ações
  continuam no HTML semântico.

## Critérios de aceitação

1. O hero deve renderizar conteúdo e CTAs antes da cena WebGL terminar de carregar.
2. A navegação funciona sem JavaScript avançado e sem Canvas.
3. A primeira dobra não usa cores fora da paleta monocromática.
4. Em telas menores, o visual deve ficar abaixo da mensagem e nunca esconder a ação.
5. `npm run build` deve concluir sem erro antes de publicar.

## Referências

- HorizonX, Intelligence Evolve: https://horizonx.so/explore/intelligence-evolve
- Motion: https://motion.dev/docs/react-scroll-animations
- Lenis: https://github.com/darkroomengineering/lenis
- React Three Fiber: https://r3f.docs.pmnd.rs/
- Drei: https://github.com/pmndrs/drei
