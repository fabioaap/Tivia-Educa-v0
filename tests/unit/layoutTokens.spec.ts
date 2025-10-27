import { describe, it, expect } from 'vitest';
import { LAYOUT } from '@config/constants';
import { LAYOUT_TOKENS } from '@config/generatedLayout';
import baseline from '@config/layoutBaseline.json' assert { type: 'json' };

type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

type TokenBaseline = {
  frame: Frame;
  center: {
    x: number;
    y: number;
  };
};

const baselineData = baseline as Record<keyof typeof LAYOUT_TOKENS, TokenBaseline>;
const EPSILON = 1;

const expectClose = (actual: number, expected: number, label: string) => {
  const diff = Math.abs(actual - expected);
  expect(diff, `${label} | esperado=${expected} obtido=${actual}`).toBeLessThanOrEqual(EPSILON);
};

const getBaseline = (key: keyof typeof LAYOUT_TOKENS): TokenBaseline => {
  const value = baselineData[key];
  if (!value) {
    throw new Error(`Baseline ausente para ${key}`);
  }
  return value;
};

describe('Automação de layout', () => {
  it('tokens gerados conferem com o baseline extraído do SVG', () => {
    (Object.keys(LAYOUT_TOKENS) as Array<keyof typeof LAYOUT_TOKENS>).forEach((key) => {
      const token = LAYOUT_TOKENS[key];
      const base = getBaseline(key);
      expect(token.frame).toMatchObject(base.frame);
      expect(token.center).toMatchObject(base.center);
    });
  });

  it('QuestionCard usa as coordenadas do baseline', () => {
    const base = getBaseline('QUESTION_CARD');
    expectClose(LAYOUT.QUESTION_CARD.X, base.frame.x, 'QuestionCard.x');
    expectClose(LAYOUT.QUESTION_CARD.Y, base.frame.y, 'QuestionCard.y');
    expectClose(LAYOUT.QUESTION_CARD.WIDTH, base.frame.width, 'QuestionCard.width');
    expectClose(LAYOUT.QUESTION_CARD.HEIGHT, base.frame.height, 'QuestionCard.height');
  });

  it('AlternativesGrid normaliza slots com base no baseline', () => {
    const grid = LAYOUT.ALTERNATIVES_GRID;
    const top = getBaseline('ALTERNATIVE_TOP_STRIP');
    const left = getBaseline('ALTERNATIVE_LEFT_COL');
    const right = getBaseline('ALTERNATIVE_RIGHT_COL');
    const bottom = getBaseline('FOOTER_PANEL');

    const frames = [top.frame, left.frame, right.frame, bottom.frame];
    const centers = {
      D: top.center,
      A: left.center,
      B: right.center,
      C: bottom.center,
    } as const;

    const expectedWidth = Math.max(...frames.map((frame) => frame.width));
    const expectedHeight = Math.max(...frames.map((frame) => frame.height));

    expectClose(grid.BUTTON_WIDTH, expectedWidth, 'Alternatives button width');
    expectClose(grid.BUTTON_HEIGHT, expectedHeight, 'Alternatives button height');

  const expectedOriginX = Math.min(...Object.values(centers).map((center) => center.x - expectedWidth / 2));
  const expectedOriginY = Math.min(...Object.values(centers).map((center) => center.y - expectedHeight / 2));

    expectClose(grid.X, expectedOriginX, 'AlternativesGrid.x');
    expectClose(grid.Y, expectedOriginY, 'AlternativesGrid.y');

    const expectedWidthTotal = Math.max(...Object.values(centers).map((center) => center.x + expectedWidth / 2)) - expectedOriginX;
    const expectedHeightTotal = Math.max(...Object.values(centers).map((center) => center.y + expectedHeight / 2)) - expectedOriginY;
    expectClose(grid.WIDTH, expectedWidthTotal, 'AlternativesGrid.width');
    expectClose(grid.HEIGHT, expectedHeightTotal, 'AlternativesGrid.height');

  const expectedGapHorizontal = centers.B.x - centers.A.x - expectedWidth;
  const expectedGapTopToMid = centers.A.y - centers.D.y - expectedHeight;
  const expectedGapMidToBottom = centers.C.y - centers.A.y - expectedHeight;

  expectClose(grid.GAP_HORIZONTAL, expectedGapHorizontal, 'Alternatives gap horizontal');
  expectClose(grid.GAP_TOP_TO_MID, expectedGapTopToMid, 'Alternatives gap top-mid');
  expectClose(grid.GAP_MID_TO_BOTTOM, expectedGapMidToBottom, 'Alternatives gap mid-bottom');

    (['D', 'A', 'B', 'C'] as const).forEach((letter) => {
      const center = centers[letter];
      const expectedX = center.x - expectedWidth / 2 - expectedOriginX;
      const expectedY = center.y - expectedHeight / 2 - expectedOriginY;
      expectClose(grid.SLOTS[letter].x, expectedX, `Slot ${letter}.x`);
      expectClose(grid.SLOTS[letter].y, expectedY, `Slot ${letter}.y`);
    });
  });

  it('FooterHUD usa as coordenadas globais do baseline', () => {
    const strip = getBaseline('FOOTER_STRIP').frame;
    const hint = getBaseline('FOOTER_POWERUP_LEFT').frame;
    const remove = getBaseline('FOOTER_POWERUP_CENTER').frame;
    const skip = getBaseline('FOOTER_POWERUP_RIGHT').frame;

    expectClose(LAYOUT.FOOTER.X, strip.x, 'Footer.x');
    expectClose(LAYOUT.FOOTER.Y, strip.y, 'Footer.y');
    expectClose(LAYOUT.FOOTER.WIDTH, strip.width, 'Footer.width');
    expectClose(LAYOUT.FOOTER.HEIGHT, strip.height, 'Footer.height');

    expectClose(LAYOUT.FOOTER.HINT_BUTTON.x, hint.x, 'Footer hint.x');
    expectClose(LAYOUT.FOOTER.HINT_BUTTON.y, hint.y, 'Footer hint.y');
    expectClose(LAYOUT.FOOTER.REMOVE_BUTTON.x, remove.x, 'Footer remove.x');
    expectClose(LAYOUT.FOOTER.REMOVE_BUTTON.y, remove.y, 'Footer remove.y');
    expectClose(LAYOUT.FOOTER.SKIP_BUTTON.x, skip.x, 'Footer skip.x');
    expectClose(LAYOUT.FOOTER.SKIP_BUTTON.y, skip.y, 'Footer skip.y');
  });
});
