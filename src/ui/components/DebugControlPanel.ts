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
  private isDragging: boolean = false;
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
  private collapseButton: Graphics;
  private collapseText: Text;
  private isCollapsed: boolean = false;
  private buttonsContainer: Container;
  
  constructor() {
    super();
    
    // Background semi-transparente com bordas arredondadas
    this.panelBg = new Graphics();
    this.panelBg.roundRect(0, 0, 1360, 80, 8);
    this.panelBg.fill({ color: 0x000000, alpha: 0.9 });
    this.panelBg.stroke({ color: 0x00ff00, width: 2 });
    this.addChild(this.panelBg);
    
    // Barra de título arrastável
    const titleBar = new Graphics();
    titleBar.roundRect(0, 0, 1360, 30, 8);
    titleBar.fill({ color: 0x001a00, alpha: 0.95 });
    titleBar.eventMode = 'static';
    titleBar.cursor = 'move';
    this.addChild(titleBar);
    
    // Título do painel
    const title = new Text({
      text: '🎮 DEBUG CONTROLS (Drag to Move)',
      style: {
        fontSize: 14,
        fill: 0x00ff00,
        fontFamily: 'Arial',
        fontWeight: 'bold',
      },
    });
    title.x = 10;
    title.y = 7;
    this.addChild(title);
    
    // Botão de colapsar/expandir
    this.collapseButton = new Graphics();
    this.collapseButton.circle(0, 0, 10);
    this.collapseButton.fill({ color: 0xffaa00 });
    this.collapseButton.x = 1340;
    this.collapseButton.y = 15;
    this.collapseButton.eventMode = 'static';
    this.collapseButton.cursor = 'pointer';
    this.addChild(this.collapseButton);
    
    this.collapseText = new Text({
      text: '−',
      style: {
        fontSize: 16,
        fill: 0x000000,
        fontFamily: 'Arial',
        fontWeight: 'bold',
      },
    });
    this.collapseText.anchor.set(0.5);
    this.collapseText.x = 1340;
    this.collapseText.y = 15;
    this.addChild(this.collapseText);
    
    // Container para os botões
    this.buttonsContainer = new Container();
    this.buttonsContainer.y = 35;
    this.addChild(this.buttonsContainer);
    
    // Posicionar no topo direito (não atrapalha footer)
    this.x = DESIGN.WIDTH - 1380;
    this.y = 10;
    
    this.createButtons();
    this.setupDragHandlers(titleBar);
    this.setupCollapseHandler();
  }
  
  private createButtons(): void {
    const buttonConfigs = [
      { id: 'debug', label: 'Debug [D]', x: 10, color: 0x00ff00 },
      { id: 'edit', label: 'Edit [E]', x: 160, color: 0xffaa00 },
      { id: 'save', label: 'Save [S]', x: 310, color: 0x00aaff },
      { id: 'reset', label: 'Reset [R]', x: 460, color: 0xff0000 },
      { id: 'alpha-', label: 'Alpha -', x: 610, color: 0x888888 },
      { id: 'alpha+', label: 'Alpha +', x: 760, color: 0x888888 },
      { id: 'discard', label: 'Discard [ESC]', x: 910, color: 0xff6600 },
      { id: 'copy', label: 'Copy [C]', x: 1080, color: 0x9900ff },
    ];
    
    buttonConfigs.forEach(config => {
      const btn = this.createButton(
        config.id,
        config.label,
        config.x,
        5,
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
    this.buttonsContainer.addChild(bg);
    
    const text = new Text({
      text: label,
      style: {
        fontSize: 12,
        fill: 0xffffff,
        fontFamily: 'Arial',
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    text.x = x + 70;
    text.y = y + 15;
    this.buttonsContainer.addChild(text);
    
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
  
  private setupDragHandlers(titleBar: Graphics): void {
    titleBar.on('pointerdown', (e) => {
      this.isDragging = true;
      this.dragOffset.x = e.global.x - this.x;
      this.dragOffset.y = e.global.y - this.y;
      this.alpha = 0.8;
      e.stopPropagation();
    });
  }
  
  public update(mouseX: number, mouseY: number): void {
    if (this.isDragging) {
      this.x = mouseX - this.dragOffset.x;
      this.y = mouseY - this.dragOffset.y;
      
      // Limitar aos bounds da tela
      this.x = Math.max(0, Math.min(DESIGN.WIDTH - 1360, this.x));
      this.y = Math.max(0, Math.min(DESIGN.HEIGHT - 80, this.y));
    }
  }
  
  public stopDragging(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.alpha = 1;
    }
  }
  
  private setupCollapseHandler(): void {
    this.collapseButton.on('pointerdown', () => {
      this.isCollapsed = !this.isCollapsed;
      
      if (this.isCollapsed) {
        // Colapsar: esconder botões
        this.buttonsContainer.visible = false;
        this.panelBg.clear();
        this.panelBg.roundRect(0, 0, 1360, 30, 8);
        this.panelBg.fill({ color: 0x000000, alpha: 0.9 });
        this.panelBg.stroke({ color: 0x00ff00, width: 2 });
        this.collapseText.text = '+';
      } else {
        // Expandir: mostrar botões
        this.buttonsContainer.visible = true;
        this.panelBg.clear();
        this.panelBg.roundRect(0, 0, 1360, 80, 8);
        this.panelBg.fill({ color: 0x000000, alpha: 0.9 });
        this.panelBg.stroke({ color: 0x00ff00, width: 2 });
        this.collapseText.text = '−';
      }
    });
  }
}
