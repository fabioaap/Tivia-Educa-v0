/**
 * AlternativesGrid - Grid 2x2 de alternativas (A, B, C, D)
 * Renderização nativa via Graphics (sem PNGs)
 * Coordenadas absolutas extraídas do Figma HTML
 */
import { Container, Graphics, Text } from 'pixi.js';
import { RoundButton } from '../primitives/RoundButton';
import { LAYOUT, COLORS, TYPOGRAPHY } from '../../config/constants';

interface Alternative {
  letter: string;
  text: string;
  isCorrect: boolean;
}

type SlotKey = 'A' | 'B' | 'C' | 'D';

interface AlternativeSlot {
  button: RoundButton;
  contentText: Text;
  letterBadge: Graphics;
  letterText: Text;
}

const SLOT_SEQUENCE: SlotKey[] = ['D', 'A', 'B', 'C'];

export class AlternativesGrid extends Container {
  private readonly slots = new Map<SlotKey, AlternativeSlot>();
  private readonly buttonWidth: number;
  private readonly buttonHeight: number;
  private readonly onSelect: (letter: string) => void;

  constructor(onSelect: (letter: string) => void) {
    super();
    this.sortableChildren = true;
    this.onSelect = onSelect;

    console.log('🎯 AlternativesGrid: creating native alternative buttons...');

    const gridLayout = LAYOUT.ALTERNATIVES_GRID;
    this.buttonWidth = gridLayout.BUTTON_WIDTH;
    this.buttonHeight = gridLayout.BUTTON_HEIGHT;

    SLOT_SEQUENCE.forEach((letter) => this.createSlot(letter));
  }

  private createSlot(letter: SlotKey): void {
    const gridLayout = LAYOUT.ALTERNATIVES_GRID;
    const slot = gridLayout.SLOTS[letter];
    if (!slot) {
      console.warn(`⚠️ Slot ${letter} not found in layout tokens.`);
      return;
    }

    const container = new Container();
    container.position.set(slot.x, slot.y);
    this.addChild(container);

    const button = new RoundButton({
      width: this.buttonWidth,
      height: this.buttonHeight,
      borderRadius: 36,
      bgColor: 0x0a1f33,
      bgAlpha: 0.95,
      hoverColor: 0x123754,
      pressedColor: 0x071424,
      borderColor: COLORS.PRIMARY_CYAN,
      borderWidth: 2,
      onClick: () => this.onSelect(letter),
    });
    container.addChild(button);

    const badge = new Graphics();
    badge.circle(this.buttonWidth * 0.06, this.buttonHeight / 2, 32);
    badge.fill({ color: COLORS.PRIMARY_CYAN, alpha: 0.18 });
    badge.circle(this.buttonWidth * 0.06, this.buttonHeight / 2, 32);
    badge.stroke({ width: 3, color: COLORS.PRIMARY_CYAN });
    container.addChild(badge);

    const letterText = new Text({
      text: letter,
      style: {
        fontFamily: TYPOGRAPHY.FONT_DISPLAY,
        fontSize: 26,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        fill: COLORS.PRIMARY_CYAN,
      },
    });
    letterText.anchor.set(0.5);
    letterText.position.set(this.buttonWidth * 0.06, this.buttonHeight / 2);
    container.addChild(letterText);

    const contentText = new Text({
      text: 'Texto placeholder',
      style: {
        fontFamily: TYPOGRAPHY.FONT_BODY,
        fontSize: TYPOGRAPHY.SIZES.ALTERNATIVE,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        fill: 0x7ff0ff,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: this.buttonWidth - 140,
        lineHeight: Math.round(TYPOGRAPHY.SIZES.ALTERNATIVE * 1.35),
      },
    });
    contentText.anchor.set(0, 0.5);
    contentText.position.set(this.buttonWidth * 0.18, this.buttonHeight / 2);
    container.addChild(contentText);

    this.slots.set(letter, {
      button,
      contentText,
      letterBadge: badge,
      letterText,
    });

    console.log(`✅ Slot ${letter} created at (${slot.x}, ${slot.y})`);
  }

  public setAlternatives(alternatives: Alternative[]): void {
    const byLetter = new Map<SlotKey, Alternative>();
    alternatives.forEach((alt) => {
      const letter = alt.letter.toUpperCase() as SlotKey;
      if (SLOT_SEQUENCE.includes(letter)) {
        byLetter.set(letter, alt);
      }
    });

    SLOT_SEQUENCE.forEach((letter) => {
      const slot = this.slots.get(letter);
      if (!slot) return;

      const alt = byLetter.get(letter);
      if (alt) {
        slot.contentText.text = alt.text;
        slot.letterText.text = letter;
        slot.contentText.alpha = 1;
        slot.button.alpha = 1;
        slot.button.tint = COLORS.TEXT_WHITE;
        slot.button.eventMode = 'static';
      } else {
        slot.contentText.text = '';
        slot.letterText.text = letter;
        slot.button.eventMode = 'none';
        slot.button.alpha = 0.5;
      }
    });
  }

  public disableButton(letter: string): void {
    const slot = this.slots.get(letter.toUpperCase() as SlotKey);
    if (!slot) return;
    slot.button.alpha = 0.45;
    slot.contentText.alpha = 0.45;
    slot.button.eventMode = 'none';
  }

  public enableButton(letter: string): void {
    const slot = this.slots.get(letter.toUpperCase() as SlotKey);
    if (!slot) return;
    slot.button.alpha = 1;
    slot.button.tint = COLORS.TEXT_WHITE;
    slot.contentText.alpha = 1;
    slot.button.eventMode = 'static';
  }

  public markCorrect(letter: string): void {
    const slot = this.slots.get(letter.toUpperCase() as SlotKey);
    if (!slot) return;
    slot.button.tint = COLORS.ACCENT_GREEN;
  }

  public markWrong(letter: string): void {
    const slot = this.slots.get(letter.toUpperCase() as SlotKey);
    if (!slot) return;
    slot.button.tint = COLORS.ACCENT_RED;
  }

  public reset(): void {
    this.slots.forEach((slot) => {
      slot.button.alpha = 1;
      slot.button.tint = COLORS.TEXT_WHITE;
      slot.button.eventMode = 'static';
      slot.contentText.alpha = 1;
      slot.contentText.text = '';
    });
  }
}
