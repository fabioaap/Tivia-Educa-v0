import { Container, Graphics, Sprite, Text, Assets } from 'pixi.js';
import { DESIGN, COLORS, TYPOGRAPHY } from '@config/constants';

interface ComponentSpec {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface DraggableComponent {
  id: string;
  container: Container;
  bounds: Graphics;
  resizeHandles: Graphics[];
  isDragging: boolean;
  isResizing: boolean;
  resizeDirection: string | null;
  dragOffset: { x: number; y: number };
  originalSize: { width: number; height: number };
}

export class PixelPerfectDebugger extends Container {
  private isVisible: boolean = false;
  private editMode: boolean = false;
  private referenceOverlay: Sprite | null = null;
  private grid: Graphics;
  private boundingBoxes: Map<string, Graphics> = new Map();
  private infoPanel: Container;
  private specs: Map<string, ComponentSpec> = new Map();
  private draggables: Map<string, DraggableComponent> = new Map();
  private selectedComponent: string | null = null;
  private changesPanel: Graphics;
  private changesPanelText: Text;
  private hasUnsavedChanges: boolean = false;
  
  constructor() {
    super();
    this.grid = new Graphics();
    this.infoPanel = new Container();
    this.changesPanel = new Graphics();
    this.changesPanelText = new Text({
      text: '',
      style: {
        fontSize: 14,
        fill: 0xffffff,
        fontFamily: 'monospace',
        lineHeight: 18,
      },
    });
    
    this.addChild(this.grid);
    this.addChild(this.infoPanel);
    this.addChild(this.changesPanel);
    this.changesPanel.addChild(this.changesPanelText);
    this.changesPanel.visible = false;
    
    this.visible = false;
    this.loadReferenceSpecs();
    this.loadPersistedChanges(); // Carrega automaticamente mudanças salvas
  }

  private loadReferenceSpecs(): void {
    // Specs extraídas do Figma (1920x1080 base)
    this.specs.set('timer', {
      x: 1230, y: 30, width: 90, height: 90, label: 'Timer'
    });
    
    this.specs.set('hint-button', {
      x: 285, y: 980, width: 400, height: 80, label: 'Hint Button'
    });
    
    this.specs.set('remove-button', {
      x: 760, y: 980, width: 420, height: 80, label: 'Remove Button'
    });
    
    this.specs.set('skip-button', {
      x: 1280, y: 980, width: 360, height: 80, label: 'Skip Button'
    });
    
    this.specs.set('alternative-a', {
      x: 460, y: 660, width: 490, height: 110, label: 'Alternative A'
    });
    
    this.specs.set('alternative-b', {
      x: 970, y: 660, width: 490, height: 110, label: 'Alternative B'
    });
    
    this.specs.set('alternative-c', {
      x: 460, y: 790, width: 490, height: 110, label: 'Alternative C'
    });
    
    this.specs.set('alternative-d', {
      x: 970, y: 790, width: 490, height: 110, label: 'Alternative D'
    });
  }

  public async loadReferenceImage(path: string): Promise<void> {
    try {
      await Assets.load(path);
      this.referenceOverlay = Sprite.from(path);
      this.referenceOverlay.width = DESIGN.WIDTH;
      this.referenceOverlay.height = DESIGN.HEIGHT;
      this.referenceOverlay.alpha = 0.3; // Semi-transparente
      this.addChildAt(this.referenceOverlay, 0);
      console.log('✅ Reference overlay loaded');
    } catch (error) {
      console.warn('⚠️ Reference overlay not found:', path);
    }
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.visible = this.isVisible;
    
    if (this.isVisible) {
      this.drawGrid();
      this.drawAllBoundingBoxes();
      console.log('🔍 Pixel Perfect Debug: ON | Press [E] to toggle Edit Mode');
    } else {
      console.log('🔍 Pixel Perfect Debug: OFF');
    }
  }

  public toggleEditMode(): void {
    this.editMode = !this.editMode;
    
    if (this.editMode) {
      console.log('✏️ Edit Mode: ON');
      console.log('   🖱️ Drag component = Move position');
      console.log('   🔲 Drag corner handles = Resize');
      console.log('   📋 Press [S] to save | [C] to copy | [ESC] to discard');
      this.enableInteractiveMode();
    } else {
      console.log('✏️ Edit Mode: OFF');
      this.disableInteractiveMode();
    }
  }

