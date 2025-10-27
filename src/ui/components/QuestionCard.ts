/**
 * QuestionCard - Card da pergunta principal com glassmorphism
 * Renderização nativa via Graphics (sem PNGs)
 * Coordenadas extraídas do Figma HTML
 */
import { Container, Text } from 'pixi.js';
import { LAYOUT } from '../../config/constants';
import { GlassPanel } from '../primitives/GlassPanel';

export class QuestionCard extends Container {
  private panel: GlassPanel;
  private questionText: Text;

  constructor() {
    super();

    const cardLayout = LAYOUT.QUESTION_CARD;
    console.log(`🎨 QuestionCard: Creating card ${cardLayout.WIDTH}x${cardLayout.HEIGHT}...`);

    // Panel glassmorphism (fundo + outline ciano)
    this.panel = new GlassPanel({
      width: cardLayout.WIDTH,
      height: cardLayout.HEIGHT,
      borderRadius: 60,
      bgColor: 0x000000, // Preto puro (volta ao original)
      bgAlpha: 0.85, // Semi-transparente glassmorphism (0.95→0.85)
      borderColor: 0x0A9C9A, // Ciano primário
      borderWidth: 3, // Borda fina final (6→3)
    });
    this.addChild(this.panel);
    console.log('  ✅ Panel added');

    // Texto da pergunta (centralizado)
    this.questionText = new Text({
      text: '',
      style: {
        fontFamily: 'Montserrat',
        fontSize: 44,
        fontWeight: '700',
        fill: 0xFFFFFF,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardLayout.TEXT_WIDTH,
      },
    });
    this.questionText.anchor.set(0.5);
    this.questionText.x = cardLayout.WIDTH / 2;
    this.questionText.y = cardLayout.HEIGHT / 2;
    this.addChild(this.questionText);
    console.log('  ✅ Text added (empty)');
  }

  public setQuestion(text: string): void {
    this.questionText.text = text;
    this.questionText.style.wordWrapWidth = LAYOUT.QUESTION_CARD.TEXT_WIDTH;
    console.log(`  📝 QuestionCard text set: "${text.substring(0, 50)}..." | visible:${this.visible} alpha:${this.alpha}`);
  }
}
