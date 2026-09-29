import { damp, clamp } from '../core/MathUtils.js';

const LANE_X = [-2.2, 0, 2.2];
const JUMP_LAUNCH_SPEED = 9.2;
const GRAVITY = -26;
const SLIDE_DURATION = 0.62;
const LANE_DAMP = 14; // higher = snappier lane changes

export class Rocky {
  constructor() {
    this.group = new THREE.Group();
    this.lane = 1;
    this.verticalSpeed = 0;
    this.airborne = false;
    this.sliding = false;
    this.slideTimeLeft = 0;
    this.strideCycle = 0;
    this.landingSquash = 0; // 0..1, decays after touching down

    this._buildBody();
  }

  get mesh() {
    return this.group;
  }

  setShieldVisible(visible) {
    this.aura.visible = visible;
  }

  changeLane(direction) {
    this.lane = clamp(this.lane + direction, 0, 2);
  }

  jump() {
    if (this.airborne || this.sliding) return;
    this.airborne = true;
    this.verticalSpeed = JUMP_LAUNCH_SPEED;
  }

  slide() {
    if (this.airborne) return;
    this.sliding = true;
    this.slideTimeLeft = SLIDE_DURATION;
  }

  update(dt, speedFactor) {
    const targetX = LANE_X[this.lane];
    
    this.group.position.x = damp(this.group.position.x, targetX, LANE_DAMP, dt);
    this.group.rotation.z = (targetX - this.group.position.x) * -0.12;

    if (this.airborne) {
      this.group.position.y += this.verticalSpeed * dt;
      this.verticalSpeed += GRAVITY * dt;
      if (this.group.position.y <= 0) {
        this.group.position.y = 0;
        this.airborne = false;
        this.verticalSpeed = 0;
        this.landingSquash = 1;
      }
    }

    if (this.sliding) {
      this.slideTimeLeft -= dt;
      if (this.slideTimeLeft <= 0) this.sliding = false;
    }

    this._animateStride(dt, speedFactor);
    this._animateSquash(dt);
  }

  _animateStride(dt, speedFactor) {
    this.strideCycle += dt * 9 * speedFactor * (this.sliding ? 0.2 : 1);
    const swing = Math.sin(this.strideCycle);

    this.legL.hip.rotation.x = swing * 0.7;
    this.legR.hip.rotation.x = -swing * 0.7;
    this.legL.knee.rotation.x = Math.max(0, -swing) * 0.9;
    this.legR.knee.rotation.x = Math.max(0, swing) * 0.9;
    this.armL.shoulder.rotation.x = -swing * 0.6;
    this.armR.shoulder.rotation.x = 0.85 + swing * 0.1;
    this.torso.rotation.x = Math.sin(this.strideCycle * 2) * 0.03;
    this.head.position.y = 1.42 + Math.abs(Math.sin(this.strideCycle * 2)) * 0.03;

    const slideTarget = this.sliding ? 0.55 : 1;
    const posTarget = this.sliding ? 0.55 : 0.95;
    this.hips.scale.y = damp(this.hips.scale.y, slideTarget, this.airborne ? 0 : 10, dt);
    this.hips.position.y = damp(this.hips.position.y, posTarget, this.airborne ? 0 : 10, dt);
  }

  _animateSquash(dt) {
    if (this.landingSquash <= 0) return;
    this.landingSquash = Math.max(0, this.landingSquash - dt * 4);
    const s = this.landingSquash * 0.12;
    this.group.scale.set(1 + s, 1 - s, 1 + s);
  }

