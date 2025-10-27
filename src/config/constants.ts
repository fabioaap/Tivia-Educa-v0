import { LAYOUT_TOKENS } from './generatedLayout';
import { GAME_LAYOUT_ASSETS } from './layoutAssets';

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
  RESOLUTION: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
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

const QUESTION_FRAME = LAYOUT_TOKENS.QUESTION_CARD.frame;
const ALT_TOP_FRAME = LAYOUT_TOKENS.ALTERNATIVE_TOP_STRIP.frame;
const ALT_LEFT_FRAME = LAYOUT_TOKENS.ALTERNATIVE_LEFT_COL.frame;
const ALT_RIGHT_FRAME = LAYOUT_TOKENS.ALTERNATIVE_RIGHT_COL.frame;
const ALT_BOTTOM_FRAME = LAYOUT_TOKENS.FOOTER_PANEL.frame;

const ALT_TOP_CENTER = LAYOUT_TOKENS.ALTERNATIVE_TOP_STRIP.center;
const ALT_LEFT_CENTER = LAYOUT_TOKENS.ALTERNATIVE_LEFT_COL.center;
const ALT_RIGHT_CENTER = LAYOUT_TOKENS.ALTERNATIVE_RIGHT_COL.center;
const ALT_BOTTOM_CENTER = LAYOUT_TOKENS.FOOTER_PANEL.center;

const ALT_FRAMES = [ALT_TOP_FRAME, ALT_LEFT_FRAME, ALT_RIGHT_FRAME, ALT_BOTTOM_FRAME];
const ALT_CENTERS = {
  D: ALT_TOP_CENTER,
  A: ALT_LEFT_CENTER,
  B: ALT_RIGHT_CENTER,
  C: ALT_BOTTOM_CENTER,
} as const;

const ALT_BUTTON_WIDTH = Math.max(...ALT_FRAMES.map((frame) => frame.width));
const ALT_BUTTON_HEIGHT = Math.max(...ALT_FRAMES.map((frame) => frame.height));

const ALT_GRID_MIN_X = Math.min(
  ...Object.values(ALT_CENTERS).map((center) => center.x - ALT_BUTTON_WIDTH / 2),
);
const ALT_GRID_MAX_X = Math.max(
  ...Object.values(ALT_CENTERS).map((center) => center.x + ALT_BUTTON_WIDTH / 2),
);
const ALT_GRID_MIN_Y = Math.min(
  ...Object.values(ALT_CENTERS).map((center) => center.y - ALT_BUTTON_HEIGHT / 2),
);
const ALT_GRID_MAX_Y = Math.max(
  ...Object.values(ALT_CENTERS).map((center) => center.y + ALT_BUTTON_HEIGHT / 2),
);

const ALT_SLOT_OFFSETS = Object.fromEntries(
  Object.entries(ALT_CENTERS).map(([key, center]) => [
    key,
    {
      x: center.x - ALT_BUTTON_WIDTH / 2 - ALT_GRID_MIN_X,
      y: center.y - ALT_BUTTON_HEIGHT / 2 - ALT_GRID_MIN_Y,
    },
  ]),
) as Record<keyof typeof ALT_CENTERS, { x: number; y: number }>;

const ALT_GAP_HORIZONTAL = ALT_RIGHT_CENTER.x - ALT_LEFT_CENTER.x - ALT_BUTTON_WIDTH;
const ALT_GAP_TOP_TO_MID = ALT_LEFT_CENTER.y - ALT_TOP_CENTER.y - ALT_BUTTON_HEIGHT;
const ALT_GAP_MID_TO_BOTTOM = ALT_BOTTOM_CENTER.y - ALT_LEFT_CENTER.y - ALT_BUTTON_HEIGHT;

const FOOTER_FRAME = LAYOUT_TOKENS.FOOTER_STRIP.frame;
const POWERUP_LEFT_FRAME = LAYOUT_TOKENS.FOOTER_POWERUP_LEFT.frame;
const POWERUP_CENTER_FRAME = LAYOUT_TOKENS.FOOTER_POWERUP_CENTER.frame;
const POWERUP_RIGHT_FRAME = LAYOUT_TOKENS.FOOTER_POWERUP_RIGHT.frame;

