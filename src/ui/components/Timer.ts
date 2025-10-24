import { Container, Sprite, Text, Graphics } from 'pixi.js';
import { COLORS, TYPOGRAPHY } from '@config/constants';
import gsap from 'gsap';

export interface TimerConfig {
  size: number;
  textColor?: number;
  warningColor?: number;
  criticalThreshold?: number; // segundos
  useFallback?: boolean; // Se true, usa Graphics como fallback
}

export class Timer extends Container {
  private bgSprite: Sprite | null = null;
  private progressSprite: Sprite | null = null;
  private fallbackCircle: Graphics | null = null;
  private timeText: Text;
  private config: Required<TimerConfig>;
  private _remainingMs = 0;
  private _maxMs = 0;
  private pulseAnimation?: gsap.core.Tween;

  constructor(config: TimerConfig) {
    super();

    this.config = {
      textColor: COLORS.TEXT_WHITE,
      warningColor: COLORS.ACCENT_RED,
      criticalThreshold: 10,
      useFallback: false,
      ...config,
    };

    this.initVisuals();

    // Texto do tempo
    this.timeText = new Text({
      text: '00:00',
      style: {
        fontFamily: TYPOGRAPHY.FONT_DISPLAY,
        fontSize: 20,
        fill: this.config.textColor,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      },
    });
    this.timeText.anchor.set(0.5);
    this.timeText.position.set(this.config.size / 2, this.config.size / 2);
    this.addChild(this.timeText);
  }

  private initVisuals(): void {
    // Tenta carregar sprites do Figma
    try {
      this.bgSprite = Sprite.from('/assets/ui/timer/timer-bg.png');
      this.bgSprite.anchor.set(0.5);
      this.bgSprite.position.set(this.config.size / 2, this.config.size / 2);
      this.bgSprite.width = this.bgSprite.height = this.config.size;
      this.addChild(this.bgSprite);
      console.log('✓ Timer bg sprite loaded');

      // Progress sprite pode ser opcional (animar via rotation/mask)
      // Por enquanto, usa fallback para o arco
    } catch (error) {
      console.warn('Timer sprites not found, using fallback graphics');
      this.config.useFallback = true;
    }

    // Fallback ou complemento: Graphics para arco de progresso
    if (this.config.useFallback || !this.progressSprite) {
      this.fallbackCircle = new Graphics();
      this.addChild(this.fallbackCircle);
    }
  }

  private draw(): void {
    // Se tem sprite de progresso, anima via rotation
    if (this.progressSprite && this._maxMs > 0) {
      const progress = this._remainingMs / this._maxMs;
      this.progressSprite.rotation = -Math.PI / 2 + (Math.PI * 2 * progress);
      return;
    }

    // Fallback: desenha arco via Graphics
    if (this.fallbackCircle) {
      this.fallbackCircle.clear();

      const radius = this.config.size / 2 - 5;
      const centerX = this.config.size / 2;
      const centerY = this.config.size / 2;

      if (this._maxMs > 0) {
        const progress = this._remainingMs / this._maxMs;
        const angle = Math.PI * 2 * progress;

        if (progress > 0) {
          this.fallbackCircle.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + angle);
          
          const isCritical = this._remainingMs / 1000 < this.config.criticalThreshold;
          const color = isCritical ? this.config.warningColor : COLORS.PRIMARY_CYAN;
          this.fallbackCircle.stroke({ width: 3, color });
        }
      }
    }
  }

  public setTime(remainingMs: number, maxMs: number): void {
    this._remainingMs = Math.max(0, remainingMs);
    this._maxMs = maxMs;

    const seconds = Math.ceil(this._remainingMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timeText.text = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    this.draw();

    // Animação de pulse quando crítico
    const isCritical = seconds < this.config.criticalThreshold;
    if (isCritical && !this.pulseAnimation) {
      this.startPulse();
    } else if (!isCritical && this.pulseAnimation) {
      this.stopPulse();
    }
  }

  private startPulse(): void {
    this.pulseAnimation = gsap.to(this.scale, {
      x: 1.1,
      y: 1.1,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  }

  private stopPulse(): void {
    if (this.pulseAnimation) {
      this.pulseAnimation.kill();
      this.pulseAnimation = undefined;
      gsap.to(this.scale, { x: 1, y: 1, duration: 0.2 });
    }
  }

  public reset(): void {
    this._remainingMs = 0;
    this._maxMs = 0;
    this.timeText.text = '00:00';
    this.draw();
    this.stopPulse();
  }

  public destroy(): void {
    this.stopPulse();
    super.destroy();
  }
}
