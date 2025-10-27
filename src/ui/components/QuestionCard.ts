/**
 * QuestionCard - Card da pergunta principal com glassmorphism
 * Renderização nativa via Graphics (sem PNGs)
 * Coordenadas extraídas do Figma HTML
 */
import { Container, Text } from 'pixi.js';
import { LAYOUT, COLORS, TYPOGRAPHY } from '../../config/constants';
import { GlassPanel } from '../primitives/GlassPanel';

export class QuestionCard extends Container {
  private readonly panel: GlassPanel;
  private readonly questionText: Text;

  constructor() {
    super();

    const cardLayout = LAYOUT.QUESTION_CARD;
    console.log(`🎯 QuestionCard: creating card ${cardLayout.WIDTH}x${cardLayout.HEIGHT}...`);

    this.panel = new GlassPanel({
      width: cardLayout.WIDTH,
      height: cardLayout.HEIGHT,
      borderRadius: 48,
      bgColor: COLORS.BG_DARK,
      bgAlpha: 0.86,
      borderColor: COLORS.PRIMARY_CYAN,
      borderWidth: 2,
    });
    this.addChild(this.panel);

    this.questionText = new Text({
      text: '',
      style: {
        fontFamily: TYPOGRAPHY.FONT_BODY,
        fontSize: TYPOGRAPHY.SIZES.QUESTION,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        fill: COLORS.TEXT_WHITE,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: cardLayout.TEXT_WIDTH,
        lineHeight: Math.round(TYPOGRAPHY.SIZES.QUESTION * 1.3),
      },
    });
    this.questionText.anchor.set(0, 0);
    this.questionText.position.set(cardLayout.TEXT_X, cardLayout.TEXT_Y);
    this.addChild(this.questionText);
  }

  public setQuestion(text: string): void {
    this.questionText.text = text;
    this.questionText.style.wordWrapWidth = LAYOUT.QUESTION_CARD.TEXT_WIDTH;
    console.log(
      `📝 QuestionCard text set: "${text.substring(0, 50)}..." | visible:${this.visible} alpha:${this.alpha}`,
    );
  }
}
