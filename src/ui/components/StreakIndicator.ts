import { Container, Graphics, Text, Sprite } from 'pixi.js';
import { TYPOGRAPHY, COLORS } from '@config/constants';
import { StreakLevel, STREAK_COLORS } from '@systems/StreakSystem';
import gsap from 'gsap';

export class StreakIndicator extends Container {
  private fireSprite: Sprite | null = null;
  private fallbackGraphics: Graphics;
  private numberText: Text;
  private glowCircle: Graphics;
  private particles: Container;
  private pulseTimeline?: gsap.core.Timeline;

  constructor() {
    super();
    this.alpha = 0; // invisível inicialmente
    this.visible = false;

    // Container de partículas (atrás de tudo)
    this.particles = new Container();
    this.addChild(this.particles);

    // Glow de fundo
    this.glowCircle = new Graphics();
    this.glowCircle.circle(0, 0, 70);
    this.glowCircle.fill({ color: STREAK_COLORS[StreakLevel.LEVEL_1], alpha: 0.4 });
    this.addChild(this.glowCircle);

    // Fallback graphics (forma de gota/chama)
    this.fallbackGraphics = new Graphics();
    this.drawFallbackFire();
    this.addChild(this.fallbackGraphics);

    // Tenta carregar sprite do Figma
    this.loadSprite();

    // Número do streak
    this.numberText = new Text({
      text: '1',
      style: {
        fontFamily: TYPOGRAPHY.FONT_DISPLAY,
        fontSize: 48,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        fill: COLORS.TEXT_WHITE,
        stroke: { color: 0x000000, width: 4 },
      },
    });
    this.numberText.anchor.set(0.5);
    this.numberText.position.set(0, 10); // ligeiramente abaixo do centro
    this.addChild(this.numberText);
  }

  private loadSprite(): void {
    try {
      this.fireSprite = Sprite.from('/assets/ui/streak/fire.png');
      this.fireSprite.anchor.set(0.5);
      this.fireSprite.width = 120;
      this.fireSprite.height = 140;
      this.fireSprite.position.set(0, -10);
      this.addChildAt(this.fireSprite, 2); // entre glow e número
      this.fallbackGraphics.visible = false;
      console.log('✓ Streak fire sprite loaded');
    } catch (error) {
      console.warn('Streak fire sprite not found, using fallback graphics');
      this.fallbackGraphics.visible = true;
    }
  }

  private drawFallbackFire(): void {
    // Desenha uma chama estilizada (forma de gota)
    this.fallbackGraphics.clear();
    
    // Corpo principal (gota)
    this.fallbackGraphics.moveTo(0, -50);
    this.fallbackGraphics.bezierCurveTo(-30, -30, -35, 0, -25, 30);
    this.fallbackGraphics.bezierCurveTo(-15, 50, 15, 50, 25, 30);
    this.fallbackGraphics.bezierCurveTo(35, 0, 30, -30, 0, -50);
    this.fallbackGraphics.fill({ color: STREAK_COLORS[StreakLevel.LEVEL_1] });

    // Destaque interno (mais claro)
    this.fallbackGraphics.moveTo(0, -40);
    this.fallbackGraphics.bezierCurveTo(-15, -25, -20, 0, -12, 20);
    this.fallbackGraphics.bezierCurveTo(-5, 30, 5, 30, 12, 20);
    this.fallbackGraphics.bezierCurveTo(20, 0, 15, -25, 0, -40);
    this.fallbackGraphics.fill({ color: 0xFFD700, alpha: 0.6 });
  }

  /**
   * Mostra indicador com animação de entrada
   */
  show(level: StreakLevel): void {
    this.numberText.text = level.toString();
    this.visible = true;

    const color = STREAK_COLORS[level];
    this.updateColor(color);

    // Animação de entrada: scale + fade
    gsap.killTweensOf(this);
    this.scale.set(0.3);
    this.rotation = -0.3;

    const timeline = gsap.timeline();
    timeline.to(this, {
      alpha: 1,
      rotation: 0,
      duration: 0.4,
      ease: 'back.out(1.7)',
    });
    timeline.to(
      this.scale,
      {
        x: 1,
        y: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      },
      '<'
    );

    // Inicia pulse contínuo
    this.startPulse();

    // Partículas na entrada
    this.spawnParticles(4, 40);
  }

