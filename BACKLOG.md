# 📋 BACKLOG - Trivia Educa v0

**Projeto**: Jogo de Trivia Educativo Pixel-Perfect  
**Engine**: Pixi.js 8.0.5 + TypeScript 5  
**Design**: Figma → Graphics API nativa (sem sprites PNG)  
**Data**: 25/10/2025

---

## 🎯 STATUS GERAL

- **Total de Tarefas**: 28
- **✅ Feito**: 20 (71%)
- **🚧 Fazendo**: 1 (4%)
- **📋 A Fazer**: 7 (25%)
- **🚫 Bloqueios**: 0

---

## ✅ FEITO (20 tarefas)

### Arquitetura & Setup
- [x] **#1** - Migração PNG → Graphics API nativa
  - Motivação: Problemas de posicionamento com sprites PNG
  - Solução: Componentes nativos com `Graphics.roundRect()`, `fill()`, `stroke()`
  - Resultado: Controle total sobre renderização

- [x] **#2** - Estrutura de primitivos (`ui/primitives/`)
  - `RoundButton.ts` (180 linhas) - Botão glassmorphism base
  - `ProgressBar.ts` (114 linhas) - Barra de progresso
  - `IconButton.ts` (68 linhas) - Botões circulares
  - `GlassPanel.ts` (40 linhas) - Painel translúcido

- [x] **#3** - Estrutura de componentes (`ui/components/`)
  - `HeaderHUD.ts` (113 linhas) - Header completo
  - `FooterHUD.ts` (147 linhas) - Footer com power-ups
  - `QuestionCard.ts` (80 linhas) - Card de pergunta
  - `AlternativesGrid.ts` (134 linhas) - Grid 2×2 de alternativas

### Componentes UI
- [x] **#4** - HeaderHUD implementado
  - Progress bar (20, 68) - OCULTA (PNG background já tem)
  - Avatar placeholder (960, 60)
  - Timer (1230, 32.5) com texto "05:00"
  - 5 botões direitos com emojis placeholders

- [x] **#5** - FooterHUD implementado
  - Background rgba(0,189,185,0.3)
  - 3 power-ups: PEDIR DICA (260), ELIMINAR ALTERNATIVA (680), PULAR QUESTÃO (1220)
  - Contadores laranja (0xFF6B35) com "3" no top-right de cada botão

- [x] **#6** - AlternativesGrid layout 2×2 corrigido
  - Origem (343, 333) com D no topo
  - Posições hardcoded: D(403,0), A(0,229), B(805,229), C(403,457)
  - Evita offsets negativos

- [x] **#7** - QuestionCard centralizado
  - Posição (363, 199)
  - Largura 1193px, altura dinâmica
  - Texto Montserrat 44px bold, centralizado

### Correções & Otimizações
- [x] **#8** - Text overflow nas alternativas corrigido
  - fontSize: 32px
  - wordWrapWidth: 394px (474 - 80 padding)
  - Previne overflow horizontal

- [x] **#9** - RoundButton warnings corrigidos
  - Parâmetros não-usados com prefixo `_event`
  - Compilação limpa

- [x] **#10** - GameScene.ts cleanup
  - Removido: `PowerUpButton`, `AlternativeButton` (imports obsoletos)
  - Removido: `selectAlternative()`, `checkAnswer()` (métodos legado)
  - Removido: `selectedAlternativeIndex` (propriedade não-usada)
  - Resultado: 543 linhas (vs 557 antes)

- [x] **#11** - Feedback visual de resposta
  - Tint verde (0x00FF88) para correto
  - Tint vermelho (0xFF0000) para incorreto
  - Duração: 200ms nativo

- [x] **#12** - Hover animations nos botões
  - scale(1.0 → 1.05) em RoundButton
  - Transição GSAP suave
  - Cursor pointer ativo

