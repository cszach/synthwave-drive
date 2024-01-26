import * as THREE from "three";
import Experience from "./Experience";

export default class CubeCamera {
  constructor() {
    this.experience = new Experience();
    this.renderer = this.experience.renderer;
    this.scene = this.experience.scene;
    this.layerNumber = 1;

    this.setRenderTarget();
    this.setInstance();
  }

  setRenderTarget() {
    this.renderTarget = new THREE.WebGLCubeRenderTarget(512);
  }

  setInstance() {
    this.instance = new THREE.CubeCamera(0.1, 1250, this.renderTarget);
    this.instance.layers.set(this.layerNumber);
    this.scene.add(this.instance);
  }

  update() {
    this.instance.update(this.renderer.instance, this.scene);
  }
}
