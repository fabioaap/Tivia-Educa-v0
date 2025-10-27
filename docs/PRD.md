# PRD - Trivia Educacross v0

**Status**: Rascunho v0.1 (27/out/2025)  
**AtualizaÃ§Ã£o 27/out**: Layout tokens recalculados e HUDs nativos (Header, QuestionCard, Alternatives, Footer) alinhados ao gabarito pixel-perfect.  
**Owner**: Educacross HQ (Fabio + Copilot)  
**Repositorio**: `main` @ `fabioaap/Tivia-Educa-v0`

---

## 1. Visao Geral

### 1.1 Resumo Executivo
Trivia Educacross v0 e um jogo de trivia educacional para navegador (desktop e mobile) que precisa entregar experiencia pixel-perfect alinhada ao layout do Figma e evoluir rapidamente para gameplay completa (timer, pontuacao, power-ups) com telemetria ativa. Este PRD consolida objetivos, escopo, requisitos e roadmap do MVP+.

### 1.2 Problema e Oportunidade
- **Problema**: Interface atual majoritariamente em Pixi.js apresenta desvios visuais, HUD complexo de manter e gameplay incompleta (timer, score e power-ups). Falta documento unico de alinhamento.
- **Oportunidade**: Consolidar entrega robusta, visualmente fiel, com interacoes responsivas e pronta para evoluir com backend real.

### 1.3 Objetivo Macro
Entregar ate 28/outubro/2025 uma experiencia de trivia 100% alinhada ao gabarito Figma, com gameplay completa, telemetria essencial e performance dentro dos orcamentos definidos.

---

## 2. Personas e Cenarios

| Persona | Contexto | Necessidade chave |
|---------|----------|-------------------|
| **Aluno Explorador (10-14 anos)** | Usa navegador da escola ou de casa com mouse/touch | Aprender brincando com feedback imediato e interface fluida |
| **Professor Mediador** | Supervisiona turma e projeta na sala | Precisao visual, previsibilidade e reinicio rapido de partidas |
| **Equipe Pedagogica** | Analisa resultados e ajusta conteudos | Telemetria confiavel, visao de dificuldade e aderencia a curriculo |

---

## 3. Jornada do Usuario (MVP)

1. Usuario acessa a URL e carrega o jogo em ate 3s.
2. HUD apresenta header, pergunta, alternativas e botoes de power-up.
3. Jogador escolhe alternativa ou aciona power-up (maximo 3 usos cada).
4. Sistema fornece feedback visual e sonoro, ajusta streak e score.
5. Avanca automaticamente para a proxima pergunta (10 por rodada).
6. Exibe tela final com score, tempo medio, streak e sugestao de replay.
7. Eventos sao enviados para telemetria local com flush programado.

---

## 4. Escopo

### 4.1 Escopo Funcional (MoSCoW)
- **Must (MVP+)**
  - UI principal pixel-perfect (Header, QuestionCard, AlternativesGrid, Footer com power-ups).
  - HUD hibrido HTML/SVG para header/footer sincronizado com gameplay Pixi.
  - Timer regressivo de 90s por pergunta com feedback de timeout.
  - Score com multiplicador de streak via `StreakSystem` e feedback visual/audio.
  - Power-ups (dica, remover alternativa, pular) com contadores e estados desabilitados.
  - Persistencia local via IndexedDB (Dexie) permitindo jogo offline.
  - Telemetria essencial (questao apresentada, resposta, power-ups, conclusao).
- **Should**
  - Responsividade 1920x1080, 1366x768, 1024x768 via escala unificada.
  - Modos de acessibilidade (alto contraste, daltonismo, navegacao por teclado).
  - Som configuravel (mute global) para eventos principais.
- **Could**
  - Animacoes ricas (shake, confetti) controladas por flag.
  - Skins de HUD tematizadas por escola.
- **Won't (agora)**
  - Multiplayer online e ranking global.
  - Loja, anuncios ou compras in-app.
  - Backend de producao (API real) antes de Q1/2026.

### 4.2 Fora de Escopo
- Cadastro/autenticacao de usuarios.
- Marketplace de questoes de terceiros.
- Integracao com analytics corporativos externos.

---

## 5. Requisitos Nao Funcionais

