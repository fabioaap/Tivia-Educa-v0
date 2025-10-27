/**
 * GlassPanel - Painel retangular com efeito glassmorphism
 * Usado para cards de questão, alternativas, etc.
 */
import { Container, Graphics } from 'pixi.js';

export interface GlassPanelConfig {
  width: number;
  height: number;
  borderRadius?: number;
  bgColor?: number;
  bgAlpha?: number;
  borderColor?: number;
  borderWidth?: number;
  shadowBlur?: number;
  shadowColor?: number;
}

export class GlassPanel extends Container {
  private bg: Graphics;
  private config: Required<GlassPanelConfig>;

  constructor(config: GlassPanelConfig) {
    super();
    
    this.config = {
      width: config.width,
      height: config.height,
      borderRadius: config.borderRadius ?? 30,
      bgColor: config.bgColor ?? 0x000000,
      bgAlpha: config.bgAlpha ?? 0.8,
      borderColor: config.borderColor ?? 0x0A9C9A,
      borderWidth: config.borderWidth ?? 3,
      shadowBlur: config.shadowBlur ?? 20,
      shadowColor: config.shadowColor ?? 0x56C2DA,
    };

    this.bg = new Graphics();
    this.draw();
    this.addChild(this.bg);
  }

  private draw(): void {
    this.bg.clear();
    
    // Fundo glassmorphism
    this.bg
      .roundRect(0, 0, this.config.width, this.config.height, this.config.borderRadius)
      .fill({ color: this.config.bgColor, alpha: this.config.bgAlpha });
    
    // Borda
    this.bg
      .roundRect(0, 0, this.config.width, this.config.height, this.config.borderRadius)
      .stroke({ width: this.config.borderWidth, color: this.config.borderColor });
  }

  public resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.draw();
  }

  public setBgColor(color: number, alpha?: number): void {
    this.config.bgColor = color;
    if (alpha !== undefined) this.config.bgAlpha = alpha;
    this.draw();
  }

  public setBorderColor(color: number): void {
    this.config.borderColor = color;
    this.draw();
  }
}