  public registerComponent(id: string, container: Container): void {
    if (!this.draggables.has(id)) {
      const spec = this.specs.get(id);
      const draggable: DraggableComponent = {
        id,
        container,
        bounds: new Graphics(),
        resizeHandles: [],
        isDragging: false,
        isResizing: false,
        resizeDirection: null,
        dragOffset: { x: 0, y: 0 },
        originalSize: { 
          width: spec?.width || 100, 
          height: spec?.height || 100 
        },
      };
      
      // Cria 8 handles (4 cantos + 4 bordas)
      for (let i = 0; i < 8; i++) {
        const handle = new Graphics();
        handle.eventMode = 'static';
        draggable.resizeHandles.push(handle);
        this.addChild(handle);
      }
      
      this.draggables.set(id, draggable);
      this.addChild(draggable.bounds);
    }
  }

  private enableInteractiveMode(): void {
    this.draggables.forEach((draggable) => {
      const { container, bounds } = draggable;
      
      // Torna o container interativo
      container.eventMode = 'static';
      container.cursor = 'move';
      
      // Desenha bounds interativos
      this.updateDraggableBounds(draggable);
      
      // Eventos de drag
      container.on('pointerdown', (e) => this.onDragStart(e, draggable));
      container.on('pointermove', (e) => this.onDragMove(e, draggable));
      container.on('pointerup', () => this.onDragEnd(draggable));
      container.on('pointerupoutside', () => this.onDragEnd(draggable));
    });
  }

  private disableInteractiveMode(): void {
    this.draggables.forEach((draggable) => {
      const { container } = draggable;
      container.eventMode = 'auto';
      container.cursor = 'default';
      container.removeAllListeners();
      draggable.bounds.clear();
    });
  }

  private updateDraggableBounds(draggable: DraggableComponent): void {
    const { container, bounds, id, resizeHandles } = draggable;
    const spec = this.specs.get(id);
    
    if (!spec) return;
    
    bounds.clear();
    
    const isSelected = this.selectedComponent === id;
    const color = isSelected ? 0xff00ff : 0x00ffff;
    
    // Retângulo do componente
    bounds.rect(container.x, container.y, spec.width, spec.height);
    bounds.stroke({ width: 3, color, alpha: 0.8 });
    
    // Label com coordenadas atualizadas
    const label = new Text({
      text: `${id}\n(${Math.round(container.x)}, ${Math.round(container.y)}, ${spec.width}x${spec.height})`,
      style: {
        fontSize: 12,
        fill: color,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 2 },
      },
    });
    label.position.set(container.x + 5, container.y - 35);
    bounds.addChild(label);
    
    // Desenha handles de resize (sempre visíveis em edit mode)
    if (this.editMode) {
      const handleSize = 12;
      const hw = spec.width;
      const hh = spec.height;
      
      // Posições dos 8 handles: 4 cantos + 4 bordas
      const handlePositions = [
        { x: container.x, y: container.y, cursor: 'nw-resize', dir: 'nw' }, // Top-left
        { x: container.x + hw / 2, y: container.y, cursor: 'n-resize', dir: 'n' }, // Top
        { x: container.x + hw, y: container.y, cursor: 'ne-resize', dir: 'ne' }, // Top-right
        { x: container.x + hw, y: container.y + hh / 2, cursor: 'e-resize', dir: 'e' }, // Right
        { x: container.x + hw, y: container.y + hh, cursor: 'se-resize', dir: 'se' }, // Bottom-right
        { x: container.x + hw / 2, y: container.y + hh, cursor: 's-resize', dir: 's' }, // Bottom
        { x: container.x, y: container.y + hh, cursor: 'sw-resize', dir: 'sw' }, // Bottom-left
        { x: container.x, y: container.y + hh / 2, cursor: 'w-resize', dir: 'w' }, // Left
      ];
      
      handlePositions.forEach((pos, index) => {
        const handle = resizeHandles[index];
        handle.clear();
        handle.rect(
          pos.x - handleSize / 2,
          pos.y - handleSize / 2,
          handleSize,
          handleSize
        );
        handle.fill(isSelected ? 0xff00ff : 0xffffff);
        handle.stroke({ width: 2, color: 0x000000 });
        handle.cursor = pos.cursor;
        
        // Remove listeners antigos
        handle.removeAllListeners();
        
        // Adiciona eventos de resize
        handle.on('pointerdown', (e) => this.onResizeStart(e, draggable, pos.dir));
        handle.on('pointermove', (e) => this.onResizeMove(e, draggable));
        handle.on('pointerup', () => this.onResizeEnd(draggable));
        handle.on('pointerupoutside', () => this.onResizeEnd(draggable));
        
        handle.visible = true;
      });
    } else {
      resizeHandles.forEach(h => h.visible = false);
    }
  }

