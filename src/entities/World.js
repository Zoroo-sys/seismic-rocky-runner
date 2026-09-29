const TREE_COUNT = 40;
const LANE_EDGES = [-3.3, -1.1, 1.1, 3.3];

export class World {
  constructor(scene) {
    this.scene = scene;
    this.trees = [];
    this._buildGround();
    this._plantTrees();
  }

  scroll(dt, distancePerSecond) {
    for (const tree of this.trees) {
      tree.root.position.z += distancePerSecond * dt;
      if (tree.root.position.z > 12) {
        tree.root.position.z = -130 - Math.random() * 20;
        const side = Math.random() < 0.5 ? -1 : 1;
        tree.root.position.x = side * (4.4 + Math.random() * 5);
      }
      this._updateLurker(tree, dt);
    }
  }

  setDangerEyesVisible(visible) {
    for (const tree of this.trees) {
      for (const eye of tree.dangerEyes.children) {
        const material = eye.material;
        material.opacity = visible ? 1 : 0;
      }
    }
  }

  notifyDangerState(isDanger) {
    this._dangerActive = isDanger;
  }

  _buildGround() {
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0e2016, roughness: 0.95 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(9, 400), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -150);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const stripMat = new THREE.MeshStandardMaterial({
      color: 0x39e77f,
      emissive: 0x39e77f,
      emissiveIntensity: 0.8,
    });
    for (const x of LANE_EDGES) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 400), stripMat);
      strip.position.set(x, 0.02, -150);
      this.scene.add(strip);
    }

    const sideMat = new THREE.MeshStandardMaterial({ color: 0x02070e, roughness: 1 });
    const sideFloor = new THREE.Mesh(new THREE.PlaneGeometry(260, 460), sideMat);
    sideFloor.rotation.x = -Math.PI / 2;
    sideFloor.position.set(0, -0.02, -150);
    sideFloor.receiveShadow = true;
    this.scene.add(sideFloor);
  }

  _plantTrees() {
    for (let i = 0; i < TREE_COUNT; i++) {
      const tree = this._buildTree();
      const side = Math.random() < 0.5 ? -1 : 1;
      tree.root.position.set(side * (4.4 + Math.random() * 5), 0, -Math.random() * 140);
      this.scene.add(tree.root);
      this.trees.push(tree);
    }
  }

  _buildTree() {
    const root = new THREE.Group();
    const height = 3 + Math.random() * 3;

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8a7256, roughness: 1 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, height, 7), trunkMat);
    trunk.position.y = height / 2;
    trunk.rotation.y = Math.random() * Math.PI;
    root.add(trunk);

    const canopyPalette = [0x0f3320, 0x123a26, 0x17482e, 0x0c2a1c];
    const canopyCenterY = height + 0.9;
    const clumpCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < clumpCount; i++) {
      const color = canopyPalette[Math.floor(Math.random() * canopyPalette.length)];
      const clumpMat = new THREE.MeshStandardMaterial({ color, roughness: 0.92, flatShading: true });
      const size = 0.85 + Math.random() * 0.7;
      const clump = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), clumpMat);
      const angle = (i / clumpCount) * Math.PI * 2 + Math.random() * 0.6;
      const radius = i === 0 ? 0 : 0.35 + Math.random() * 0.55;
      clump.position.set(
        Math.cos(angle) * radius,
        canopyCenterY + (Math.random() - 0.3) * 0.9,
        Math.sin(angle) * radius
      );
      root.add(clump);
    }

    const glowMat = new THREE.MeshBasicMaterial({ color: 0x39e77f });
    for (let i = 0; i < 3; i++) {
      const speck = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), glowMat);
      speck.position.set(
        (Math.random() - 0.5) * 1.6,
        canopyCenterY + (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 1.6
      );
      root.add(speck);
    }

    const dangerEyes = new THREE.Group();
    const eyeMatTemplate = new THREE.MeshBasicMaterial({ color: 0xff2c3d, transparent: true, opacity: 0 });
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), eyeMatTemplate.clone());
      eye.position.set(side * 0.12, canopyCenterY, 0.95);
      dangerEyes.add(eye);
    }
    root.add(dangerEyes);

    const tree = { root, dangerEyes, lurker: null, lurkerHidden: true, lurkerTimer: 1 + Math.random() * 4 };
    if (Math.random() < 0.7) {
      tree.lurker = this._buildLurker(height);
      root.add(tree.lurker.group);
    }
    return tree;
  }

  _buildLurker(treeHeight) {
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x03060a, transparent: true, opacity: 0 });
    const group = new THREE.Group();

    const hunchHeight = 0.5 + Math.random() * 0.18;
    const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 0), bodyMat);
    body.scale.set(0.85, (hunchHeight / 0.26) * 0.4, 0.75);
    body.position.set(0, hunchHeight * 0.5, 0.42);
    body.rotation.y = Math.random() * Math.PI;
    group.add(body);

    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), bodyMat);
    head.position.set(0, hunchHeight * 0.88, 0.5);
    group.add(head);

    const eyes = [];
    for (const side of [-1, 1]) {
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2c3d, transparent: true, opacity: 0 });
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), eyeMat);
      eye.position.set(side * 0.065, hunchHeight * 0.9, 0.62);
      group.add(eye);
      eyes.push(eye);
    }

    return { group, bodyMat, eyes };
  }

  _updateLurker(tree, dt) {
    if (!tree.lurker) return;
    const forcedVisible = this._dangerActive;

    if (!forcedVisible) {
      tree.lurkerTimer -= dt;
      if (tree.lurkerTimer <= 0) {
        tree.lurkerHidden = !tree.lurkerHidden;
        tree.lurkerTimer = tree.lurkerHidden ? 1.2 + Math.random() * 3 : 2.5 + Math.random() * 4.5;
      }
    }

    const hidden = forcedVisible ? false : tree.lurkerHidden;
    const bodyTarget = hidden ? 0 : forcedVisible ? 0.6 : 0.4;
    const eyeTarget = hidden ? 0 : forcedVisible ? 1.0 : 0.7;

    tree.lurker.bodyMat.opacity += (bodyTarget - tree.lurker.bodyMat.opacity) * Math.min(1, dt * 5);
    for (const eye of tree.lurker.eyes) {
      eye.material.opacity += (eyeTarget - eye.material.opacity) * Math.min(1, dt * 5);
    }
  }
}
