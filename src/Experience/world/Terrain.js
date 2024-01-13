import * as THREE from "three";
import Experience from "../Experience";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise";

export default class Terrain {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.colorPalette = this.experience.world.colorPalette;
    this.debug = this.experience.debug;

    this.config = {
      width: 1000,
      depth: 1000,
      verticesWidth: 128,
      verticesDepth: 128,
      // zFactor: Math.random(),
      zFactor: 0.914, // TODO: set back to random later
      frequency1: 14.81,
      amplitude1: 1.0,
      frequency2: 26.98,
      amplitude2: 0.5,
      frequency3: 22.11,
      amplitude3: 0.25,
      multiplier: 139.5,
      exp: 2.14,
      fudgeFactor: 1.17,
      floorElevation: 0.4,
    };

    this.generateElevation();
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setDebug();
  }

  generateElevation() {
    const verticesWidth = this.config.verticesWidth;
    const verticesDepth = this.config.verticesDepth;

    this.elevation = new Float32Array(verticesWidth * verticesDepth);

    const perlin = new ImprovedNoise();

    for (let y = 0; y < verticesDepth; y++) {
      for (let x = 0; x < verticesWidth; x++) {
        const nx = x / verticesWidth;
        const ny = y / verticesDepth;

        let elevation =
          (perlin.noise(
            nx * this.config.frequency1,
            ny * this.config.frequency1,
            this.config.zFactor
          ) *
            0.5 +
            0.5) *
          this.config.amplitude1;

        elevation +=
          (perlin.noise(
            nx * this.config.frequency2 + 5.3,
            ny * this.config.frequency2 + 9.1,
            this.config.zFactor
          ) *
            0.5 +
            0.5) *
          this.config.amplitude2;

        elevation +=
          (perlin.noise(
            nx * this.config.frequency3 + 17.8,
            ny * this.config.frequency3 + 23.5,
            this.config.zFactor
          ) *
            0.5 +
            0.5) *
          this.config.amplitude3;

        elevation /=
          this.config.amplitude1 +
          this.config.amplitude2 +
          this.config.amplitude3;

        elevation = Math.pow(
          elevation * this.config.fudgeFactor,
          this.config.exp
        );

        if (elevation < this.config.floorElevation) {
          elevation = this.config.floorElevation;
        }

        this.elevation[x + y * verticesDepth] =
          elevation * this.config.multiplier;
      }
    }
  }

  setGeometry() {
    if (this.terrainGeometry) {
      this.terrainGeometry.dispose();
    }

    if (this.wireframeGeometry) {
      this.wireframeGeometry.dispose();
    }

    this.terrainGeometry = new THREE.PlaneGeometry(
      this.config.width,
      this.config.depth,
      this.config.verticesWidth - 1,
      this.config.verticesDepth - 1
    );

    const vertices = this.terrainGeometry.attributes.position.array;

    for (let y = 0; y < this.config.verticesDepth; y++) {
      for (let x = 0; x < this.config.verticesWidth; x++) {
        const i = x + y * this.config.verticesWidth;

        vertices[i * 3 + 2] = this.elevation[i];
      }
    }

    this.wireframeGeometry = new THREE.WireframeGeometry(this.terrainGeometry);
  }

  setMaterial() {
    this.terrainMaterial = new THREE.MeshStandardMaterial({
      color: "#000001",
      metalness: 0,
      roughness: 0,
    });

    this.wireframeMaterial = new THREE.LineBasicMaterial({
      color: this.colorPalette.pink,
    });
  }

  setMesh() {
    if (this.mesh) {
      this.mesh.children.length = 0;
    }

    this.mesh = new THREE.Group();

    // Terrain
    this.mesh.add(new THREE.Mesh(this.terrainGeometry, this.terrainMaterial));
    // Terrain wireframe
    this.mesh.add(
      new THREE.LineSegments(this.wireframeGeometry, this.wireframeMaterial)
    );

    this.mesh.rotateX(-Math.PI / 2);

    this.scene.add(this.mesh);
  }

  setDebug() {
    if (this.debug.active) {
      const debug = this.config;

      debug.regenerate = (keepZ) => {
        if (!keepZ) {
          this.config.zFactor = Math.random();
        }

        this.generateElevation();
        this.setGeometry();
        this.setMesh();
      };

      const regenerateWithoutChangingZ = debug.regenerate.bind(null, true);

      this.debugFolder = this.debug.ui.addFolder("Terrain");

      this.debugFolder
        .add(debug, "width", 100, 2000, 1)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "depth", 100, 2000, 1)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "verticesWidth", 8, 512, 1)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "verticesDepth", 8, 512, 1)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "zFactor", 0, 1, 0.001)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "frequency1", 1.0, 100.0, 0.01)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "amplitude1", 0.0, 1.0, 0.001)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "frequency2", 1.0, 100.0, 0.01)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "amplitude2", 0.0, 1.0, 0.001)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "frequency3", 1.0, 100.0, 0.01)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "amplitude3", 0.0, 1.0, 0.001)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "multiplier", 0.0, 1000.0, 0.1)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "exp", 0.01, 10.0, 0.01)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder
        .add(debug, "fudgeFactor", 0.01, 2.0, 0.01)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder.add(this.terrainMaterial, "metalness", 0, 1, 0.01);
      this.debugFolder.add(this.terrainMaterial, "roughness", 0, 1, 0.01);
      this.debugFolder.addColor(this.wireframeMaterial, "color");

      this.debugFolder
        .add(debug, "floorElevation", 0, 1, 0.01)
        .onFinishChange(regenerateWithoutChangingZ);

      this.debugFolder.add(debug, "regenerate");
    }
  }
}
