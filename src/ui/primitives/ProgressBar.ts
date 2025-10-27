/**
 * ProgressBar - Barra horizontal de progresso com animação
 * Usada para indicar progresso da partida
 */
import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';

export interface ProgressBarConfig {
  width: number;
  height: number;
  bgColor?: number;
  bgAlpha?: number;
  fillColor?: number;
  fillAlpha?: number;
  borderRadius?: number;
  borderColor?: number;
  borderWidth?: number;
  initialProgress?: number;
}

export class ProgressBar extends Container {
  private bgGraphics: Graphics;
  private fillGraphics: Graphics;
  private config: Required<ProgressBarConfig>;
  private _progress: number;

  constructor(config: ProgressBarConfig) {
    super();

    this.config = {
      width: config.width,
      height: config.height,
      bgColor: config.bgColor ?? 0x000000,
      bgAlpha: config.bgAlpha ?? 0.3,
      fillColor: config.fillColor ?? 0x0A9C9A,
      fillAlpha: config.fillAlpha ?? 1.0,
      borderRadius: config.borderRadius ?? 10,
      borderColor: config.borderColor ?? 0x56C2DA,
      borderWidth: config.borderWidth ?? 2,
      initialProgress: config.initialProgress ?? 0,
    };

    this._progress = this.config.initialProgress;

    // Background
    this.bgGraphics = new Graphics();
    this.drawBackground();
    this.addChild(this.bgGraphics);

    // Fill
    this.fillGraphics = new Graphics();
    this.drawFill();
    this.addChild(this.fillGraphics);
  }

  private drawBackground(): void {
    this.bgGraphics.clear();
    
    this.bgGraphics
      .roundRect(0, 0, this.config.width, this.config.height, this.config.borderRadius)
      .fill({ color: this.config.bgColor, alpha: this.config.bgAlpha });
    
    this.bgGraphics
      .roundRect(0, 0, this.config.width, this.config.height, this.config.borderRadius)
      .stroke({ width: this.config.borderWidth, color: this.config.borderColor });
  }

  private drawFill(): void {
    this.fillGraphics.clear();
    
    const fillWidth = this.config.width * this._progress;
    
    if (fillWidth > 0) {
      this.fillGraphics
        .roundRect(0, 0, fillWidth, this.config.height, this.config.borderRadius)
        .fill({ color: this.config.fillColor, alpha: this.config.fillAlpha });
    }
  }

  public setProgress(value: number, animate: boolean = true): void {
    const clampedValue = Math.max(0, Math.min(1, value));
    
    if (animate) {
      gsap.to(this, {
        _progress: clampedValue,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => {
          this.drawFill();
        },
      });
    } else {
      this._progress = clampedValue;
      this.drawFill();
    }
  }

  public getProgress(): number {
    return this._progress;
  }

  public reset(): void {
    this.setProgress(0, false);
  }
}
