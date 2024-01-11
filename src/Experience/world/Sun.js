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
      gapStart: 0.6,
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
    this.material = new THREE.ShaderMaterial({
      vertexShader: sunVertexShader,
      fragmentShader: sunFragmentShader,
      transparent: true,
      uniforms: {
        gapStart: { value: this.config.gapStart },
        initialGapSize: { value: this.config.initialGapSize },
      },
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = 1000;
    this.mesh.rotation.x = Math.PI;

    this.scene.add(this.mesh);
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Sun");

    this.debugFolder
      .add(this.material.uniforms.gapStart, "value", 0.0, 1.0, 0.01)
      .name("gapStart");
    this.debugFolder
      .add(this.material.uniforms.initialGapSize, "value", 0.0, 1.0, 0.01)
      .name("initialGapSize");
  }

  update() {}
}
