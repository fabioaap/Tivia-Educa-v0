import { Container, Graphics, Text } from 'pixi.js';
import { Button } from './Button';
import { COLORS, TYPOGRAPHY } from '@config/constants';

export interface PowerUpButtonConfig {
  width: number;
  height: number;
  icon: string; // Unicode/emoji
  label: string;
  uses: number;
  maxUses: number;
}

export class PowerUpButton extends Container {
  private button: Button;
  private iconText: Text;
  private labelText: Text;
  private badge: Container;
  private badgeText: Text;
  private _uses: number;
  private _maxUses: number;

  public onClick?: () => void;

  constructor(config: PowerUpButtonConfig) {
    super();

    this._uses = config.uses;
    this._maxUses = config.maxUses;

    // Botão base
    this.button = new Button({
      width: config.width,
      height: config.height,
      borderRadius: config.height / 2,
      backgroundColor: COLORS.BG_DARKER,
      borderColor: COLORS.PRIMARY_CYAN,
      borderWidth: 2,
    });
    this.button.position.set(config.width / 2, config.height / 2);
    this.button.onClick = () => this.handleClick();
    this.addChild(this.button);

    // Ícone
    this.iconText = new Text({
      text: config.icon,
      style: {
        fontSize: 32,
        fill: COLORS.TEXT_WHITE,
      },
    });
    this.iconText.anchor.set(0.5);
    this.iconText.position.set(60, config.height / 2);
    this.addChild(this.iconText);

    // Label
    this.labelText = new Text({
      text: config.label,
      style: {
        fontFamily: TYPOGRAPHY.FONT_BODY,
        fontSize: TYPOGRAPHY.SIZES.BUTTON,
        fill: COLORS.TEXT_WHITE,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      },
    });
    this.labelText.anchor.set(0, 0.5);
    this.labelText.position.set(100, config.height / 2);
    this.addChild(this.labelText);

    // Badge de usos
    this.badge = new Container();
    const badgeBg = new Graphics();
    badgeBg.circle(0, 0, 15);
    badgeBg.fill(COLORS.ACCENT_ORANGE);
    this.badge.addChild(badgeBg);

    this.badgeText = new Text({
      text: this._uses.toString(),
      style: {
        fontFamily: TYPOGRAPHY.FONT_DISPLAY,
        fontSize: TYPOGRAPHY.SIZES.BADGE,
        fill: COLORS.TEXT_WHITE,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      },
    });
    this.badgeText.anchor.set(0.5);
    this.badge.addChild(this.badgeText);

    this.badge.position.set(30, 15);
    this.addChild(this.badge);

    this.updateState();
  }

  private handleClick(): void {
    if (this._uses > 0) {
      this.onClick?.();
    }
  }

  public use(): boolean {
    if (this._uses > 0) {
      this._uses--;
      this.updateState();
      return true;
    }
    return false;
  }

  public setUses(uses: number): void {
    this._uses = Math.max(0, Math.min(this._maxUses, uses));
    this.updateState();
  }

  private updateState(): void {
    this.badgeText.text = this._uses.toString();
    const disabled = this._uses === 0;
    this.button.setDisabled(disabled);
    this.badge.alpha = disabled ? 0.5 : 1.0;
  }

  public getUses(): number {
    return this._uses;
  }
}
