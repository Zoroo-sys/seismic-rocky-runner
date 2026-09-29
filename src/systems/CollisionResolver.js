const HIT_Z_WINDOW = 1.05;

export class CollisionResolver {
  constructor({ rocky, runState, spawner, audio, particles, shake }) {
    this.rocky = rocky;
    this.runState = runState;
    this.spawner = spawner;
    this.audio = audio;
    this.particles = particles;
    this.shake = shake;
  }

  resolve(lane) {
    const objects = this.spawner.worldObjects;
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (obj.processed) continue;

      const dz = Math.abs(obj.mesh.position.z - this.rocky.mesh.position.z);
      const sameLane = obj.lane === lane;

      if (dz < HIT_Z_WINDOW && sameLane) {
        this._handleDirectHit(obj);
        continue;
      }

      if (this.runState.boostActive && obj.type === 'coin' && dz < 6) {
        this._magnetPull(obj, dz, lane);
      }
    }
  }

  _handleDirectHit(obj) {
    switch (obj.type) {
      case 'coin':
        this._collectCoin(obj);
        break;
      case 'shield':
        this._collectGem(obj);
        break;
      case 'spike': {
        const clearedByJump = this.rocky.airborne && this.rocky.mesh.position.y > 0.9;
        obj.processed = true;
        if (!clearedByJump) {
          this.runState.reactToGasSpike();
          this.audio.playImpact();
          this.shake.kick(0.35);
        }
        break;
      }
      case 'barrier':
        obj.processed = true;
        if (this.runState.reactToBarrier()) {
          this.audio.playFatal();
          this.shake.kick(0.9);
        }
        break;
    }
  }

  _collectCoin(obj) {
    obj.processed = true;
    this.runState.addScore(10);
    this.audio.playCoin();
    this.particles.burst(obj.mesh.position, { color: 0xf2c14e, count: 14, speed: 2.2 });
    obj.mesh.parent.remove(obj.mesh);
  }

  _collectGem(obj) {
    obj.processed = true;
    const wasVulnerable = this.runState.activateShield();
    wasVulnerable ? this.audio.playRecovery() : this.audio.playShieldPickup();
    this.particles.burst(obj.mesh.position, { color: 0x39e77f, count: 34, speed: 3.6, spread: 1.3 });
    this.rocky.setShieldVisible(true);
    obj.mesh.parent.remove(obj.mesh);
  }

  _magnetPull(obj, dz, lane) {
    const targetX = laneX(lane);
    obj.mesh.position.x += (targetX - obj.mesh.position.x) * 0.15;
    if (dz < HIT_Z_WINDOW) {
      obj.processed = true;
      this.runState.addScore(10);
      this.audio.playCoin();
      this.particles.burst(obj.mesh.position, { color: 0xf2c14e, count: 10, speed: 1.8 });
      obj.mesh.parent.remove(obj.mesh);
    }
  }
}

function laneX(lane) {
  return [-2.2, 0, 2.2][lane];
}
