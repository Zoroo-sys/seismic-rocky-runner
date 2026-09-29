
export class ScreenShake {
  constructor(camera) {
    this.camera = camera;
    this.homeX = camera.position.x;
    this.homeY = camera.position.y;
    this.homeRoll = camera.rotation.z;
    this.trauma = 0;
    this.decayPerSecond = 2.1;
    this.maxOffset = 0.28;
    this.maxRoll = 0.045;
  }

  kick(amount) {
    this.trauma = clamp01(this.trauma + amount);
  }

  update(dt) {
    if (this.trauma <= 0) {
      return;
    }
    this.trauma = clamp01(this.trauma - this.decayPerSecond * dt);
    const shake = this.trauma * this.trauma;
    this.camera.position.x = this.homeX + rand(-1, 1) * this.maxOffset * shake;
    this.camera.position.y = this.homeY + rand(-1, 1) * this.maxOffset * shake;
    this.camera.rotation.z = this.homeRoll + rand(-1, 1) * this.maxRoll * shake;
  }
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
