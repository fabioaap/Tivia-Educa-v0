# ðŸŽ® Trivia Educacross v0 - MASTER PHASE âœ…

**Status**: âœ… **COMPLETO E FUNCIONAL** (26 de Outubro de 2024)

Jogo de perguntas-e-respostas educacional com **gamificaÃ§Ã£o em tempo real**, renderizado com Pixi.js 8.0, delta-based timer, e SVG gabarito Figma integrado.

## ðŸš€ Quick Start

### PrÃ©-requisitos

- Node.js â‰¥ 20.0.0
- npm â‰¥ 10.0.0

### InstalaÃ§Ã£o & ExecuÃ§Ã£o

```powershell
# Clone o repositÃ³rio
git clone https://github.com/fabioaap/Tivia-Educa-v0.git
cd Tivia-Educa-v0

# Instale dependÃªncias
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Navegador abrirÃ¡ automaticamente em `http://localhost:3000`

### ðŸŽ® Controles In-Game

```
ðŸ–±ï¸ Clique em qualquer alternativa (A, B, C, D) para responder
ðŸ’¡ PEDIR DICA: Remove 2 alternativas (3 usos)
ðŸ—‘ï¸ REMOVER ALTERNATIVA: Remove 1 alternativa (3 usos)
â­ï¸ PULAR QUESTÃƒO: Pula para prÃ³xima pergunta (3 usos)
â±ï¸ Timer: 90 segundos por pergunta (conta regressiva)
```

### ðŸ”§ Debug & Dev Tools (in-browser)

```
D     â†’ Toggle debug overlay (mostra SVG gabarito semi-transparente)
E     â†’ Exportar coordenadas atuais dos componentes (console)
+/-   â†’ Ajustar transparÃªncia do overlay
```

---

## ðŸ“Š Status & Arquitetura

### âœ… Funcionalidades Implementadas

- **Game Loop**: Delta-based, 60 FPS, Pixi.js ticker
- **DinÃ¢mica**: Timer countdown, alternativas clicÃ¡veis, feedback visual
- **Power-ups**: Hint, remove, skip com contadores
- **Scoring**: Base 100 + time bonus (10 pts/seg) + streak multiplier
- **Componentes Nativos**: HeaderHUD, QuestionCard, AlternativesGrid, FooterHUD (Graphics API)
- **SVG Background**: Figma gabarito integrado (zIndex=0)
- **TypeScript**: 0 erros de compilaÃ§Ã£o, strict mode
- **Pixel-Perfect Layout**: Exportado e sincronizado

### ðŸ—ï¸ Arquitetura

```
Application
â”œâ”€ SceneManager (ticker loop auto)
â”œâ”€ BootScene (3s preload)
â””â”€ GameScene
    â”œâ”€ SVG Background (Sprite)
    â”œâ”€ Components (nativo Graphics API)
    â”‚   â”œâ”€ HeaderHUD (880Ã—70)
    â”‚   â”œâ”€ QuestionCard (733Ã—94)
    â”‚   â”œâ”€ AlternativesGrid (788Ã—343)
    â”‚   â””â”€ FooterHUD (1202Ã—626)
    â”œâ”€ StreakSystem (business logic)
    â”œâ”€ PixelPerfectDebugger (dev tools)
    â””â”€ LayoutExporter (debug export)
```

---

## ðŸ“ Estrutura do Projeto

```
trivia-educa-v0/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ config/          # Constantes e configuraÃ§Ãµes
â”‚   â”œâ”€â”€ core/            # Application, SceneManager, BaseScene
â”‚   â”œâ”€â”€ scenes/          # Cenas do jogo (Boot, Menu, Game, Results, Ranking)
â”‚   â”œâ”€â”€ ui/              # Componentes UI reutilizÃ¡veis
â”‚   â”œâ”€â”€ ecs/             # Entity-Component-System
â”‚   â”œâ”€â”€ game/            # LÃ³gica de gameplay (FSM, scoring, combos)
â”‚   â”œâ”€â”€ data/            # Modelos, repositories, API client
â”‚   â”œâ”€â”€ storage/         # IndexedDB, cache, sincronizaÃ§Ã£o
â”‚   â”œâ”€â”€ telemetry/       # Eventos e mÃ©tricas
â”‚   â”œâ”€â”€ audio/           # Gerenciamento de Ã¡udio
â”‚   â””â”€â”€ utils/           # Helpers e utilitÃ¡rios
â”œâ”€â”€ tests/               # Testes (unit, integration, e2e, performance)
â”œâ”€â”€ public/              # Assets estÃ¡ticos
â””â”€â”€ docs/                # DocumentaÃ§Ã£o tÃ©cnica
```

