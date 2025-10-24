import { Application } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { BootScene } from '@scenes/BootScene';
import { GameScene } from '@scenes/GameScene';

export type SceneName = 'boot' | 'menu' | 'game' | 'results' | 'ranking';

export class SceneManager {
  private app: Application;
  private scenes: Map<SceneName, BaseScene> = new Map();
  private currentScene: BaseScene | null = null;

  constructor(app: Application) {
    this.app = app;
  }

  async init(): Promise<void> {
    // Registra todas as cenas
    this.registerScene('boot', new BootScene(this.app));
    this.registerScene('game', new GameScene(this.app));

    // Inicia com BootScene
    await this.changeScene('boot');

    // Setup game loop
    this.app.ticker.add((ticker) => {
      if (this.currentScene) {
        this.currentScene.update(ticker.deltaTime);
      }
    });

    // Aguarda 3 segundos e muda para GameScene (temporário para testes)
    setTimeout(() => {
      void this.changeScene('game');
    }, 3000);
  }

  private registerScene(name: SceneName, scene: BaseScene): void {
    this.scenes.set(name, scene);
  }

  async changeScene(name: SceneName): Promise<void> {
    const nextScene = this.scenes.get(name);
    if (!nextScene) {
      throw new Error(`Scene "${name}" not found`);
    }

    // Esconde cena atual
    if (this.currentScene) {
      this.currentScene.onHide();
      this.app.stage.removeChild(this.currentScene);
    }

    // Inicializa nova cena se necessário
    await nextScene.init();

    // Mostra nova cena
    this.app.stage.addChild(nextScene);
    nextScene.onShow();
    this.currentScene = nextScene;
  }

  getCurrentScene(): BaseScene | null {
    return this.currentScene;
  }

  destroy(): void {
    this.scenes.forEach((scene) => scene.cleanup());
    this.scenes.clear();
    this.currentScene = null;
  }
}