// Layout measurements (pixel perfect 1920x1080)
// **COORDENADAS SVG GABARITO (fonte de verdade)**
// Extraído visualmente do SVG gabarito do Figma
// 
// Layout de 4 HUDs em canvas 1920x1080:
// 1. HeaderHUD (topo): Y=0, Height=70 (timer, avatar, buttons)
// 2. QuestionCard (questão): Y=230, Height=94 (pergunta centralizada)
// 3. AlternativesGrid (alternativas 2x2): Y=370, Height=343 (4 botões)
// 4. FooterHUD (botões power-up): Y=900 (~aproximadamente), Height=180 (3 botões com contadores)
//
export const LAYOUT = {
  HEADER: {
    X: 0,
    Y: 0,
    WIDTH: 1920,
    HEIGHT: 70,
    // Elementos internos
    AVATAR_X: 50,
    AVATAR_Y: 10,
    AVATAR_SIZE: 50,
    TIMER_X: 1300,
    TIMER_Y: 15,
    PROGRESS_BAR_X: 50,
    PROGRESS_BAR_Y: 50,
    PROGRESS_BAR_WIDTH: 1820,
    PROGRESS_BAR_HEIGHT: 8,
  },
  QUESTION_CARD: {
    X: QUESTION_FRAME.x,
    Y: QUESTION_FRAME.y,
    WIDTH: QUESTION_FRAME.width,
    HEIGHT: QUESTION_FRAME.height,
    TEXT_X: 20,
    TEXT_Y: 12,
    TEXT_WIDTH: 1100,
    TEXT_HEIGHT: 70,
  },
  ALTERNATIVES_GRID: {
    X: ALT_GRID_MIN_X,
    Y: ALT_GRID_MIN_Y,
    WIDTH: ALT_GRID_MAX_X - ALT_GRID_MIN_X,
    HEIGHT: ALT_GRID_MAX_Y - ALT_GRID_MIN_Y,
    BUTTON_WIDTH: ALT_BUTTON_WIDTH,
    BUTTON_HEIGHT: ALT_BUTTON_HEIGHT,
    GAP_HORIZONTAL: ALT_GAP_HORIZONTAL,
    GAP_TOP_TO_MID: ALT_GAP_TOP_TO_MID,
    GAP_MID_TO_BOTTOM: ALT_GAP_MID_TO_BOTTOM,
    SLOTS: ALT_SLOT_OFFSETS,
    // Backwards compatibility (usado pelos componentes antigos)
    D_X: ALT_SLOT_OFFSETS.D.x,
    D_Y: ALT_SLOT_OFFSETS.D.y,
    D_WIDTH: ALT_BUTTON_WIDTH,
    D_HEIGHT: ALT_BUTTON_HEIGHT,
    A_X: ALT_SLOT_OFFSETS.A.x,
    A_Y: ALT_SLOT_OFFSETS.A.y,
    A_WIDTH: ALT_BUTTON_WIDTH,
    A_HEIGHT: ALT_BUTTON_HEIGHT,
    B_X: ALT_SLOT_OFFSETS.B.x,
    B_Y: ALT_SLOT_OFFSETS.B.y,
    B_WIDTH: ALT_BUTTON_WIDTH,
    B_HEIGHT: ALT_BUTTON_HEIGHT,
    C_X: ALT_SLOT_OFFSETS.C.x,
    C_Y: ALT_SLOT_OFFSETS.C.y,
    C_WIDTH: ALT_BUTTON_WIDTH,
    C_HEIGHT: ALT_BUTTON_HEIGHT,
  },
  FOOTER: {
    X: FOOTER_FRAME.x,
    Y: FOOTER_FRAME.y,
    WIDTH: FOOTER_FRAME.width,
    HEIGHT: FOOTER_FRAME.height,
    // Buttons (3 power-ups) posicionados horizontalmente
    HINT_BUTTON: {
      x: POWERUP_LEFT_FRAME.x,
      y: POWERUP_LEFT_FRAME.y,
      width: POWERUP_LEFT_FRAME.width,
      height: POWERUP_LEFT_FRAME.height,
    },
    REMOVE_BUTTON: {
      x: POWERUP_CENTER_FRAME.x,
      y: POWERUP_CENTER_FRAME.y,
      width: POWERUP_CENTER_FRAME.width,
      height: POWERUP_CENTER_FRAME.height,
    },
    SKIP_BUTTON: {
      x: POWERUP_RIGHT_FRAME.x,
      y: POWERUP_RIGHT_FRAME.y,
      width: POWERUP_RIGHT_FRAME.width,
      height: POWERUP_RIGHT_FRAME.height,
    },
    COUNTER_OFFSET_Y: 10, // Offset vertical para posicionar o contador acima do botão
  },
} as const;

export const LAYOUT_ASSETS = GAME_LAYOUT_ASSETS;

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
