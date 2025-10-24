import { Container, Graphics, Text } from 'pixi.js';
import { COLORS, TYPOGRAPHY } from '@config/constants';
import gsap from 'gsap';

export interface ProgressBarConfig {
  width: number;
  height: number;
  label?: string;
  borderColor?: number;
  fillColor?: number;
  backgroundColor?: number;
  borderRadius?: number;
}

export class ProgressBar extends Container {
  private bg: Graphics;
  private fill: Graphics;
  private labelText?: Text;
  private config: Required<ProgressBarConfig>;
  private _progress = 0;

  constructor(config: ProgressBarConfig) {
    super();

    this.config = {
      label: '',
      borderColor: COLORS.PRIMARY_CYAN,
      fillColor: COLORS.ACCENT_GREEN,
      backgroundColor: COLORS.BG_DARKER,
      borderRadius: 8,
      ...config,
    };

    // Background
    this.bg = new Graphics();
    this.addChild(this.bg);

    // Fill
    this.fill = new Graphics();
    this.addChild(this.fill);

    // Label (opcional)
    if (this.config.label) {
      this.labelText = new Text({
        text: this.config.label,
        style: {
          fontFamily: TYPOGRAPHY.FONT_DISPLAY,
          fontSize: TYPOGRAPHY.SIZES.PROGRESS_LABEL,
          fill: COLORS.TEXT_WHITE,
          fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        },
      });
      this.labelText.anchor.set(0.5);
      this.labelText.position.set(this.config.width / 2, this.config.height / 2);
      this.addChild(this.labelText);
    }

    this.draw();
  }

  private draw(): void {
    // Background
    this.bg.clear();
    this.bg.roundRect(0, 0, this.config.width, this.config.height, this.config.borderRadius);
    this.bg.fill(this.config.backgroundColor);
    this.bg.roundRect(0, 0, this.config.width, this.config.height, this.config.borderRadius);
    this.bg.stroke({ width: 2, color: this.config.borderColor });

    // Fill
    this.updateFill();
  }

  private updateFill(): void {
    this.fill.clear();
    const fillWidth = this.config.width * this._progress;
    if (fillWidth > 0) {
      this.fill.roundRect(0, 0, fillWidth, this.config.height, this.config.borderRadius);
      this.fill.fill(this.config.fillColor);
    }
  }

  public setProgress(progress: number, animate = false): void {
    const clampedProgress = Math.max(0, Math.min(1, progress));

    if (animate) {
      gsap.to(this, {
        _progress: clampedProgress,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => {
          this.updateFill();
        },
      });
    } else {
      this._progress = clampedProgress;
      this.updateFill();
    }
  }

  public getProgress(): number {
    return this._progress;
  }

  public setLabel(label: string): void {
    if (this.labelText) {
      this.labelText.text = label;
    }
  }
}
