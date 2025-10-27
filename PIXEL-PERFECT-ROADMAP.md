# Análise Completa do Projeto - Pixel-Perfect Roadmap

## 📊 Estado Atual do Projeto (26 de outubro de 2025)

### ✅ Implementado e Funcional
- **Core Game Loop**: Pixi.js 8.x inicializado, responsivo, renderizando a 60 FPS
- **Scene Manager**: Transição Boot → Game funcionando
- **SVG Gabarito Carregado**: `figma-gabarito.svg` renderizado como background 100% fiel ao design
- **Componentes Nativos (Graphics API)**: Sem dependência de PNGs
  - HeaderHUD: Progress bar, avatar, timer, 5 botões direitos
  - QuestionCard: Card de pergunta com glassmorphism
  - AlternativesGrid: 4 alternativas (D-topo, A/B-meio, C-baixo)
  - FooterHUD: 3 power-ups com contadores
  - StreakIndicator: Indicador de combo com fogo
- **Layout Exporter**: Script que exporta coordenadas em JSON via tecla "E"
- **Debug Tools**: PixelPerfectDebugger, overlay de comparação com SVG

### ⚠️ Desvios Visuais (comparado ao SVG gabarito)
Do último print análise:
1. **QuestionCard**: +6px deslocado para baixo, width 605px (dentro do esperado)
2. **AlternativesGrid**: +10px deslocado para cima, width 650px (ligeiramente menor que o ideal)
3. **Cards das Alternativas**: 
   - Altura inconsistente com espaçamento irregular
   - Texto não completamente centralizado dentro dos cards
4. **HeaderHUD**: Alinhado corretamente (x:0, y:0)
5. **FooterHUD**: Não renderizando (y:0, x:0 indica não inicializado)

### 🔴 Problemas Críticos
- FooterHUD não renderizando (coordenadas undefined)
- Espaçamento entre alternativas não uniforme
- Texto das alternativas com kerning/line-height inconsistente

---

## 🎯 Plano Pixel-Perfect: 5 Fases

### **Fase 1: Diagnosticar e Corrigir Coordenadas Base** (Hoje)
**Objetivo**: Garantir que todos os componentes principais estejam inicializados e posicionados

**Tarefas**:
- [ ] 1.1 Verificar se `footerHUD` está sendo criado em `GameScene.createNativeUI()`
- [ ] 1.2 Exportar layout com "E" e validar JSON (todos os 4 componentes com coords ≠ 0)
- [ ] 1.3 Ajustar `QuestionCard` y: -6px (de 230 para 224) para alinhar com SVG
- [ ] 1.4 Ajustar `AlternativesGrid` y: -10px (de 370 para 360) e largura se necessário
- [ ] 1.5 Posicionar `FooterHUD` exatamente em y:960 (fundo da tela)
- [ ] 1.6 Exportar JSON final com valores corretos

**Saída**: JSON das coordenadas finais, pronto para consolidar em `constants.ts`

---

### **Fase 2: Refinar Dimensões e Espaçamento** (Après Fase 1)
**Objetivo**: Garantir que o layout 2×2 das alternativas seja uniforme e bem espaçado

**Tarefas**:
- [ ] 2.1 Medir largura/altura dos botões das alternativas no overlay
- [ ] 2.2 Validar espaçamento entre D-A, D-B, A-C, B-C (devem ser iguais)
- [ ] 2.3 Ajustar `RoundButton` ou `AlternativesGrid` para garantir uniformidade
- [ ] 2.4 Centralizar texto verticalmente dentro de cada botão (anchor.set(0.5, 0.5))
- [ ] 2.5 Testar em navegador com overlay ativo
- [ ] 2.6 Exportar JSON atualizado

**Saída**: Layout uniforme 2×2, todos os cards com mesma dimensão e espaçamento

---

### **Fase 3: Refinar Tipografia e Cores** (Após Fase 2)
**Objetivo**: Garantir que fontes, pesos e cores correspondam exatamente ao gabarito

**Tarefas**:
- [ ] 3.1 Validar fonte `Montserrat` em `QuestionCard` (peso 700, size 44px)
- [ ] 3.2 Validar fonte nas alternativas (`Montserrat` 700, size 32px)
- [ ] 3.3 Validar cores:
  - QuestionCard border: 0x0A9C9A (ciano primário)
  - Texto alternativas: 0x006B7E (ciano escuro)
  - Botões: borders ciano, fundo branco (0xF5F5F5)
