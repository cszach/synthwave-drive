import * as THREE from "three";
import Experience from "../../Experience";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise";

const TAU = Math.PI * 2;
const sqrtTwo = Math.sqrt(2);

export default class Terrain {
  constructor() {
    this.experience = new Experience();
    this.cubeCamera = this.experience.cubeCamera;
    this.scene = this.experience.scene;
    this.colorPalette = this.experience.colorPalette;
    this.debug = this.experience.debug;

    this.config = {
      /** The width of the terrain plane. */
      width: 1000,
      /** The depth of the terrain plane. */
      depth: 1000,
      /** The number of vertices along the width. Subdivision = this number - 1. */
      verticesWidth: 128,
      /** The number of vertices along the depth. */
      verticesDepth: 128,
      /**
       * The normalized z value for the 3D Perlin noise.
       *
       * Since we use the x and y coordinates to get the height, the z value can
       * be used to randomize terrains.
       */
      zFactor: Math.random(),
      tune: Math.sqrt(2),

      /* We add noises at 3 different frequencies and amplitudes for interesting
      results (hopefully). */

      frequency1: 4,
      amplitude1: 1.0,
      frequency2: 8,
      amplitude2: 0.5,
      frequency3: 16,
      amplitude3: 0.25,

      /**
       * The factor by which the Perlin noise output will be multiplied at the
       * end to make terrains more prominent.
       */
      multiplier: 49.8,
      /**
       * Redistribution factor. Higher values push middle elevations down into
       * valleys and lower values pull middle elevations up towards the peaks.
       */
      exp: 2.55,
      /**
       * Fudge factor for the redistribution.
       */
      fudgeFactor: 1.17,
      /**
       * Any values from the Perlin noise function that is lower than this value
       * will be set equal to this value to make a floor.
       */
      floorElevation: 0.62,
    };

    this.generateElevation();
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    if (this.debug.active) this.setDebug();
  }

  static torusNoise(simplex, nx, ny) {
    const angleX = TAU * nx;
    const angleY = TAU * ny;

    return (
      simplex.noise4d(
        Math.cos(angleX) / TAU,
        Math.sin(angleX) / TAU,
        Math.cos(angleY) / TAU,
        Math.sin(angleY) / TAU
      ) *
        0.5 +
      0.5
    );
  }

  // Thanks to tutorial from https://www.redblobgames.com/maps/terrain-from-noise/
  generateElevation() {
    const verticesWidth = this.config.verticesWidth;
    const verticesDepth = this.config.verticesDepth;

    this.elevation = new Float32Array(verticesWidth * verticesDepth);

    const simplex = new SimplexNoise();
    const {
      frequency1,
      frequency2,
      frequency3,
      amplitude1,
      amplitude2,
      amplitude3,
      tune,
    } = this.config;

    for (let y = 0; y < verticesDepth; y++) {
      for (let x = 0; x < verticesWidth; x++) {
        const nx = x / (verticesWidth - 1);
        const ny = y / (verticesDepth - 1);

        let elevation =
          tune *
          Terrain.torusNoise(simplex, nx * frequency1, ny * frequency1) *
          amplitude1;

        elevation +=
          tune *
          Terrain.torusNoise(
            simplex,
            nx * frequency2 + 5.3,
            ny * frequency2 + 9.1
          ) *
          amplitude2;

        elevation +=
          tune *
          Terrain.torusNoise(
            simplex,
            nx * frequency3 + 17.8,
            ny * frequency3 + 23.5
          ) *
          amplitude3;

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

    if (this.wireframeGeometry) {
      this.wireframeGeometry.dispose();
    }

    this.wireframeGeometry = new THREE.WireframeGeometry(this.terrainGeometry);

    if (this.floorGeometry) {
      this.floorGeometry.dispose();
    }

    this.floorGeometry = new THREE.PlaneGeometry(
      this.config.width,
      this.config.depth,
      this.config.verticesWidth - 1,
      this.config.verticesDepth - 1
    );

    if (this.floorWireframeGeometry) {
      this.floorWireframeGeometry.dispose();
    }

    this.floorWireframeGeometry = new THREE.WireframeGeometry(
      this.floorGeometry
    );
  }

  setMaterial() {
    this.terrainMaterial = new THREE.MeshLambertMaterial({
      color: this.colorPalette.night,
      flatShading: true,
    });

    this.wireframeMaterial = new THREE.LineBasicMaterial({
      color: this.colorPalette.fuchsia,
    });

    this.floorMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xffffff),
      envMap: this.cubeCamera.instance.renderTarget.texture,
    });

