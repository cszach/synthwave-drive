import * as THREE from "three";
import Experience from "./Experience";

export default class Camera {
  constructor(config) {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    this.initialConfig = config || {
      fov: 35,
      near: 0.1,
      far: 20000,
    };

    this.setInstance();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      this.initialConfig.fov,
      this.sizes.width / this.sizes.height,
      this.initialConfig.near,
      this.initialConfig.far
    );

    this.scene.add(this.instance);
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.controls) {
      this.controls.update();
    }
  }
}
