const MAX_PARTICLES = 220;

export class ParticleSystem {
  constructor(scene) {
    this.positions = new Float32Array(MAX_PARTICLES * 3);
    this.velocities = new Float32Array(MAX_PARTICLES * 3);
    this.lifetimes = new Float32Array(MAX_PARTICLES);
    this.ages = new Float32Array(MAX_PARTICLES);
    this.active = new Uint8Array(MAX_PARTICLES);
    this.cursor = 0;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.material = new THREE.PointsMaterial({
      color: 0x39e77f,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  burst(position, { color = 0x39e77f, count = 26, speed = 3.2, spread = 1 } = {}) {
    this.material.color.set(color);
    for (let i = 0; i < count; i++) {
      const slot = this.cursor;
      this.cursor = (this.cursor + 1) % MAX_PARTICLES;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const dirX = Math.sin(phi) * Math.cos(theta);
      const dirY = Math.abs(Math.cos(phi)) * 0.8 + 0.2;
      const dirZ = Math.sin(phi) * Math.sin(theta);
      const velocity = speed * (0.4 + Math.random() * 0.6);

      this.positions[slot * 3] = position.x;
      this.positions[slot * 3 + 1] = position.y;
      this.positions[slot * 3 + 2] = position.z;

      this.velocities[slot * 3] = dirX * velocity * spread;
      this.velocities[slot * 3 + 1] = dirY * velocity;
      this.velocities[slot * 3 + 2] = dirZ * velocity * spread;

      this.lifetimes[slot] = 0.5 + Math.random() * 0.4;
      this.ages[slot] = 0;
      this.active[slot] = 1;
    }
  }

  update(dt) {
    let anyActive = false;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (!this.active[i]) continue;
      anyActive = true;
      this.ages[i] += dt;
      if (this.ages[i] >= this.lifetimes[i]) {
        this.active[i] = 0;
        this.positions[i * 3 + 1] = -999; // park it off-screen
        continue;
      }
      this.velocities[i * 3 + 1] -= 4.5 * dt; // gravity pulling sparks down
      this.positions[i * 3] += this.velocities[i * 3] * dt;
      this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * dt;
      this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * dt;
    }
    if (anyActive) {
      this.points.geometry.attributes.position.needsUpdate = true;
    }
  }
}
