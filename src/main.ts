import { GameApplication } from './core/Application';
import { environment } from './config/environment';

async function main() {
  try {
    // Log ambiente
    if (environment.ENABLE_DEBUG) {
      console.log('🎮 Trivia Educacross - Iniciando...');
      console.log('Ambiente:', environment.ENVIRONMENT);
      console.log('API:', environment.API_BASE_URL);
    }

    // Cria e inicializa aplicação
    const game = new GameApplication();
    await game.init();

    // Expõe globalmente para debug (apenas dev)
    if (environment.ENABLE_DEBUG) {
      (window as any).game = game;
      console.log('✅ Jogo inicializado! Acesse via window.game');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar o jogo:', error);
    
    // Mostra erro amigável ao usuário
    const container = document.getElementById('game-container');
    if (container) {
      container.innerHTML = `
        <div style="color: #FF6B35; font-family: 'Exo 2', sans-serif; text-align: center; padding: 40px;">
          <h2 style="font-size: 24px; margin-bottom: 20px;">Erro ao carregar o jogo</h2>
          <p style="font-size: 16px; color: #B0BEC5;">
            Por favor, recarregue a página ou entre em contato com o suporte.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="margin-top: 20px; padding: 12px 24px; background: #00D9FF; color: #000814; border: none; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer;"
          >
            Recarregar
          </button>
        </div>
      `;
    }
  }
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  void main();
}
