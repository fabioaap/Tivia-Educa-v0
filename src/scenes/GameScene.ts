import { Application, Container, Graphics, Text, Sprite } from 'pixi.js';
// import { Background } from '../ui/components/Background';
import { BaseScene } from '@core/BaseScene';
import { COLORS, DESIGN, LAYOUT, TYPOGRAPHY } from '@config/constants';
import { RoundedButton } from '@ui/components/RoundedButton';
import { HeaderBar } from '@ui/components/HeaderBar';
import { ProgressBar } from '@ui/components/ProgressBar';
import { Timer } from '@ui/components/Timer';
import { PowerUpButton } from '@ui/components/PowerUpButton';
import { AlternativeButton } from '@ui/components/AlternativeButton';
import { Question } from '@data/models/Question';

export class GameScene extends BaseScene {
  // Header components
  private headerContainer!: Container;
  private backButton!: RoundedButton;
  private homeButton!: RoundedButton;
  private progressBar!: ProgressBar;
  private timerCircle!: Timer;
  private pauseButton!: RoundedButton;

  // Question components
  private questionContainer!: Container;
  private questionBg!: Graphics;
  private questionText!: Text;
  private enunciadoCard?: Container;
  private alternativesContainer!: Container;
  private alternatives: AlternativeButton[] = [];

  // Footer components
  private footerContainer!: Container;
  private hintButton!: PowerUpButton;
  private removeButton!: PowerUpButton;
  private skipButton!: PowerUpButton;

  // State
  private currentQuestion: Question | null = null;
  private currentQuestionIndex = 0;
  private totalQuestions = 10;
  private selectedAlternativeIndex: number | null = null;

  constructor(app: Application) {
    super(app);
  }

  protected async load(): Promise<void> {
    // Carregar o PNG do Figma primeiro
    const { Assets } = await import('pixi.js');
    await Assets.load('/assets/tela-1.png');
    
    // Carregar questões mock
    const response = await fetch('/assets/data/mockQuestions.json');
    const questions = (await response.json()) as Question[];
    this.currentQuestion = questions[0] || null;
    return Promise.resolve();
  }

  protected create(): void {
    this.createBackground();
    this.createHeader();
    this.createQuestionArea();
    this.createFooter();
    
    // Inicia com primeira questão
    if (this.currentQuestion) {
      this.displayQuestion(this.currentQuestion);
    }
  }

  private createBackground(): void {
    // Renderiza o PNG exportado do Figma como fundo pixel-perfect
    const bg = Sprite.from('/assets/tela-1.png');
    bg.width = DESIGN.WIDTH;
    bg.height = DESIGN.HEIGHT;
    this.addChild(bg);
  }

  private createHeader(): void {
    this.headerContainer = new Container();
    this.addChild(this.headerContainer);
    
    // Elementos estáticos (invisíveis - PNG já tem)
    const staticElements = new Container();
    staticElements.alpha = 0; // Oculta botões estáticos
    this.headerContainer.addChild(staticElements);

    // Back button
    this.backButton = new RoundedButton({
      size: LAYOUT.HEADER.BACK_BUTTON.size,
      icon: '◀',
      iconSize: 32,
    });
    this.backButton.position.set(
      LAYOUT.HEADER.BACK_BUTTON.x + LAYOUT.HEADER.BACK_BUTTON.size / 2,
      LAYOUT.HEADER.BACK_BUTTON.y + LAYOUT.HEADER.BACK_BUTTON.size / 2
    );
    this.backButton.onClick = () => console.log('Back clicked');
    staticElements.addChild(this.backButton);

    // Home button
    this.homeButton = new RoundedButton({
      size: LAYOUT.HEADER.HOME_BUTTON.size,
      icon: '🏠',
      iconSize: 32,
    });
    this.homeButton.position.set(
      LAYOUT.HEADER.HOME_BUTTON.x + LAYOUT.HEADER.HOME_BUTTON.size / 2,
      LAYOUT.HEADER.HOME_BUTTON.y + LAYOUT.HEADER.HOME_BUTTON.size / 2
    );
    this.homeButton.onClick = () => console.log('Home clicked');
    staticElements.addChild(this.homeButton);

    // Pause button
    this.pauseButton = new RoundedButton({
      size: LAYOUT.HEADER.PAUSE.size,
      icon: '⏸',
      iconSize: 28,
    });
    this.pauseButton.position.set(
      LAYOUT.HEADER.PAUSE.x + LAYOUT.HEADER.PAUSE.size / 2,
      LAYOUT.HEADER.PAUSE.y + LAYOUT.HEADER.PAUSE.size / 2
    );
    this.pauseButton.onClick = () => console.log('Pause clicked');
    staticElements.addChild(this.pauseButton);

    // ELEMENTOS DINÂMICOS (visíveis e animáveis)
    // Progress bar
    this.progressBar = new ProgressBar({
      width: LAYOUT.HEADER.PROGRESS_BAR.width,
      height: LAYOUT.HEADER.PROGRESS_BAR.height,
      label: 'EDUCACROSS EXTREME',
    });
    this.progressBar.position.set(
      LAYOUT.HEADER.PROGRESS_BAR.x,
      LAYOUT.HEADER.PROGRESS_BAR.y
    );
    this.progressBar.setProgress(0.1);
    this.progressBar.alpha = 0; // Temporariamente oculto - PNG já mostra
    this.headerContainer.addChild(this.progressBar);

    // Timer (VISÍVEL e ANIMÁVEL)
    this.timerCircle = new Timer({
      size: LAYOUT.HEADER.TIMER.size,
    });
    this.timerCircle.position.set(
      LAYOUT.HEADER.TIMER.x,
      LAYOUT.HEADER.TIMER.y
    );
    this.timerCircle.setTime(90000, 90000); // 1:30
    // Timer fica VISÍVEL para animação em tempo real
    this.headerContainer.addChild(this.timerCircle);
  }