  private onDragStart(event: any, draggable: DraggableComponent): void {
    if (!this.editMode) return;
    
    const { container } = draggable;
    const globalPos = event.global;
    
    draggable.isDragging = true;
    draggable.dragOffset = {
      x: globalPos.x - container.x,
      y: globalPos.y - container.y,
    };
    
    this.selectedComponent = draggable.id;
    this.updateDraggableBounds(draggable);
    
    console.log(`🖱️ Dragging: ${draggable.id}`);
  }

  private onDragMove(event: any, draggable: DraggableComponent): void {
    if (!this.editMode || !draggable.isDragging) return;
    
    const { container, dragOffset } = draggable;
    const globalPos = event.global;
    
    // Snap to grid (10px)
    const snapSize = 10;
    const newX = Math.round((globalPos.x - dragOffset.x) / snapSize) * snapSize;
    const newY = Math.round((globalPos.y - dragOffset.y) / snapSize) * snapSize;
    
    container.position.set(newX, newY);
    this.updateDraggableBounds(draggable);
  }

  private onDragEnd(draggable: DraggableComponent): void {
    if (!draggable.isDragging) return;
    
    draggable.isDragging = false;
    
    const { container, id } = draggable;
    const spec = this.specs.get(id);
    
    if (spec) {
      const oldX = spec.x;
      const oldY = spec.y;
      const newX = Math.round(container.x);
      const newY = Math.round(container.y);
      
      // Só marca como mudança se realmente moveu
      if (oldX !== newX || oldY !== newY) {
        console.log(
          `✅ ${id} moved: (${oldX}, ${oldY}) → (${newX}, ${newY})`
        );
        
        // Atualiza spec interna
        spec.x = newX;
        spec.y = newY;
        
        this.hasUnsavedChanges = true;
        this.updateChangesPanel();
      }
    }
  }

  private onResizeStart(event: any, draggable: DraggableComponent, direction: string): void {
    if (!this.editMode) return;
    
    event.stopPropagation(); // Previne drag do container
    
    const spec = this.specs.get(draggable.id);
    if (spec) {
      draggable.isResizing = true;
      draggable.resizeDirection = direction;
      draggable.originalSize = { width: spec.width, height: spec.height };
      draggable.dragOffset = {
        x: event.global.x,
        y: event.global.y,
      };
      
      this.selectedComponent = draggable.id;
      console.log(`🔲 Resizing ${draggable.id} from ${direction}`);
    }
  }

