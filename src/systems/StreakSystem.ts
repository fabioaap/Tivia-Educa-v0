export interface StreakState {
  current: number;      // streak atual (0-5+)
  max: number;          // recorde da sessão
  multiplier: number;   // multiplicador de pontos
}

export enum StreakLevel {
  NONE = 0,
  LEVEL_1 = 1,  // laranja
  LEVEL_2 = 2,  // laranja-vermelho
  LEVEL_3 = 3,  // vermelho
  LEVEL_4 = 4,  // roxo
  LEVEL_5 = 5   // azul/branco (max)
}

export const STREAK_COLORS = {
  [StreakLevel.NONE]: 0x666666,
  [StreakLevel.LEVEL_1]: 0xFF9500,  // laranja
  [StreakLevel.LEVEL_2]: 0xFF6B00,  // laranja-escuro
  [StreakLevel.LEVEL_3]: 0xFF0000,  // vermelho
  [StreakLevel.LEVEL_4]: 0xBB00FF,  // roxo
  [StreakLevel.LEVEL_5]: 0x00D9FF   // ciano brilhante
};

export class StreakSystem {
  private state: StreakState = { current: 0, max: 0, multiplier: 1 };

  /**
   * Incrementa streak ao acertar uma questão
   * @returns número atual do streak
   */
  increment(): number {
    this.state.current++;
    if (this.state.current > this.state.max) {
      this.state.max = this.state.current;
    }
    this.state.multiplier = this.calculateMultiplier(this.state.current);
    return this.state.current;
  }

  /**
   * Reseta streak ao errar ou pular
   */
  reset(): void {
    this.state.current = 0;
    this.state.multiplier = 1;
  }

  /**
   * Retorna streak atual
   */
  getCurrent(): number {
    return this.state.current;
  }

  /**
   * Retorna multiplicador de pontos baseado no streak
   */
  getMultiplier(): number {
    return this.state.multiplier;
  }

  /**
   * Retorna nível do streak (1-5) para animações
   */
  getLevel(): StreakLevel {
    return Math.min(this.state.current, StreakLevel.LEVEL_5) as StreakLevel;
  }

  /**
   * Calcula multiplicador baseado no streak
   */
  private calculateMultiplier(streak: number): number {
    // Streak 1-2: 1.0x
    // Streak 3: 1.2x
    // Streak 4: 1.5x
    // Streak 5+: 2.0x
    const multipliers = [1.0, 1.0, 1.0, 1.2, 1.5, 2.0];
    const index = Math.min(streak, multipliers.length - 1);
    return multipliers[index] ?? 1.0;
  }

  /**
   * Retorna estado completo para persistência
   */
  getState(): StreakState {
    return { ...this.state };
  }

  /**
   * Restaura estado (útil para save/load)
   */
  setState(state: StreakState): void {
    this.state = { ...state };
  }
}
