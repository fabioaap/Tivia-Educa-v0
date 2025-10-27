/**
 * IconButton - Botão circular/arredondado com ícone
 * Usado para voltar, home, config, pause, etc
 */
import { Container, Graphics, Text } from 'pixi.js';

export interface IconButtonConfig {
  size: number;
  icon: string; // Emoji ou texto
  bgColor?: number;
  bgAlpha?: number;
  borderColor?: number;
  borderWidth?: number;
  onClick?: () => void;
}

export class IconButton extends Container {
  private bg: Graphics;
  private iconText: Text;
  private config: Required<IconButtonConfig>;

  constructor(config: IconButtonConfig) {
    super();

    this.config = {
      bgColor: 0x0A9C9A,
      bgAlpha: 0.8,
      borderColor: 0x56C2DA,
      borderWidth: 3,
      onClick: () => {},
      ...config,
    };

    // Fundo circular
    this.bg = new Graphics();
    this.bg.circle(0, 0, this.config.size / 2);
    this.bg.fill({ color: this.config.bgColor, alpha: this.config.bgAlpha });
    this.bg.stroke({ width: this.config.borderWidth, color: this.config.borderColor });
    this.addChild(this.bg);

    // Ícone/emoji
    this.iconText = new Text({
      text: this.config.icon,
      style: {
        fontFamily: 'Montserrat',
        fontSize: this.config.size * 0.5,
        fontWeight: '700',
        fill: 0xFFFFFF,
        align: 'center',
      },
    });
    this.iconText.anchor.set(0.5);
    this.addChild(this.iconText);

    // Eventos de clique
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', () => {
      this.scale.set(0.95);
      this.config.onClick();
    });
    this.on('pointerup', () => this.scale.set(1));
    this.on('pointerupoutside', () => this.scale.set(1));
    this.on('pointerover', () => this.scale.set(1.05));
    this.on('pointerout', () => this.scale.set(1));
  }

  public setIcon(icon: string): void {
    this.iconText.text = icon;
  }
}