  _buildBody() {
    const stone = stoneMaterial(0x8f8d86, 0x5c5a54);
    const stoneLight = stoneMaterial(0xb6b3aa, 0x847f74);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x39424d, roughness: 0.35, metalness: 0.6 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x111111 });

    this.hips = new THREE.Group();
    this.hips.position.y = 0.95;
    this.group.add(this.hips);

    this.torso = box([1.15, 1.0, 0.7], stone);
    this.torso.position.y = 0.65;
    this.torso.castShadow = true;
    this.hips.add(this.torso);

    const farPlate = box([0.7, 0.55, 0.12], stoneLight);
    farPlate.position.set(0, 0.75, -0.38);
    this.hips.add(farPlate);

    const crestPlate = box([0.7, 0.6, 0.1], stoneLight);
    crestPlate.position.set(0, 0.75, 0.38);
    this.hips.add(crestPlate);

    for (const side of [-1, 1]) {
      const pad = box([0.4, 0.32, 0.5], stoneLight);
      pad.position.set(side * 0.72, 1.12, 0);
      this.hips.add(pad);
    }

    this.head = new THREE.Group();
    this.head.position.set(0, 1.42, -0.02);
    this.hips.add(this.head);
    const skull = box([0.62, 0.42, 0.6], stone);
    skull.castShadow = true;
    this.head.add(skull);
    const jaw = box([0.5, 0.18, 0.5], stoneLight);
    jaw.position.set(0, -0.24, -0.02);
    this.head.add(jaw);
    const crestFin = box([0.2, 0.22, 0.34], stone);
    crestFin.position.set(0, 0.3, 0.06);
    this.head.add(crestFin);
    const visor = box([0.64, 0.14, 0.15], visorMat);
    visor.position.set(0, 0.02, -0.32);
    this.head.add(visor);
    const eye = sphere(0.045, eyeMat);
    eye.position.set(0.18, 0.02, -0.4);
    this.head.add(eye);

    this.armL = this._buildArm(-1, stone, stoneLight);
    this.armR = this._buildArm(1, stone, stoneLight);
    this.armR.shoulder.rotation.z = -0.3;
    this.armR.elbow.rotation.x = 1.7;

    this._attachDocument();

    this.legL = this._buildLeg(-1, stone, stoneLight);
    this.legR = this._buildLeg(1, stone, stoneLight);

    const auraMat = new THREE.MeshBasicMaterial({ color: 0x39e77f, transparent: true, opacity: 0.28 });
    this.aura = sphere(1.35, auraMat);
    this.aura.position.y = 1.1;
    this.aura.visible = false;
    this.group.add(this.aura);

    this.group.scale.set(0.85, 0.85, 0.85);
  }

  _buildArm(side, mat, matLight) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.75, 1.08, 0);
    const upper = box([0.32, 0.55, 0.32], mat);
    upper.position.y = -0.28;
    shoulder.add(upper);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.55, 0);
    shoulder.add(elbow);
    const lower = box([0.28, 0.5, 0.28], matLight);
    lower.position.y = -0.25;
    elbow.add(lower);
    const hand = box([0.3, 0.26, 0.3], mat);
    hand.position.y = -0.55;
    elbow.add(hand);

    this.hips.add(shoulder);
    return { shoulder, elbow, hand };
  }

  _buildLeg(side, mat, matLight) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.34, 0, 0);
    const thigh = box([0.38, 0.5, 0.38], mat);
    thigh.position.y = -0.25;
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.set(0, -0.5, 0);
    hip.add(knee);
    const shin = box([0.32, 0.48, 0.32], matLight);
    shin.position.y = -0.24;
    knee.add(shin);
    const foot = box([0.36, 0.18, 0.56], mat);
    foot.position.set(0, -0.5, 0.1);
    knee.add(foot);

    this.hips.add(hip);
    return { hip, knee };
  }

  _attachDocument() {
    const docGroup = new THREE.Group();
    const docTex = documentTexture();
    const doc = new THREE.Mesh(
      new THREE.PlaneGeometry(0.36, 0.48),
      new THREE.MeshStandardMaterial({ map: docTex, side: THREE.DoubleSide, roughness: 0.85 })
    );
    docGroup.add(doc);
    const docBacking = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.46, 0.015),
      new THREE.MeshStandardMaterial({ color: 0xcdbd8f, roughness: 0.95 })
    );
    docBacking.position.z = -0.01;
    docGroup.add(docBacking);
    docGroup.position.set(0.6, 1.3, -0.4);
    docGroup.rotation.set(0.1, -0.35, -0.08);
    this.hips.add(docGroup);
  }
}

function box(size, mat) {
  return new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
}
function sphere(radius, mat) {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 16), mat);
}

function stoneMaterial(baseHex, speckHex) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = colorToCss(baseHex);
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 16; i++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const r = 10 + Math.random() * 18;
    const sides = 5 + Math.floor(Math.random() * 3);
    ctx.beginPath();
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2 + Math.random() * 0.5;
      const rr = r * (0.7 + Math.random() * 0.5);
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)';
    ctx.fill();
  }

  for (let i = 0; i < 900; i++) {
    ctx.globalAlpha = 0.05 + Math.random() * 0.12;
    ctx.fillStyle = colorToCss(speckHex);
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < 22; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, 1 + Math.random() * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 5; i++) {
    let x = Math.random() * size;
    let y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segments = 2 + Math.floor(Math.random() * 2);
    for (let s = 0; s < segments; s++) {
      const angle = Math.random() * Math.PI * 2;
      const len = 8 + Math.random() * 14;
      x += Math.cos(angle) * len;
      y += Math.sin(angle) * len;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: 0.95, metalness: 0.03 });
}

function documentTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e9dcb8';
  ctx.fillRect(0, 0, 128, 160);
  ctx.strokeStyle = 'rgba(80,60,20,0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 120, 152);
  ctx.fillStyle = 'rgba(70,50,20,0.4)';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(16, 24 + i * 14, 96 - (i % 3) * 18, 4);
  }
  ctx.beginPath();
  ctx.arc(64, 132, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#39e77f';
  ctx.fill();
  ctx.fillStyle = '#04140b';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('S', 64, 138);
  return new THREE.CanvasTexture(canvas);
}

function colorToCss(hex) {
  return '#' + hex.toString(16).padStart(6, '0');
}