---

## ðŸ› ï¸ Scripts DisponÃ­veis

| Comando | DescriÃ§Ã£o |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (hot-reload) |
| `npm run build` | Build de produÃ§Ã£o (otimizado) |
| `npm run preview` | Preview do build de produÃ§Ã£o |
| `npm run lint` | Roda ESLint (falha se houver warnings) |
| `npm run lint:fix` | Corrige problemas de lint automaticamente |
| `npm run format` | Formata cÃ³digo com Prettier |
| `npm run format:check` | Verifica formataÃ§Ã£o |
| `npm test` | Roda testes em watch mode |
| `npm run test:unit` | Testes unitÃ¡rios com coverage |
| `npm run test:integration` | Testes de integraÃ§Ã£o |
| `npm run test:e2e` | Testes end-to-end (Playwright) |
| `npm run test:e2e:ui` | E2E com UI interativa |
| `npm run test:performance` | Testes de performance (FPS, memÃ³ria) |
| `npm run test:visual` | Atualiza snapshots visuais |
| `npm run analyze` | Analisa tamanho do bundle |
| `npm run layout:sync -- --scene <nome>` | Regenera tokens/baseline da cena informada (ex.: `game`, `menu`) |
| `npm run layout:slice <scene>` | Recorta o gabarito SVG da cena em sprites `public/assets/layout/<scene>/` |

### Workflow de gabaritos por tela
1. **Exportar do Figma**: para cada tela, exporte o SVG completo (`gabarito-game.svg`, `gabarito-menu.svg` etc.) para `public/`.
2. **Gerar sprites estáticos**: execute `npm run layout:slice <scene>` para criar os recortes (header, question-card, alternativas, footer) em `public/assets/layout/<scene>/`.
3. **Validar slices**: rode `npm run layout:validate <scene>` e garanta que as dimensões dos PNGs coincidem com o baseline.
4. **Atualizar tokens**: use `npm run layout:sync -- --scene <scene>` para gerar `generatedLayout-<scene>.ts` e `layoutBaseline-<scene>.json`.
5. **Consumir na cena**: carregue os sprites com Pixi `Sprite.from` e sobreponha textos/estados dinâmicos usando os tokens.
6. **Atualizar sempre que o layout mudar**: repita os passos 1-4 após cada nova exportação do Figma.

---

## ðŸŽ¨ Stack TecnolÃ³gica

| Camada | Tecnologia | VersÃ£o |
|--------|------------|--------|
| **Rendering** | Pixi.js | 8.0.5 |
| **Framework** | TypeScript + Vite | 5.4.2 + 5.1.6 |
| **AnimaÃ§Ãµes** | GSAP | 3.12.5 |
| **Ãudio** | Howler.js | 2.2.4 |
| **Estado** | XState | 5.9.1 |
| **Storage** | Dexie.js (IndexedDB) | 4.0.1 |
| **HTTP** | Axios | 1.6.7 |
| **Testes** | Vitest + Playwright | 1.3.1 + 1.42.1 |

---

## ðŸŽ¯ Arquitetura de Camadas

### Core Systems
- **Application**: InicializaÃ§Ã£o Pixi.js, setup responsivo, game loop
- **SceneManager**: Gerenciamento de cenas (Boot â†’ Menu â†’ Game â†’ Results)
- **BaseScene**: Classe abstrata para todas as cenas

### ECS (Entity-Component-System)
- **Components**: Timer, Score, Combo, Question, Answer, User
- **Systems**: TimerSystem, ScoringSystem, ComboSystem, RenderSystem

### FSM (Finite State Machine)
- **RoundStateMachine**: Idle â†’ Question â†’ Feedback â†’ Results
- **PauseStateMachine**: Pausa/resume