| Categoria | Requisito |
|-----------|-----------|
| **Performance** | FPS medio >= 60; frame p95 <= 16.6ms; bundle inicial <= 3MB; heap <= 100MB; load <= 3s. |
| **Compatibilidade** | Chrome >= 119, Edge >= 119, Safari 17 (WebGL2), iPadOS 17; fallback WebGL1 quando necessario. |
| **Acessibilidade** | Contraste WCAG AA, navegacao teclado completa, labels ARIA no HUD HTML, modo daltonismo. |
| **Seguranca** | Sem armazenamento de PII; eventos anonimizados; CSP restritiva; debug desligado em producao. |
| **Confiabilidade** | CI falha se lint/test/perf romperem; feature flags com TTL e owner definido. |
| **Observabilidade** | Logs estruturados por rodada; alerta se FPS medio < 55 em 3 rodadas consecutivas. |

---

## 6. Arquitetura e Componentizacao

1. **Render principal**: Pixi.js 8 (canvas) com `GameScene` orquestrando questoes, feedback e power-ups.
2. **HUD hibrido**: Header/Footer em HTML/SVG (grid 12 colunas) comunicando com Pixi via eventos customizados.
3. **Layout tokens**: `scripts/extract-layout.js` gera `generatedLayout.ts` e `layoutBaseline.json`; teste `layoutTokens.spec.ts` garante drift <= 1px.
4. **Estado**: `SceneManager` + `StreakSystem`; futuro suporte a Zustand/React Query quando HUD migrar para React.
5. **Persistencia**: Dexie com interface `QuestionRepository` mockada e pronta para API.
6. **Telemetria**: Buffer local com eventos obrigatorios e flush manual via REST (mock) ou console.

### 6.1 Plano de Gabaritos por Tela (27/out)
- **Separação por cena**: cada tela do jogo terá um SVG dedicado (`gabarito-game.svg`, `gabarito-menu.svg`, etc.) exportado do Figma com camadas estáticas.
- **Slicing automatizado**: novo script `scripts/split-gabarito.js` irá ler o SVG da cena, identificar masks/bounding boxes e gerar sprites individuais em `public/assets/layout/<scene>/`.
- **Validação de slices**: comando `npm run layout:validate <scene>` confere se as dimensões dos PNGs cortados batem com o `layoutBaseline-<scene>.json` antes de integrar.
- **Tokens específicos**: `npm run layout:sync -- --scene <nome>` produzirá `generatedLayout-<scene>.ts` e `layoutBaseline-<scene>.json`, mantendo o teste `layoutTokens` alinhado a cada HUD.
- **Runtime híbrido**: `GameScene` e demais cenas carregarão os sprites recortados como `Sprite` Pixi para shapes/gradientes, posicionando textos e estados dinâmicos por cima via tokens.
- **Atualização contínua**: ao atualizar o layout no Figma, basta exportar o SVG da cena e rodar `npm run layout:slice <scene>`, `npm run layout:validate <scene>` e `npm run layout:sync -- --scene <scene>`.

---

## 7. Conteudo e Regras de Negocio

- **Question bank**: `mockQuestions.json` seguindo `Question.ts` (id, statement, alternatives[], correctLetter, hint, category, difficulty).
- **Curadoria**: Foco inicial em lingua portuguesa; roadmap para matematica e ciencias.
- **Pontuacao**: Base 100, multiplicador de dificuldade (1.0 a 3.0), bonus `ceil(tempo_restante/3)`, streak multiplica 0.1 a cada 3 acertos.
- **Power-ups**: Tres usos por rodada; bloqueio visual e funcional ao atingir zero.
- **Timer**: Ao chegar a zero dispara mensagem "Tempo esgotado" e avanca questao sem pontos.

---

## 8. Telemetria e Privacidade

- **Eventos obrigatorios**
  - `round_started` (timestamp, device_class, seed)
  - `question_presented` (question_id, difficulty, order)
  - `answer_submitted` (question_id, letter, correct, time_spent_ms)
  - `powerup_used` (type, remaining)
  - `round_completed` (score, accuracy, duration_ms)
- **Metricas chave**: Taxa de acerto, tempo medio por questao, uso de power-ups, perdas por timeout, FPS medio.
- **Privacidade**: IDs pseudonimizados, sem coleta de nome/email; aviso de telemetria com opt-in quando exigido.

---

## 9. UX/UI e Acessibilidade

- **Pixel-perfect**: Tolerancia <= 1px validada via overlay e diff visual Playwright.
- **Tipografia**: Montserrat (header 24-32px, pergunta 44px, alternativas 32px) com fallback Arial.
- **HUD HTML/SVG**: Tokens documentados, escala uniforme baseada em viewport 1920x1080.
- **Estados visuais**: Hover, active, disabled, correct, wrong, timeout documentados no design system.
- **Acessibilidade**: Atalhos 1-4 (alternativas), H (dica), R (remover), P (pular); preparacao para TTS opcional.

