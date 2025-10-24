import { Container, Graphics, Text } from 'pixi.js';
import { COLORS, TYPOGRAPHY, ANIMATIONS } from '@config/constants';
import gsap from 'gsap';

export type AlternativeState = 'normal' | 'hovered' | 'selected' | 'correct' | 'wrong' | 'disabled';

export interface AlternativeButtonConfig {
  width: number;
  height: number;
  letter: string; // A, B, C, D, E
  text: string;
}

export class AlternativeButton extends Container {
  private bg: Graphics;
  private letterText: Text;
  private contentText: Text;
  private config: AlternativeButtonConfig;
  private _state: AlternativeState = 'normal';
  private glowFilter?: gsap.core.Tween;

  public onClick?: () => void;

  constructor(config: AlternativeButtonConfig) {
    super();
    this.config = config;

    // Background
    this.bg = new Graphics();
    this.addChild(this.bg);

    // Letra (A, B, C, D)
    this.letterText = new Text({
      text: config.letter,
      style: {
        fontFamily: TYPOGRAPHY.FONT_DISPLAY,
        fontSize: 24,
        fill: COLORS.PRIMARY_CYAN,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      },
    });
    this.letterText.anchor.set(0.5);
    this.letterText.position.set(40, config.height / 2);
    this.addChild(this.letterText);

    // Texto da alternativa
    this.contentText = new Text({
      text: config.text,
      style: {
        fontFamily: TYPOGRAPHY.FONT_BODY,
        fontSize: TYPOGRAPHY.SIZES.ALTERNATIVE,
        fill: COLORS.TEXT_WHITE,
        fontWeight: TYPOGRAPHY.WEIGHTS.MEDIUM,
        wordWrap: true,
        wordWrapWidth: config.width - 100,
      },
    });
    this.contentText.anchor.set(0, 0.5);
    this.contentText.position.set(70, config.height / 2);
    this.addChild(this.contentText);

    this.draw();
    this.setupInteraction();
  }

  private draw(): void {
    this.bg.clear();

    const { width, height } = this.config;
    let bgColor = 0x0a1a2a;
    let borderColor: number = COLORS.PRIMARY_CYAN;
    let borderWidth = 2;

    switch (this._state) {
      case 'hovered':
        bgColor = 0x0f2538;
        borderWidth = 3;
        break;
      case 'selected':
        borderColor = COLORS.ACCENT_YELLOW;
        borderWidth = 4;
        bgColor = 0x1a1a00;
        break;
      case 'correct':
        borderColor = COLORS.ACCENT_GREEN;
        borderWidth = 4;
        bgColor = 0x001a0a;
        break;
      case 'wrong':
        borderColor = COLORS.ACCENT_RED;
        borderWidth = 4;
        bgColor = 0x1a0000;
        break;
      case 'disabled':
        bgColor = 0x050a0f;
        borderColor = 0x333333;
        break;
    }

    // Background com gradiente sutil
    this.bg.roundRect(0, 0, width, height, 15);
    this.bg.fill(bgColor);

    // Border
    this.bg.roundRect(0, 0, width, height, 15);
    this.bg.stroke({ width: borderWidth, color: borderColor });
  }

  private setupInteraction(): void {
    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointerover', () => {
      if (this._state === 'normal' || this._state === 'selected') {
        const previousState = this._state;
        this._state = 'hovered';
        this.draw();
        this.animateScale(1.05);
        // Restaura estado anterior se era selected
        if (previousState === 'selected') {
          this._state = 'selected';
        }
      }
    });

    this.on('pointerout', () => {
      if (this._state === 'hovered') {
        this._state = 'normal';
        this.draw();
        this.animateScale(1.0);
      }
    });

    this.on('pointerdown', () => {
      if (this._state === 'normal' || this._state === 'hovered' || this._state === 'selected') {
        this.onClick?.();
      }
    });
  }

  private animateScale(scale: number): void {
    gsap.to(this.scale, {
      x: scale,
      y: scale,
      duration: ANIMATIONS.BUTTON_HOVER / 1000,
      ease: 'power1.out',
    });
  }

  public setState(state: AlternativeState): void {
    this._state = state;
    this.draw();

    // Animações especiais
    if (state === 'correct') {
      this.animateCorrect();
    } else if (state === 'wrong') {
      this.animateWrong();
    } else if (state === 'selected') {
      this.animateSelected();
    }

    // Desabilita interação em estados finais
    if (state === 'correct' || state === 'wrong' || state === 'disabled') {
      this.eventMode = 'none';
      this.cursor = 'default';
    } else {
      this.eventMode = 'static';
      this.cursor = 'pointer';
    }
  }

  private animateCorrect(): void {
    gsap.to(this.scale, {
      x: 1.05,
      y: 1.05,
      duration: 0.3,
      ease: 'elastic.out(1, 0.5)',
    });
  }

  private animateWrong(): void {
    gsap.to(this, {
      x: this.x - 10,
      duration: 0.05,
      yoyo: true,
      repeat: 5,
      ease: 'power1.inOut',
      onComplete: () => {
        this.x = 0;
      },
    });
  }

  private animateSelected(): void {
    gsap.to(this.scale, {
      x: 1.02,
      y: 1.02,
      duration: 0.2,
      ease: 'back.out(1.7)',
    });
  }

  public getState(): AlternativeState {
    return this._state;
  }

  public setText(text: string): void {
    this.config.text = text;
    this.contentText.text = text;
  }

  public destroy(): void {
    if (this.glowFilter) {
      this.glowFilter.kill();
    }
    super.destroy();
  }
}