### PersistÃªncia (Offline-First)
- **IndexedDB**: Cache de questÃµes, perfil local, rodadas nÃ£o sincronizadas
- **SyncManager**: SincronizaÃ§Ã£o bidirecional com backend

---

## ðŸŽ® MecÃ¢nicas do Jogo

### Rodada PadrÃ£o
1. **10 questÃµes** por rodada (configurÃ¡vel)
2. **90 segundos** por questÃ£o (configurÃ¡vel)
3. **Feedback imediato** (correto/errado + explicaÃ§Ã£o)
4. **Combo (streak)**: multiplicador cresce a cada acerto consecutivo
5. **BÃ´nus de tempo**: segundos restantes convertem em pontos
6. **XP e moedas** com limites diÃ¡rios

### Sistema de PontuaÃ§Ã£o
```
Pontos = (Base Ã— Dificuldade Ã— Combo) + BÃ´nus Tempo

Base: 100 pontos
Dificuldade: 1.0 â†’ 3.0
Combo: 1.0x (0-2) â†’ 2.0x (10+)
BÃ´nus Tempo: 0-30 pontos
```

### Power-ups (3 usos cada)
- **Pedir Dica**: Mostra dica da questÃ£o
- **Remover Alternativa**: Remove 2 alternativas erradas
- **Pular QuestÃ£o**: Pula sem penalidade (nÃ£o soma pontos)

---

## ðŸ§ª Testes

### PirÃ¢mide de Testes
```
  /\    E2E (5%)         â† Fluxos crÃ­ticos
 /  \   Integration (15%) â† Repositories, storage
/____\  Unit (80%)        â† ECS systems, lÃ³gica pura
```

### Cobertura MÃ­nima
- **LÃ³gica crÃ­tica**: 80%
- **Componentes UI**: 60%
- **Overall**: 75%

### Executar Testes

```powershell
# Unit tests (rÃ¡pidos)
npm run test:unit

# E2E (requer build)
npm run build
npm run test:e2e

# Performance (valida budgets)
npm run test:performance
```

---

## ðŸ“Š Budgets de Performance

| MÃ©trica | Target (SLO) | AÃ§Ã£o se violado |
|---------|--------------|-----------------|
| FPS mÃ©dio | â‰¥ 60 | Fail build |
| p95 frame time | â‰¤ 16.6 ms | Fail build |
| Bundle inicial | â‰¤ 3 MB (gzipped) | Fail build |
| MemÃ³ria (heap) | â‰¤ 150 MB | Fail build |
| Load time | â‰¤ 3s (4G) | Warning |

---

## ðŸŒ VariÃ¡veis de Ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_API_BASE_URL=https://api.educacross.com.br
VITE_ENABLE_TELEMETRY=true
VITE_ENABLE_DEBUG=false
```

---

## ðŸš¢ Deploy

### Build de ProduÃ§Ã£o

```powershell
npm run build
```

Artefatos gerados em `dist/`.

### Preview Local

```powershell
npm run preview
```

---

## ðŸ“– DocumentaÃ§Ã£o Adicional

- [Arquitetura TÃ©cnica](docs/architecture.md)
- [MecÃ¢nicas de Jogo](docs/game-design.md)
- [IntegraÃ§Ã£o com API](docs/api-integration.md)
- [Telemetria e Privacidade](docs/telemetry.md)

---

## ðŸ¤ Contribuindo

1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Commit suas mudanÃ§as: `git commit -m 'feat: adiciona nova feature'`
3. Push: `git push origin feature/nova-feature`
4. Abra um Pull Request

### ConvenÃ§Ã£o de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova feature
- `fix:` CorreÃ§Ã£o de bug
- `docs:` DocumentaÃ§Ã£o
- `test:` Testes
- `perf:` Performance
- `refactor:` RefatoraÃ§Ã£o
- `style:` FormataÃ§Ã£o

---

## ðŸ“„ LicenÃ§a

Propriedade de Educacross Â© 2025

---

## ðŸ†˜ Suporte

- Email: suporte@educacross.com.br
- Issues: [GitHub Issues](https://github.com/fabioaap/Tivia-Educa-v0/issues)

---

**Status do Projeto**: ðŸš§ MVP em desenvolvimento (Sprint 1/4)