  private onResizeMove(event: any, draggable: DraggableComponent): void {
    if (!this.editMode || !draggable.isResizing) return;
    
    const spec = this.specs.get(draggable.id);
    if (!spec) return;
    
    const { container, dragOffset, resizeDirection, originalSize } = draggable;
    const globalPos = event.global;
    const dx = globalPos.x - dragOffset.x;
    const dy = globalPos.y - dragOffset.y;
    
    const snapSize = 10;
    
    // Calcula nova dimensão baseada na direção
    switch (resizeDirection) {
      case 'nw': // Top-left
        spec.width = Math.max(50, Math.round((originalSize.width - dx) / snapSize) * snapSize);
        spec.height = Math.max(50, Math.round((originalSize.height - dy) / snapSize) * snapSize);
        container.x += (originalSize.width - spec.width);
        container.y += (originalSize.height - spec.height);
        break;
      case 'n': // Top
        spec.height = Math.max(50, Math.round((originalSize.height - dy) / snapSize) * snapSize);
        container.y += (originalSize.height - spec.height);
        break;
      case 'ne': // Top-right
        spec.width = Math.max(50, Math.round((originalSize.width + dx) / snapSize) * snapSize);
        spec.height = Math.max(50, Math.round((originalSize.height - dy) / snapSize) * snapSize);
        container.y += (originalSize.height - spec.height);
        break;
      case 'e': // Right
        spec.width = Math.max(50, Math.round((originalSize.width + dx) / snapSize) * snapSize);
        break;
      case 'se': // Bottom-right
        spec.width = Math.max(50, Math.round((originalSize.width + dx) / snapSize) * snapSize);
        spec.height = Math.max(50, Math.round((originalSize.height + dy) / snapSize) * snapSize);
        break;
      case 's': // Bottom
        spec.height = Math.max(50, Math.round((originalSize.height + dy) / snapSize) * snapSize);
        break;
      case 'sw': // Bottom-left
        spec.width = Math.max(50, Math.round((originalSize.width - dx) / snapSize) * snapSize);
        spec.height = Math.max(50, Math.round((originalSize.height + dy) / snapSize) * snapSize);
        container.x += (originalSize.width - spec.width);
        break;
      case 'w': // Left
        spec.width = Math.max(50, Math.round((originalSize.width - dx) / snapSize) * snapSize);
        container.x += (originalSize.width - spec.width);
        break;
    }
    
    this.updateDraggableBounds(draggable);
  }

  private onResizeEnd(draggable: DraggableComponent): void {
    if (!draggable.isResizing) return;
    
    draggable.isResizing = false;
    draggable.resizeDirection = null;
    
    const spec = this.specs.get(draggable.id);
    if (spec) {
      console.log(
        `✅ ${draggable.id} resized to ${spec.width}x${spec.height}`
      );
      
      this.hasUnsavedChanges = true;
      this.updateChangesPanel();
    }
  }

  private updateChangesPanel(): void {
    if (!this.hasUnsavedChanges) {
      this.changesPanel.visible = false;
      return;
    }
    
    // Posiciona painel no canto inferior direito
    const panelWidth = 600;
    const panelHeight = 400;
    const panelX = DESIGN.WIDTH - panelWidth - 20;
    const panelY = DESIGN.HEIGHT - panelHeight - 20;
    
    this.changesPanel.clear();
    this.changesPanel.position.set(panelX, panelY);
    this.changesPanel.visible = true;
    
    // Background semi-transparente
    this.changesPanel.roundRect(0, 0, panelWidth, panelHeight, 10);
    this.changesPanel.fill({ color: 0x000000, alpha: 0.9 });
    this.changesPanel.stroke({ width: 2, color: 0x00ff00 });
    
    // Título
    const title = new Text({
      text: '📝 MUDANÇAS DETECTADAS - Pressione [S] para Salvar',
      style: {
        fontSize: 16,
        fill: 0x00ff00,
        fontFamily: 'monospace',
        fontWeight: 'bold',
      },
    });
    title.position.set(10, 10);
    this.changesPanel.addChild(title);
    
    // Monta texto das mudanças
    const changes = this.generateChangesCode();
    this.changesPanelText.text = changes;
    this.changesPanelText.position.set(10, 40);
    
    // Instrução
    const instruction = new Text({
      text: '[S] Salvar no console | [C] Copiar para clipboard | [ESC] Descartar',
      style: {
        fontSize: 12,
        fill: 0xffff00,
        fontFamily: 'monospace',
      },
    });
    instruction.position.set(10, panelHeight - 30);
    this.changesPanel.addChild(instruction);
  }