---

## 10. Criterios de Aceitacao

1. Layout coincide com gabarito Figma com desvio <= 1px (teste E2E com diff visual aprovado).
2. Timer decrementa a cada segundo e dispara transicao ao chegar a zero.
3. Power-ups atualizam contador, refletem estado e afetam alternativas conforme regra.
4. Score e streak exibidos no HUD e na tela final com calculo correto.
5. Eventos obrigatorios gravados com latencia < 100ms para buffer local.
6. Build de producao sem logs de debug e com HUD HTML ativo.
7. `npm run lint`, `npm run test:unit`, `npm run test:e2e`, `npm run test:performance` passando.

---

## 11. Roadmap e Marcos

| Fase | Out | Nov |
|------|-----|-----|
| F1: Refinar pixel-perfect (Pixi) | âœ… | |
| F2: HUD HTML/SVG + bridge | ðŸš§ | âœ… |
| F3: Gameplay completa + testes | | âœ… |
| F4: Telemetria, acessibilidade, QA | | ðŸš§ |
| F5: Launch review e handoff | | âœ… |

### Detalhamento (27/out -> 30/nov)
- **Semana 1 (27/10-02/11)**: Migrar HUD para HTML/SVG, sincronizar escala, adaptar LayoutExporter.
- **Semana 2 (03/11-09/11)**: Implementar timer, score, power-ups e streak com testes unitarios.
- **Semana 3 (10/11-16/11)**: E2E Playwright com diff visual, testes de performance, ajustes de acessibilidade.
- **Semana 4 (17/11-23/11)**: Telemetria, script de deploy, checklist de qualidade.
- **Semana 5 (24/11-30/11)**: Pilotagem interna, correcoes finais, go/no-go.

---

## 12. Dependencias e Recursos

- **Tecnologia**: Node 20+, Pixi 8, Vite 5, GSAP, Howler, Dexie, Vitest, Playwright.
- **Design**: Figma "Trivia Educacross - HUD 2025" conforme `FIGMA-EXPORT-GUIDE.md`.
- **Time**: 1 dev frontend (Copilot), 1 tech lead (Fabio), 1 QA parcial, 1 designer sob demanda.
- **Infra**: GitHub Actions (lint/test/perf), Vercel (preview), S3/CloudFront para assets.

---

## 13. Riscos e Mitigacoes

| Risco | Impacto | Prob | Mitigacao |
|-------|---------|------|-----------|
| Complexidade HTML+Pixi | Alto | Medio | Prototipo em branch dedicada; fallback para Pixi puro com degrade de HUD. |
| Performance WebGL em notebooks fracos | Medio | Medio | Perfil de qualidade (full/reduzido), monitoramento de FPS, alerta se p95 > 25ms. |
| Ausencia de backend real | Medio | Alto | Interface `QuestionRepository` com mocks; plano de migracao para API REST. |
| Cobertura de testes insuficiente | Alto | Medio | Gate em CI (80% unit, 60% visuais), revisao semanal de metricas. |
| Compliance LGPD | Alto | Baixo | Eventos anonimizados, revisao legal do dicionario de dados, aviso de telemetria. |

---

## 14. Sucesso e KPIs

- **Qualidade**: 0 regressao visual > 1px por release; >= 95% testes passando.
- **Engajamento**: Tempo medio por rodada 6-8 minutos; taxa de conclusao >= 85%; uso de power-ups >= 60%.
- **Performance**: FPS medio 60; bundle < 3MB; crash rate < 1%.
- **Acessibilidade**: Score WAVE >= 90; navegacao teclado completa sem bloqueios.

---

## 15. Aprovacao e Governanca

- **Stakeholders**: Fabio (product/tech lead), Copilot (implementacao), designer UI, QA.
- **Mudancas**: Atualizacoes no PRD exigem ADR resumido e aprovacao dos stakeholders.
- **Artefatos relacionados**: `ANALISE-COMPLETA-26OUT.md`, `ARCHITECTURE.md`, `PIXEL-PERFECT-ROADMAP.md`, `BACKLOG.md`, `FIGMA-EXPORT-GUIDE.md`.

---

**Proximos passos imediatos**
1. Revisar PRD com stakeholders ate 29/out.  
2. Abrir milestone "HUD HTML Overlay" com tarefas detalhadas.  
3. Iniciar POC do overlay em branch `feature/hud-html-overlay`.

---

**Historico de revisoes**
- 27/out/2025: Rascunho inicial (Copilot).

