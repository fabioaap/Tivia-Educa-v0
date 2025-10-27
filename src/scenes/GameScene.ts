import { Application } from 'pixi.js';
import { BaseScene } from '@core/BaseScene';
import { FooterHUD } from '@ui/components/FooterHUD';
import { QuestionCard } from '@ui/components/QuestionCard';
import { AlternativesGrid } from '@ui/components/AlternativesGrid';
import { HeaderHUD } from '@ui/components/HeaderHUD';
import { Question } from '@data/models/Question';
import { StreakSystem } from '@systems/StreakSystem';
import { PixelPerfectDebugger } from '@debug/PixelPerfectDebugger';
import { LayoutExporter } from '../utils/LayoutExporter';
import { DebugControlPanel } from '@ui/components/DebugControlPanel';
import { LAYOUT } from '../config/constants';

export class GameScene extends BaseScene {
  // Native UI components (Graphics API)
  private headerHUD!: HeaderHUD;
  private questionCard!: QuestionCard;
  private alternativesGrid!: AlternativesGrid;
  private footerHUD!: FooterHUD;

  // Streak system
  private streakSystem: StreakSystem;

  // Debug system
  private debugger!: PixelPerfectDebugger;
  private debugControlPanel!: DebugControlPanel;

  // Layout exporter
  private layoutExporter!: LayoutExporter;

  // State
  private currentQuestion: Question | null = null;
  private currentQuestionIndex = 0;
  private totalQuestions = 10;
  private allQuestions: Question[] = [];

  // Game loop state
  private gameState: 'playing' | 'feedback' | 'between_questions' = 'playing';
  private timerMs = 90_000; // 90 segundos em ms
  private timerDuration = 90_000;
  private feedbackShowing = false;
  private feedbackDuration = 1500; // ms para mostrar feedback antes de próxima pergunta
  private feedbackTimer = 0;

  // Scoring
  private score = 0;
  private correctAnswers = 0;
  private totalAnswered = 0;

