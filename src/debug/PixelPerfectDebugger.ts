import { Container, Graphics, Sprite, Text, Assets } from 'pixi.js';
import { DESIGN, COLORS, TYPOGRAPHY } from '@config/constants';

interface ComponentSpec {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export class PixelPerfectDebugger extends Container {
  private isVisible: boolean = false;
  private referenceOverlay: Sprite | null = null;
  private grid: Graphics;
  private boundingBoxes: Map<string, Graphics> = new Map();
  private infoPanel: Container;
  private specs: Map<string, ComponentSpec> = new Map();
  
  constructor() {
    super();
    this.grid = new Graphics();
    this.infoPanel = new Container();
    
    this.addChild(this.grid);
    this.addChild(this.infoPanel);
    
    this.visible = false;
    this.loadReferenceSpecs();
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
      console.log('🔍 Pixel Perfect Debug: ON');
    } else {
      console.log('🔍 Pixel Perfect Debug: OFF');
    }
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
}
