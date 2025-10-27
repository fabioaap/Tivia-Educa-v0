/**
 * HeaderHUD - Header com progress bar, avatar, timer e botões
 * Renderização nativa via Graphics (sem PNGs)
 * Coordenadas extraídas do Figma HTML
 */
import { Container, Graphics, Text } from 'pixi.js';
import { ProgressBar } from './ProgressBar';
import { IconButton } from './IconButton';
import { LAYOUT, COLORS, TYPOGRAPHY } from '../../config/constants';

const RIGHT_BUTTON_ICONS = ['?', 'T', 'S', '!', '#'];

export class HeaderHUD extends Container {
  private readonly progressBar: ProgressBar;
  private readonly avatar: Graphics;
  private readonly timerText: Text;
  private readonly timerBg: Graphics;
  private readonly rightButtons: IconButton[] = [];

  constructor() {
    super();
    this.sortableChildren = true;

    console.log('🎯 HeaderHUD: creating native header components...');

    const headerLayout = LAYOUT.HEADER;

    const backButton = new IconButton({
      size: 72,
      icon: '<',
      bgColor: COLORS.PRIMARY_CYAN,
      onClick: () => console.log('🔙 Voltar clicado'),
    });
    backButton.position.set(24, headerLayout.AVATAR_Y);
    this.addChild(backButton);

    const homeButton = new IconButton({
      size: 72,
      icon: 'H',
      bgColor: COLORS.PRIMARY_CYAN,
      onClick: () => console.log('🏠 Home clicado'),
    });
    homeButton.position.set(118, headerLayout.AVATAR_Y);
    this.addChild(homeButton);

    this.progressBar = new ProgressBar({
      width: headerLayout.PROGRESS_BAR_WIDTH,
      height: headerLayout.PROGRESS_BAR_HEIGHT,
      borderRadius: 6,
    });
    this.progressBar.position.set(headerLayout.PROGRESS_BAR_X, headerLayout.PROGRESS_BAR_Y);
    this.addChild(this.progressBar);

    this.avatar = new Graphics();
    this.avatar.circle(0, 0, headerLayout.AVATAR_SIZE / 2);
    this.avatar.fill({ color: COLORS.PRIMARY_CYAN, alpha: 0.85 });
    this.avatar.position.set(1750, headerLayout.AVATAR_Y + headerLayout.AVATAR_SIZE / 2);
    this.avatar.zIndex = 5;
    this.addChild(this.avatar);

    this.timerBg = new Graphics();
    this.timerBg.roundRect(0, 0, 144, 72, 24);
    this.timerBg.fill({ color: 0x021428, alpha: 0.9 });
    this.timerBg.stroke({ color: COLORS.PRIMARY_CYAN, width: 2 });
    this.timerBg.position.set(headerLayout.TIMER_X, headerLayout.TIMER_Y);
    this.timerBg.zIndex = 5;
    this.addChild(this.timerBg);

    this.timerText = new Text({
      text: '05:00',
      style: {
        fontFamily: TYPOGRAPHY.FONT_DISPLAY,
        fontSize: 32,
        fontWeight: TYPOGRAPHY.WEIGHTS.BLACK,
        fill: COLORS.TEXT_WHITE,
      },
    });
    this.timerText.anchor.set(0.5);
    this.timerText.position.set(
      headerLayout.TIMER_X + this.timerBg.width / 2,
      headerLayout.TIMER_Y + this.timerBg.height / 2,
    );
    this.timerText.zIndex = 6;
    this.addChild(this.timerText);

    const rightStartX = headerLayout.TIMER_X + this.timerBg.width + 120;
    RIGHT_BUTTON_ICONS.forEach((icon, index) => {
      const btn = new IconButton({
        size: 56,
        icon,
        bgColor: COLORS.SECONDARY_CYAN,
        onClick: () => console.log(`⚙ Botão ${icon} clicado`),
      });
      btn.position.set(rightStartX + index * 70, headerLayout.AVATAR_Y + 12);
      this.rightButtons.push(btn);
      this.addChild(btn);
    });
  }

  public setProgress(value: number): void {
    this.progressBar.setProgress(value);
  }

  public setTimer(seconds: number): void {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timerText.text = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
