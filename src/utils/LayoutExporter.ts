import type { Container } from 'pixi.js';

export interface ComponentLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExportedLayout {
  HEADER: ComponentLayout;
  QUESTION_CARD: ComponentLayout;
  ALTERNATIVES_GRID: ComponentLayout;
  FOOTER: ComponentLayout;
}

export class LayoutExporter {
  private components: Map<string, Container> = new Map();

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'e' || e.key === 'E') {
        this.exportLayout();
      }
    });
  }

  public registerComponent(name: string, component: Container): void {
    this.components.set(name, component);
  }

  private exportLayout(): void {
    const layout: ExportedLayout = {
      HEADER: this.getLayout('header'),
      QUESTION_CARD: this.getLayout('questionCard'),
      ALTERNATIVES_GRID: this.getLayout('alternativesGrid'),
      FOOTER: this.getLayout('footer'),
    };

    console.clear();
    console.log('🎯 LAYOUT EXPORTADO - Copie e cole em constants.ts:\n');
    console.log(JSON.stringify(layout, null, 2));
    console.log('\n✅ Coordenadas capturadas! Pressione E novamente para atualizar');
  }

  private getLayout(name: string): ComponentLayout {
    const component = this.components.get(name);
    if (!component) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const bounds = component.getBounds();
    return {
      x: Math.round(component.x),
      y: Math.round(component.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
    };
  }
}
