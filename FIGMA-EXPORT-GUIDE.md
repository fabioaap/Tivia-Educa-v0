# Guia de Exportação de Assets do Figma

## Configurações de Exportação
- **Formato**: PNG
- **Escala**: 3x (para retina/alta resolução)
- **Background**: Transparente
- **Qualidade**: Máxima

## Assets para Exportar

### 1. Background Estático
📁 `public/assets/backgrounds/`

- **tela-1-static.png** (1920x1080)
  - Remover: timer, progress bar, textos dinâmicos
  - Manter: bordas, glow ambiente, texturas, decorações fixas

### 2. Timer (Header)
📁 `public/assets/ui/timer/`

- **bg.png** (~90x90px) - Círculo de fundo do timer
- **progress.png** (~90x90px) - Arco de progresso (ou deixo animar via código)

### 3. Streak/Combo Indicator 🔥
📁 `public/assets/ui/streak/`

- **fire.png** (~120x140px) - Ícone do fogo/chama (muda de cor via código)
  - Exportar em laranja #FF9500 (cor base)
  - Sistema automaticamente tinta para outras cores conforme nível

### 4. Progress Bar (Header)
📁 `public/assets/ui/progress/`

- **bar-bg.png** (~600x50px) - Fundo da barra
- **bar-fill.png** (~600x50px) - Preenchimento (ou deixo animar via código)

### 5. Botões do Header
📁 `public/assets/ui/buttons/`

**Estados normais** (~60-80px cada):
- back.png
- home.png
- pause.png
- coin.png
- lives.png (coração)
- help.png
- settings.png

**Estados hover** (opcional, se tiver no Figma):
- back-hover.png
- home-hover.png
- etc.

### 5. Alternativas de Resposta
📁 `public/assets/ui/alternatives/`

**4 estados para cada alternativa** (~490x110px):
- a-normal.png
- a-hover.png
- a-correct.png (verde/brilho)
- a-wrong.png (vermelho)
- b-normal.png
- b-hover.png
- b-correct.png
- b-wrong.png
- c-normal.png
- c-hover.png
- c-correct.png
- c-wrong.png
- d-normal.png
- d-hover.png
- d-correct.png
- d-wrong.png

### 6. Power-ups (Footer)
📁 `public/assets/ui/powerups/`

**Botões completos** (~360-420x80px):
- hint-button.png
- remove-button.png
- skip-button.png

**Ícones individuais** (se preferir, ~32-48px):
- hint-icon.png
- remove-icon.png
- skip-icon.png

**Badges de contador** (~24x24px):
- badge-bg.png (círculo com número)

### 7. Efeitos/Partículas (Opcional)
📁 `public/assets/ui/effects/`

- star.png (~32x32px) - Para efeito de acerto
- glow-correct.png - Brilho verde
- glow-wrong.png - Brilho vermelho
- coin-icon.png - Ícone de moeda animado
- xp-icon.png - Ícone de XP

## Prioridade de Exportação

### Fase 1 (Essencial - faça primeiro):
1. tela-1-static.png (fundo sem elementos dinâmicos)
2. Timer: bg.png
3. Alternativas: a/b/c/d-normal.png, a/b/c/d-correct.png, a/b/c/d-wrong.png

### Fase 2 (Importante):
4. Botões do header (back, home, pause)
5. Power-ups (hint, remove, skip)
6. Progress bar (bg, fill)

### Fase 3 (Refinamento):
7. Estados hover
8. Efeitos e partículas
9. Ícones adicionais

## Onde Colocar os Arquivos

Depois de exportar, coloque os arquivos nas pastas correspondentes:

```
public/assets/
├── backgrounds/
│   └── tela-1-static.png
├── ui/
│   ├── timer/
│   │   └── bg.png
│   ├── buttons/
│   │   ├── back.png
│   │   ├── home.png
│   │   └── ...
│   ├── alternatives/
│   │   ├── a-normal.png
│   │   ├── a-correct.png
│   │   └── ...
│   ├── powerups/
│   │   └── ...
│   └── progress/
│       └── ...
```

## Checklist

- [ ] Background estático exportado
- [ ] Timer bg exportado
- [ ] 4 alternativas (normal) exportadas
- [ ] 4 alternativas (correct) exportadas
- [ ] 4 alternativas (wrong) exportadas
- [ ] Botões header exportados
- [ ] Power-ups exportados
- [ ] Progress bar exportada

## Dúvidas?

Se algum elemento for complexo demais para exportar ou tiver muitos estados, me avise que posso criar proceduralmente via código mantendo o estilo visual.