  private createQuestionArea(): void {
    this.questionContainer = new Container();
    this.questionContainer.alpha = 0; // Oculta - PNG já tem os visuais
    this.questionContainer.position.set(
      LAYOUT.QUESTION.CONTAINER.x,
      LAYOUT.QUESTION.CONTAINER.y
    );
    this.addChild(this.questionContainer);

    // O PNG já tem o visual - removemos backgrounds duplicados
    
    // Question text (invisível - o PNG já tem o texto visível)
    this.questionText = new Text({
      text: '',
      style: {
        fontFamily: TYPOGRAPHY.FONT_BODY,
        fontSize: TYPOGRAPHY.SIZES.QUESTION,
        fill: COLORS.TEXT_WHITE,
        fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
        wordWrap: true,
        wordWrapWidth: LAYOUT.QUESTION.CONTAINER.width - LAYOUT.QUESTION.TEXT.paddingX * 2,
        align: 'center',
      },
    });
    this.questionText.anchor.set(0.5, 0);
    this.questionText.position.set(
      LAYOUT.QUESTION.CONTAINER.width / 2,
      LAYOUT.QUESTION.TEXT.paddingY
    );
    this.questionText.alpha = 0; // Oculta pois o PNG já mostra o texto
    this.questionContainer.addChild(this.questionText);

    // Alternatives container
    this.alternativesContainer = new Container();
    this.alternativesContainer.position.set(50, 360);
    this.questionContainer.addChild(this.alternativesContainer);
  }

  private createFooter(): void {
    this.footerContainer = new Container();
    this.footerContainer.alpha = 0; // Oculta - PNG já tem os visuais
    this.footerContainer.position.set(0, LAYOUT.FOOTER.Y);
    this.addChild(this.footerContainer);

    // O PNG já tem o footer - removemos o background duplicado

    // Hint button
    this.hintButton = new PowerUpButton({
      width: LAYOUT.FOOTER.HINT_BUTTON.width,
      height: LAYOUT.FOOTER.HINT_BUTTON.height,
      icon: '💡',
      label: 'PEDIR DICA',
      uses: 3,
      maxUses: 3,
    });
    this.hintButton.position.set(LAYOUT.FOOTER.HINT_BUTTON.x, 20);
    this.hintButton.onClick = () => this.useHint();
    this.footerContainer.addChild(this.hintButton);

    // Remove alternative button
    this.removeButton = new PowerUpButton({
      width: LAYOUT.FOOTER.REMOVE_BUTTON.width,
      height: LAYOUT.FOOTER.REMOVE_BUTTON.height,
      icon: '🗑️',
      label: 'REMOVER ALTERNATIVA',
      uses: 3,
      maxUses: 3,
    });
    this.removeButton.position.set(LAYOUT.FOOTER.REMOVE_BUTTON.x, 20);
    this.removeButton.onClick = () => this.useRemoveAlternative();
    this.footerContainer.addChild(this.removeButton);

    // Skip button
    this.skipButton = new PowerUpButton({
      width: LAYOUT.FOOTER.SKIP_BUTTON.width,
      height: LAYOUT.FOOTER.SKIP_BUTTON.height,
      icon: '⏭️',
      label: 'PULAR QUESTÃO',
      uses: 3,
      maxUses: 3,
    });
    this.skipButton.position.set(LAYOUT.FOOTER.SKIP_BUTTON.x, 20);
    this.skipButton.onClick = () => this.skipQuestion();
    this.footerContainer.addChild(this.skipButton);
  }

  private displayQuestion(question: Question): void {
    // Atualiza texto da questão
    this.questionText.text = question.text;

    // Cria/atualiza enunciado destacado
    if (question.enunciado) {
      this.createEnunciadoCard(question.enunciado);
    }

    // Cria alternativas
    this.createAlternatives(question.alternatives);

    // Atualiza progress bar
    const progress = (this.currentQuestionIndex + 1) / this.totalQuestions;
    this.progressBar.setProgress(progress, true);
  }

