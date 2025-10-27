/**
 * FooterHUD - Container com os 3 botões de power-up
 * Renderização nativa via Graphics (sem PNGs)
 * Coordenadas extraídas do Figma HTML
 */
import { Container, Graphics, Text } from 'pixi.js';
import { RoundButton } from '../primitives/RoundButton';
import { GlassPanel } from '../primitives/GlassPanel';
import { LAYOUT, COLORS, TYPOGRAPHY } from '../../config/constants';

type PowerUpType = 'hint' | 'remove' | 'skip';

export class FooterHUD extends Container {
  private background: GlassPanel;
  private hintButton!: RoundButton;
  private removeButton!: RoundButton;
  private skipButton!: RoundButton;
  private hintCounter!: Container;
  private removeCounter!: Container;
  private skipCounter!: Container;
  private hintCountText!: Text;
  private removeCountText!: Text;
  private skipCountText!: Text;
  private readonly callbacks: Record<PowerUpType, () => void>;

  constructor(callbacks: { onHint: () => void; onRemove: () => void; onSkip: () => void }) {
    super();
    this.callbacks = {
      hint: callbacks.onHint,
      remove: callbacks.onRemove,
      skip: callbacks.onSkip,
    };

    const footerLayout = LAYOUT.FOOTER;
    this.background = new GlassPanel({
      width: footerLayout.WIDTH,
      height: footerLayout.HEIGHT,
      borderRadius: footerLayout.HEIGHT / 2,
      bgColor: COLORS.BG_DARK,
      bgAlpha: 0.8,
      borderColor: COLORS.PRIMARY_CYAN,
      borderWidth: 2,
    });
    this.addChild(this.background);

    this.createPowerUps();
    this.createCounters();
  }

  private createPowerUps(): void {
    const footerOriginX = LAYOUT.FOOTER.X;
    const footerOriginY = LAYOUT.FOOTER.Y;

    const baseButtonConfig = {
      borderRadius: 40,
      bgColor: 0x043248,
      bgAlpha: 0.92,
      hoverColor: 0x075074,
      pressedColor: 0x021d2d,
      borderColor: COLORS.PRIMARY_CYAN,
      borderWidth: 2,
      fontSize: 30,
      fontFamily: TYPOGRAPHY.FONT_BODY,
      fontColor: COLORS.TEXT_WHITE,
    } as const;

    const hintConfig = LAYOUT.FOOTER.HINT_BUTTON;
    this.hintButton = new RoundButton({
      width: hintConfig.width,
      height: hintConfig.height,
      ...baseButtonConfig,
      label: 'PEDIR DICA',
      onClick: () => this.callbacks.hint(),
    });
    this.hintButton.position.set(hintConfig.x - footerOriginX, hintConfig.y - footerOriginY);
    this.addChild(this.hintButton);

    const removeConfig = LAYOUT.FOOTER.REMOVE_BUTTON;
    this.removeButton = new RoundButton({
      width: removeConfig.width,
      height: removeConfig.height,
      ...baseButtonConfig,
      label: 'REMOVER ALTERNATIVA',
      onClick: () => this.callbacks.remove(),
    });
    this.removeButton.position.set(removeConfig.x - footerOriginX, removeConfig.y - footerOriginY);
    this.addChild(this.removeButton);

    const skipConfig = LAYOUT.FOOTER.SKIP_BUTTON;
    this.skipButton = new RoundButton({
      width: skipConfig.width,
      height: skipConfig.height,
      ...baseButtonConfig,
      label: 'PULAR QUESTÃO',
      onClick: () => this.callbacks.skip(),
    });
    this.skipButton.position.set(skipConfig.x - footerOriginX, skipConfig.y - footerOriginY);
    this.addChild(this.skipButton);
  }

  private createCounters(): void {
    const footerX = LAYOUT.FOOTER.X;
    const footerY = LAYOUT.FOOTER.Y;
    const counterOffsetY = LAYOUT.FOOTER.COUNTER_OFFSET_Y;

    const hintConfig = LAYOUT.FOOTER.HINT_BUTTON;
    this.hintCounter = this.createCounter(3);
    this.hintCounter.position.set(
      hintConfig.x - footerX + hintConfig.width - 28,
      hintConfig.y - footerY - counterOffsetY,
    );
    this.addChild(this.hintCounter);
    this.hintCountText = this.hintCounter.children[1] as Text;

    const removeConfig = LAYOUT.FOOTER.REMOVE_BUTTON;
    this.removeCounter = this.createCounter(3);
    this.removeCounter.position.set(
      removeConfig.x - footerX + removeConfig.width - 28,
      removeConfig.y - footerY - counterOffsetY,
    );
    this.addChild(this.removeCounter);
    this.removeCountText = this.removeCounter.children[1] as Text;

    const skipConfig = LAYOUT.FOOTER.SKIP_BUTTON;
    this.skipCounter = this.createCounter(3);
    this.skipCounter.position.set(
      skipConfig.x - footerX + skipConfig.width - 28,
      skipConfig.y - footerY - counterOffsetY,
    );
    this.addChild(this.skipCounter);
    this.skipCountText = this.skipCounter.children[1] as Text;
  }

  private createCounter(initialValue: number): Container {
    const container = new Container();

    const bg = new Graphics();
    bg.circle(0, 0, 18);
    bg.fill({ color: COLORS.ACCENT_ORANGE, alpha: 1 });
    bg.circle(0, 0, 18);
    bg.stroke({ width: 3, color: COLORS.TEXT_WHITE });
    container.addChild(bg);

    const text = new Text({
      text: initialValue.toString(),
      style: {
        fontFamily: TYPOGRAPHY.FONT_BODY,
        fontSize: 20,
        fontWeight: '900',
        fill: COLORS.TEXT_WHITE,
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

  public updatePowerUpCounter(type: PowerUpType, count: number): void {
    const setters: Record<PowerUpType, (value: number) => void> = {
      hint: (value) => {
        this.setHintCount(value);
        this.hintButton.setEnabled(value > 0);
      },
      remove: (value) => {
        this.setRemoveCount(value);
        this.removeButton.setEnabled(value > 0);
      },
      skip: (value) => {
        this.setSkipCount(value);
        this.skipButton.setEnabled(value > 0);
      },
    };

    setters[type](count);
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
