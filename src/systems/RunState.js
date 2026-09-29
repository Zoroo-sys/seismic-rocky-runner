const BASE_SPEED = 11;
const MAX_SPEED = 27;
const SPEED_RAMP = 0.055;
const SHIELD_DURATION = 10;
const DECRYPT_DURATION = 10;
const BOOST_DURATION = 5;
const IDLE_WARNING_DELAY = 25; // force a warning if a player never touches a shield or a spike
const WIN_TIME = 360;

export class RunState {
  constructor({ onShieldChange, onDangerChange, onBoostChange, onCheckpoint, onWin, onLose }) {
    this._onShieldChange = onShieldChange;
    this._onDangerChange = onDangerChange;
    this._onBoostChange = onBoostChange;
    this._onCheckpoint = onCheckpoint;
    this._onWin = onWin;
    this._onLose = onLose;
    this.reset();
  }

  reset() {
    this.running = true;
    this.gameOver = false;
    this.won = false;
    this.elapsed = 0;
    this.score = 0;
    this.speed = BASE_SPEED;
    this.shieldActive = false;
    this.shieldTime = 0;
    this.vulnerable = false;
    this.decryptTime = DECRYPT_DURATION;
    this.consecutiveShields = 0;
    this.boostActive = false;
    this.boostTime = 0;
    this.safeTimer = IDLE_WARNING_DELAY;
  }

  get travelSpeed() {
    return this.boostActive ? this.speed * 1.6 : this.speed;
  }

  addScore(amount) {
    this.score += amount;
  }

  activateShield() {
    const wasVulnerable = this.vulnerable;
    this.shieldActive = true;
    this.shieldTime = SHIELD_DURATION;
    this.vulnerable = false;
    this.decryptTime = DECRYPT_DURATION;
    this._onDangerChange(false);
    this._onShieldChange(true);

    this.consecutiveShields++;
    if (this.consecutiveShields >= 2) {
      this._activateBoost();
      this.consecutiveShields = 0;
    }
    return wasVulnerable;
  }

  _activateBoost() {
    this.boostActive = true;
    this.boostTime = BOOST_DURATION;
    this._onBoostChange(true);
  }

  _endShield() {
    this.shieldActive = false;
    this.shieldTime = 0;
    this.consecutiveShields = 0;
    this._onShieldChange(false);
    this._startVulnerability();
  }

  _startVulnerability() {
    if (this.vulnerable) return;
    this.vulnerable = true;
    this.decryptTime = DECRYPT_DURATION;
    this._onDangerChange(true);
  }

  reactToGasSpike() {
    if (this.boostActive) return;
    if (this.shieldActive) {
      this.shieldTime = Math.max(0, this.shieldTime - 3);
      if (this.shieldTime <= 0) this._endShield();
    } else if (!this.vulnerable) {
      this._startVulnerability();
    } else {
      this.decryptTime = Math.max(0, this.decryptTime - 2);
    }
  }

  reactToBarrier() {
    if (this.boostActive) return false;
    this.gameOver = true;
    this.running = false;
    return true;
  }

  crossCheckpoint() {
    this.addScore(150);
    const wasVulnerable = this.activateShield();
    this._onCheckpoint();
    return wasVulnerable;
  }

  triggerTrackerCatch() {
    if (!this.vulnerable) this._startVulnerability();
  }

  tick(dt) {
    if (!this.running || this.gameOver) return;

    this.elapsed += dt;
    this.speed = Math.min(MAX_SPEED, BASE_SPEED + this.elapsed * SPEED_RAMP);
    this.addScore(this.travelSpeed * dt * 0.6);

    if (this.shieldActive && !this.boostActive) {
      this.shieldTime -= dt;
      if (this.shieldTime <= 0) this._endShield();
    }

    if (this.boostActive) {
      this.boostTime -= dt;
      if (this.boostTime <= 0) {
        this.boostActive = false;
        this._onBoostChange(false);
        if (this.shieldTime <= 0) this._endShield();
      }
    }

    if (this.vulnerable) {
      this.decryptTime -= dt;
      if (this.decryptTime <= 0) this._lose();
    }

    if (!this.shieldActive && !this.vulnerable && !this.boostActive) {
      this.safeTimer -= dt;
      if (this.safeTimer <= 0) this._startVulnerability();
    } else {
      this.safeTimer = IDLE_WARNING_DELAY;
    }

    if (this.elapsed >= WIN_TIME) this._win();
  }

  _lose() {
    this.gameOver = true;
    this.running = false;
    this._onLose();
  }

  _win() {
    this.gameOver = true;
    this.won = true;
    this.running = false;
    this._onWin();
  }

  get riskPercent() {
    if (this.vulnerable) return null;
    if (this.shieldActive) return 0;
    return Math.max(0, Math.min(100, (1 - this.safeTimer / IDLE_WARNING_DELAY) * 100));
  }
}