### Decisões de Design (Pragmáticas)
- [x] **#13** - Progress bar sem gradiente
  - Tentativa: linear-gradient(180deg, #008380 → #80FFFC → #008380)
  - Limitação: Pixi.js 8 não suporta `gradientStops` nativo
  - Solução: Cor sólida 0x00BDB9 + TODO para shader futuro

- [x] **#14** - QuestionCard sem sombra
  - Tentativa: DropShadowFilter
  - Limitação: Removido no Pixi.js 8
  - Solução: Glassmorphism sem glow (design consistente)

- [x] **#15** - Footer sem gradiente
  - Mesma limitação de #13
  - Solução: rgba(0,189,185,0.3) sólido

- [x] **#16** - Placeholders aceitáveis para MVP
  - Avatar: círculo ciano (sprite pode ser adicionado depois)
  - Right buttons: emojis (🪙, ❤️, ❓, ⚙️, ⏸️)
  - Não-crítico para funcionalidade

### Limpeza & Performance
- [x] **#17** - PNGs obsoletos deletados
  - `public/assets/ui/alternatives/*.png` (16 arquivos)
  - `public/assets/ui/buttons/*.png` (15 arquivos)
  - `public/assets/ui/powerups/*.png` (3 arquivos)
  - Economia: ~2.3MB

- [x] **#18** - Power-up usage counters implementados
  - Círculos laranja (0xFF6B35) com texto branco
  - Posição: top-right de cada botão (+30x, -10y offset)
  - Métodos: `setHintCount()`, `setRemoveCount()`, `setSkipCount()`

### Documentação
- [x] **#19** - `constants.ts` documentado
  - Coordenadas Figma comentadas
  - Metodologia PNG → Graphics API explicada
  - Hierarquia de coordenadas (Header, Footer, Grid)
  - Alternativas LEGADO marcadas (usar AlternativesGrid.ts)

- [x] **#20** - `ARCHITECTURE.md` criado (400 linhas)
  - Visão geral da stack técnica
  - Hierarquia de componentes (primitives → components)
  - Fluxo de dados (callbacks, state management)
  - Decisões de design documentadas
  - Roadmap pós-MVP

---

## 🚧 FAZENDO (3 tarefas)

### Pixel-Perfect Layout Refinement
- [x] **#21** - **[FASE 1]** Diagnosticar e corrigir coordenadas base
  - **Objetivo**: Garantir que TODOS os componentes (HeaderHUD, QuestionCard, AlternativesGrid, FooterHUD) estejam inicializados e posicionados corretamente
  - **Sub-tarefas**:
    - [x] SVG gabarito carregado e renderizado (overlay visível)
    - [x] LayoutExporter implementado (tecla "E" exporta JSON)
    - [x] FooterHUD: Verificar se está sendo criado em `GameScene.createNativeUI()`
    - [x] Integrar `LAYOUT_TOKENS` no `GameScene` + QuestionCard/AlternativesGrid/FooterHUD
    - [x] Posicionar FooterHUD em y:960 (fundo da tela) via layout gerado
  - [x] Gerar `layoutBaseline.json` + teste `layoutTokens.spec.ts` para diffs automáticos
  - [x] Ajustar offsets finos caso o baseline aponte divergências (baseline atual: OK)
  - **Saída esperada**: JSON com coordenadas finais, consolidado em `constants.ts`
  - **Bloqueio**: Confirmar posicionamento do FooterHUD

- [ ] **#22** - **[FASE 2]** Refinar dimensões e espaçamento
  - **Objetivo**: Garantir layout 2×2 uniforme e bem espaçado (Após Fase 1)
  - **Sub-tarefas**:
    - [x] Medir largura/altura dos botões das alternativas via baseline automatizado
    - [x] Validar espaçamento entre D-A, D-B, A-C, B-C (teste `layoutTokens.spec.ts`)
    - [x] Ajustar `AlternativesGrid` para uniformidade (slots normalizados)
    - [x] Centralizar texto verticalmente nos botões (anchor 0.5, 0.5 com altura uniforme)
    - [ ] Testar em navegador com overlay ativo
  - **Saída esperada**: Layout uniforme 2×2, screenshot validado

- [ ] **#23** - **[PREPARAÇÃO]** Integração do LayoutExporter com GameScene
  - **Status**: ✅ COMPLETO - LayoutExporter.ts criado e funcional
  - **Funcionalidade**: Pressione "E" para exportar JSON das coordenadas atuais
  - **Próximo**: Usar para validar e ajustar posições até pixel-perfect
  - **Causa**: Texto com zIndex baixo, renderizando atrás dos botões
  - **Solução aplicada**:
    - Adicionado `text.zIndex = 10` (na frente)
    - Adicionado `button.zIndex = 1` (atrás)
    - Habilitado `sortableChildren = true` no container
    - Texto placeholder "A. Texto placeholder" para debug
  - **Status**: Aguardando teste visual

---

# BACKLOG - Trivia Educa v0

## 📋 Status Geral

- **Fase Atual**: Pixel-Perfect Layout Refinement (2025-10-27)
- **Última Atualização**: 2025-10-27 11:46 BRT
- **Responsável**: Fabio + Copilot
- **Próximos 7 dias**: Fase 1-2 do Roadmap (Coordenadas + Espaçamento)
- **Documentação**: Vide `PIXEL-PERFECT-ROADMAP.md` para detalhes completos

---

## 🎯 Fase 1: Diagnosticar e Corrigir Coordenadas Base

### Ajustes Visuais (Pixel-Perfect)
- [ ] **#22** - Ajustar cores e opacidades
  - Validar ciano primário (0x0A9C9A) vs Figma
  - Validar border ciano (0x56C2DA)
  - Validar laranja contadores (0xFF6B35)
  - Ajustar glassmorphism alpha (0.3-0.9)

- [ ] **#23** - Verificar tipografia pixel-perfect
  - Alternativas: Montserrat 32px, weight 700
  - Pergunta: Montserrat 44px, weight 900
  - Timer: Montserrat 32px, weight 900
  - Validar wordWrap 394px (sem overflow)

- [ ] **#24** - Ajustar z-index dos componentes
  - Ordem esperada: background (0) < headerHUD (1) < questionCard (2) < alternativesGrid (3) < footerHUD (4) < debugger (999)
  - Verificar sobreposições indesejadas
  - Garantir clicks funcionam corretamente

### Fase 3 (Após Pixel-Perfect): Tipografia & Cores
- [ ] **#24** - Refinar tipografia e cores (FASE 3)
  - Validar font `Montserrat` em QuestionCard (peso 700, size 44px)
  - Validar font nas alternativas (`Montserrat` 700, size 32px)
  - Validar cores:
    - QuestionCard border: 0x0A9C9A (ciano primário)
    - Texto alternativas: 0x006B7E (ciano escuro)
    - Botões: borders ciano, fundo branco (0xF5F5F5)
  - Ajustar line-height se necessário (`leading` em Pixi.js Text)
  - Validar glow/shadow effects no overlay

### Fase 4 (Após Fase 3): Responsividade & Performance
- [ ] **#25** - Validar responsividade e performance (FASE 4)
  - Testar layout em 1920×1080 (base)
  - Testar em 1366×768 (laptop comum)
  - Testar em 1024×768 (tablet)
  - Validar que componentes não overflow
  - Medir FPS em cada resolução (target: ≥60 FPS)
  - Validar memória (pico ≤100MB em desktop)

### Fase 5 (Após Fase 4): Consolidação Final
- [ ] **#26** - Consolidar e documentar layout final (FASE 5)
  - Remover overlay de debug (ou deixar como flag de dev)
  - Remover/desabilitar LayoutExporter em produção
  - Atualizar `constants.ts` com coordenadas finais
  - Atualizar `ARCHITECTURE.md` com layout final
  - Criar screenshot final para referência
  - Commit final: "refactor: pixel-perfect layout refinement"

### Funcionalidades de Jogo (Pós Pixel-Perfect)
- [ ] **#27** - Implementar lógica de power-ups
  - **PEDIR DICA**: Remover 2 alternativas incorretas
  - **ELIMINAR ALTERNATIVA**: Remover 1 alternativa incorreta
  - **PULAR QUESTÃO**: Ir para próxima questão sem penalidade
  - Decrementar contadores visuais
  - Desabilitar quando contador = 0

- [ ] **#28** - Implementar progressão de questões
  - Carregar próxima questão de `mockQuestions.json`
  - Atualizar progress bar (1/10, 2/10, etc.)
  - Reset do AlternativesGrid
  - Transição suave (fade in/out)

- [ ] **#29** - Implementar timer countdown
  - Iniciar em 90s (01:30)
  - Decrementar a cada segundo
  - Atualizar HeaderHUD timer text (MM:SS)
  - Timeout: marcar como erro e ir próxima

- [ ] **#30** - Implementar sistema de pontuação
  - Integrar `StreakSystem.ts`
  - Score base + bônus de tempo + combo multiplier
  - Exibir score acumulado
  - Persistir para tela de resultados

---

## 🚫 BLOQUEIOS (0 tarefas)

Nenhum bloqueio técnico no momento.

**Bloqueios Resolvidos**:
- ~~Pixi.js 8 sem gradientes nativos~~ → Aceito cores sólidas + TODO shader
- ~~DropShadowFilter removido~~ → Aceito glassmorphism sem sombra
- ~~FooterHUD.ts corrupção em edições~~ → Recriado via PowerShell Out-File
- ~~AlternativesGrid layout incorreto (y:562)~~ → Corrigido para y:333 (D no topo)

---

## 📊 MÉTRICAS DE PROGRESSO

### Código
- **Componentes Criados**: 12 (primitives + components)
- **Linhas de Código**: ~1.500 (componentes UI)
- **Compilação**: ✅ Limpa (0 erros, 0 warnings críticos)
- **Bundle Size**: ~800KB (sem PNGs obsoletos, -2.3MB)

### Design
- **Coordenadas Figma**: 100% mapeadas em `constants.ts`
- **Componentes Nativos**: 100% (0 sprites PNG em uso)
- **Pixel-Perfect**: ~90% (aguardando validação visual #21)

### Funcionalidade
- **UI Rendering**: ✅ 100%
- **Interações Básicas**: ✅ 90% (click em alternativas funciona)
- **Lógica de Jogo**: ⏳ 30% (power-ups, timer, score pendentes)
- **Progressão**: ⏳ 20% (apenas mock da primeira questão)

---

## 🎯 PRÓXIMOS PASSOS CRÍTICOS

1. **IMEDIATO** (#21): Validar renderização visual no navegador
   - Abrir http://localhost:3000/
   - Pressionar **D** para comparar com overlay Figma
   - Reportar ajustes necessários (posições, cores, tamanhos)

2. **CURTO PRAZO** (#25-27): Implementar lógica de jogo core
   - Power-ups funcionais (3 horas)
   - Progressão de questões (2 horas)
   - Timer countdown (1 hora)

3. **MÉDIO PRAZO** (#28): Sistema de pontuação
   - Score + streak + bônus de tempo (3 horas)
   - Tela de resultados final (2 horas)

4. **LONGO PRAZO**: Features avançadas
   - Backend API para questões dinâmicas
   - Sistema de autenticação
   - Leaderboard
   - Modo multiplayer

---

## 🔧 CONFIGURAÇÃO DE DESENVOLVIMENTO

### Executar Projeto
```powershell
npm install
npm run dev
# http://localhost:3000/
```

### Atalhos de Debug (Teclado)
- **D**: Toggle overlay Figma (comparação visual)
- **E**: Modo edição (ajustar posições)
- **+/-**: Ajustar transparência do overlay
- **S**: Salvar mudanças (console)
- **C**: Copiar layout (clipboard)
- **R**: Resetar cache de layout
- **ESC**: Descartar mudanças

### Build Produção
```powershell
npm run build
npm run preview
```

---

## 📝 NOTAS TÉCNICAS

### Limitações Conhecidas (Pixi.js 8)
1. **Sem gradientes nativos**: `Graphics.fill()` não aceita `gradientStops`
   - Workaround: Cores sólidas + TODOs para shaders futuros
2. **Sem DropShadowFilter**: Removido na v8
   - Workaround: Glassmorphism sem glow (design aceitável)
3. **Text multi-linha**: Requer `wordWrapWidth` configurado
   - Solução: 394px nas alternativas (474 - 80 padding)

### Decisões Arquiteturais
- **PNG vs Graphics API**: Graphics API escolhido por controle total
- **Callbacks vs Event Emitter**: Callbacks diretos para simplicidade
- **State Management**: Props drilling (suficiente para MVP)
- **Componentes Legacy**: Mantidos para compatibilidade com debugger

### Performance Targets (SLIs)
- FPS médio: ≥ 60fps
- Frame p95: ≤ 16.6ms
- Memória: < 100MB
- Draw calls: ~35 (vs ~60 com PNGs)

---

**Última Atualização**: 25/10/2025 14:45  
**Responsável**: GitHub Copilot + fabioaap  
**Status do Servidor**: ✅ Rodando em http://localhost:3000/
