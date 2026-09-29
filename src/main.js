import { Engine } from './core/Engine.js';
import { InputController } from './core/InputController.js';
import { ScreenShake } from './core/ScreenShake.js';
import { formatTime } from './core/format.js';
import { Rocky } from './entities/Rocky.js';
import { World } from './entities/World.js';
import { RunState } from './systems/RunState.js';
import { Spawner } from './systems/Spawner.js';
import { CollisionResolver } from './systems/CollisionResolver.js';
import { ParticleSystem } from './systems/Particles.js';
import { AudioDirector } from './systems/AudioDirector.js';
import { Hud } from './ui/Hud.js';
import { Screens } from './ui/Screens.js';
import { shareRun } from './ui/ShareCard.js';

const BASE_SPEED_FOR_ANIM = 11;

class Game {
  constructor() {
    const canvas = document.getElementById('gameCanvas');
    this.engine = new Engine(canvas);

    this.rocky = new Rocky();
    this.engine.scene.add(this.rocky.mesh);

    this.world = new World(this.engine.scene);
    this.particles = new ParticleSystem(this.engine.scene);
    this.spawner = new Spawner(this.engine.scene);
    this.audio = new AudioDirector();
    this.shake = new ScreenShake(this.engine.camera);
    this.hud = new Hud();

    this.runState = new RunState({
      onShieldChange: (active) => {
        this.rocky.setShieldVisible(active);
        this.hud.setShieldGlow(active);
      },
      onDangerChange: (active) => {
        this.hud.setDanger(active);
        this.world.setDangerEyesVisible(active);
        this.world.notifyDangerState(active);
        this.audio.setDanger(active);
      },
      onBoostChange: (active) => this.hud.showBoostBanner(active),
      onCheckpoint: () => {
        this.audio.playCheckpoint();
        this.hud.flashCheckpointBanner();
      },
      onWin: () => this._finish(() => this.screens.showWin(this.runState.score)),
      onLose: () => this._finish(() => this.screens.showLose(this.runState.score, this.runState.elapsed)),
    });

    this.collisions = new CollisionResolver({
      rocky: this.rocky,
      runState: this.runState,
      spawner: this.spawner,
      audio: this.audio,
      particles: this.particles,
      shake: this.shake,
    });
    this.spawner.onTrackerCatch = () => this.runState.triggerTrackerCatch();
    this.spawner.onCheckpointPass = () => this.runState.crossCheckpoint();

    this.screens = new Screens({
      onStart: () => this._start(),
      onRetry: () => this._start(),
      onShare: (outcome) => this._share(outcome),
    });

    new InputController({
      onLaneChange: (dir) => {
        if (!this.runState.running) return;
        this.rocky.changeLane(dir);
        this.audio.playDodge();
      },
      onJump: () => {
        if (!this.runState.running) return;
        this.audio.unlock();
        this.rocky.jump();
      },
      onSlide: () => {
        if (!this.runState.running) return;
        this.audio.unlock();
        this.rocky.slide();
      },
    });

    this.engine.run((dt) => this._update(dt));
  }

  _start() {
    this.runState.reset();
    this.rocky.lane = 1;
    this.rocky.group.position.set(0, 0, 0);
    this.rocky.group.rotation.set(0, 0, 0);
    this.rocky.setShieldVisible(false);

    this.world.setDangerEyesVisible(false);
    this.world.notifyDangerState(false);
    this.spawner.reset();

    this.hud.setDanger(false);
    this.hud.setShieldGlow(false);
    this.hud.showBoostBanner(false);
    this.hud.showDecryptRow(false);

    this.screens.hideAll();

    this.audio.unlock();
    this.audio.startMusic();
    
  }

  _finish(showScreen) {
    this.audio.stopMusic();
    this.audio.setDanger(false);
    if (this.runState.won) this.audio.playVictory();
    showScreen();
  }

  _share(outcome) {
    const isWin = outcome === 'win';
    const statusEl = document.getElementById(isWin ? 'shareStatusWin' : 'shareStatusLose');
    shareRun(
      isWin ? 'Transaction finalized on Seismic' : 'Transaction intercepted by MEV bots',
      String(Math.floor(this.runState.score)),
      isWin ? '360s' : formatTime(this.runState.elapsed),
      isWin ? '#39e77f' : '#ff3b4e',
      statusEl
    );
  }

  _update(dt) {
    this.shake.update(dt);
    this.particles.update(dt);

    if (!this.runState.running || this.runState.gameOver) {
      return;
    }

    this.runState.tick(dt);
    this.hud.showDecryptRow(this.runState.vulnerable);

    const travelSpeed = this.runState.travelSpeed;
    const speedFactor = 0.4 + (this.runState.speed / BASE_SPEED_FOR_ANIM) * 0.5;

    this.rocky.update(dt, speedFactor);
    this.world.scroll(dt, travelSpeed);
    this.spawner.update(dt, this.runState.elapsed, travelSpeed, this.rocky.lane, this.rocky.group.position.x);
    this.collisions.resolve(this.rocky.lane);

    this.hud.render(this.runState);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.__game = new Game();
});
