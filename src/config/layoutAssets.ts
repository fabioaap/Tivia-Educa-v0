export const GAME_LAYOUT_ASSETS = {
  HEADER: 'assets/layout/game/header.png',
  QUESTION_CARD: 'assets/layout/game/question-card.png',
  ALTERNATIVES_GRID: 'assets/layout/game/alternatives-grid.png',
  ALTERNATIVE_TOP_STRIP: 'assets/layout/game/alternative-top-strip.png',
  ALTERNATIVE_LEFT_COL: 'assets/layout/game/alternative-left-col.png',
  ALTERNATIVE_RIGHT_COL: 'assets/layout/game/alternative-right-col.png',
  FOOTER: {
    PANEL: 'assets/layout/game/footer-panel.png',
    STRIP: 'assets/layout/game/footer-strip.png',
    POWERUP_LEFT: 'assets/layout/game/footer-powerup-left.png',
    POWERUP_CENTER: 'assets/layout/game/footer-powerup-center.png',
    POWERUP_RIGHT: 'assets/layout/game/footer-powerup-right.png',
  },
} as const;

export type GameLayoutAssetKey = keyof typeof GAME_LAYOUT_ASSETS;
