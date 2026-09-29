
export class Engine {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030b07);
    this.scene.fog = new THREE.FogExp2(0x030b07, 0.045);

    this.camera = new THREE.PerspectiveCamera(
      62,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(0, 4.4, 8.2);
    this.camera.lookAt(0, 1.6, -6);

    this.clock = new THREE.Clock();

    this._buildLighting();
    window.addEventListener('resize', () => this._handleResize());
  }

  _buildLighting() {
    const ambient = new THREE.HemisphereLight(0x2e5b46, 0x0a0f0a, 0.65);
    this.scene.add(ambient);

    const moon = new THREE.DirectionalLight(0x9fd7c0, 0.55);
    moon.position.set(-6, 12, 4);
    moon.castShadow = true;
    moon.shadow.mapSize.set(512, 512);
    moon.shadow.camera.left = -14;
    moon.shadow.camera.right = 14;
    moon.shadow.camera.top = 14;
    moon.shadow.camera.bottom = -14;
    this.scene.add(moon);

    const rimGlow = new THREE.PointLight(0x39e77f, 0.9, 20);
    rimGlow.position.set(0, 2.4, 3);
    this.scene.add(rimGlow);
  }

  _handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  run(onTick) {
    const frame = () => {
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, this.clock.getDelta());
      onTick(dt);
      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(frame);
  }
}
