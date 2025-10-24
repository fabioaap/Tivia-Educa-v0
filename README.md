# Trivia Educacross v0

Jogo de perguntas-e-respostas educacional com gamificação (pontuação, combos, rankings e recompensas).

## 🚀 Quick Start

### Pré-requisitos

- Node.js ≥ 20.0.0
- npm ≥ 10.0.0

### Instalação

```powershell
# Clone o repositório
git clone https://github.com/fabioaap/Tivia-Educa-v0.git
cd Tivia-Educa-v0

# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
trivia-educa-v0/
├── src/
│   ├── config/          # Constantes e configurações
│   ├── core/            # Application, SceneManager, BaseScene
│   ├── scenes/          # Cenas do jogo (Boot, Menu, Game, Results, Ranking)
│   ├── ui/              # Componentes UI reutilizáveis
│   ├── ecs/             # Entity-Component-System
│   ├── game/            # Lógica de gameplay (FSM, scoring, combos)
│   ├── data/            # Modelos, repositories, API client
│   ├── storage/         # IndexedDB, cache, sincronização
│   ├── telemetry/       # Eventos e métricas
│   ├── audio/           # Gerenciamento de áudio
│   └── utils/           # Helpers e utilitários
├── tests/               # Testes (unit, integration, e2e, performance)
├── public/              # Assets estáticos
└── docs/                # Documentação técnica
```

---

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (hot-reload) |
| `npm run build` | Build de produção (otimizado) |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Roda ESLint (falha se houver warnings) |
| `npm run lint:fix` | Corrige problemas de lint automaticamente |
| `npm run format` | Formata código com Prettier |
| `npm run format:check` | Verifica formatação |
| `npm test` | Roda testes em watch mode |
| `npm run test:unit` | Testes unitários com coverage |
| `npm run test:integration` | Testes de integração |
| `npm run test:e2e` | Testes end-to-end (Playwright) |
| `npm run test:e2e:ui` | E2E com UI interativa |
| `npm run test:performance` | Testes de performance (FPS, memória) |
| `npm run test:visual` | Atualiza snapshots visuais |
| `npm run analyze` | Analisa tamanho do bundle |

---

## 🎨 Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| **Rendering** | Pixi.js | 8.0.5 |
| **Framework** | TypeScript + Vite | 5.4.2 + 5.1.6 |
| **Animações** | GSAP | 3.12.5 |
| **Áudio** | Howler.js | 2.2.4 |
| **Estado** | XState | 5.9.1 |
| **Storage** | Dexie.js (IndexedDB) | 4.0.1 |
| **HTTP** | Axios | 1.6.7 |
| **Testes** | Vitest + Playwright | 1.3.1 + 1.42.1 |

---

## 🎯 Arquitetura de Camadas

### Core Systems
- **Application**: Inicialização Pixi.js, setup responsivo, game loop
- **SceneManager**: Gerenciamento de cenas (Boot → Menu → Game → Results)
- **BaseScene**: Classe abstrata para todas as cenas

### ECS (Entity-Component-System)
- **Components**: Timer, Score, Combo, Question, Answer, User
- **Systems**: TimerSystem, ScoringSystem, ComboSystem, RenderSystem

### FSM (Finite State Machine)
- **RoundStateMachine**: Idle → Question → Feedback → Results
- **PauseStateMachine**: Pausa/resume

### Persistência (Offline-First)
- **IndexedDB**: Cache de questões, perfil local, rodadas não sincronizadas
- **SyncManager**: Sincronização bidirecional com backend

---

## 🎮 Mecânicas do Jogo

### Rodada Padrão
1. **10 questões** por rodada (configurável)
2. **90 segundos** por questão (configurável)
3. **Feedback imediato** (correto/errado + explicação)
4. **Combo (streak)**: multiplicador cresce a cada acerto consecutivo
5. **Bônus de tempo**: segundos restantes convertem em pontos
6. **XP e moedas** com limites diários

### Sistema de Pontuação
```
Pontos = (Base × Dificuldade × Combo) + Bônus Tempo

Base: 100 pontos
Dificuldade: 1.0 → 3.0
Combo: 1.0x (0-2) → 2.0x (10+)
Bônus Tempo: 0-30 pontos
```

### Power-ups (3 usos cada)
- **Pedir Dica**: Mostra dica da questão
- **Remover Alternativa**: Remove 2 alternativas erradas
- **Pular Questão**: Pula sem penalidade (não soma pontos)

---

## 🧪 Testes

### Pirâmide de Testes
```
  /\    E2E (5%)         ← Fluxos críticos
 /  \   Integration (15%) ← Repositories, storage
/____\  Unit (80%)        ← ECS systems, lógica pura
```

### Cobertura Mínima
- **Lógica crítica**: 80%
- **Componentes UI**: 60%
- **Overall**: 75%

### Executar Testes

```powershell
# Unit tests (rápidos)
npm run test:unit

# E2E (requer build)
npm run build
npm run test:e2e

# Performance (valida budgets)
npm run test:performance
```

---

## 📊 Budgets de Performance

| Métrica | Target (SLO) | Ação se violado |
|---------|--------------|-----------------|
| FPS médio | ≥ 60 | Fail build |
| p95 frame time | ≤ 16.6 ms | Fail build |
| Bundle inicial | ≤ 3 MB (gzipped) | Fail build |
| Memória (heap) | ≤ 150 MB | Fail build |
| Load time | ≤ 3s (4G) | Warning |

---

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_API_BASE_URL=https://api.educacross.com.br
VITE_ENABLE_TELEMETRY=true
VITE_ENABLE_DEBUG=false
```

---

## 🚢 Deploy

### Build de Produção

```powershell
npm run build
```

Artefatos gerados em `dist/`.

### Preview Local

```powershell
npm run preview
```

---

## 📖 Documentação Adicional

- [Arquitetura Técnica](docs/architecture.md)
- [Mecânicas de Jogo](docs/game-design.md)
- [Integração com API](docs/api-integration.md)
- [Telemetria e Privacidade](docs/telemetry.md)

---

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
3. Push: `git push origin feature/nova-feature`
4. Abra um Pull Request

### Convenção de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Documentação
- `test:` Testes
- `perf:` Performance
- `refactor:` Refatoração
- `style:` Formatação

---

## 📄 Licença

Propriedade de Educacross © 2025

---

## 🆘 Suporte

- Email: suporte@educacross.com.br
- Issues: [GitHub Issues](https://github.com/fabioaap/Tivia-Educa-v0/issues)

---

**Status do Projeto**: 🚧 MVP em desenvolvimento (Sprint 1/4)
