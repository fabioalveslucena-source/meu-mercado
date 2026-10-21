/**
 * ============================================================================
 * 🔊 MOTOR DE ÁUDIO WEB - MEU MERCADO
 * ============================================================================
 * Sintetizador Web Audio API puro (sem arquivos de áudio externos).
 * Funciona 100% offline com latência zero e suporte tátil (vibração).
 */

class SomMeuMercado {
  constructor() {
    this.ctx = null;
    this.somAtivo = true;
  }

  obterContexto() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Bip curto e agradável ao adicionar ou marcar produto no carrinho
   */
  bipItem() {
    if (!this.somAtivo) return;
    try {
      const ctx = this.obterContexto();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // Nota Lá (A5)
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.07); // Sobe rápido

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);

      // Vibração suave no celular
      if ('vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } catch (e) {
      console.warn('Erro ao tocar bip de item:', e);
    }
  }

  /**
   * Sinal sonoro triunfal / comemorativo ao clicar em "Finalizar Compras"
   * Acorde arpejado maior brilhante (Do - Mi - Sol - Do agudo) estilo caixa registradora moderna
   */
  bipFinalizarCompra() {
    if (!this.somAtivo) return;
    try {
      const ctx = this.obterContexto();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Notas do acorde de Dó Maior (C5, E5, G5, C6)
      const notas = [523.25, 659.25, 783.99, 1046.50];

      notas.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const inicio = now + (idx * 0.08);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, inicio);

        gain.gain.setValueAtTime(0, inicio);
        gain.gain.linearRampToValueAtTime(0.28, inicio + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, inicio + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(inicio);
        osc.stop(inicio + 0.4);
      });

      // Vibração comemorativa no celular (dois pulsos firmes)
      if ('vibrate' in navigator) {
        navigator.vibrate([40, 70, 90]);
      }
    } catch (e) {
      console.warn('Erro ao tocar bip de finalização:', e);
    }
  }

  /**
   * Bip sutil de remoção ou desmarcação
   */
  bipDesmarcar() {
    if (!this.somAtivo) return;
    try {
      const ctx = this.obterContexto();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }
}

window.SomMercado = new SomMeuMercado();
