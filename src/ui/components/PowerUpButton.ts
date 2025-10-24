import { Container, Graphics, Sprite, Assets, Text } from 'pixi.js';
import { COLORS, TYPOGRAPHY, LAYOUT } from '@config/constants';

export type PowerUpType = 'hint' | 'remove' | 'skip';

interface PowerUpConfig {
  type: PowerUpType;
  x: number;
  y: number;
}

const POWERUP_SPRITES = {
  hint: '/assets/ui/powerups/pedir-dica.png',
  remove: '/assets/ui/powerups/remover-alternativa.png',
  skip: '/assets/ui/powerups/pular-questao.png',
} as const;

const POWERUP_FALLBACK = {
  hint: { icon: '💡', label: 'PEDIR DICA' },
  remove: { icon: '🗑️', label: 'REMOVER ALTERNATIVA' },
  skip: { icon: '⏭️', label: 'PULAR QUESTÃO' },
} as const;

export class PowerUpButton extends Container {
  private config: PowerUpConfig;
  private bg: Sprite | null = null;
  private fallbackBg: Graphics;
  private badge: Container;
  private badgeText: Text;
  private uses: number = 3;
  private isEnabled: boolean = true;
  private onClickCallback?: () => void;

  constructor(config: PowerUpConfig) {
    super();
    this.config = config;
    this.position.set(config.x, config.y);
    this.eventMode = 'static';
    this.cursor = 'pointer';

    // Cria fallback Graphics imediatamente
    this.fallbackBg = new Graphics();
    this.addChild(this.fallbackBg);

    // Badge contador no canto superior direito
    this.badge = new Container();
    const btnWidth = config.type === 'hint' ? 400 : config.type === 'remove' ? 420 : 360;
    this.badge.position.set(btnWidth - 30, 10);
    this.badgeText = new Text({
      text: this.uses.toString(),
      style: {
        fontSize: TYPOGRAPHY.SIZES.BADGE,
        fill: COLORS.TEXT_WHITE,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        align: 'center',
      },
    });
    this.badgeText.anchor.set(0.5);
    this.badge.addChild(this.badgeText);
    this.addChild(this.badge);

    this.loadSprite();
    this.setupInteraction();
  }

  private async loadSprite(): Promise<void> {
    const spritePath = POWERUP_SPRITES[this.config.type];
    const btnConfig = this.config.type === 'hint' 
      ? LAYOUT.FOOTER.HINT_BUTTON 
      : this.config.type === 'remove' 
      ? LAYOUT.FOOTER.REMOVE_BUTTON 
      : LAYOUT.FOOTER.SKIP_BUTTON;
    
    try {
      await Assets.load(spritePath);
      this.bg = Sprite.from(spritePath);
      this.bg.anchor.set(0);
      this.bg.width = btnConfig.width;
      this.bg.height = btnConfig.height;
      this.addChildAt(this.bg, 0);
      this.fallbackBg.visible = false;
      console.log(`✅ PowerUpButton sprite loaded: ${spritePath}`);
    } catch (error) {
      console.warn(`⚠️ PowerUpButton sprite not found: ${spritePath}, using fallback Graphics`);
      this.createFallbackGraphics();
    }
    this.updateBadgeVisuals();
  }

  private createFallbackGraphics(): void {
    const btnConfig = this.config.type === 'hint' 
      ? LAYOUT.FOOTER.HINT_BUTTON 
      : this.config.type === 'remove' 
      ? LAYOUT.FOOTER.REMOVE_BUTTON 
      : LAYOUT.FOOTER.SKIP_BUTTON;
    
    const w = btnConfig.width;
    const h = btnConfig.height;
    const fallback = POWERUP_FALLBACK[this.config.type];

    this.fallbackBg.clear();
    this.fallbackBg
      .roundRect(0, 0, w, h, 12)
      .fill(COLORS.SECONDARY_CYAN);

    const iconText = new Text({
      text: fallback.icon,
      style: { fontSize: 32, align: 'center' },
    });
    iconText.anchor.set(0.5);
    iconText.position.set(w / 2, h / 2 - 15);
    this.fallbackBg.addChild(iconText);

    const labelText = new Text({
      text: fallback.label,
      style: {
        fontSize: TYPOGRAPHY.SIZES.BUTTON,
        fill: COLORS.TEXT_WHITE,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        align: 'center',
      },
    });
    labelText.anchor.set(0.5);
    labelText.position.set(w / 2, h / 2 + 20);
    this.fallbackBg.addChild(labelText);
  }

  private setupInteraction(): void {
    this.on('pointerdown', () => {
      if (this.isEnabled && this.uses > 0) {
        this.scale.set(0.95);
      }
    });

    this.on('pointerup', () => {
      this.scale.set(1);
      if (this.isEnabled && this.uses > 0) {
        // Apenas dispara o callback, não decrementa aqui
        this.onClickCallback?.();
      }
    });

    this.on('pointerupoutside', () => {
      this.scale.set(1);
    });

    this.on('pointerover', () => {
      if (this.isEnabled && this.uses > 0) {
        this.alpha = 0.9;
      }
    });

    this.on('pointerout', () => {
      this.alpha = 1;
      this.scale.set(1);
    });
  }

  private updateBadgeVisuals(): void {
    const bgCircle = new Graphics();
    bgCircle
      .circle(0, 0, 16)
      .fill(this.uses > 0 ? COLORS.ACCENT_GREEN : COLORS.ACCENT_RED);
    
    if (this.badge.children.length > 1) {
      this.badge.removeChildAt(0);
    }
    this.badge.addChildAt(bgCircle, 0);
    this.badgeText.text = this.uses.toString();

    if (this.uses === 0) {
      this.alpha = 0.5;
      this.cursor = 'not-allowed';
      this.isEnabled = false;
    } else {
      this.alpha = 1;
      this.cursor = 'pointer';
      this.isEnabled = true;
    }
  }

  public use(): boolean {
    if (this.uses > 0) {
      this.uses--;
      this.updateBadgeVisuals();
      this.onClickCallback?.();
      return true;
    }
    return false;
  }

  public setUses(value: number): void {
    this.uses = Math.max(0, value);
    this.updateBadgeVisuals();
  }

  public getUses(): number {
    return this.uses;
  }

  public onClick(callback: () => void): void {
    this.onClickCallback = callback;
  }
}
