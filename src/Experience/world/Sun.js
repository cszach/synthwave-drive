import * as THREE from "three";
import Experience from "../Experience.js";
import sunVertexShader from "../shaders/sun.vert";
import sunFragmentShader from "../shaders/sun.frag";

export default class Sun {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

    // TODO: Move config to parent
    this.config = {
      numGaps: 3,
      gapStart: 0.6,
      gapEnd: 0.4,
      initialGapSize: 0.05,
    };

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    if (this.debug.active) this.setDebug();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(1000, 1000);
  }

  setMaterial() {
    const { numGaps, gapStart, gapEnd, initialGapSize } = this.config;
    const { gapSizes, height } = this.computeGapSizes(
      numGaps,
      gapStart,
      gapEnd,
      initialGapSize
    );

    this.material = new THREE.ShaderMaterial({
      vertexShader: sunVertexShader,
      fragmentShader: sunFragmentShader,
      transparent: true,
      uniforms: {
        numGaps: { value: numGaps },
        gapStart: { value: gapStart },
        gapEnd: { value: gapEnd },
        initialGapSize: { value: initialGapSize },
        gapSizes: { value: gapSizes },
        height: { value: height },
      },
    });
  }

  computeGapSizes(numGaps, gapStart, gapEnd, initialGapSize) {
    const gapSizeDecrementPercentage = 1.0 / numGaps;
    const gapSizes = [];
    let sumGapSizes = 0;

    for (
      let i = 0, percentage = 1.0;
      i < numGaps;
      i++, percentage -= gapSizeDecrementPercentage
    ) {
      const gapSize = initialGapSize * percentage;

      gapSizes.push(gapSize);
      sumGapSizes += gapSize;
    }

    const height = (gapStart - gapEnd - sumGapSizes) / numGaps;

    return { gapSizes, height };
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = 1000;
    this.mesh.rotation.x = Math.PI;

    this.scene.add(this.mesh);
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Sun");

    const debug = {
      update: () => {
        const numGaps = this.material.uniforms.numGaps.value;
        const gapStart = this.material.uniforms.gapStart.value;
        const gapEnd = this.material.uniforms.gapEnd.value;
        const initialGapSize = this.material.uniforms.initialGapSize.value;

        const { gapSizes, height } = this.computeGapSizes(
          numGaps,
          gapStart,
          gapEnd,
          initialGapSize
        );

        this.material.uniforms.gapSizes.value = gapSizes;
        this.material.uniforms.height.value = height;
      },
    };

    this.debugFolder
      .add(this.material.uniforms.numGaps, "value", 1, 5, 1)
      .name("numGaps")
      .onChange(debug.update);
    this.debugFolder
      .add(this.material.uniforms.gapStart, "value", 0.0, 1.0, 0.01)
      .name("gapStart")
      .onChange(debug.update);
    this.debugFolder
      .add(this.material.uniforms.gapEnd, "value", 0.0, 1.0, 0.01)
      .name("gapEnd")
      .onChange(debug.update);
    this.debugFolder
      .add(this.material.uniforms.initialGapSize, "value", 0.0, 1.0, 0.01)
      .name("initialGapSize")
      .onChange(debug.update);
  }

  update() {}
}
