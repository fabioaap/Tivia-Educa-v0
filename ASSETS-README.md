# Assets System - Sprite-Based UI

## Status Atual

✅ **Estrutura de pastas criada**  
✅ **Componentes refatorados para usar sprites**  
✅ **Alternative A exportada e funcionando**
✅ **Timer bg exportado e funcionando**
✅ **Power-ups exportados e funcionando**
❌ **Alternatives B/C/D FALTANDO**
🔄 **Aguardando exports do Figma**  

## ⚠️ ASSETS NECESSÁRIOS

### Alternativas GENÉRICAS (4 sprites apenas!)

**Pasta**: `/public/assets/ui/alternatives/`

Como as alternativas são **dinâmicas**, precisamos de apenas **1 conjunto genérico**:

- `alternative-normal.png` (490x110px) - Estado padrão
- `alternative-hovered.png` (490x110px) - Hover/focus
- `alternative-correct.png` (490x110px) - Resposta correta
- `alternative-wrong.png` (490x110px) - Resposta errada

**IMPORTANTE**: 
- ✅ Todos os botões (A/B/C/D/E...) usam os **mesmos sprites**
- ✅ A letra e texto são **dinâmicos** (renderizados por cima)
- ✅ Funciona com **qualquer número de alternativas**
- ✅ Fallback automático para Graphics se sprites não existirem

**Status**: Usando fallback (Graphics) - funciona mas não é pixel-perfect  

## Como Funciona

### Sistema Híbrido: Sprites + Fallback

Todos os componentes foram refatorados para:

1. **Tentar carregar sprites** do Figma (PNGs nas pastas `/assets/ui/`)
2. **Usar fallback automático** (Graphics procedurais) se sprites não existirem
3. **Animar suavemente** independente da fonte visual

### Componentes Atualizados

#### Timer (`src/ui/components/Timer.ts`)
- **Sprite esperado**: `/assets/ui/timer/bg.png` (90x90px)
- **Fallback**: Círculo desenhado via Graphics
- **Animação**: Arco de progresso (rotation ou Graphics)

#### AlternativeButton (`src/ui/components/AlternativeButton.ts`)
- **Sprites esperados**:
  - `/assets/ui/alternatives/a-normal.png`
  - `/assets/ui/alternatives/a-hovered.png`
  - `/assets/ui/alternatives/a-correct.png`
  - `/assets/ui/alternatives/a-wrong.png`
  - (repetir para b, c, d)
- **Fallback**: Retângulos com bordas via Graphics
- **Animação**: Troca de sprite + scale/glow

## Testando Agora

### O jogo funciona IMEDIATAMENTE sem sprites

1. Rode o servidor: `npm run dev`
2. Abra no navegador
3. Verá os componentes com **fallback visual** (Graphics)
4. Funcionalidade completa (timers, cliques, animações)

### Quando Adicionar Sprites do Figma

1. **Exporte os PNGs** seguindo o guia `FIGMA-EXPORT-GUIDE.md`
2. **Coloque nas pastas** correspondentes em `public/assets/ui/`
3. **Recarregue o navegador** (Ctrl+Shift+R)
4. Os componentes **automaticamente mudam** para usar os sprites
5. Fallback permanece para sprites não exportados

## Prioridade de Implementação

### Fase 1 (AGORA - Funciona com Fallback)
- [x] Timer component pronto
- [x] AlternativeButton component pronto
- [x] Sistema de fallback automático
- [x] Estrutura de pastas criada

### Fase 2 (Quando Você Exportar)
- [ ] Background estático: `backgrounds/tela-1-static.png`
- [ ] Timer bg: `ui/timer/bg.png`
- [ ] Alternativas (a/b/c/d): `ui/alternatives/{letter}-{state}.png`

### Fase 3 (Refinamento)
- [ ] Botões do header
- [ ] Power-ups
- [ ] Progress bar
- [ ] Efeitos e partículas

## Próximos Componentes a Refatorar

Quer que eu refatore mais componentes antes de você exportar? Posso fazer:

- [ ] **ProgressBar** (barra de progresso do header)
- [ ] **RoundedButton** (botões back/home/pause)
- [ ] **PowerUpButton** (botões de power-up do footer)

Ou prefere testar o sistema atual primeiro?

## Debug/Logs

Os componentes logam no console quando:
- ✅ Sprites carregados com sucesso
- ⚠️ Sprites não encontrados → usando fallback

Exemplo:
```
Timer sprites not found, using fallback graphics
Alternative sprites not found for a, using fallback
```

Isso é normal e esperado até você exportar os PNGs.

## Estrutura Final de Assets

```
public/assets/
├── backgrounds/
│   └── tela-1-static.png          # Fundo sem elementos dinâmicos
├── ui/
│   ├── timer/
│   │   ├── bg.png                 # Círculo do timer
│   │   └── progress.png           # (opcional) Arco animado
│   ├── buttons/
│   │   ├── back.png
│   │   ├── back-hover.png
│   │   ├── home.png
│   │   ├── pause.png
│   │   └── ...
│   ├── alternatives/
│   │   ├── a-normal.png
│   │   ├── a-hovered.png
│   │   ├── a-correct.png
│   │   ├── a-wrong.png
│   │   ├── b-normal.png
│   │   └── ...
│   ├── powerups/
│   │   ├── hint-button.png
│   │   ├── remove-button.png
│   │   └── skip-button.png
│   └── progress/
│       ├── bar-bg.png
│       └── bar-fill.png
```

## Perguntas Frequentes

### 1. O jogo funciona sem os sprites?
✅ **Sim!** Todos os componentes têm fallback visual via Graphics.

### 2. Preciso exportar tudo de uma vez?
❌ **Não!** Exporte aos poucos. O sistema usa sprites quando disponíveis e fallback para o resto.

### 3. Como sei se o sprite carregou?
📊 Verifique o console do navegador. Haverá mensagens sobre sprites carregados ou fallback.

### 4. Posso mudar os sprites sem recompilar?
✅ **Sim!** Basta substituir o PNG e recarregar o navegador (Ctrl+Shift+R).

### 5. E se o sprite tiver tamanho diferente?
🔧 Os componentes redimensionam automaticamente para o layout definido em `constants.ts`.
