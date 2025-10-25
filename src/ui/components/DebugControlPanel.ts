import { Container, Graphics, Text } from 'pixi.js';
import { DESIGN } from '@config/constants';

interface ControlButton {
  id: string;
  label: string;
  bg: Graphics;
  text: Text;
  isActive: boolean;
  callback: () => void;
}

export class DebugControlPanel extends Container {
  private buttons: Map<string, ControlButton> = new Map();
  private panelBg: Graphics;
  
  constructor() {
    super();
    
    // Background semi-transparente
    this.panelBg = new Graphics();
    this.panelBg.rect(0, 0, DESIGN.CANVAS_WIDTH, 80);
    this.panelBg.fill({ color: 0x000000, alpha: 0.85 });
    this.addChild(this.panelBg);
    
    // Título do painel
    const title = new Text({
      text: 'DEBUG CONTROLS',
      style: {
        fontSize: 16,
        fill: 0x00ff00,
        fontFamily: 'Arial',
        fontWeight: 'bold',
      },
    });
    title.x = 20;
    title.y = 10;
    this.addChild(title);
    
    // Posicionar no footer
    this.y = DESIGN.CANVAS_HEIGHT - 80;
    
    this.createButtons();
  }
  
  private createButtons(): void {
    const buttonConfigs = [
      { id: 'debug', label: 'Debug [D]', x: 20, color: 0x00ff00 },
      { id: 'edit', label: 'Edit [E]', x: 180, color: 0xffaa00 },
      { id: 'save', label: 'Save [S]', x: 340, color: 0x00aaff },
      { id: 'reset', label: 'Reset [R]', x: 500, color: 0xff0000 },
      { id: 'alpha-', label: 'Alpha -', x: 660, color: 0x888888 },
      { id: 'alpha+', label: 'Alpha +', x: 820, color: 0x888888 },
      { id: 'discard', label: 'Discard [ESC]', x: 980, color: 0xff6600 },
      { id: 'copy', label: 'Copy [C]', x: 1160, color: 0x9900ff },
    ];
    
    buttonConfigs.forEach(config => {
      const btn = this.createButton(
        config.id,
        config.label,
        config.x,
        40,
        config.color
      );
      this.buttons.set(config.id, btn);
    });
  }
  
  private createButton(
    id: string,
    label: string,
    x: number,
    y: number,
    color: number
  ): ControlButton {
    const bg = new Graphics();
    bg.roundRect(0, 0, 140, 30, 4);
    bg.fill({ color: 0x333333 });
    bg.stroke({ color, width: 2 });
    bg.x = x;
    bg.y = y;
    bg.eventMode = 'static';
    bg.cursor = 'pointer';
    this.addChild(bg);
    
    const text = new Text({
      text: label,
      style: {
        fontSize: 13,
        fill: 0xffffff,
        fontFamily: 'Arial',
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    text.x = x + 70;
    text.y = y + 15;
    this.addChild(text);
    
    const button: ControlButton = {
      id,
      label,
      bg,
      text,
      isActive: false,
      callback: () => {},
    };
    
    // Hover effects
    bg.on('pointerenter', () => {
      bg.clear();
      bg.roundRect(0, 0, 140, 30, 4);
      bg.fill({ color: 0x444444 });
      bg.stroke({ color, width: 3 });
    });
    
    bg.on('pointerleave', () => {
      this.updateButtonVisual(button);
    });
    
    bg.on('pointerdown', () => {
      button.callback();
    });
    
    return button;
  }
  
  private updateButtonVisual(button: ControlButton): void {
    const config = [
      { id: 'debug', color: 0x00ff00 },
      { id: 'edit', color: 0xffaa00 },
      { id: 'save', color: 0x00aaff },
      { id: 'reset', color: 0xff0000 },
      { id: 'alpha-', color: 0x888888 },
      { id: 'alpha+', color: 0x888888 },
      { id: 'discard', color: 0xff6600 },
      { id: 'copy', color: 0x9900ff },
    ].find(c => c.id === button.id);
    
    if (!config) return;
    
    button.bg.clear();
    button.bg.roundRect(0, 0, 140, 30, 4);
    
    if (button.isActive) {
      button.bg.fill({ color: config.color, alpha: 0.3 });
      button.bg.stroke({ color: config.color, width: 3 });
      button.text.style.fill = config.color;
    } else {
      button.bg.fill({ color: 0x333333 });
      button.bg.stroke({ color: config.color, width: 2 });
      button.text.style.fill = 0xffffff;
    }
  }
  
  // API pública para conectar callbacks
  public onDebugToggle(callback: () => void): void {
    const btn = this.buttons.get('debug');
    if (btn) btn.callback = callback;
  }
  
  public onEditToggle(callback: () => void): void {
    const btn = this.buttons.get('edit');
    if (btn) btn.callback = callback;
  }
  
  public onSave(callback: () => void): void {
    const btn = this.buttons.get('save');
    if (btn) btn.callback = callback;
  }
  
  public onReset(callback: () => void): void {
    const btn = this.buttons.get('reset');
    if (btn) btn.callback = callback;
  }
  
  public onAlphaDecrease(callback: () => void): void {
    const btn = this.buttons.get('alpha-');
    if (btn) btn.callback = callback;
  }
  
  public onAlphaIncrease(callback: () => void): void {
    const btn = this.buttons.get('alpha+');
    if (btn) btn.callback = callback;
  }
  
  public onDiscard(callback: () => void): void {
    const btn = this.buttons.get('discard');
    if (btn) btn.callback = callback;
  }
  
  public onCopy(callback: () => void): void {
    const btn = this.buttons.get('copy');
    if (btn) btn.callback = callback;
  }
  
  // Atualizar estado visual dos botões
  public setDebugActive(active: boolean): void {
    const btn = this.buttons.get('debug');
    if (btn) {
      btn.isActive = active;
      this.updateButtonVisual(btn);
    }
  }
  
  public setEditActive(active: boolean): void {
    const btn = this.buttons.get('edit');
    if (btn) {
      btn.isActive = active;
      this.updateButtonVisual(btn);
    }
  }
  
  public show(): void {
    this.visible = true;
  }
  
  public hide(): void {
    this.visible = false;
  }
}