  private createEnunciadoCard(text: string): void {
    // Remove card anterior se existir
    if (this.enunciadoCard) {
      this.questionContainer.removeChild(this.enunciadoCard);
    }

    this.enunciadoCard = new Container();
    
    const cardBg = new Graphics();
    cardBg.roundRect(0, 0, 700, 140, 20);
    cardBg.fill(0x00ff8833);
    cardBg.roundRect(0, 0, 700, 140, 20);
    cardBg.stroke({ width: 3, color: COLORS.PRIMARY_CYAN });
    this.enunciadoCard.addChild(cardBg);

    const enunciadoText = new Text({
      text,
      style: {
        fontFamily: TYPOGRAPHY.FONT_BODY,
        fontSize: TYPOGRAPHY.SIZES.ENUNCIADO,
        fill: COLORS.TEXT_WHITE,
        fontWeight: TYPOGRAPHY.WEIGHTS.MEDIUM,
        wordWrap: true,
        wordWrapWidth: 640,
        align: 'center',
      },
    });
    enunciadoText.anchor.set(0.5);
    enunciadoText.position.set(350, 70);
    this.enunciadoCard.addChild(enunciadoText);

    this.enunciadoCard.position.set(200, 180);
    this.questionContainer.addChild(this.enunciadoCard);
  }

  private createAlternatives(alternatives: string[]): void {
    // Remove alternativas antigas
    this.alternatives.forEach(alt => alt.destroy());
    this.alternatives = [];
    this.alternativesContainer.removeChildren();

    const letters = ['A', 'B', 'C', 'D', 'E'];
    const cols = 2;
    const altWidth = LAYOUT.QUESTION.ALTERNATIVE.width;
    const altHeight = LAYOUT.QUESTION.ALTERNATIVE.height;
    const gapX = LAYOUT.QUESTION.ALTERNATIVE.gapX;
    const gapY = LAYOUT.QUESTION.ALTERNATIVE.gapY;

    alternatives.forEach((text, index) => {
      const alt = new AlternativeButton({
        width: altWidth,
        height: altHeight,
        letter: letters[index] || '',
        text,
      });

      const row = Math.floor(index / cols);
      const col = index % cols;
      alt.position.set(
        col * (altWidth + gapX),
        row * (altHeight + gapY)
      );

      alt.onClick = () => this.selectAlternative(index);
      this.alternativesContainer.addChild(alt);
      this.alternatives.push(alt);
    });
  }

  private selectAlternative(index: number): void {
    // Desmarca alternativa anterior
    if (this.selectedAlternativeIndex !== null) {
      this.alternatives[this.selectedAlternativeIndex]?.setState('normal');
    }

    // Marca nova alternativa
    this.selectedAlternativeIndex = index;
    this.alternatives[index]?.setState('selected');

    console.log(`Alternative ${index} selected`);

    // Simula resposta após 1 segundo
    setTimeout(() => this.checkAnswer(), 1000);
  }

  private checkAnswer(): void {
    if (this.selectedAlternativeIndex === null || !this.currentQuestion) return;

    const isCorrect = this.selectedAlternativeIndex === this.currentQuestion.correctIndex;

    // Atualiza estado das alternativas
    this.alternatives.forEach((alt, index) => {
      if (index === this.currentQuestion!.correctIndex) {
        alt.setState('correct');
      } else if (index === this.selectedAlternativeIndex) {
        alt.setState('wrong');
      } else {
        alt.setState('disabled');
      }
    });

    console.log(isCorrect ? '✅ Correto!' : '❌ Errado!');

    // Simula próxima questão após 2 segundos
    setTimeout(() => this.nextQuestion(), 2000);
  }

  private nextQuestion(): void {
    this.currentQuestionIndex++;
    this.selectedAlternativeIndex = null;

    if (this.currentQuestionIndex >= this.totalQuestions) {
      console.log('🎉 Rodada finalizada!');
      return;
    }

    // Simula carregamento de próxima questão
    // TODO: Implementar QuestionRepository
    console.log(`Próxima questão: ${this.currentQuestionIndex + 1}/${this.totalQuestions}`);
  }

  private useHint(): void {
    if (this.hintButton.use()) {
      console.log('💡 Dica usada!');
      // TODO: Mostrar dica/explicação
    }
  }

  private useRemoveAlternative(): void {
    if (this.removeButton.use() && this.currentQuestion) {
      console.log('🗑️ Remover alternativa usada!');
      // Remove 2 alternativas incorretas
      let removed = 0;
      this.alternatives.forEach((alt, index) => {
        if (removed < 2 && index !== this.currentQuestion!.correctIndex && alt.getState() !== 'disabled') {
          alt.setState('disabled');
          removed++;
        }
      });
    }
  }

  private skipQuestion(): void {
    if (this.skipButton.use()) {
      console.log('⏭️ Questão pulada!');
      this.nextQuestion();
    }
  }

  update(_delta: number): void {
    // TODO: Atualizar timer
    // const currentTime = this.timerCircle.getTime();
    // this.timerCircle.setTime(currentTime - _delta * 16.67, 90000);
  }
}
