import { HUD_LABELS } from '../data/Copy.js';
import { formatTime } from '../core/format.js';

export class Hud {
  constructor() {
    this.scoreEl = document.getElementById('scoreVal');
    this.timeEl = document.getElementById('timeVal');
    this.shieldBar = document.getElementById('shieldFill');
    this.riskBar = document.getElementById('riskFill');
    this.riskRow = document.getElementById('riskRow');
    this.decryptBar = document.getElementById('decryptFill');
    this.decryptRow = document.getElementById('decryptRow');
    this.vignette = document.getElementById('vignette');
    this.shieldGlow = document.getElementById('shieldGlow');
    this.boostBanner = document.getElementById('boostBanner');
    this.checkpointBanner = document.getElementById('checkpointBanner');

    this.boostBanner.textContent = HUD_LABELS.boostBanner;
    this.checkpointBanner.textContent = HUD_LABELS.checkpointBanner;
  }

  render(runState) {
    this.scoreEl.textContent = Math.floor(runState.score);
    this.timeEl.textContent = formatTime(runState.elapsed);

    const shieldPct = runState.shieldActive ? Math.max(0, (runState.shieldTime / 10) * 100) : 0;
    this.shieldBar.style.width = shieldPct + '%';

    const decryptPct = runState.vulnerable ? Math.max(0, (runState.decryptTime / 10) * 100) : 100;
    this.decryptBar.style.width = decryptPct + '%';

    const risk = runState.riskPercent;
    if (risk === null) {
      this.riskRow.classList.add('hide');
    } else {
      this.riskRow.classList.remove('hide');
      this.riskBar.style.width = risk + '%';
      this.riskBar.style.background =
        risk < 40
          ? 'linear-gradient(90deg,#1d5c3c,var(--privacy))'
          : risk < 75
          ? 'linear-gradient(90deg,#7a5c14,var(--gold))'
          : 'linear-gradient(90deg,#7a1420,var(--danger))';
    }
  }

  setDanger(active) {
    this.vignette.classList.toggle('warn', active);
  }

  setShieldGlow(active) {
    this.shieldGlow.classList.toggle('on', active);
  }

  showBoostBanner(visible) {
    this.boostBanner.classList.toggle('show', visible);
  }

  flashCheckpointBanner() {
    this.checkpointBanner.classList.add('show');
    setTimeout(() => this.checkpointBanner.classList.remove('show'), 2200);
  }

  showDecryptRow(visible) {
    this.decryptRow.classList.toggle('show', visible);
  }
}
