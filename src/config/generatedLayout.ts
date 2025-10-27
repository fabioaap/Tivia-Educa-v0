// Este arquivo é gerado automaticamente por scripts/extract-layout.js
// Não edite manualmente. Execute `npm run layout:sync` após atualizar o SVG.

export const LAYOUT_TOKENS = {
  // Cartão de pergunta principal
  QUESTION_CARD: {
    frame: {
      x: 339.5,
      y: 196,
      width: 1243,
      height: 100,
      right: 1582.5,
      bottom: 296,
    },
    center: {
      x: 961,
      y: 246,
    },
  },

  // Faixa superior das alternativas
  ALTERNATIVE_TOP_STRIP: {
    frame: {
      x: 719,
      y: 333,
      width: 486,
      height: 120,
      right: 1205,
      bottom: 453,
    },
    center: {
      x: 962,
      y: 393,
    },
  },

  // Coluna esquerda das alternativas inferiores
  ALTERNATIVE_LEFT_COL: {
    frame: {
      x: 316,
      y: 562,
      width: 480,
      height: 120,
      right: 796,
      bottom: 682,
    },
    center: {
      x: 556,
      y: 622,
    },
  },

  // Coluna direita das alternativas inferiores
  ALTERNATIVE_RIGHT_COL: {
    frame: {
      x: 1121,
      y: 562,
      width: 486,
      height: 120,
      right: 1607,
      bottom: 682,
    },
    center: {
      x: 1364,
      y: 622,
    },
  },

  // Painel inferior lateral (botão principal)
  FOOTER_PANEL: {
    frame: {
      x: 719,
      y: 790,
      width: 486,
      height: 120,
      right: 1205,
      bottom: 910,
    },
    center: {
      x: 962,
      y: 850,
    },
  },

  // Faixa inferior completa (HUD footer)
  FOOTER_STRIP: {
    frame: {
      x: 90.143,
      y: 957,
      width: 1778,
      height: 126,
      right: 1868.143,
      bottom: 1083,
    },
    center: {
      x: 979.143,
      y: 1020,
    },
  },

  // Botão power-up esquerdo
  FOOTER_POWERUP_LEFT: {
    frame: {
      x: 346.143,
      y: 993,
      width: 54,
      height: 54,
      right: 400.143,
      bottom: 1047,
    },
    center: {
      x: 373.143,
      y: 1020,
    },
  },

  // Botão power-up central
  FOOTER_POWERUP_CENTER: {
    frame: {
      x: 697.143,
      y: 993,
      width: 54,
      height: 54,
      right: 751.143,
      bottom: 1047,
    },
    center: {
      x: 724.143,
      y: 1020,
    },
  },

  // Botão power-up direito
  FOOTER_POWERUP_RIGHT: {
    frame: {
      x: 1224.14,
      y: 993,
      width: 54,
      height: 54,
      right: 1278.14,
      bottom: 1047,
    },
    center: {
      x: 1251.14,
      y: 1020,
    },
  },

} as const;

export type LayoutTokenKey = keyof typeof LAYOUT_TOKENS;
