import * as THREE from "three";
import Experience from "../Experience";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise";

export default class Terrain {
  constructor(width, depth, verticesWidth, verticesDepth) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.debug = this.experience.debug;

    this.width = width;
    this.depth = depth;
    this.verticesWidth = verticesWidth;
    this.verticesDepth = verticesDepth;
    this.size = verticesWidth * verticesDepth;

    this.config = {
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
    this.elevation = new Float32Array(this.size);

    const perlin = new ImprovedNoise();
    const z = Math.random();

    for (let y = 0; y < this.verticesDepth; y++) {
      for (let x = 0; x < this.verticesWidth; x++) {
        const nx = x / this.verticesWidth;
        const ny = y / this.verticesDepth;

        let elevation =
          (perlin.noise(
            nx * this.config.frequency1,
            ny * this.config.frequency1,
            z
          ) *
            0.5 +
            0.5) *
          this.config.amplitude1;

        elevation +=
          (perlin.noise(
            nx * this.config.frequency2 + 5.3,
            ny * this.config.frequency2 + 9.1,
            z
          ) *
            0.5 +
            0.5) *
          this.config.amplitude2;

        elevation +=
          (perlin.noise(
            nx * this.config.frequency3 + 17.8,
            ny * this.config.frequency3 + 23.5,
            z
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

        this.elevation[x + y * this.verticesWidth] =
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
      this.width,
      this.depth,
      this.verticesWidth - 1,
      this.verticesDepth - 1
    );

    const vertices = this.terrainGeometry.attributes.position.array;

    for (let y = 0; y < this.verticesDepth; y++) {
      for (let x = 0; x < this.verticesWidth; x++) {
        const i = x + y * this.verticesWidth;

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
      color: 0xff499e,
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

      debug.regenerate = () => {
        this.generateElevation();
        this.setGeometry();
        this.setMesh();
      };

      this.debugFolder = this.debug.ui.addFolder("Terrain");

      this.debugFolder
        .add(debug, "frequency1", 1.0, 100.0, 0.01)
        .onFinishChange(debug.regenerate);

      this.debugFolder
        .add(debug, "amplitude1", 0.0, 1.0, 0.001)
        .onFinishChange(debug.regenerate);

      this.debugFolder
        .add(debug, "frequency2", 1.0, 100.0, 0.01)
        .onFinishChange(debug.regenerate);

      this.debugFolder
        .add(debug, "amplitude2", 0.0, 1.0, 0.001)
        .onFinishChange(debug.regenerate);

      this.debugFolder
        .add(debug, "frequency3", 1.0, 100.0, 0.01)
        .onFinishChange(debug.regenerate);

      this.debugFolder
        .add(debug, "amplitude3", 0.0, 1.0, 0.001)
        .onFinishChange(debug.regenerate);

      this.debugFolder
        .add(debug, "multiplier", 0.0, 1000.0, 0.1)
        .onFinishChange(debug.regenerate);

      this.debugFolder
        .add(debug, "exp", 0.01, 10.0, 0.01)
        .onFinishChange(debug.regenerate);

      this.debugFolder
        .add(debug, "fudgeFactor", 0.01, 2.0, 0.01)
        .onFinishChange(debug.regenerate);

      this.debugFolder.add(this.terrainMaterial, "metalness", 0, 1, 0.01);
      this.debugFolder.add(this.terrainMaterial, "roughness", 0, 1, 0.01);
      this.debugFolder.addColor(this.wireframeMaterial, "color");

      this.debugFolder
        .add(debug, "floorElevation", 0, 1, 0.01)
        .onFinishChange(debug.regenerate);

      this.debugFolder.add(debug, "regenerate");
    }
  }
}