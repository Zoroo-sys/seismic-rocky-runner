(function () {
  class Vec3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    clone() { return new Vec3(this.x, this.y, this.z); }
  }

  class Object3D {
    constructor() {
      this.position = new Vec3();
      this.rotation = new Vec3();
      this.scale = new Vec3(1, 1, 1);
      this.children = [];
      this.parent = null;
      this.visible = true;
      this.castShadow = false;
      this.receiveShadow = false;
      this.frustumCulled = true;
    }
    add(child) { this.children.push(child); child.parent = this; return this; }
    remove(child) {
      const i = this.children.indexOf(child);
      if (i >= 0) this.children.splice(i, 1);
      return this;
    }
    lookAt() {}
  }

  class Group extends Object3D {}
  class Scene extends Object3D {}

  class Mesh extends Object3D {
    constructor(geometry, material) {
      super();
      this.geometry = geometry;
      this.material = material;
    }
  }

  class Points extends Object3D {
    constructor(geometry, material) {
      super();
      this.geometry = geometry;
      this.material = material;
    }
  }

  class BufferAttribute {
    constructor(array, itemSize) { this.array = array; this.itemSize = itemSize; this.needsUpdate = false; }
  }
  class BufferGeometry {
    constructor() { this.attributes = {}; }
    setAttribute(name, attr) { this.attributes[name] = attr; return this; }
  }

  function geometryStub(name) {
    return class { constructor(...args) { this.type = name; this.args = args; } };
  }

  class Color { constructor(v) { this.value = v; } set(v) { this.value = v; return this; } }

  class MaterialBase {
    constructor(props = {}) { Object.assign(this, props); this.color = new Color(props.color); }
    clone() { return new this.constructor({ ...this }); }
  }
  class MeshStandardMaterial extends MaterialBase {}
  class MeshBasicMaterial extends MaterialBase {}
  class PointsMaterial extends MaterialBase {}

  class CanvasTexture { constructor(canvas) { this.canvas = canvas; } }

  class Light extends Object3D {
    constructor(color, intensity) { super(); this.color = new Color(color); this.intensity = intensity; }
  }
  class DirectionalLight extends Light {
    constructor(color, intensity) {
      super(color, intensity);
      this.shadow = { mapSize: new Vec3(), camera: {} };
    }
  }
  class HemisphereLight extends Light {}
  class PointLight extends Light {
    constructor(color, intensity, distance) { super(color, intensity); this.distance = distance; }
  }

  class PerspectiveCamera extends Object3D {
    constructor(fov, aspect, near, far) {
      super();
      Object.assign(this, { fov, aspect, near, far });
    }
    updateProjectionMatrix() {}
  }

  class FogExp2 { constructor(color, density) { this.color = color; this.density = density; } }

  class Clock {
    getDelta() { return 0.016; }
  }

  class WebGLRenderer {
    constructor({ canvas } = {}) {
      this.domElement = canvas || { style: {} };
      this.shadowMap = { enabled: false };
    }
    setPixelRatio() {}
    setSize() {}
    render() {}
  }

  window.THREE = {
    Group, Scene, Mesh, Points, Object3D,
    BoxGeometry: geometryStub('Box'),
    SphereGeometry: geometryStub('Sphere'),
    CylinderGeometry: geometryStub('Cylinder'),
    ConeGeometry: geometryStub('Cone'),
    IcosahedronGeometry: geometryStub('Icosahedron'),
    PlaneGeometry: geometryStub('Plane'),
    BufferGeometry, BufferAttribute,
    MeshStandardMaterial, MeshBasicMaterial, PointsMaterial,
    CanvasTexture,
    Color,
    DirectionalLight, HemisphereLight, PointLight,
    PerspectiveCamera,
    FogExp2,
    Clock,
    WebGLRenderer,
    DoubleSide: 2,
  };
})();
