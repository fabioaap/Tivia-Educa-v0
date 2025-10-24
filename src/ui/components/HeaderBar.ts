// src/ui/components/HeaderBar.ts
// Barra superior arredondada conforme SVG tela 1.svg
import { Graphics } from 'pixi.js';

export class HeaderBar extends Graphics {
  constructor() {
    super();
    this.drawBar();
  }

  drawBar() {
    // Dimensões exatas do SVG tela 1.svg
    const barWidth = 1190;
    const barHeight = 94;
    const radius = 47;
    this.clear();
    this.beginFill(0x000000, 0.8);
    this.drawRoundedRect(0, 0, barWidth, barHeight, radius);
    this.endFill();
  }
}
