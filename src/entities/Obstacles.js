const LANE_X = [-2.2, 0, 2.2];

function material(color, emissive, emissiveIntensity = 0, roughness = 0.5, metalness = 0.2) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  if (emissiveIntensity > 0) {
    mat.emissive = new THREE.Color(emissive);
    mat.emissiveIntensity = emissiveIntensity;
  }
  return mat;
}


const geo = {
  spike: new THREE.ConeGeometry(0.16, 0.55, 6),
  barrier: new THREE.BoxGeometry(1.7, 2.0, 0.3),
  barrierStripe: new THREE.BoxGeometry(1.7, 0.08, 0.32),
  gemTop: new THREE.ConeGeometry(0.38, 0.64, 6, 1),
  gemBase: new THREE.ConeGeometry(0.38, 0.48, 6, 1),
  gemBand: new THREE.CylinderGeometry(0.38, 0.34, 0.08, 6),
  coin: new THREE.CylinderGeometry(0.47, 0.47, 0.1, 24),
};

const mats = {
  spike: material(0xff8a3d, 0x552200, 0.6),
  barrier: material(0xff3b4e, 0x5a0009, 0.5, 0.4, 0.3),
  stripe: material(0xffe1a8),
  gem: material(0xa87c92, 0x6e3f57, 0.55, 0.25, 0.15),
  coinEdge: material(0xf2c14e, 0x6b4c04, 0.2, 0.3, 0.6),
  coinFace: (() => {
    const mat = new THREE.MeshStandardMaterial({
      map: coinFaceTexture(),
      emissive: 0x6b4c04,
      emissiveIntensity: 0.15,
      roughness: 0.3,
      metalness: 0.55,
    });
    return mat;
  })(),
};

export function makeGasSpike() {
  const group = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const cone = new THREE.Mesh(geo.spike, mats.spike);
    cone.position.set((i - 1) * 0.22, 0.27, 0);
    group.add(cone);
  }
  return group;
}

export function makeReentrancyBarrier() {
  const group = new THREE.Group();
  const bar = new THREE.Mesh(geo.barrier, mats.barrier);
  bar.position.y = 1.0;
  group.add(bar);
  for (let i = 0; i < 3; i++) {
    const stripe = new THREE.Mesh(geo.barrierStripe, mats.stripe);
    stripe.position.set(0, 0.35 + i * 0.6, 0);
    stripe.rotation.z = 0.15;
    group.add(stripe);
  }
  return group;
}

export function makeGemstone() {
  const group = new THREE.Group();
  const top = new THREE.Mesh(geo.gemTop, mats.gem);
  top.position.y = 0.34;
  group.add(top);
  const base = new THREE.Mesh(geo.gemBase, mats.gem);
  base.rotation.x = Math.PI;
  base.position.y = -0.22;
  group.add(base);
  const band = new THREE.Mesh(geo.gemBand, mats.gem);
  band.position.y = 0.02;
  group.add(band);
  group.position.y = 1.15;
  const glow = new THREE.PointLight(0xb98aa0, 1.1, 4);
  group.add(glow);
  return group;
}

export function makeCoin() {
  const coin = new THREE.Mesh(geo.coin, [mats.coinEdge, mats.coinFace, mats.coinFace]);
  coin.rotation.x = Math.PI / 2;
  coin.position.y = 1.05;
  return coin;
}

export function makeTrackerBot() {
  const group = new THREE.Group();
  const bodyMat = material(0x120306, 0, 0);
  bodyMat.transparent = true;
  bodyMat.opacity = 0.55;
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 0), bodyMat);
  body.scale.set(1, 0.8, 1);
  body.position.y = 0.32;
  group.add(body);

  const eyeMat = material(0xff2c3d, 0xff2c3d, 1);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), eyeMat);
  eye.position.set(0, 0.55, 0.22);
  group.add(eye);

  const glow = new THREE.PointLight(0xff2c3d, 1.2, 5);
  glow.position.y = 0.55;
  group.add(glow);

  return { group, eye };
}

export function makeCheckpointGate() {
  const group = new THREE.Group();
  const gateMat = material(0x39e77f, 0x39e77f, 0.4, 0.4, 0.1);
  const gateWidth = LANE_X[2] - LANE_X[0] + 1.6;
  const gateHeight = 3.2;

  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.22, gateHeight, 0.22), gateMat);
    pillar.position.set((side * gateWidth) / 2, gateHeight / 2, 0);
    group.add(pillar);
  }

  const beam = new THREE.Mesh(new THREE.BoxGeometry(gateWidth + 0.3, 0.22, 0.22), gateMat);
  beam.position.set(0, gateHeight, 0);
  group.add(beam);

  const curtainMat = material(0x39e77f, 0, 0);
  curtainMat.transparent = true;
  curtainMat.opacity = 0.16;
  curtainMat.side = THREE.DoubleSide;
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(gateWidth, gateHeight), curtainMat);
  curtain.position.set(0, gateHeight / 2, 0);
  curtain.rotation.x = Math.PI / 2;
  group.add(curtain);

  for (const side of [-1, 1]) {
    const glow = new THREE.PointLight(0x39e77f, 0.9, 6);
    glow.position.set((side * gateWidth) / 2, gateHeight * 0.5, 0);
    group.add(glow);
  }

  return group;
}

function coinFaceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f2c14e';
  ctx.fillRect(0, 0, 224, 224);
  ctx.beginPath();
  ctx.arc(112, 112, 104, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(107,76,4,0.55)';
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(112, 112, 84, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(107,76,4,0.35)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#6b4c04';
  ctx.font = 'bold 54px "Chakra Petch", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SIZE', 112, 119);
  return new THREE.CanvasTexture(canvas);
}
