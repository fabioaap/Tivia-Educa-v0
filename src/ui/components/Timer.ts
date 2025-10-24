import { Container, Graphics, Text } from 'pixi.js';
import { COLORS, TYPOGRAPHY } from '@config/constants';
import gsap from 'gsap';

export interface TimerConfig {
  size: number;
  borderWidth?: number;
  borderColor?: number;
  textColor?: number;
  warningColor?: number;
  criticalThreshold?: number; // segundos
}

export class Timer extends Container {
  private circle: Graphics;
  private timeText: Text;
  private config: Required<TimerConfig>;
  private _remainingMs = 0;
  private _maxMs = 0;
  private pulseAnimation?: gsap.core.Tween;

  constructor(config: TimerConfig) {
    super();

    this.config = {
      borderWidth: 6,
      borderColor: COLORS.PRIMARY_CYAN,
      textColor: COLORS.TEXT_WHITE,
      warningColor: COLORS.ACCENT_RED,
      criticalThreshold: 10,
      ...config,
    };

    // Círculo de progresso
    this.circle = new Graphics();
    this.addChild(this.circle);

    // Texto do tempo
    this.timeText = new Text({
      text: '00:00',
      style: {
        fontFamily: TYPOGRAPHY.FONT_DISPLAY,
        fontSize: TYPOGRAPHY.SIZES.TIMER,
        fill: this.config.textColor,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      },
    });
    this.timeText.anchor.set(0.5);
    this.timeText.position.set(this.config.size / 2, this.config.size / 2);
    this.addChild(this.timeText);

    this.draw();
  }

  private draw(): void {
    this.circle.clear();

    const radius = this.config.size / 2 - this.config.borderWidth;
    const centerX = this.config.size / 2;
    const centerY = this.config.size / 2;

    // Círculo de fundo
    this.circle.circle(centerX, centerY, radius);
    this.circle.stroke({ width: this.config.borderWidth, color: 0x333333 });

    // Arco de progresso
    if (this._maxMs > 0) {
      const progress = this._remainingMs / this._maxMs;
      const angle = Math.PI * 2 * progress;

      this.circle.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + angle);
      
      const isCritical = this._remainingMs / 1000 < this.config.criticalThreshold;
      const color = isCritical ? this.config.warningColor : this.config.borderColor;
      this.circle.stroke({ width: this.config.borderWidth, color });
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
