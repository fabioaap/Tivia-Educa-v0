import { Application } from 'pixi.js';
import { GAME_CONFIG, DESIGN } from '@config/constants';
import { SceneManager } from './SceneManager.js';

export class GameApplication {
  public app: Application;
  public sceneManager: SceneManager;
  private currentScale = 1;

  constructor() {
    // Cria aplicação Pixi.js
    this.app = new Application();
    this.sceneManager = new SceneManager(this.app);
  }

  async init(): Promise<void> {
    // Inicializa Pixi.js
    await this.app.init({
      width: GAME_CONFIG.WIDTH,
      height: GAME_CONFIG.HEIGHT,
      backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
      resolution: GAME_CONFIG.RESOLUTION,
      antialias: GAME_CONFIG.ANTIALIAS,
      autoDensity: true,
    });

    // Adiciona canvas ao DOM
    const container = document.getElementById('game-container');
    if (!container) {
      throw new Error('Game container not found');
    }

    // Remove loading
    const loading = document.getElementById('loading');
    if (loading) {
      loading.remove();
    }

    container.appendChild(this.app.canvas);

    // Configura escalonamento responsivo
    this.setupResponsive();
    window.addEventListener('resize', () => this.setupResponsive());

    // Inicializa scene manager
    await this.sceneManager.init();
  }

  private setupResponsive(): void {
    const scaleX = window.innerWidth / DESIGN.WIDTH;
    const scaleY = window.innerHeight / DESIGN.HEIGHT;
    this.currentScale = Math.min(scaleX, scaleY);

    // Aplica escala ao stage
    this.app.stage.scale.set(this.currentScale);

    // Centraliza o canvas
    const canvasWidth = DESIGN.WIDTH * this.currentScale;
    const canvasHeight = DESIGN.HEIGHT * this.currentScale;
    
    this.app.canvas.style.width = `${canvasWidth}px`;
    this.app.canvas.style.height = `${canvasHeight}px`;
    this.app.canvas.style.position = 'absolute';
    this.app.canvas.style.left = `${(window.innerWidth - canvasWidth) / 2}px`;
    this.app.canvas.style.top = `${(window.innerHeight - canvasHeight) / 2}px`;
  }

  public getScale(): number {
    return this.currentScale;
  }

  public destroy(): void {
    window.removeEventListener('resize', () => this.setupResponsive());
    this.sceneManager.destroy();
    this.app.destroy(true, { children: true, texture: true });
  }
}
