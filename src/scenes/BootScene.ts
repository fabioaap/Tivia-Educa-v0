import { Application, Graphics, Text } from 'pixi.js';
import { BaseScene } from '@core/BaseScene';
import { COLORS, TYPOGRAPHY } from '@config/constants';

export class BootScene extends BaseScene {
  private loadingText!: Text;
  private progressBar!: Graphics;

  constructor(app: Application) {
    super(app);
  }

  protected async load(): Promise<void> {
    // No MVP, não há assets pesados para carregar
    // Futuramente: carregar spritesheets, áudio, fontes
    return Promise.resolve();
  }

  protected create(): void {
    // Background
    const bg = new Graphics();
    bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.fill(COLORS.BG_DARK);
    this.addChild(bg);

    // Loading text
    this.loadingText = new Text({
      text: 'Carregando Trivia...',
      style: {
        fontFamily: TYPOGRAPHY.FONT_DISPLAY,
        fontSize: 32,
        fill: COLORS.PRIMARY_CYAN,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
      },
    });
    this.loadingText.anchor.set(0.5);
    this.loadingText.position.set(this.app.screen.width / 2, this.app.screen.height / 2 - 50);
    this.addChild(this.loadingText);

    // Progress bar background
    const progressBg = new Graphics();
    progressBg.rect(
      this.app.screen.width / 2 - 200,
      this.app.screen.height / 2 + 50,
      400,
      20
    );
    progressBg.stroke({ width: 2, color: COLORS.PRIMARY_CYAN });
    this.addChild(progressBg);

    // Progress bar fill
    this.progressBar = new Graphics();
    this.addChild(this.progressBar);

    // Simula carregamento
    this.simulateLoading();
  }

  private async simulateLoading(): Promise<void> {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05;
      this.updateProgress(progress);

      if (progress >= 1) {
        clearInterval(interval);
        // TODO: Mudar para MenuScene
        console.log('Boot complete - ready to transition to MenuScene');
      }
    }, 50);
  }

  private updateProgress(progress: number): void {
    this.progressBar.clear();
    this.progressBar.rect(
      this.app.screen.width / 2 - 200,
      this.app.screen.height / 2 + 50,
      400 * progress,
      20
    );
    this.progressBar.fill(COLORS.PRIMARY_CYAN);
  }

  update(_delta: number): void {
    // Animação simples de pulse no texto
    const time = Date.now() / 1000;
    this.loadingText.alpha = 0.5 + Math.sin(time * 2) * 0.5;
  }
}
