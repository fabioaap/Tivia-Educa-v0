import { Container, Graphics, Text } from 'pixi.js';

export class LayoutTuner extends Container {
  private target: Container | null = null;
  private labelText: Text;
  private step: number = 1;
  private overlayToggle: (() => void) | null = null;

  constructor() {
    super();
    this.zIndex = 9999;
    this.labelText = new Text({
      text: 'LayoutTuner: Nenhum alvo',
      style: { fontFamily: 'monospace', fontSize: 18, fill: 0xffffff, align: 'left' }
    });
    this.labelText.x = 20;
    this.labelText.y = 20;
    this.addChild(this.labelText);

    // Fundo do painel
    const bg = new Graphics();
    bg.beginFill(0x222222, 0.8);
    bg.drawRoundedRect(10, 10, 340, 60, 12);
    bg.endFill();
    this.addChildAt(bg, 0);

    // Atalhos de teclado
    window.addEventListener('keydown', (e) => {
      if (!this.visible || !this.target) return;
      let moved = false;
      if (e.key === 'ArrowUp') { this.target.y -= this.step; moved = true; }
      if (e.key === 'ArrowDown') { this.target.y += this.step; moved = true; }
      if (e.key === 'ArrowLeft') { this.target.x -= this.step; moved = true; }
      if (e.key === 'ArrowRight') { this.target.x += this.step; moved = true; }
      if (e.key === '+') { this.step = Math.min(20, this.step + 1); }
      if (e.key === '-') { this.step = Math.max(1, this.step - 1); }
      if (e.key === 'o' && this.overlayToggle) { this.overlayToggle(); }
      if (moved) this.updateLabel();
    });
  }

  setTarget(target: Container, name: string) {
    this.target = target;
    this.labelText.text = `Ajustando: ${name} | x:${target.x} y:${target.y} | step:${this.step}  (setas: move, +/-: step, O: overlay)`;
  }

  setOverlayToggle(fn: () => void) {
    this.overlayToggle = fn;
  }

  updateLabel() {
    if (this.target) {
      this.labelText.text = `Ajustando: x:${this.target.x} y:${this.target.y} | step:${this.step}  (setas: move, +/-: step, O: overlay)`;
    }
  }
}