- [ ] 3.4 Ajustar line-height se necessário (`leading` em Pixi.js Text)
- [ ] 3.5 Validar glow/shadow effects no overlay (se houver no SVG)
- [ ] 3.6 Captura de screenshot para comparação

**Saída**: Tipografia e cores pixel-perfect; screenshot validado contra gabarito

---

### **Fase 4: Validar Responsividade e Performance** (Após Fase 3)
**Objetivo**: Garantir que o layout permaneça pixel-perfect em diferentes resoluções

**Tarefas**:
- [ ] 4.1 Testar layout em 1920×1080 (base)
- [ ] 4.2 Testar em 1366×768 (laptop comum)
- [ ] 4.3 Testar em 1024×768 (tablet)
- [ ] 4.4 Validar que componentes não overflow ou desaparecem
- [ ] 4.5 Medir FPS em cada resolução (target: ≥60 FPS)
- [ ] 4.6 Validar memória (pico ≤100MB em desktop)

**Saída**: Relatório de responsividade; SLIs validados (FPS, memória)

---

### **Fase 5: Consolidar e Documentar** (Após Fase 4)
**Objetivo**: Finalizar layout e criar referência para futuras mudanças

**Tarefas**:
- [ ] 5.1 Remover overlay de debug (ou deixar como flag)
- [ ] 5.2 Remover LayoutExporter do código final (ou deixar em dev-only)
- [ ] 5.3 Atualizar `constants.ts` com coordenadas finais
- [ ] 5.4 Atualizar `ARCHITECTURE.md` com layout final
- [ ] 5.5 Criar screenshot final para referência (salvar em `docs/final-layout.png`)
- [ ] 5.6 Atualizar `BACKLOG.md` marcando tudo como "feito"
- [ ] 5.7 Commit final: "refactor: pixel-perfect layout refinement"

**Saída**: Projeto pronto para produção com layout 100% pixel-perfect

---

## 🔧 Checklist de Execução por Componente

### HeaderHUD (Já alinhado)
- [x] x: 0, y: 0
- [x] Avatar, Timer, Botões posicionados
- [x] Visível e funcional

### QuestionCard
- [ ] Ajustar y de 230 → 224 (-6px)
- [ ] Validar width: 605px vs esperado
- [ ] Validar altura: 77px
- [ ] Fonte 44px, peso 700
- [ ] Cor texto: branco (#FFFFFF)
- [ ] Border ciano: 0x0A9C9A

### AlternativesGrid
- [ ] Ajustar x de 360 → 370 (+10px)
- [ ] Validar height: 283px
- [ ] Validar espaçamento entre botões (uniforme)
- [ ] Centralizar textos nos botões
- [ ] Fonte 32px, peso 700
- [ ] Cor texto: 0x006B7E

### FooterHUD
- [ ] Criar/inicializar em `GameScene.createNativeUI()`
- [ ] Posicionar em y: 960 (fundo)
- [ ] Validar contadores visíveis
- [ ] Validar botões de power-ups

---

## 📈 Métricas de Sucesso

- **Visual**: Layout 100% pixel-perfect vs SVG (desvio ≤1px)
- **Performance**: FPS ≥60, memória ≤100MB
- **Responsividade**: Funciona em 1920×1080, 1366×768, 1024×768
- **Cobertura de Componentes**: 100% dos elementos principal alinhados
- **Documentação**: Coordenadas finais documentadas em `constants.ts` e `ARCHITECTURE.md`

---

## 🚀 Próximos Passos Imediatos

1. **Ativar Fase 1 agora**: Diagnosticar FooterHUD e exportar JSON
2. **Após validação visual**: Passar para Fase 2 (refinamento de espaçamento)
3. **Após Fase 2**: Validar tipografia e cores (Fase 3)
4. **Meta Final**: Projeto pronto para entrega com layout 100% fiel ao Figma

---

## 📝 Notas de Implementação

- **LayoutExporter.ts**: Exporta JSON via tecla "E" — use para validar a cada ajuste
- **SVG Overlay**: Deixa em alpha=0.25 para comparação visual — remover antes da entrega final
- **Debug Console**: Limpar logs em produção — usar `drop_console: true` no terser config

