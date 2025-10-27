/**
 * AlternativesGrid - Grid 2x2 de alternativas (A, B, C, D)
 * Renderização nativa via Graphics (sem PNGs)
 * Coordenadas absolutas extraídas do Figma HTML
 */
import { Container, Text } from 'pixi.js';
import { LAYOUT } from '../../config/constants';
import { RoundButton } from '../primitives/RoundButton';

interface Alternative {
  letter: string;
  text: string;
  isCorrect: boolean;
}

const SLOT_SEQUENCE = ['D', 'A', 'B', 'C'] as const;
type SlotKey = (typeof SLOT_SEQUENCE)[number];

export class AlternativesGrid extends Container {
  private buttons: Map<string, RoundButton> = new Map();
  private alternativeTexts: Map<string, Text> = new Map();
  private readonly buttonWidth: number;
  private readonly buttonHeight: number;

  constructor(onSelect: (letter: string) => void) {
    super();

    console.log('🎨 AlternativesGrid: Creating native alternative buttons...');

    const gridLayout = LAYOUT.ALTERNATIVES_GRID;
    this.buttonWidth = gridLayout.BUTTON_WIDTH;
    this.buttonHeight = gridLayout.BUTTON_HEIGHT;

    SLOT_SEQUENCE.forEach((letter) => {
      const slot = gridLayout.SLOTS[letter];

      // Botão glassmorphism (fundo branco + outline ciano)
      const button = new RoundButton({
        width: this.buttonWidth,
        height: this.buttonHeight,
        borderRadius: 30,
        bgColor: 0xF5F5F5,
        bgAlpha: 0.9,
        hoverColor: 0xFFFFFF,
        pressedColor: 0xE0E0E0,
        borderColor: 0x0A9C9A,
        borderWidth: 6,
        label: '', // Vazio porque texto vai separado
        onClick: () => onSelect(letter),
      });
  button.position.set(slot.x, slot.y);
      button.zIndex = 1; // Botão atrás do texto
      this.addChild(button);
      this.buttons.set(letter, button);
      console.log(`  ✅ Button ${letter} at (${slot.x}, ${slot.y})`);

      // Texto da alternativa (sobre o botão, não como child)
      const text = new Text({
        text: `${letter}. Texto placeholder`, // DEBUG: Texto visível de teste
        style: {
          fontFamily: 'Montserrat',
          fontSize: 32, // Reduzido de 36 para evitar overflow
          fontWeight: '700',
          fill: 0x006B7E, // Azul esverdeado (visível em fundo branco)
          align: 'center',
          wordWrap: true,
          wordWrapWidth: this.buttonWidth - 80, // padding 40px cada lado (mais espaço)
          lineHeight: 38, // Espaçamento entre linhas
        },
      });
      text.anchor.set(0.5);
  text.x = slot.x + this.buttonWidth / 2;
  text.y = slot.y + this.buttonHeight / 2;
      text.zIndex = 10; // Texto na frente
      text.alpha = 1; // Garante visibilidade total
      text.visible = true; // Força visível
      this.addChild(text);
      this.alternativeTexts.set(letter, text);
      console.log(`  📝 Text ${letter}: "${text.text}" at (${text.x}, ${text.y}) | visible:${text.visible} alpha:${text.alpha} zIndex:${text.zIndex}`);
    });
    
    // IMPORTANTE: Habilitar sorting por zIndex
    this.sortableChildren = true;
  }

  public setAlternatives(alternatives: Alternative[]): void {
    // IMPORTANTE: Limpar COMPLETAMENTE os textos antigos antes de atualizar
    // Remove do Pixi e apaga da memória
    this.alternativeTexts.forEach((text, letter) => {
      this.removeChild(text);
      text.destroy();
      this.alternativeTexts.delete(letter);
    });

    // Recriar com os novos textos
    const gridLayout = LAYOUT.ALTERNATIVES_GRID;
    const buttonWidth = this.buttonWidth;
    const buttonHeight = this.buttonHeight;

    alternatives.forEach((alt) => {
      const slot = gridLayout.SLOTS[alt.letter as SlotKey];
      if (!slot) return;

      const text = new Text({
        text: alt.text,
        style: {
          fontFamily: 'Montserrat',
          fontSize: 32,
          fontWeight: '700',
          fill: 0x006B7E,
          align: 'center',
          wordWrap: true,
          wordWrapWidth: buttonWidth - 80,
          lineHeight: 38,
        },
      });
      text.anchor.set(0.5);
      text.x = slot.x + buttonWidth / 2;
      text.y = slot.y + buttonHeight / 2;
      text.zIndex = 10;
      text.alpha = 1;
      text.visible = true;
      this.addChild(text);
      this.alternativeTexts.set(alt.letter, text);
      console.log(`  📝 Alternative ${alt.letter}: ${alt.text.substring(0, 30)}...`);
    });
  }

  public disableButton(letter: string): void {
    const button = this.buttons.get(letter);
    if (button) {
      button.alpha = 0.5;
      button.eventMode = 'none';
    }
  }

  public enableButton(letter: string): void {
    const button = this.buttons.get(letter);
    if (button) {
      button.alpha = 1;
      button.tint = 0xFFFFFF;
      button.eventMode = 'static';
    }
  }

  public markCorrect(letter: string): void {
    const button = this.buttons.get(letter);
    if (button) {
      button.tint = 0x00FF00; // Verde
    }
  }

  public markWrong(letter: string): void {
    const button = this.buttons.get(letter);
    if (button) {
      button.tint = 0xFF0000; // Vermelho
    }
  }

  public reset(): void {
    // Reseta apenas estados visuais (cores, alpha, interatividade)
    this.buttons.forEach((button) => {
      button.alpha = 1;
      button.tint = 0xFFFFFF;
      button.eventMode = 'static';
    });
    // Remover COMPLETAMENTE textos antigos (não só limpar texto)
    this.alternativeTexts.forEach((text) => {
      this.removeChild(text);
      text.destroy();
    });
    this.alternativeTexts.clear();
  }
}