    this.floorWireframeMaterial = new THREE.LineBasicMaterial({
      color: this.colorPalette.fuchsia,
    });
  }

  setMesh() {
    if (this.mesh) {
      this.mesh.children.length = 0;
    }

    this.mesh = new THREE.Group();

    const terrainMesh = new THREE.Mesh(
      this.terrainGeometry,
      this.terrainMaterial
    );
    terrainMesh.layers.enable(this.cubeCamera.layerNumber);

    const wireframeMesh = new THREE.LineSegments(
      this.wireframeGeometry,
      this.wireframeMaterial
    );
    wireframeMesh.layers.enable(this.cubeCamera.layerNumber);

    // FIXME: fix z-fighting

    const floorMesh = new THREE.Mesh(this.floorGeometry, this.floorMaterial);
    floorMesh.position.z = this.config.floorElevation * this.config.multiplier;

    const floorWireframeMesh = new THREE.LineSegments(
      this.floorWireframeGeometry,
      this.floorWireframeMaterial
    );
    floorWireframeMesh.position.z =
      this.config.floorElevation * this.config.multiplier;

    this.mesh.add(terrainMesh, wireframeMesh, floorMesh, floorWireframeMesh);
    // Make sure the floor's world y position is 0.
    this.mesh.position.y = -this.config.floorElevation * this.config.multiplier;
    this.mesh.rotation.x = -Math.PI / 2;

    this.scene.add(this.mesh);
  }

  // TODO: recompile the physics heightfield
  regenerate(changeZ = true) {
    if (changeZ) {
      this.config.zFactor = Math.random();
    }

    this.generateElevation();
    this.setGeometry();
    this.setMesh();
  }

  setDebug() {
    const debug = this.config;

    this.debugFolder = this.debug.ui.addFolder("Terrain");

    const terrainGeometryFolder = this.debugFolder
      .addFolder("Terrain geometry")
      .onFinishChange(this.regenerate.bind(this, false));

    terrainGeometryFolder.add(debug, "width", 100, 2000, 1);
    terrainGeometryFolder.add(debug, "depth", 100, 2000, 1);
    terrainGeometryFolder.add(debug, "verticesWidth", 8, 512, 1);
    terrainGeometryFolder.add(debug, "verticesDepth", 8, 512, 1);
    const zControl = terrainGeometryFolder.add(debug, "zFactor", 0, 1, 0.001);
    terrainGeometryFolder.add(debug, "frequency1", 0.0, 50.0, 1);
    terrainGeometryFolder.add(debug, "amplitude1", 0.0, 1.0, 0.001);
    terrainGeometryFolder.add(debug, "frequency2", 0.0, 50.0, 1);
    terrainGeometryFolder.add(debug, "amplitude2", 0.0, 1.0, 0.001);
    terrainGeometryFolder.add(debug, "frequency3", 0.0, 50.0, 1);
    terrainGeometryFolder.add(debug, "amplitude3", 0.0, 1.0, 0.001);
    terrainGeometryFolder.add(debug, "tune", 0.1, 3.0, 0.01);
    terrainGeometryFolder.add(debug, "multiplier", 0.0, 1000.0, 0.1);
    terrainGeometryFolder.add(debug, "exp", 0.01, 10.0, 0.01);
    terrainGeometryFolder.add(debug, "fudgeFactor", 0.01, 2.0, 0.01);
    terrainGeometryFolder.add(debug, "floorElevation", 0, 1, 0.01);
    terrainGeometryFolder
      .add(this, "regenerate")
      .onChange(zControl.updateDisplay.bind(zControl));

    const terrainMaterialFolder =
      this.debugFolder.addFolder("Terrain material");

    terrainMaterialFolder
      .addColor(this.terrainMaterial, "color")
      .name("terrainColor");
    terrainMaterialFolder
      .addColor(this.wireframeMaterial, "color")
      .name("wireframeColor");
    terrainMaterialFolder
      .addColor(this.floorWireframeMaterial, "color")
      .name("floorWireframeColor");
  }
}