  private generateChangesCode(): string {
    let output = '';
    
    // Agrupa mudanças por tipo
    const updates: string[] = [];
    
    this.specs.forEach((spec, id) => {
      if (id.includes('timer')) {
        updates.push(`HEADER.TIMER: { x: ${spec.x}, y: ${spec.y}, size: ${spec.width} }`);
      } else if (id.includes('hint')) {
        updates.push(`FOOTER.HINT_BUTTON: { x: ${spec.x}, y: ${spec.y}, width: ${spec.width}, height: ${spec.height} }`);
      } else if (id.includes('remove')) {
        updates.push(`FOOTER.REMOVE_BUTTON: { x: ${spec.x}, y: ${spec.y}, width: ${spec.width}, height: ${spec.height} }`);
      } else if (id.includes('skip')) {
        updates.push(`FOOTER.SKIP_BUTTON: { x: ${spec.x}, y: ${spec.y}, width: ${spec.width}, height: ${spec.height} }`);
      } else if (id.includes('alternative')) {
        const letter = id.split('-')[1].toUpperCase();
        updates.push(`ALT_${letter}: { x: ${spec.x}, y: ${spec.y}, width: ${spec.width}, height: ${spec.height} }`);
      }
    });
    
    return updates.join('\n');
  }

  public exportLayoutConstants(): string {
    let output = '// Updated LAYOUT constants (copy to constants.ts)\n\n';
    
    // Agrupa por categoria
    const timers = Array.from(this.specs.entries()).filter(([id]) => id.includes('timer'));
    const buttons = Array.from(this.specs.entries()).filter(([id]) => id.includes('button'));
    const alternatives = Array.from(this.specs.entries()).filter(([id]) => id.includes('alternative'));
    
    if (timers.length > 0) {
      output += 'HEADER: {\n';
      timers.forEach(([id, spec]) => {
        output += `  TIMER: { x: ${spec.x}, y: ${spec.y}, size: ${spec.width} },\n`;
      });
      output += '},\n\n';
    }
    
    if (buttons.length > 0) {
      output += 'FOOTER: {\n';
      buttons.forEach(([id, spec]) => {
        const name = id.replace('-button', '').toUpperCase().replace('-', '_');
        output += `  ${name}_BUTTON: { x: ${spec.x}, y: ${spec.y}, width: ${spec.width}, height: ${spec.height} },\n`;
      });
      output += '},\n\n';
    }
    
    if (alternatives.length > 0) {
      output += 'ALTERNATIVES: {\n';
      alternatives.forEach(([id, spec]) => {
        const letter = id.split('-')[1].toUpperCase();
        output += `  ${letter}: { x: ${spec.x}, y: ${spec.y}, width: ${spec.width}, height: ${spec.height} },\n`;
      });
      output += '},\n';
    }
    
    console.log(output);
    return output;
  }

  public copyToClipboard(): void {
    const layout = this.exportLayoutConstants();
    
    navigator.clipboard.writeText(layout).then(() => {
      console.log('📋 Layout constants copied to clipboard!');
    }).catch((err) => {
      console.error('❌ Failed to copy to clipboard:', err);
      console.log('💡 Layout constants printed above - copy manually');
    });
  }

  private drawGrid(): void {
    this.grid.clear();
    
    const gridSize = 50;
    const lineColor = 0x00ffff;
    const lineAlpha = 0.2;
    
    // Linhas verticais
    for (let x = 0; x <= DESIGN.WIDTH; x += gridSize) {
      this.grid.moveTo(x, 0);
      this.grid.lineTo(x, DESIGN.HEIGHT);
      this.grid.stroke({ width: 1, color: lineColor, alpha: lineAlpha });
      
      // Coordenada X a cada 100px
      if (x % 100 === 0) {
        const label = new Text({
          text: x.toString(),
          style: {
            fontSize: 12,
            fill: 0x00ffff,
            fontFamily: 'monospace',
          },
        });
        label.position.set(x + 2, 2);
        this.grid.addChild(label);
      }
    }
    
    // Linhas horizontais
    for (let y = 0; y <= DESIGN.HEIGHT; y += gridSize) {
      this.grid.moveTo(0, y);
      this.grid.lineTo(DESIGN.WIDTH, y);
      this.grid.stroke({ width: 1, color: lineColor, alpha: lineAlpha });
      
      // Coordenada Y a cada 100px
      if (y % 100 === 0 && y > 0) {
        const label = new Text({
          text: y.toString(),
          style: {
            fontSize: 12,
            fill: 0x00ffff,
            fontFamily: 'monospace',
          },
        });
        label.position.set(2, y + 2);
        this.grid.addChild(label);
      }
    }
  }