  // Power-ups
  private powerUpCounters = { hint: 3, remove: 3, skip: 3 };

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
    this.allQuestions = questions;
    this.totalQuestions = questions.length;
    this.currentQuestion = questions[0] || null;
    return Promise.resolve();
  }

  protected create(): void {
    this.createBackground();
    this.createDebugger();
    // Os componentes nativos e displayQuestion serão criados após o fundo (SVG) ser carregado em createBackground()
  }

  private createDebugger(): void {
    this.debugger = new PixelPerfectDebugger();
    // Carrega a imagem de referência (coloque o PNG completo do Figma aqui)
    this.debugger.loadReferenceImage('/assets/backgrounds/tela-1-reference.png');
    this.addChild(this.debugger);
    
    // Cria painel de controles visuais
    this.debugControlPanel = new DebugControlPanel();
    this.debugControlPanel.alpha = 0; // DESABILITADO - oculta painel de debug
    this.debugControlPanel.visible = false; // Remove interatividade
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

  private createBackground(): void {
    // SVG é usado APENAS como referência - NÃO renderizar no canvas
    // Chamar direto para criar componentes nativos
    this.sortableChildren = true;
    this.createNativeUI();
  }
  
  private createNativeUI(): void {
    console.log('🎨 Creating NATIVE UI components (Graphics API)...');
    
    // Header (progress bar + avatar + timer)
    this.headerHUD = new HeaderHUD();
    this.headerHUD.zIndex = 10;
    this.addChild(this.headerHUD);
    console.log(`  ✅ HeaderHUD added at (${this.headerHUD.x}, ${this.headerHUD.y})`);

    // Ajuste fino: QuestionCard (x:380, y:230 do Figma)
    this.questionCard = new QuestionCard();
    this.questionCard.position.set(LAYOUT.QUESTION_CARD.X, LAYOUT.QUESTION_CARD.Y);
    this.questionCard.zIndex = 10;
    this.addChild(this.questionCard);
    console.log(`  ✅ QuestionCard added at (${this.questionCard.x}, ${this.questionCard.y}) | visible:${this.questionCard.visible} alpha:${this.questionCard.alpha}`);
    // Ajuste fino: AlternativesGrid (x:360, y:370 do Figma)
    this.alternativesGrid = new AlternativesGrid((letter: string) => this.handleAlternativeClick(letter));
    this.alternativesGrid.position.set(LAYOUT.ALTERNATIVES_GRID.X, LAYOUT.ALTERNATIVES_GRID.Y);
    this.alternativesGrid.zIndex = 10;
    this.addChild(this.alternativesGrid);
    console.log(`  ✅ AlternativesGrid added at (${this.alternativesGrid.x}, ${this.alternativesGrid.y}) | children:${this.alternativesGrid.children.length}`);

    // Footer ANTES de displayQuestion (necessário para callbacks)
    this.createFooter();

    // Agora sim, pode exibir a primeira questão (após garantir todos os componentes criados)
    setTimeout(() => {
      if (this.currentQuestion && this.questionCard && this.alternativesGrid) {
        this.displayQuestion(this.currentQuestion);
      }
    }, 0);

    // Registrar componentes no Layout Exporter
    this.layoutExporter = new LayoutExporter();
    this.layoutExporter.registerComponent('header', this.headerHUD);
    this.layoutExporter.registerComponent('questionCard', this.questionCard);
    this.layoutExporter.registerComponent('alternativesGrid', this.alternativesGrid);
    if (this.footerHUD) {
      this.layoutExporter.registerComponent('footer', this.footerHUD);
    }
    console.log('📐 Layout Exporter ativo: pressione [E] para exportar coordenadas');
  }

  private createFooter(): void {
    console.log('🎨 Creating NATIVE FooterHUD (Graphics API):');
    
    // Novo FooterHUD nativo com callbacks conectados aos métodos do GameScene
    this.footerHUD = new FooterHUD({
      onHint: () => this.useHint(),
      onRemove: () => this.useRemoveAlternative(),
      onSkip: () => this.skipQuestion(),
    });
    this.footerHUD.position.set(LAYOUT.FOOTER.X, LAYOUT.FOOTER.Y);
    this.addChild(this.footerHUD); // Adiciona direto à cena (coordenadas absolutas)
  }

  private displayQuestion(question: Question): void {
    this.currentQuestion = question;
    
    // Atualiza QuestionCard nativo
    this.questionCard.setQuestion(question.text);
    
    // Atualiza AlternativesGrid nativo
    if (this.alternativesGrid && typeof this.alternativesGrid.setAlternatives === 'function') {
      const alternatives = question.alternatives.map((text, index) => ({
        letter: String.fromCharCode(65 + index), // A, B, C, D
        text,
        isCorrect: question.correctIndex === index,
      }));
      this.alternativesGrid.reset();
      this.alternativesGrid.setAlternatives(alternatives);
    } else {
      console.warn('AlternativesGrid ou setAlternatives não inicializado!');
    }
    
    // Atualiza progress bar
    const progressValue = (this.currentQuestionIndex + 1) / this.totalQuestions;
    this.headerHUD.setProgress(progressValue);
  }
  
  private handleAlternativeClick(letter: string): void {
    if (!this.currentQuestion || this.gameState !== 'playing' || this.feedbackShowing) return;

    // Converte letra (A, B, C, D) para index (0, 1, 2, 3)
    const selectedIndex = letter.charCodeAt(0) - 65;
    const isCorrect = this.currentQuestion.correctIndex === selectedIndex;
    
    // Desabilitar todos os botões após resposta
    ['A', 'B', 'C', 'D'].forEach((l) => this.alternativesGrid.disableButton(l));
    
    // Mostrar feedback visual (correto/errado)
    if (isCorrect) {
      this.alternativesGrid.markCorrect(letter);
      this.correctAnswers++;
      const baseScore = 100;
      const timeBonus = Math.max(0, Math.floor(this.timerMs / 1000) * 10); // 10 pts por segundo restante
      const roundScore = baseScore + timeBonus;
      this.score += roundScore;
      this.streakSystem.increment();
      console.log(`✅ Resposta correta! +${roundScore} pts (streak: ${this.streakSystem.getCurrent()})`);
    } else {
      this.alternativesGrid.markWrong(letter);
      // Mostrar resposta correta
      const correctLetter = String.fromCharCode(65 + this.currentQuestion.correctIndex);
      this.alternativesGrid.markCorrect(correctLetter);
      this.streakSystem.reset();
      console.log(`❌ Resposta errada! Streak resetado.`);
    }

    this.totalAnswered++;
    this.feedbackShowing = true;
    this.gameState = 'feedback';
  }

  private handleTimeoutQuestion(): void {
    if (!this.currentQuestion) return;
    
    console.log('⏱️ Tempo esgotado!');
    this.streakSystem.reset();
    
    // Desabilitar todos os botões
    ['A', 'B', 'C', 'D'].forEach((l) => this.alternativesGrid.disableButton(l));
    
    // Mostrar resposta correta
    const correctLetter = String.fromCharCode(65 + this.currentQuestion.correctIndex);
    this.alternativesGrid.markCorrect(correctLetter);
    
    this.totalAnswered++;
    this.feedbackShowing = true;
    this.feedbackDuration = 1000; // Menor tempo para timeout
    this.gameState = 'feedback';
  }

  private nextQuestion(): void {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.totalQuestions) {
      console.log('🎉 Rodada finalizada!');
      console.log(`📊 Pontuação final: ${this.score} pontos`);
      console.log(`✅ Acertos: ${this.correctAnswers}/${this.totalAnswered}`);
      this.gameState = 'between_questions';
      return;
    }

    // Carregar próxima questão
    if (this.allQuestions[this.currentQuestionIndex]) {
      const nextQuestion = this.allQuestions[this.currentQuestionIndex];
      if (nextQuestion) {
        this.currentQuestion = nextQuestion;
        this.timerMs = this.timerDuration; // Reset timer
        this.gameState = 'playing';
        
        // Habilitar todos os botões novamente
        ['A', 'B', 'C', 'D'].forEach((l) => this.alternativesGrid.enableButton(l));
        
        this.displayQuestion(this.currentQuestion);
        console.log(`📋 Pergunta ${this.currentQuestionIndex + 1}/${this.totalQuestions}`);
      }
    }
  }

  private useHint(): void {
    if (this.powerUpCounters.hint <= 0 || !this.currentQuestion) return;
    
    this.powerUpCounters.hint--;
    console.log(`💡 Dica usada! Restam: ${this.powerUpCounters.hint}`);
    
    // Remove 2 alternativas incorretas aleatoriamente
    const incorrectIndices = this.currentQuestion.alternatives
      .map((_, idx) => idx)
      .filter((idx) => idx !== this.currentQuestion!.correctIndex);
    
    // Shuffle e remove as 2 primeiras
    incorrectIndices.sort(() => Math.random() - 0.5);
    const toRemove = incorrectIndices.slice(0, 2);
    
    toRemove.forEach((idx) => {
      const letter = String.fromCharCode(65 + idx);
      this.alternativesGrid.disableButton(letter);
    });
    
    this.footerHUD.updatePowerUpCounter('hint', this.powerUpCounters.hint);
  }

  private useRemoveAlternative(): void {
    if (this.powerUpCounters.remove <= 0 || !this.currentQuestion) return;
    
    this.powerUpCounters.remove--;
    console.log(`🗑️ Remover alternativa usada! Restam: ${this.powerUpCounters.remove}`);
    
    // Remove 1 alternativa incorreta aleatoriamente
    const incorrectIndices = this.currentQuestion.alternatives
      .map((_, idx) => idx)
      .filter((idx) => idx !== this.currentQuestion!.correctIndex);
    
    if (incorrectIndices.length > 0) {
      const randomIdx = incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)]!;
      const letter = String.fromCharCode(65 + randomIdx);
      this.alternativesGrid.disableButton(letter);
    }
    
    this.footerHUD.updatePowerUpCounter('remove', this.powerUpCounters.remove);
  }

  private skipQuestion(): void {
    if (this.powerUpCounters.skip <= 0) return;
    
    this.powerUpCounters.skip--;
    console.log(`⏭️ Questão pulada! Restam: ${this.powerUpCounters.skip}`);
    
    // Reseta streak ao pular
    if (this.streakSystem.getCurrent() > 0) {
      this.streakSystem.reset();
    }
    
    // Desabilitar todos os botões
    ['A', 'B', 'C', 'D'].forEach((l) => this.alternativesGrid.disableButton(l));
    this.feedbackShowing = true;
    this.feedbackDuration = 500; // Transição rápida
    this.gameState = 'feedback';
    
    this.footerHUD.updatePowerUpCounter('skip', this.powerUpCounters.skip);
  }

  public override update(delta: number): void {
    // Game loop - Timer countdown
    if (this.gameState === 'playing' && !this.feedbackShowing) {
      this.timerMs -= delta * 1000; // delta já é em segundos (Pixi.js), converte para ms

      // Perde questão se tempo acabar
      if (this.timerMs <= 0) {
        this.timerMs = 0;
        this.handleTimeoutQuestion();
      }
    }

    // Feedback visual (espera antes de próxima pergunta)
    if (this.feedbackShowing) {
      this.feedbackTimer += delta * 1000;
      if (this.feedbackTimer >= this.feedbackDuration) {
        this.feedbackShowing = false;
        this.feedbackTimer = 0;
        this.nextQuestion();
      }
    }

    // Atualizar drag do painel de controles (legado debug)
    if (this.debugControlPanel) {
      const mousePos = this.app.renderer.events.pointer;
      this.debugControlPanel.update(mousePos.global.x, mousePos.global.y);
    }
  }
}