  /**
   * Animação de incremento (streak aumentou)
   */
  increment(newLevel: StreakLevel): void {
    this.numberText.text = newLevel.toString();

    const color = STREAK_COLORS[newLevel];
    
    // Transição suave de cor
    gsap.to(this.glowCircle, {
      pixi: { tint: color },
      duration: 0.3,
    });

    if (this.fireSprite) {
      gsap.to(this.fireSprite, {
        pixi: { tint: color },
        duration: 0.3,
      });
    } else {
      // Atualiza cor do fallback (redraw)
      this.updateColor(color);
    }

    // Shake + scale punch
    const timeline = gsap.timeline();
    timeline.to(this.scale, {
      x: 1.4,
      y: 1.4,
      duration: 0.15,
      ease: 'power2.out',
    });
    timeline.to(this.scale, {
      x: 1,
      y: 1,
      duration: 0.2,
      ease: 'elastic.out(1, 0.3)',
    });

    // Rotação rápida do número
    gsap.fromTo(
      this.numberText,
      { rotation: 0 },
      {
        rotation: Math.PI * 2,
        duration: 0.6,
        ease: 'back.out(1.5)',
      }
    );

    // Mais partículas conforme nível aumenta
    const particleCount = Math.min(newLevel * 2, 12);
    this.spawnParticles(particleCount, 50 + newLevel * 10);
  }

  /**
   * Oculta indicador com animação de saída
   */
  hide(): void {
    gsap.killTweensOf(this);
    this.stopPulse();

    const timeline = gsap.timeline();
    timeline.to(this.scale, {
      x: 0.5,
      y: 0.5,
      duration: 0.3,
      ease: 'back.in(1.5)',
    });
    timeline.to(
      this,
      {
        alpha: 0,
        duration: 0.3,
        onComplete: () => {
          this.visible = false;
          this.clearParticles();
        },
      },
      '<'
    );
  }

  private updateColor(color: number): void {
    this.glowCircle.tint = color;
    
    if (this.fireSprite) {
      this.fireSprite.tint = color;
    } else {
      // Redesenha fallback com nova cor
      this.fallbackGraphics.clear();
      
      // Corpo principal
      this.fallbackGraphics.moveTo(0, -50);
      this.fallbackGraphics.bezierCurveTo(-30, -30, -35, 0, -25, 30);
      this.fallbackGraphics.bezierCurveTo(-15, 50, 15, 50, 25, 30);
      this.fallbackGraphics.bezierCurveTo(35, 0, 30, -30, 0, -50);
      this.fallbackGraphics.fill({ color });

      // Destaque interno
      const lightColor = this.lightenColor(color, 0.3);
      this.fallbackGraphics.moveTo(0, -40);
      this.fallbackGraphics.bezierCurveTo(-15, -25, -20, 0, -12, 20);
      this.fallbackGraphics.bezierCurveTo(-5, 30, 5, 30, 12, 20);
      this.fallbackGraphics.bezierCurveTo(20, 0, 15, -25, 0, -40);
      this.fallbackGraphics.fill({ color: lightColor, alpha: 0.7 });
    }
  }

  private lightenColor(color: number, amount: number): number {
    const r = ((color >> 16) & 0xff) + amount * 255;
    const g = ((color >> 8) & 0xff) + amount * 255;
    const b = (color & 0xff) + amount * 255;
    return (Math.min(r, 255) << 16) | (Math.min(g, 255) << 8) | Math.min(b, 255);
  }

  private startPulse(): void {
    this.stopPulse(); // limpa animações anteriores

    this.pulseTimeline = gsap.timeline({ repeat: -1 });

    // Pulse do sprite/graphics
    const target = this.fireSprite || this.fallbackGraphics;
    this.pulseTimeline.to(target.scale, {
      x: 1.15,
      y: 1.15,
      duration: 0.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
    });

    // Pulse do glow (offset de fase)
    this.pulseTimeline.to(
      this.glowCircle.scale,
      {
        x: 1.3,
        y: 1.3,
        duration: 0.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      },
      '<0.1'
    );
  }

  private stopPulse(): void {
    if (this.pulseTimeline) {
      this.pulseTimeline.kill();
      this.pulseTimeline = undefined;
    }
  }

  private spawnParticles(count: number, distance: number): void {
    for (let i = 0; i < count; i++) {
      const particle = new Graphics();
      const size = 3 + Math.random() * 4;
      particle.circle(0, 0, size);
      particle.fill({ color: this.glowCircle.tint, alpha: 0.9 });

      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
      const startDist = 30 + Math.random() * 10;
      particle.position.set(Math.cos(angle) * startDist, Math.sin(angle) * startDist);

      this.particles.addChild(particle);

      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 20,
        alpha: 0,
        duration: 0.6 + Math.random() * 0.4,
        ease: 'power2.out',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private clearParticles(): void {
    this.particles.removeChildren().forEach(child => child.destroy());
  }

  public destroy(): void {
    this.stopPulse();
    this.clearParticles();
    super.destroy({ children: true });
  }
}
