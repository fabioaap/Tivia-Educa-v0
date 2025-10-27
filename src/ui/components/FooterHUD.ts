/**
 * FooterHUD - Container com os 3 botões de power-up
 * Renderização nativa via Graphics (sem PNGs)
 * Coordenadas extraídas do Figma HTML
 */
import { Container, Graphics, Text } from 'pixi.js';
import { RoundButton } from '../primitives/RoundButton';
import { LAYOUT } from '../../config/constants';

export class FooterHUD extends Container {
  private background: Graphics;
  private hintButton!: RoundButton;
  private removeButton!: RoundButton;
  private skipButton!: RoundButton;
  private hintCounter!: Container;
  private removeCounter!: Container;
  private skipCounter!: Container;
  private hintCountText!: Text;
  private removeCountText!: Text;
  private skipCountText!: Text;
  private callbacks: {
    onHint: () => void;
    onRemove: () => void;
    onSkip: () => void;
  };

  constructor(callbacks: {
    onHint: () => void;
    onRemove: () => void;
    onSkip: () => void;
  }) {
    super();
    this.callbacks = callbacks;
    this.background = new Graphics();
    const footerLayout = LAYOUT.FOOTER;
    this.background.rect(0, 0, footerLayout.WIDTH, footerLayout.HEIGHT);
    this.background.fill({ color: 0x00BDB9, alpha: 0.3 });
    this.addChild(this.background);
    this.createPowerUps();
    this.createCounters();
  }

  private createPowerUps(): void {
    const footerOriginX = LAYOUT.FOOTER.X;
    const footerOriginY = LAYOUT.FOOTER.Y;

    // Coordenadas relativas ao FooterHUD container (Y começa em 0)
    const hintConfig = LAYOUT.FOOTER.HINT_BUTTON;
    this.hintButton = new RoundButton({
      width: hintConfig.width,
      height: hintConfig.height,
      borderRadius: 20,
      bgColor: 0x0A9C9A,
      bgAlpha: 0.9,
      hoverColor: 0x0DB3B1,
      pressedColor: 0x088583,
      borderColor: 0x56C2DA,
      borderWidth: 3,
      label: ' PEDIR DICA',
      fontSize: 32,
      fontColor: 0xFFFFFF,
      onClick: () => this.callbacks.onHint(),
    });
    this.hintButton.position.set(
      hintConfig.x - footerOriginX,
      hintConfig.y - footerOriginY,
    );
    this.addChild(this.hintButton);

    const removeConfig = LAYOUT.FOOTER.REMOVE_BUTTON;
    this.removeButton = new RoundButton({
      width: removeConfig.width,
      height: removeConfig.height,
      borderRadius: 20,
      bgColor: 0x0A9C9A,
      bgAlpha: 0.9,
      hoverColor: 0x0DB3B1,
      pressedColor: 0x088583,
      borderColor: 0x56C2DA,
      borderWidth: 3,
      label: ' REMOVER ALTERNATIVA',
      fontSize: 32,
      fontColor: 0xFFFFFF,
      onClick: () => this.callbacks.onRemove(),
    });
    this.removeButton.position.set(
      removeConfig.x - footerOriginX,
      removeConfig.y - footerOriginY,
    );
    this.addChild(this.removeButton);

    const skipConfig = LAYOUT.FOOTER.SKIP_BUTTON;
    this.skipButton = new RoundButton({
      width: skipConfig.width,
      height: skipConfig.height,
      borderRadius: 20,
      bgColor: 0x0A9C9A,
      bgAlpha: 0.9,
      hoverColor: 0x0DB3B1,
      pressedColor: 0x088583,
      borderColor: 0x56C2DA,
      borderWidth: 3,
      label: ' PULAR QUESTÃO',
      fontSize: 32,
      fontColor: 0xFFFFFF,
      onClick: () => this.callbacks.onSkip(),
    });
    this.skipButton.position.set(
      skipConfig.x - footerOriginX,
      skipConfig.y - footerOriginY,
    );
    this.addChild(this.skipButton);
  }

  private createCounters(): void {
    const hintConfig = LAYOUT.FOOTER.HINT_BUTTON;
    const removeConfig = LAYOUT.FOOTER.REMOVE_BUTTON;
    const skipConfig = LAYOUT.FOOTER.SKIP_BUTTON;
    const footerX = LAYOUT.FOOTER.X;
    const footerY = LAYOUT.FOOTER.Y;
    const counterOffsetY = LAYOUT.FOOTER.COUNTER_OFFSET_Y;

    // Contador HINT (canto superior direito do botão) - coordenadas relativas
    this.hintCounter = this.createCounter(3);
    this.hintCounter.position.set(
      hintConfig.x - footerX + hintConfig.width - 20, // 20px da borda direita
      hintConfig.y - footerY - counterOffsetY, // offset vertical definido pelo layout
    );
    this.addChild(this.hintCounter);
    this.hintCountText = this.hintCounter.children[1] as Text;

    // Contador REMOVE
    this.removeCounter = this.createCounter(3);
    this.removeCounter.position.set(
      removeConfig.x - footerX + removeConfig.width - 20,
      removeConfig.y - footerY - counterOffsetY,
    );
    this.addChild(this.removeCounter);
    this.removeCountText = this.removeCounter.children[1] as Text;

    // Contador SKIP
    this.skipCounter = this.createCounter(3);
    this.skipCounter.position.set(
      skipConfig.x - footerX + skipConfig.width - 20,
      skipConfig.y - footerY - counterOffsetY,
    );
    this.addChild(this.skipCounter);
    this.skipCountText = this.skipCounter.children[1] as Text;
  }

  private createCounter(count: number): Container {
    const container = new Container();

    // Círculo de fundo
    const bg = new Graphics();
    bg.circle(0, 0, 18); // raio 18px
    bg.fill({ color: 0xFF6B35, alpha: 1 }); // Laranja vibrante
    bg.circle(0, 0, 18);
    bg.stroke({ width: 3, color: 0xFFFFFF }); // Borda branca
    container.addChild(bg);

    // Texto do contador
    const text = new Text({
      text: count.toString(),
      style: {
        fontFamily: 'Montserrat',
        fontSize: 20,
        fontWeight: '900',
        fill: 0xFFFFFF,
      },
    });
    text.anchor.set(0.5);
    container.addChild(text);

    return container;
  }

  public setHintCount(count: number): void {
    this.hintCountText.text = count.toString();
    this.hintCounter.visible = count > 0;
  }

  public setRemoveCount(count: number): void {
    this.removeCountText.text = count.toString();
    this.removeCounter.visible = count > 0;
  }

  public setSkipCount(count: number): void {
    this.skipCountText.text = count.toString();
    this.skipCounter.visible = count > 0;
  }

  public updatePowerUpCounter(type: 'hint' | 'remove' | 'skip', count: number): void {
    switch (type) {
      case 'hint':
        this.setHintCount(count);
        this.setHintEnabled(count > 0);
        break;
      case 'remove':
        this.setRemoveCount(count);
        this.setRemoveEnabled(count > 0);
        break;
      case 'skip':
        this.setSkipCount(count);
        this.setSkipEnabled(count > 0);
        break;
    }
  }

  public setHintEnabled(enabled: boolean): void {
    this.hintButton.setEnabled(enabled);
  }

  public setRemoveEnabled(enabled: boolean): void {
    this.removeButton.setEnabled(enabled);
  }

  public setSkipEnabled(enabled: boolean): void {
    this.skipButton.setEnabled(enabled);
  }
}
