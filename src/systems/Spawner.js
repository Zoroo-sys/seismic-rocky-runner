import {
  makeGasSpike,
  makeReentrancyBarrier,
  makeGemstone,
  makeCoin,
  makeTrackerBot,
  makeCheckpointGate,
} from '../entities/Obstacles.js';

const LANE_X = [-2.2, 0, 2.2];
const SPAWN_Z = -95;
const DESPAWN_Z = 9;

export class Spawner {
  constructor(scene) {
    this.scene = scene;
    this.worldObjects = []; // { mesh, type, lane, processed, spin }
    this.nextSpawnIn = 1.2;

    this.tracker = null; // { mesh, eye, caught }
    this.trackerSpawnIn = 18 + Math.random() * 10;

    this.checkpoint = null; // { mesh, passed }
    this.checkpointSpawnIn = 50 + Math.random() * 10;
  }

  reset() {
    for (const obj of this.worldObjects) this.scene.remove(obj.mesh);
    this.worldObjects.length = 0;
    this.nextSpawnIn = 1.2;

    if (this.tracker) this.scene.remove(this.tracker.mesh);
    this.tracker = null;
    this.trackerSpawnIn = 18 + Math.random() * 10;

    if (this.checkpoint) this.scene.remove(this.checkpoint.mesh);
    this.checkpoint = null;
    this.checkpointSpawnIn = 50 + Math.random() * 10;
  }

  update(dt, elapsed, travelSpeed, playerLane, playerX) {
    this._scheduleSpawns(dt, elapsed);
    this._scrollObjects(dt, travelSpeed);
    this._updateTracker(dt, elapsed, travelSpeed, playerLane, playerX);
    this._updateCheckpoint(dt, travelSpeed);
  }

  _spawn(type, lane, z) {
    const factory = {
      spike: makeGasSpike,
      barrier: makeReentrancyBarrier,
      shield: makeGemstone,
      coin: makeCoin,
    }[type];
    const mesh = factory();
    mesh.position.x = LANE_X[lane];
    mesh.position.z = z;
    this.scene.add(mesh);
    this.worldObjects.push({ mesh, type, lane, processed: false, spin: Math.random() * 10 });
  }

  _scheduleSpawns(dt, elapsed) {
    this.nextSpawnIn -= dt;
    if (this.nextSpawnIn > 0) return;
    this.nextSpawnIn = Math.max(0.55, 1.15 - elapsed * 0.004);

    const lanes = [0, 1, 2];
    const roll = Math.random();
    if (roll < 0.16) {
      const barrierLane = lanes[Math.floor(Math.random() * 3)];
      this._spawn('barrier', barrierLane, SPAWN_Z);
      if (Math.random() < 0.5) {
        const openLane = lanes.filter((l) => l !== barrierLane)[Math.floor(Math.random() * 2)];
        this._spawn('coin', openLane, SPAWN_Z - 3);
      }
    } else if (roll < 0.42) {
      this._spawn('spike', lanes[Math.floor(Math.random() * 3)], SPAWN_Z);
    } else if (roll < 0.56) {
      this._spawn('shield', lanes[Math.floor(Math.random() * 3)], SPAWN_Z);
    } else {
      const lane = lanes[Math.floor(Math.random() * 3)];
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) this._spawn('coin', lane, SPAWN_Z - i * 1.1);
    }
  }

  _scrollObjects(dt, travelSpeed) {
    for (let i = this.worldObjects.length - 1; i >= 0; i--) {
      const obj = this.worldObjects[i];
      obj.mesh.position.z += travelSpeed * dt;
      if (obj.type !== 'coin') obj.mesh.rotation.y += dt * obj.spin * 0.2;
      if (obj.type === 'shield') obj.mesh.rotation.y += dt * 2.2;
      if (obj.mesh.position.z > DESPAWN_Z) {
        this.scene.remove(obj.mesh);
        this.worldObjects.splice(i, 1);
      }
    }
  }

  _updateTracker(dt, elapsed, travelSpeed, playerLane, playerX) {
    if (!this.tracker) {
      this.trackerSpawnIn -= dt;
      if (this.trackerSpawnIn <= 0) {
        this.trackerSpawnIn = 20 + Math.random() * 14;
        const { group, eye } = makeTrackerBot();
        group.position.set(LANE_X[Math.floor(Math.random() * 3)], 0, SPAWN_Z - 15);
        this.scene.add(group);
        this.tracker = { mesh: group, eye, caught: false };
      }
      return;
    }

    const tracker = this.tracker;
    tracker.mesh.position.z += travelSpeed * dt * 0.92;
    const targetX = LANE_X[playerLane];
    tracker.mesh.position.x += (targetX - tracker.mesh.position.x) * Math.min(1, dt * 0.55);

    const pulse = 1 + Math.sin(elapsed * 6) * 0.15;
    tracker.eye.scale.set(pulse, pulse, pulse);

    if (
      !tracker.caught &&
      tracker.mesh.position.z > -1.2 &&
      tracker.mesh.position.z < 1.05 &&
      Math.abs(tracker.mesh.position.x - playerX) < 0.9
    ) {
      tracker.caught = true;
      this.onTrackerCatch?.();
    }

    if (tracker.mesh.position.z > DESPAWN_Z) {
      this.scene.remove(tracker.mesh);
      this.tracker = null;
    }
  }

  _updateCheckpoint(dt, travelSpeed) {
    if (!this.checkpoint) {
      this.checkpointSpawnIn -= dt;
      if (this.checkpointSpawnIn <= 0) {
        this.checkpointSpawnIn = 55 + Math.random() * 10;
        const mesh = makeCheckpointGate();
        mesh.position.set(0, 0, SPAWN_Z);
        this.scene.add(mesh);
        this.checkpoint = { mesh, passed: false };
      }
      return;
    }

    const checkpoint = this.checkpoint;
    checkpoint.mesh.position.z += travelSpeed * dt;

    if (!checkpoint.passed && checkpoint.mesh.position.z > -1.05 && checkpoint.mesh.position.z < 1.05) {
      checkpoint.passed = true;
      this.onCheckpointPass?.();
    }

    if (checkpoint.mesh.position.z > DESPAWN_Z) {
      this.scene.remove(checkpoint.mesh);
      this.checkpoint = null;
    }
  }
}
