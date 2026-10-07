# Referências de concepção dos Labs

Os Labs do MentoCyber são cenários originais, com dados sintéticos, construídos
para prática defensiva. Eles não reproduzem máquinas, rooms, flags, respostas,
walkthroughs ou infraestrutura de terceiros.

## Estrutura adotada

Como referência de progressão, usamos a organização pública da Hack The Box
Academy: caminhos por função, módulos de um tema e exercícios práticos
progressivos. No MentoCyber essa ideia se transforma em **trilhas**, **rooms** e
**checkpoints de diagnóstico**, sem dependência da plataforma externa.

Referências públicas consultadas em 7 de outubro de 2026:

- [Academy Modules & Paths](https://help.hackthebox.com/en/articles/12741910-academy-modules-paths)
- [SOC Analyst Job Role Path](https://academy.hackthebox.com/path/preview/soc-analyst)
- [Learning Paths & Courses](https://help.hackthebox.com/en/articles/14997855-learning-paths-courses)

## Adaptações originais

| Room MentoCyber | Foco defensivo |
| --- | --- |
| Sombra no proxy | Triagem de telemetria web e correlação de contexto |
| Caixa de entrada em quarentena | Avaliação de cabeçalhos de e-mail sintéticos |
| Desvio no endpoint | Linha do tempo de endpoint e contenção proporcional |
| Revisão de chave de serviço | Resposta a exposição simulada de credencial |

Cada room executa inteiramente no navegador, usa somente artefatos criados para
o cenário e valida a conclusão no servidor. Não há máquinas acessíveis, shell
real, rede externa, credenciais funcionais ou alvo de ataque.
