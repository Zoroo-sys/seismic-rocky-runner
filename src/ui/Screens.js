import { START_SCREEN, CODEX_ENTRIES, LOSE_SCREEN, WIN_SCREEN } from '../data/Copy.js';
import { formatTime } from '../core/format.js';

export class Screens {
  constructor({ onStart, onRetry, onShare }) {
    this.startScreen = document.getElementById('startScreen');
    this.loseScreen = document.getElementById('loseScreen');
    this.winScreen = document.getElementById('winScreen');
    this.codexScreen = document.getElementById('codexScreen');

    this._onStart = onStart;
    this._onRetry = onRetry;
    this._onShare = onShare;

    this._paintStartScreen();
    this._paintCodex();
    this._wireButtons();
  }

  _paintStartScreen() {
    document.getElementById('startEyebrow').textContent = START_SCREEN.eyebrow;
    document.getElementById('startTitle').innerHTML = START_SCREEN.title;
    document.getElementById('startLede').textContent = START_SCREEN.lede;

    const rulesEl = document.getElementById('startRules');
    rulesEl.innerHTML = '';
    for (const rule of START_SCREEN.rules) {
      const row = document.createElement('div');
      row.className = 'rule';
      row.innerHTML = `
        <span class="rule-tag ${rule.tag}">${rule.title}</span>
        <span class="rule-text">${rule.text}</span>
      `;
      rulesEl.appendChild(row);
    }

    document.getElementById('startBtn').textContent = START_SCREEN.startButton;
    document.getElementById('codexBtn').textContent = START_SCREEN.codexButton;
  }

  _paintCodex() {
    const listEl = document.getElementById('codexList');
    listEl.innerHTML = '';
    for (const entry of CODEX_ENTRIES) {
      const row = document.createElement('div');
      row.className = 'rule';
      row.innerHTML = `
        <span class="rule-tag gold">${entry.tag}</span>
        <span class="rule-text">${entry.text}</span>
      `;
      listEl.appendChild(row);
    }
  }

  _wireButtons() {
    document.getElementById('startBtn').addEventListener('click', () => this._onStart());
    document.getElementById('retryBtnLose').addEventListener('click', () => this._onRetry());
    document.getElementById('retryBtnWin').addEventListener('click', () => this._onRetry());
    document.getElementById('shareBtnLose').addEventListener('click', () => this._onShare('lose'));
    document.getElementById('shareBtnWin').addEventListener('click', () => this._onShare('win'));

    document.getElementById('codexBtn').addEventListener('click', () => {
      this.startScreen.classList.add('hidden');
      this.codexScreen.classList.remove('hidden');
    });
    document.getElementById('codexBackBtn').addEventListener('click', () => {
      this.codexScreen.classList.add('hidden');
      this.startScreen.classList.remove('hidden');
    });
  }

  hideAll() {
    this.startScreen.classList.add('hidden');
    this.loseScreen.classList.add('hidden');
    this.winScreen.classList.add('hidden');
    this.codexScreen.classList.add('hidden');
  }

  showStart() {
    this.hideAll();
    this.startScreen.classList.remove('hidden');
  }

  showLose(score, elapsed) {
    document.getElementById('loseEyebrow').textContent = LOSE_SCREEN.eyebrow;
    document.getElementById('loseTitle').innerHTML = LOSE_SCREEN.title;
    document.getElementById('loseScoreLabel').textContent = LOSE_SCREEN.scoreLabel;
    document.getElementById('loseTimeLabel').textContent = LOSE_SCREEN.timeLabel;
    document.getElementById('loseScore').textContent = Math.floor(score);
    document.getElementById('loseTime').textContent = formatTime(elapsed);
    document.getElementById('retryBtnLose').textContent = LOSE_SCREEN.retryButton;
    document.getElementById('shareBtnLose').textContent = LOSE_SCREEN.shareButton;
    this.loseScreen.classList.remove('hidden');
  }

  showWin(score) {
    document.getElementById('winEyebrow').textContent = WIN_SCREEN.eyebrow;
    document.getElementById('winTitle').innerHTML = WIN_SCREEN.title;
    document.getElementById('winScoreLabel').textContent = WIN_SCREEN.scoreLabel;
    document.getElementById('winTimeLabel').textContent = WIN_SCREEN.timeLabel;
    document.getElementById('winScore').textContent = Math.floor(score);
    document.getElementById('retryBtnWin').textContent = WIN_SCREEN.retryButton;
    document.getElementById('shareBtnWin').textContent = WIN_SCREEN.shareButton;
    this.winScreen.classList.remove('hidden');
  }
}
