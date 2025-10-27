/**
 * HeaderHUD - Header com progress bar, avatar, timer e botões de navegação
 * Renderização nativa via Graphics (sem PNGs)
 * Coordenadas extraídas do Figma HTML
 */
import { Container, Graphics, Text } from 'pixi.js';
import { ProgressBar } from './ProgressBar';
import { IconButton } from './IconButton';

export class HeaderHUD extends Container {
  private progressBar: ProgressBar;
  private avatar: Graphics;
  private timerText: Text;
  private timerBg: Graphics;
  private backButton: IconButton;
  private homeButton: IconButton;
  private rightButtons: IconButton[] = [];

  constructor() {
    super();

    // IMPORTANTE: Habilita ordenação por zIndex
    this.sortableChildren = true;

    console.log(' HeaderHUD: Creating native header components...');

    // Botão VOLTAR (x:33, y:33, size:75 do Figma)
    this.backButton = new IconButton({
      size: 75,
      icon: '',
      bgColor: 0x0A9C9A,
      onClick: () => console.log(' Voltar clicked'),
    });
    this.backButton.position.set(33, 33);
    this.backButton.zIndex = 5; // Garante visibilidade
    this.addChild(this.backButton);
    console.log('   Back button at (33, 33)');

    // Botão HOME (x:143, y:33, size:75 do Figma)
    this.homeButton = new IconButton({
      size: 75,
      icon: '',
      bgColor: 0x0A9C9A,
      onClick: () => console.log(' Home clicked'),
    });
    this.homeButton.position.set(143, 33);
    this.addChild(this.homeButton);
    console.log('   Home button at (143, 33)');

    // Progress Bar (x:20, y:68 do Figma) - DESABILITADO (PNG do fundo já mostra)
    this.progressBar = new ProgressBar({ width: 880, height: 40 });
    this.progressBar.position.set(20, 68);
    this.progressBar.alpha = 0; // Oculto - PNG de fundo já tem a barra
    this.addChild(this.progressBar);
    console.log('   Progress bar at (20, 68) [HIDDEN - PNG background has it]');
        // Avatar/Mascote (x:1750, y:10, size:50 do Figma gabarito SVG)
    this.avatar = new Graphics();
    this.avatar.circle(0, 0, 24);
    this.avatar.fill(0x0A9C9A);
    this.avatar.position.set(1750, 35);
    this.avatar.zIndex = 5; // Garante visibilidade
    this.addChild(this.avatar);
    console.log('   Avatar placeholder at (1750, 35)');
    console.log('   Avatar placeholder at (1750, 35)');

    // Timer Background (Figma gabarito: x:1800px, y:10px, width:100px, height:50px)
    this.timerBg = new Graphics();
    this.timerBg.roundRect(0, 0, 100, 50, 15);
    this.timerBg.fill({ color: 0x000000, alpha: 0.3 });
    this.timerBg.stroke({ color: 0x0A9C9A, width: 2 });
    this.timerBg.position.set(1800, 10);
    this.timerBg.zIndex = 5; // Garante visibilidade
    this.addChild(this.timerBg);
    console.log('   Timer background at (1800, 10)');
    console.log('   Timer background at (1800, 10)');

    // Timer Text (centralizado no timerBg)
    this.timerText = new Text({
      text: '05:00',
      style: {
        fontFamily: 'Montserrat',
        fontSize: 28,
        fontWeight: '900',
        fill: 0xFFFFFF,
      },
    });
    this.timerText.anchor.set(0.5);
    this.timerText.position.set(1850, 35);
    this.timerText.zIndex = 6; // Timer text acima do background
    this.addChild(this.timerText);
    console.log('   Timer text at (1850, 35)');
    console.log('   Timer text at (1850, 35)');
    // Timer Background (Figma HTML: left:1230px, top:32.5px, width:100px, height:75px)
    this.timerBg = new Graphics();
    this.timerBg.roundRect(0, 0, 100, 75, 20);
    this.timerBg.fill({ color: 0x000000, alpha: 0.3 });
    this.timerBg.stroke({ color: 0x0A9C9A, width: 3 });
    this.timerBg.position.set(1230, 32.5);
    this.timerBg.zIndex = 5; // Garante visibilidade
    this.addChild(this.timerBg);
    console.log('   Timer background at (1230, 32.5)');
    console.log('   Timer background at (1230, 32.5)');
    // Timer Text (centralizado no timerBg)
    this.timerText = new Text({
      text: '05:00',
      style: {
        fontFamily: 'Montserrat',
        fontSize: 32,
        fontWeight: '900',
        fill: 0xFFFFFF,
      },
    });
    this.timerText.anchor.set(0.5);
    this.timerText.position.set(1280, 70);
    this.timerText.zIndex = 6; // Timer text acima do background
    this.addChild(this.timerText);
    console.log('   Timer text at (1280, 70)');
    console.log('   Timer text at (1280, 70)');

    // 5 botões laterais direitos (emojis placeholder)
    // Posicionados entre avatar e timer (canto direito do header)
    const buttonEmojis = ['', '', '', '', ''];
    const startX = 1300; // Mais à direita, entre logo e avatar
    const spacing = 80; // Espaçamento horizontal entre os botões direitos
    for (let i = 0; i < buttonEmojis.length; i++) {
      const btn = new IconButton({
        size: 60, // Um pouco menor
        icon: buttonEmojis[i] || '•',
        bgColor: 0x0A9C9A,
        onClick: () => console.log(`Button ${i} clicked`),
      });
      btn.position.set(startX + i * spacing, 35);
      btn.zIndex = 5; // Garante visibilidade
      this.rightButtons.push(btn);
      this.addChild(btn);
    }
    console.log(`  ✅ 5 right buttons starting at (${startX}, 35)`);
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
