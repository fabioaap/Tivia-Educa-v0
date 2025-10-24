// Design constants (pixel perfect para 1920x1080 base)
export const DESIGN = {
  WIDTH: 1920,
  HEIGHT: 1080,
  ASPECT_RATIO: 16 / 9,
} as const;

// Pixi.js configuration
export const GAME_CONFIG = {
  WIDTH: DESIGN.WIDTH,
  HEIGHT: DESIGN.HEIGHT,
  BACKGROUND_COLOR: 0x000814,
  RESOLUTION: window.devicePixelRatio || 1,
  ANTIALIAS: true,
  AUTORESIZE: true,
} as const;

// Round configuration
export const ROUND_CONFIG = {
  QUESTIONS_PER_ROUND: 10,
  TIME_PER_QUESTION_MS: 90000, // 1:30 (90s)
  FEEDBACK_DURATION_MS: 2000, // 2s
  TRANSITION_DURATION_MS: 400, // 0.4s
} as const;

// Score configuration
export const SCORE_CONFIG = {
  BASE_POINTS: 100,
  TIME_BONUS_MAX: 30,
  DIFFICULTY_MULTIPLIERS: {
    1: 1.0, // Muito fácil
    2: 1.5, // Fácil
    3: 2.0, // Médio
    4: 2.5, // Difícil
    5: 3.0, // Muito difícil
  },
  COMBO_THRESHOLDS: [
    { min: 0, max: 2, multiplier: 1.0 },
    { min: 3, max: 5, multiplier: 1.2 },
    { min: 6, max: 9, multiplier: 1.5 },
    { min: 10, max: Infinity, multiplier: 2.0 },
  ],
} as const;

// Reward configuration
export const REWARD_CONFIG = {
  XP_PER_POINT: 1,
  COINS_PER_500_POINTS: 1,
  MAX_XP_PER_SESSION: 5000,
  MAX_COINS_PER_SESSION: 50,
  MAX_XP_PER_DAY: 15000,
  MAX_COINS_PER_DAY: 150,
} as const;

// Power-ups configuration
export const POWERUP_CONFIG = {
  HINT: {
    MAX_USES: 3,
    COST_COINS: 0, // Grátis no MVP
  },
  REMOVE_ALTERNATIVE: {
    MAX_USES: 3,
    COST_COINS: 0,
  },
  SKIP_QUESTION: {
    MAX_USES: 3,
    COST_COINS: 0,
  },
} as const;

// Colors (Figma palette - ciano tech theme)
export const COLORS = {
  PRIMARY_CYAN: 0x00d9ff,
  SECONDARY_CYAN: 0x00a8cc,
  BG_DARK: 0x000814,
  BG_DARKER: 0x000a14,
  TEXT_WHITE: 0xffffff,
  TEXT_GRAY: 0xb0bec5,
  ACCENT_GREEN: 0x00ff88,
  ACCENT_ORANGE: 0xff6b35,
  ACCENT_YELLOW: 0xffd700,
  ACCENT_RED: 0xff0000,
  GLASS_BG: 0x001428, // rgba(0, 20, 40, 0.7)
} as const;

// Color strings for GSAP/CSS
export const COLOR_STRINGS = {
  PRIMARY_CYAN: '#00D9FF',
  SECONDARY_CYAN: '#00A8CC',
  BG_DARK: '#000814',
  BG_GLASS: 'rgba(0, 20, 40, 0.7)',
  TEXT_WHITE: '#FFFFFF',
  TEXT_GRAY: '#B0BEC5',
  ACCENT_GREEN: '#00FF88',
  ACCENT_ORANGE: '#FF6B35',
  ACCENT_YELLOW: '#FFD700',
  ACCENT_RED: '#FF0000',
  GLOW_CYAN: 'rgba(0, 217, 255, 0.6)',
  GLOW_YELLOW: 'rgba(255, 215, 0, 0.8)',
  GLOW_GREEN: 'rgba(0, 255, 136, 0.6)',
  GLOW_RED: 'rgba(255, 0, 0, 0.6)',
} as const;

// Layout measurements (pixel perfect 1920x1080)
export const LAYOUT = {
  HEADER: {
    HEIGHT: 100,
    PADDING: 30,
    BACK_BUTTON: { x: 30, y: 30, size: 80 },
    HOME_BUTTON: { x: 130, y: 30, size: 80 },
    PROGRESS_BAR: { x: 735, y: 40, width: 600, height: 50 },
    AVATAR: { x: 1100, y: 25, size: 100 },
    TIMER: { x: 1230, y: 30, size: 90 },
    COINS: { x: 1500, y: 35, size: 60 },
    LIVES: { x: 1590, y: 35, size: 60 },
    HELP: { x: 1680, y: 35, size: 60 },
    SETTINGS: { x: 1770, y: 35, size: 60 },
    PAUSE: { x: 1850, y: 30, size: 60 },
  },
  QUESTION: {
    CONTAINER: { x: 410, y: 300, width: 1100, minHeight: 600 },
    TEXT: { paddingX: 60, paddingY: 40 },
    ENUNCIADO: { x: 610, y: 480, width: 700, height: 140 },
    ALTERNATIVES_GRID: { x: 460, y: 660, width: 1000, height: 240 },
    ALTERNATIVE: { width: 490, height: 110, gapX: 20, gapY: 20 },
  },
  FOOTER: {
    HEIGHT: 120,
    Y: 960,
    HINT_BUTTON: { x: 285, y: 980, width: 400, height: 80 },
    REMOVE_BUTTON: { x: 760, y: 980, width: 420, height: 80 },
    SKIP_BUTTON: { x: 1280, y: 980, width: 360, height: 80 },
  },
} as const;

// Typography
export const TYPOGRAPHY = {
  FONT_DISPLAY: 'Orbitron',
  FONT_BODY: 'Exo 2',
  SIZES: {
    PROGRESS_LABEL: 18,
    TIMER: 24,
    QUESTION: 28,
    ENUNCIADO: 24,
    ALTERNATIVE: 20,
    BUTTON: 18,
    COMBO: 32,
    BADGE: 16,
  },
  WEIGHTS: {
    REGULAR: '400',
    MEDIUM: '500',
    BOLD: '700',
    BLACK: '900',
  },
} as const;

// Animation durations (ms)
export const ANIMATIONS = {
  BUTTON_HOVER: 200,
  BUTTON_PRESS: 100,
  QUESTION_ENTER: 600,
  QUESTION_EXIT: 400,
  FEEDBACK: 800,
  COMBO_SURGE: 500,
  SHAKE: 500,
  PULSE: 300,
  GLOW_FADE: 200,
} as const;

// Z-index layers
export const Z_INDEX = {
  BACKGROUND: 0,
  QUESTION: 50,
  HUD: 100,
  EFFECTS: 200,
  MODAL: 300,
} as const;

// Accessibility
export const ACCESSIBILITY = {
  MIN_TOUCH_SIZE: 44, // WCAG 2.1 AA
  FOCUS_OUTLINE_WIDTH: 3,
  CONTRAST_RATIO_MIN: 4.5, // WCAG 2.1 AA
} as const;
