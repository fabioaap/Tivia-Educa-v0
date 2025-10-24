// src/ui/components/Background.ts
// Componente Pixi.js para fundo procedural baseado no SVG tela 1.svg
import { Graphics } from 'pixi.js';

export class Background extends Graphics {
  constructor(width: number, height: number) {
    super();
    this.drawBackground(width, height);
  }

  drawBackground(width: number, height: number) {
    // Fundo preto com overlay
    this.clear();
    this.beginFill(0x000000, 1);
    this.drawRect(0, 0, width, height);
    this.endFill();

    // Gradiente radial (simulação simplificada)
    // O gradiente real do SVG é complexo, mas para performance e compatibilidade,
    // usamos um overlay translúcido azul-esverdeado aproximado
    this.beginFill(0x00bdb9, 0.15);
    this.drawEllipse(width / 2, height * 0.8, width * 0.9, height * 0.4);
    this.endFill();
  }
}
