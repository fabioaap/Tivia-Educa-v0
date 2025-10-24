import { Container, Graphics, FederatedPointerEvent } from 'pixi.js';
import { COLORS, ANIMATIONS } from '@config/constants';
import gsap from 'gsap';

export interface ButtonConfig {
  width: number;
  height: number;
  borderRadius?: number;
  backgroundColor?: number;
  borderColor?: number;
  borderWidth?: number;
  hoverScale?: number;
  pressScale?: number;
}

export class Button extends Container {
  private bg: Graphics;
  private config: Required<ButtonConfig>;
  private isHovered = false;
  private isPressed = false;
  private isDisabled = false;

  public onClick?: () => void;

  constructor(config: ButtonConfig) {
    super();

    this.config = {
      borderRadius: 15,
      backgroundColor: COLORS.PRIMARY_CYAN,
      borderColor: COLORS.PRIMARY_CYAN,
      borderWidth: 2,
      hoverScale: 1.05,
      pressScale: 1.02,
      ...config,
    };

    this.bg = new Graphics();
    this.addChild(this.bg);

    this.draw();
    this.setupInteraction();
  }

  private draw(): void {
    this.bg.clear();

    // Background
    this.bg.roundRect(0, 0, this.config.width, this.config.height, this.config.borderRadius);
    this.bg.fill(this.config.backgroundColor);

    // Border
    this.bg.roundRect(0, 0, this.config.width, this.config.height, this.config.borderRadius);
    this.bg.stroke({ width: this.config.borderWidth, color: this.config.borderColor });

    // Pivot para escala centralizada
    this.pivot.set(this.config.width / 2, this.config.height / 2);
  }

  private setupInteraction(): void {
    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointerover', this.onPointerOver.bind(this));
    this.on('pointerout', this.onPointerOut.bind(this));
    this.on('pointerdown', this.onPointerDown.bind(this));
    this.on('pointerup', this.onPointerUp.bind(this));
    this.on('pointerupoutside', this.onPointerUp.bind(this));
  }

  private onPointerOver(_event: FederatedPointerEvent): void {
    if (this.isDisabled) return;
    this.isHovered = true;
    this.animateScale(this.config.hoverScale);
  }

  private onPointerOut(_event: FederatedPointerEvent): void {
    if (this.isDisabled) return;
    this.isHovered = false;
    if (!this.isPressed) {
      this.animateScale(1.0);
    }
  }

  private onPointerDown(_event: FederatedPointerEvent): void {
    if (this.isDisabled) return;
    this.isPressed = true;
    this.animateScale(this.config.pressScale);
  }

  private onPointerUp(_event: FederatedPointerEvent): void {
    if (this.isDisabled) return;
    if (this.isPressed && this.isHovered) {
      this.onClick?.();
    }
    this.isPressed = false;
    this.animateScale(this.isHovered ? this.config.hoverScale : 1.0);
  }

  private animateScale(scale: number): void {
    gsap.to(this.scale, {
      x: scale,
      y: scale,
      duration: ANIMATIONS.BUTTON_HOVER / 1000,
      ease: 'power1.out',
    });
  }

  public setDisabled(disabled: boolean): void {
    this.isDisabled = disabled;
    this.cursor = disabled ? 'not-allowed' : 'pointer';
    this.alpha = disabled ? 0.5 : 1.0;
  }

  public updateConfig(config: Partial<ButtonConfig>): void {
    Object.assign(this.config, config);
    this.draw();
  }
}
