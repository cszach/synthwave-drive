import * as THREE from "three";
import Experience from "../../Experience";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise";

export default class Terrain {
  constructor(width, depth, verticesWidth, verticesDepth) {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    this.width = width;
    this.depth = depth;
    this.verticesWidth = verticesWidth;
    this.verticesDepth = verticesDepth;
    this.size = verticesWidth * verticesDepth;

    this.generateElevation();
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  generateElevation() {
    this.elevation = new Float32Array(this.size);

    const perlin = new ImprovedNoise();

    for (let y = 0; y < this.verticesDepth; y++) {
      for (let x = 0; x < this.verticesWidth; x++) {
        const nx = x / this.verticesWidth;
        const ny = y / this.verticesDepth;

        this.elevation[x + y * this.verticesWidth] =
          (perlin.noise(2.0 * nx, 2.0 * ny, 0) * 0.5 + 0.5) * 100;
      }
    }
  }

  setGeometry() {
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
    this.material = new THREE.MeshStandardMaterial({
      color: "#000001",
      metalness: 0.0,
      roughness: 1,
    });
  }

  setMesh() {
    this.mesh = new THREE.Group();

    this.mesh.add(new THREE.Mesh(this.terrainGeometry, this.material));
    this.mesh.add(new THREE.LineSegments(this.wireframeGeometry));
    this.mesh.rotateX(-Math.PI / 2);

    this.scene.add(this.mesh);
  }
}