  private drawAllBoundingBoxes(): void {
    this.specs.forEach((spec, id) => {
      this.drawBoundingBox(id, spec.x, spec.y, spec.width, spec.height, spec.label);
    });
  }

  public drawBoundingBox(
    id: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    label?: string
  ): void {
    if (!this.isVisible) return;
    
    let box = this.boundingBoxes.get(id);
    if (!box) {
      box = new Graphics();
      this.boundingBoxes.set(id, box);
      this.addChild(box);
    }
    
    box.clear();
    
    // Verifica se há spec de referência para comparar
    const spec = this.specs.get(id);
    let color = 0x00ff00; // Verde = OK
    let diffText = '';
    
    if (spec) {
      const diffX = Math.abs(x - spec.x);
      const diffY = Math.abs(y - spec.y);
      const diffW = Math.abs(width - spec.width);
      const diffH = Math.abs(height - spec.height);
      
      // Se diferença > 2px, marca vermelho
      if (diffX > 2 || diffY > 2 || diffW > 2 || diffH > 2) {
        color = 0xff0000; // Vermelho = Desalinhado
        diffText = `Δ(${diffX > 0 ? '+' : ''}${x - spec.x}, ${diffY > 0 ? '+' : ''}${y - spec.y})`;
      } else {
        diffText = '✓ OK';
      }
    }
    
    // Desenha retângulo
    box.rect(x, y, width, height);
    box.stroke({ width: 2, color, alpha: 0.8 });
    
    // Label com coordenadas
    const labelText = new Text({
      text: `${label || id}\n(${x}, ${y}, ${width}x${height})\n${diffText}`,
      style: {
        fontSize: 14,
        fill: color,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 3 },
      },
    });
    labelText.position.set(x + 5, y + 5);
    box.addChild(labelText);
  }

  public checkComponent(
    id: string,
    actualX: number,
    actualY: number,
    actualWidth: number,
    actualHeight: number
  ): void {
    const spec = this.specs.get(id);
    if (!spec) {
      console.warn(`⚠️ No spec found for component: ${id}`);
      return;
    }
    
    const diffX = actualX - spec.x;
    const diffY = actualY - spec.y;
    const diffW = actualWidth - spec.width;
    const diffH = actualHeight - spec.height;
    
    const tolerance = 2; // pixels
    
    if (Math.abs(diffX) > tolerance || Math.abs(diffY) > tolerance || 
        Math.abs(diffW) > tolerance || Math.abs(diffH) > tolerance) {
      console.error(
        `❌ [${id}] Mismatch!\n` +
        `   Expected: (${spec.x}, ${spec.y}, ${spec.width}x${spec.height})\n` +
        `   Actual:   (${actualX}, ${actualY}, ${actualWidth}x${actualHeight})\n` +
        `   Diff:     (${diffX > 0 ? '+' : ''}${diffX}, ${diffY > 0 ? '+' : ''}${diffY}, ` +
        `${diffW > 0 ? '+' : ''}${diffW}x${diffH > 0 ? '+' : ''}${diffH})`
      );
    } else {
      console.log(`✅ [${id}] Pixel perfect!`);
    }
  }

  public setReferenceAlpha(alpha: number): void {
    if (this.referenceOverlay) {
      this.referenceOverlay.alpha = Math.max(0, Math.min(1, alpha));
    }
  }

  public saveChanges(): void {
    if (!this.hasUnsavedChanges) {
      console.log('ℹ️ No changes to save');
      return;
    }
    
    // Gera o código atualizado
    const updatedCode = this.generateFullLayoutCode();
    
    console.log('\n' + '='.repeat(80));
    console.log('💾 LAYOUT CHANGES AUTO-APPLIED');
    console.log('='.repeat(80));
    console.log('\n📝 Updated constants:\n');
    console.log(updatedCode);
    console.log('\n' + '='.repeat(80));
    console.log('✅ Changes saved! Reload the page to see updates.');
    console.log('💡 Tip: Open DevTools → Sources → Overrides to persist changes');
    console.log('='.repeat(80) + '\n');
    
    // Salva no localStorage para persistir após reload
    this.persistChangesToLocalStorage();
    
    // Copia automaticamente para clipboard
    this.copyToClipboard();
    
    this.hasUnsavedChanges = false;
    this.updateChangesPanel();
  }

  private generateFullLayoutCode(): string {
    let code = '// Auto-generated LAYOUT constants - Copy to src/config/constants.ts\n\n';
    code += 'export const LAYOUT = {\n';
    
    // HEADER
    const timerSpec = this.specs.get('timer');
    if (timerSpec) {
      code += '  HEADER: {\n';
      code += '    HEIGHT: 100,\n';
      code += '    PADDING: 30,\n';
      code += `    TIMER: { x: ${timerSpec.x}, y: ${timerSpec.y}, size: ${timerSpec.width} },\n`;
      code += '    // ... other header items\n';
      code += '  },\n\n';
    }
    
    // ALTERNATIVES
    const altA = this.specs.get('alternative-a');
    const altB = this.specs.get('alternative-b');
    if (altA && altB) {
      const gapX = altB.x - (altA.x + altA.width);
      const altC = this.specs.get('alternative-c');
      const gapY = altC ? altC.y - (altA.y + altA.height) : 20;
      
      code += '  QUESTION: {\n';
      code += `    ALTERNATIVES_GRID: { x: ${altA.x}, y: ${altA.y}, width: ${altB.x + altB.width - altA.x}, height: ${altA.height * 2 + gapY} },\n`;
      code += `    ALTERNATIVE: { width: ${altA.width}, height: ${altA.height}, gapX: ${gapX}, gapY: ${gapY} },\n`;
      code += '  },\n\n';
    }
    
    // FOOTER
    const hintSpec = this.specs.get('hint-button');
    const removeSpec = this.specs.get('remove-button');
    const skipSpec = this.specs.get('skip-button');
    
    if (hintSpec || removeSpec || skipSpec) {
      code += '  FOOTER: {\n';
      code += '    HEIGHT: 120,\n';
      code += '    Y: 960,\n';
      if (hintSpec) {
        code += `    HINT_BUTTON: { x: ${hintSpec.x}, y: ${hintSpec.y}, width: ${hintSpec.width}, height: ${hintSpec.height} },\n`;
      }
      if (removeSpec) {
        code += `    REMOVE_BUTTON: { x: ${removeSpec.x}, y: ${removeSpec.y}, width: ${removeSpec.width}, height: ${removeSpec.height} },\n`;
      }
      if (skipSpec) {
        code += `    SKIP_BUTTON: { x: ${skipSpec.x}, y: ${skipSpec.y}, width: ${skipSpec.width}, height: ${skipSpec.height} },\n`;
      }
      code += '  },\n';
    }
    
    code += '} as const;\n';
    
    return code;
  }

  private persistChangesToLocalStorage(): void {
    const changes: Record<string, any> = {};
    
    this.specs.forEach((spec, id) => {
      changes[id] = {
        x: spec.x,
        y: spec.y,
        width: spec.width,
        height: spec.height,
      };
    });
    
    localStorage.setItem('trivia_layout_overrides', JSON.stringify(changes));
    console.log('💾 Changes persisted to localStorage');
  }

  public loadPersistedChanges(): void {
    const stored = localStorage.getItem('trivia_layout_overrides');
    if (!stored) return;
    
    try {
      const changes = JSON.parse(stored);
      let hasChanges = false;
      
      Object.entries(changes).forEach(([id, data]: [string, any]) => {
        const spec = this.specs.get(id);
        if (spec) {
          spec.x = data.x;
          spec.y = data.y;
          spec.width = data.width;
          spec.height = data.height;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        console.log('✅ Loaded persisted layout changes from localStorage');
        console.log('💡 Press [D] + [E] to see current overrides');
      }
    } catch (e) {
      console.warn('⚠️ Failed to load persisted changes:', e);
    }
  }

  public discardChanges(): void {
    if (!this.hasUnsavedChanges) {
      return;
    }
    
    console.log('🗑️ Changes discarded');
    this.hasUnsavedChanges = false;
    this.updateChangesPanel();
    
    // Recarrega specs originais (opcional: você pode guardar backup)
    this.loadReferenceSpecs();
  }
}
