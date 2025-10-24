import { Text } from 'pixi.js';
import { Button } from './Button';
import { COLORS, TYPOGRAPHY } from '@config/constants';

export interface RoundedButtonConfig {
  size: number;
  icon?: string; // Unicode ou emoji
  iconSize?: number;
  backgroundColor?: number;
  borderColor?: number;
  borderWidth?: number;
}

export class RoundedButton extends Button {
  private icon?: Text;

  constructor(config: RoundedButtonConfig) {
    const buttonConfig = {
      width: config.size,
      height: config.size,
      borderRadius: config.size / 2,
      backgroundColor: config.backgroundColor || COLORS.BG_DARKER,
      borderColor: config.borderColor || COLORS.PRIMARY_CYAN,
      borderWidth: config.borderWidth || 3,
    };

    super(buttonConfig);

    if (config.icon) {
      this.icon = new Text({
        text: config.icon,
        style: {
          fontSize: config.iconSize || config.size * 0.5,
          fill: COLORS.TEXT_WHITE,
          fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        },
      });
      this.icon.anchor.set(0.5);
      this.icon.position.set(config.size / 2, config.size / 2);
      this.addChild(this.icon);
    }
  }

  public setIcon(icon: string): void {
    if (this.icon) {
      this.icon.text = icon;
    }
  }
}
