import { Application, Container, Graphics, Text, Sprite } from 'pixi.js';
// import { Background } from '../ui/components/Background';
import { BaseScene } from '@core/BaseScene';
import { COLORS, DESIGN, LAYOUT, TYPOGRAPHY } from '@config/constants';
import { 
  RoundedButton, 
  ProgressBar, 
  Timer, 
  PowerUpButton, 
  AlternativeButton, 
  StreakIndicator 
} from '@ui/components';
import { DebugControlPanel } from '@ui/components/DebugControlPanel';
import { Question } from '@data/models/Question';
import { StreakSystem } from '@systems/StreakSystem';
import { PixelPerfectDebugger } from '@debug/PixelPerfectDebugger';

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
  private questionText!: Text;
  private enunciadoCard?: Container;
  private alternativesContainer!: Container;
  private alternatives: AlternativeButton[] = [];

  // Footer components
  private footerContainer!: Container;
  private hintButton!: PowerUpButton;
  private removeButton!: PowerUpButton;
  private skipButton!: PowerUpButton;

  // Streak system
  private streakIndicator!: StreakIndicator;
  private streakSystem: StreakSystem;

  // Debug system
  private debugger!: PixelPerfectDebugger;
  private debugControlPanel!: DebugControlPanel;

  // State
  private currentQuestion: Question | null = null;
  private currentQuestionIndex = 0;
  private totalQuestions = 10;
  private selectedAlternativeIndex: number | null = null;

  constructor(app: Application) {
    super(app);
    this.streakSystem = new StreakSystem();
    this.setupDebugControls();
    this.setupGlobalMouseEvents();
  }
  
  private setupGlobalMouseEvents(): void {
    // Evento global de mouse up para soltar drag
    window.addEventListener('pointerup', () => {
      this.debugControlPanel?.stopDragging();
    });
  }

  private setupDebugControls(): void {
    // Toggle debug com tecla 'D'
    window.addEventListener('keydown', (e) => {
      if (e.key === 'd' || e.key === 'D') {
        this.debugger?.toggle();
      }
      // Toggle edit mode com tecla 'E'
      if (e.key === 'e' || e.key === 'E') {
        this.debugger?.toggleEditMode();
      }
      // Salva mudanças no console com tecla 'S'
      if (e.key === 's' || e.key === 'S') {
        this.debugger?.saveChanges();
      }
      // Copia layout para clipboard com tecla 'C'
      if (e.key === 'c' || e.key === 'C') {
        this.debugger?.copyToClipboard();
      }
      // Descarta mudanças com ESC
      if (e.key === 'Escape') {
        this.debugger?.discardChanges();
      }
      // Limpa cache persistido com 'R'
      if (e.key === 'r' || e.key === 'R') {
        localStorage.removeItem('trivia_layout_overrides');
        console.log('🗑️ Layout cache cleared. Reload to reset.');
      }
      // Ajusta alpha do overlay com '+' e '-'
      if (e.key === '+' || e.key === '=') {
        const current = this.debugger?.['referenceOverlay']?.alpha || 0.3;
        this.debugger?.setReferenceAlpha(Math.min(1, current + 0.1));
      }
      if (e.key === '-' || e.key === '_') {
        const current = this.debugger?.['referenceOverlay']?.alpha || 0.3;
        this.debugger?.setReferenceAlpha(Math.max(0, current - 0.1));
      }
    });
  }

  protected async load(): Promise<void> {
    // Carregar o PNG do Figma primeiro
    const { Assets } = await import('pixi.js');
    
    // Lista de assets para carregar (com fallback silencioso)
    const assetsToLoad = [
      '/assets/backgrounds/tela-1-static.png',
      '/assets/ui/timer/timer-bg.png',
      '/assets/ui/streak/fire.png',
      '/assets/ui/alternatives/alternative-a-normal.png',
      '/assets/ui/alternatives/alternative-a-hovered.png',
      '/assets/ui/alternatives/alternative-a-correct.png',
      '/assets/ui/alternatives/alternative-a-wrong.png',
      '/assets/ui/powerups/pedir-dica.png',
      '/assets/ui/powerups/remover-alternativa.png',
      '/assets/ui/powerups/pular-questao.png',
    ];

    // Carrega assets que existem, ignora os que não existem
    for (const asset of assetsToLoad) {
      try {
        await Assets.load(asset);
      } catch (error) {
        // Silenciosamente ignora assets que não existem (usará fallback)
      }
    }
    
    // Carregar questões mock
    const response = await fetch('/assets/data/mockQuestions.json');
    const questions = (await response.json()) as Question[];
    this.currentQuestion = questions[0] || null;
    return Promise.resolve();
  }

  protected create(): void {
    this.createBackground();
    this.createDebugger();
    this.createHeader();
    this.createStreakIndicator();
    this.createQuestionArea();
    this.createFooter();
    
    // Inicia com primeira questão
    if (this.currentQuestion) {
      this.displayQuestion(this.currentQuestion);
    }
    
    // Valida componentes após criação
    this.validateComponents();
  }

  private createDebugger(): void {
    this.debugger = new PixelPerfectDebugger();
    // Carrega a imagem de referência (coloque o PNG completo do Figma aqui)
    this.debugger.loadReferenceImage('/assets/backgrounds/tela-1-reference.png');
    this.addChild(this.debugger);
    
    // Cria painel de controles visuais
    this.debugControlPanel = new DebugControlPanel();
    this.addChild(this.debugControlPanel);
    
    // Conecta callbacks
    this.debugControlPanel.onDebugToggle(() => {
      this.debugger.toggle();
      this.debugControlPanel.setDebugActive(this.debugger['isVisible']);
    });
    
    this.debugControlPanel.onEditToggle(() => {
      this.debugger.toggleEditMode();
      this.debugControlPanel.setEditActive(this.debugger['editMode']);
    });
    
    this.debugControlPanel.onSave(() => {
      this.debugger.saveChanges();
    });
    
    this.debugControlPanel.onReset(() => {
      localStorage.removeItem('trivia_layout_overrides');
      console.log('🗑️ Layout cache cleared. Reload to reset.');
      window.location.reload();
    });
    
    this.debugControlPanel.onAlphaDecrease(() => {
      const current = this.debugger['referenceOverlay']?.alpha || 0.3;
      this.debugger.setReferenceAlpha(Math.max(0, current - 0.1));
    });
    
    this.debugControlPanel.onAlphaIncrease(() => {
      const current = this.debugger['referenceOverlay']?.alpha || 0.3;
      this.debugger.setReferenceAlpha(Math.min(1, current + 0.1));
    });
    
    this.debugControlPanel.onDiscard(() => {
      this.debugger.discardChanges();
    });
    
    this.debugControlPanel.onCopy(() => {
      this.debugger.copyToClipboard();
    });
    
    console.log('🔍 Debug Mode: Press [D] to toggle | [+/-] to adjust overlay alpha');
    console.log('🎮 Debug Controls: Visual panel available at footer');
  }

  private validateComponents(): void {
    // Valida Timer
    if (this.timerCircle) {
      this.debugger.checkComponent(
        'timer',
        this.timerCircle.x,
        this.timerCircle.y,
        LAYOUT.HEADER.TIMER.size,
        LAYOUT.HEADER.TIMER.size
      );
    }
    
    // Valida Power-ups
    if (this.hintButton) {
      this.debugger.checkComponent(
        'hint-button',
        this.hintButton.x,
        this.footerContainer.y + this.hintButton.y,
        LAYOUT.FOOTER.HINT_BUTTON.width,
        LAYOUT.FOOTER.HINT_BUTTON.height
      );
    }
    
    if (this.removeButton) {
      this.debugger.checkComponent(
        'remove-button',
        this.removeButton.x,
        this.footerContainer.y + this.removeButton.y,
        LAYOUT.FOOTER.REMOVE_BUTTON.width,
        LAYOUT.FOOTER.REMOVE_BUTTON.height
      );
    }
    
    if (this.skipButton) {
      this.debugger.checkComponent(
        'skip-button',
        this.skipButton.x,
        this.footerContainer.y + this.skipButton.y,
        LAYOUT.FOOTER.SKIP_BUTTON.width,
        LAYOUT.FOOTER.SKIP_BUTTON.height
      );
    }
    
    // Valida Alternatives (considera posição do container)
    this.alternatives.forEach((alt, index) => {
      const letter = String.fromCharCode(97 + index); // a, b, c, d
      
      this.debugger.checkComponent(
        `alternative-${letter}`,
        this.alternativesContainer.x + alt.x,
        this.alternativesContainer.y + alt.y,
        LAYOUT.QUESTION.ALTERNATIVE.width,
        LAYOUT.QUESTION.ALTERNATIVE.height
      );
    });
    
    // Registra componentes para edição interativa
    this.registerComponentsForEditing();
  }

  private registerComponentsForEditing(): void {
    // Timer
    if (this.timerCircle) {
      this.debugger.registerComponent('timer', this.timerCircle);
    }
    
    // Power-ups (ajusta posição para absoluta)
    if (this.hintButton) {
      const absoluteContainer = new Container();
      absoluteContainer.position.set(
        this.hintButton.x,
        this.footerContainer.y + this.hintButton.y
      );
      absoluteContainer.addChild(this.hintButton);
      this.debugger.registerComponent('hint-button', this.hintButton);
    }
    
    if (this.removeButton) {
      this.debugger.registerComponent('remove-button', this.removeButton);
    }
    
    if (this.skipButton) {
      this.debugger.registerComponent('skip-button', this.skipButton);
    }
    
    // Alternatives
    this.alternatives.forEach((alt, index) => {
      const letter = String.fromCharCode(97 + index);
      this.debugger.registerComponent(`alternative-${letter}`, alt);
    });
  }

  private createBackground(): void {
    // Renderiza o PNG exportado do Figma como fundo pixel-perfect
    const bg = Sprite.from('/assets/backgrounds/tela-1-static.png');
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

  private createStreakIndicator(): void {
    // Indicador de streak no centro da tela (entre header e questões)
    this.streakIndicator = new StreakIndicator();
    this.streakIndicator.position.set(
      DESIGN.WIDTH / 2,
      DESIGN.HEIGHT / 2 - 150 // Ajustar conforme necessário
    );
    this.addChild(this.streakIndicator);
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

    // Alternatives container (posiciona no grid correto)
    this.alternativesContainer = new Container();
    this.alternativesContainer.position.set(
      LAYOUT.QUESTION.ALTERNATIVES_GRID.x,
      LAYOUT.QUESTION.ALTERNATIVES_GRID.y
    );
    this.addChild(this.alternativesContainer); // Adiciona direto à cena, não ao questionContainer
  }

  private createFooter(): void {
    this.footerContainer = new Container();
    this.footerContainer.position.set(0, LAYOUT.FOOTER.Y);
    this.addChild(this.footerContainer);

    console.log('🔧 Creating Footer Power-ups:');
    
    // Hint button (PEDIR DICA)
    console.log(`  💡 HINT at x: ${LAYOUT.FOOTER.HINT_BUTTON.x}`);
    this.hintButton = new PowerUpButton({
      type: 'hint',
      x: LAYOUT.FOOTER.HINT_BUTTON.x,
      y: 20,
    });
    this.hintButton.onClick(() => this.useHint());
    this.footerContainer.addChild(this.hintButton);
    
    // DEBUG: Verificar propriedades do botão HINT
    setTimeout(() => {
      console.log('🐛 HINT BUTTON DEBUG:');
      console.log(`   Position: (${this.hintButton?.x}, ${this.hintButton?.y})`);
      console.log(`   Absolute: (${this.hintButton?.x}, ${this.footerContainer.y + (this.hintButton?.y || 0)})`);
      console.log(`   Visible: ${this.hintButton?.visible}`);
      console.log(`   Alpha: ${this.hintButton?.alpha}`);
      console.log(`   Width/Height: ${this.hintButton?.width}x${this.hintButton?.height}`);
      console.log(`   Children: ${this.hintButton?.children.length}`);
      console.log(`   Parent: ${this.hintButton?.parent?.constructor.name}`);
    }, 1000);


    // Remove alternative button (REMOVER ALTERNATIVA)
    console.log(`  🗑️ REMOVE at x: ${LAYOUT.FOOTER.REMOVE_BUTTON.x}`);
    this.removeButton = new PowerUpButton({
      type: 'remove',
      x: LAYOUT.FOOTER.REMOVE_BUTTON.x,
      y: 20,
    });
    this.removeButton.onClick(() => this.useRemoveAlternative());
    this.footerContainer.addChild(this.removeButton);

    // Skip button (PULAR QUESTÃO)
    console.log(`  ⏭️ SKIP at x: ${LAYOUT.FOOTER.SKIP_BUTTON.x}`);
    this.skipButton = new PowerUpButton({
      type: 'skip',
      x: LAYOUT.FOOTER.SKIP_BUTTON.x,
      y: 20,
    });
    this.skipButton.onClick(() => this.skipQuestion());
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

    // Gerencia sistema de streak
    if (isCorrect) {
      const newStreak = this.streakSystem.increment();
      
      if (newStreak === 1) {
        // Primeira acertada: mostra indicador
        this.streakIndicator.show(this.streakSystem.getLevel());
      } else if (newStreak <= 5) {
        // Incrementa animação
        this.streakIndicator.increment(this.streakSystem.getLevel());
      }
      
      const multiplier = this.streakSystem.getMultiplier();
      console.log(`✅ Correto! Streak: ${newStreak}x (multiplicador: ${multiplier}x)`);
    } else {
      // Reseta streak ao errar
      if (this.streakSystem.getCurrent() > 0) {
        this.streakIndicator.hide();
        this.streakSystem.reset();
      }
      console.log('❌ Errado! Streak resetado.');
    }

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
      
      // Pular também reseta streak
      if (this.streakSystem.getCurrent() > 0) {
        this.streakIndicator.hide();
        this.streakSystem.reset();
      }
      
      this.nextQuestion();
    }
  }

  update(_delta: number): void {
    // Atualizar drag do painel de controles
    if (this.debugControlPanel) {
      const mousePos = this.app.renderer.events.pointer;
      this.debugControlPanel.update(mousePos.global.x, mousePos.global.y);
    }
    
    // TODO: Atualizar timer
    // const currentTime = this.timerCircle.getTime();
    // this.timerCircle.setTime(currentTime - _delta * 16.67, 90000);
  }
}
