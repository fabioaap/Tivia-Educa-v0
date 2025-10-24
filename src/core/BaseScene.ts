import { Application, Container } from 'pixi.js';

export abstract class BaseScene extends Container {
  protected app: Application;
  protected isInitialized = false;

  constructor(app: Application) {
    super();
    this.app = app;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    await this.load();
    this.create();
    this.isInitialized = true;
  }

  /**
   * Carrega assets necessários para a cena
   */
  protected abstract load(): Promise<void>;

  /**
   * Cria elementos da cena
   */
  protected abstract create(): void;

  /**
   * Atualiza a cena (chamado a cada frame)
   */
  abstract update(delta: number): void;

  /**
   * Chamado quando a cena é mostrada
   */
  onShow(): void {
    this.visible = true;
  }

  /**
   * Chamado quando a cena é escondida
   */
  onHide(): void {
    this.visible = false;
  }

  /**
   * Cleanup da cena
   */
  cleanup(): void {
    this.removeChildren();
  }
}
