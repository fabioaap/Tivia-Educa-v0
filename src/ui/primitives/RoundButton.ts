/**
 * RoundButton - Botão retangular/circular com estados hover/pressed
 * Usado para power-ups, alternativas, etc.
 */
import { Container, Graphics, Text, FederatedPointerEvent } from 'pixi.js';

export interface RoundButtonConfig {
  width: number;
  height: number;
  borderRadius?: number;
  bgColor?: number;
  bgAlpha?: number;
  hoverColor?: number;
  pressedColor?: number;
  borderColor?: number;
  borderWidth?: number;
  label?: string;
  fontSize?: number;
  fontFamily?: string;
  fontColor?: number;
  icon?: string;
  onClick?: () => void;
}

export class RoundButton extends Container {
  private bg: Graphics;
  private labelText?: Text;
  private config: Required<Omit<RoundButtonConfig, 'label' | 'icon' | 'onClick'>>;
  private isHovered: boolean = false;
  private isPressed: boolean = false;
  private onClick?: () => void;

  constructor(config: RoundButtonConfig) {
    super();

    this.config = {
      width: config.width,
      height: config.height,
      borderRadius: config.borderRadius ?? 20,
      bgColor: config.bgColor ?? 0x0A9C9A,
      bgAlpha: config.bgAlpha ?? 1.0,
      hoverColor: config.hoverColor ?? 0x0DB3B1,
      pressedColor: config.pressedColor ?? 0x088583,
      borderColor: config.borderColor ?? 0x56C2DA,
      borderWidth: config.borderWidth ?? 3,
      fontSize: config.fontSize ?? 28,
      fontFamily: config.fontFamily ?? 'Montserrat',
      fontColor: config.fontColor ?? 0xFFFFFF,
    };

    this.onClick = config.onClick;

    // Fundo
    this.bg = new Graphics();
    this.draw();
    this.addChild(this.bg);

    // Label
    if (config.label || config.icon) {
      const displayText = config.icon || config.label || '';
      this.labelText = new Text({
        text: displayText,
        style: {
          fontFamily: this.config.fontFamily,
          fontSize: this.config.fontSize,
          fontWeight: '700',
          fill: this.config.fontColor,
          align: 'center',
        },
      });
      this.labelText.anchor.set(0.5);
      this.labelText.position.set(this.config.width / 2, this.config.height / 2);
      this.addChild(this.labelText);
    }

    this.setupInteraction();
  }

  private draw(): void {
    this.bg.clear();

    let currentColor = this.config.bgColor;
    if (this.isPressed) {
      currentColor = this.config.pressedColor;
    } else if (this.isHovered) {
      currentColor = this.config.hoverColor;
    }

    // Fundo
    this.bg
      .roundRect(0, 0, this.config.width, this.config.height, this.config.borderRadius)
      .fill({ color: currentColor, alpha: this.config.bgAlpha });

    // Borda
    this.bg
      .roundRect(0, 0, this.config.width, this.config.height, this.config.borderRadius)
      .stroke({ width: this.config.borderWidth, color: this.config.borderColor });
  }

  private setupInteraction(): void {
    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointerover', this.onPointerOver.bind(this));
    this.on('pointerout', this.onPointerOut.bind(this));
    this.on('pointerdown', this.onPointerDown.bind(this));
    this.on('pointerup', this.onPointerUp.bind(this));
    this.on('pointerupoutside', this.onPointerUpOutside.bind(this));
  }

  private onPointerOver(_event: FederatedPointerEvent): void {
    this.isHovered = true;
    this.draw();
  }

  private onPointerOut(_event: FederatedPointerEvent): void {
    this.isHovered = false;
    this.isPressed = false;
    this.draw();
  }

  private onPointerDown(_event: FederatedPointerEvent): void {
    this.isPressed = true;
    this.draw();
  }

  private onPointerUp(_event: FederatedPointerEvent): void {
    if (this.isPressed) {
      this.isPressed = false;
      this.draw();
      this.onClick?.();
    }
  }

  private onPointerUpOutside(_event: FederatedPointerEvent): void {
    this.isPressed = false;
    this.draw();
  }

  public setLabel(text: string): void {
    if (this.labelText) {
      this.labelText.text = text;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.eventMode = enabled ? 'static' : 'none';
    this.alpha = enabled ? 1.0 : 0.5;
  }
}
