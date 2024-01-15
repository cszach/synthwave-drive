import * as THREE from "three";
import Experience from "./Experience";

export default class Camera {
  constructor(config) {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.debug = this.experience.debug;

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

  setHelper(enabled, parent) {
    parent = parent || this.scene;

    this.helper = new THREE.CameraHelper(this.instance);
    this.helper.visible = enabled;
    parent.add(this.helper);
  }

  setDebug(title, ui) {
    if (!ui) ui = this.debug.ui;
    this.debugFolder = ui
      .addFolder(title)
      .onChange(this.instance.updateProjectionMatrix.bind(this.instance));

    this.debugFolder.add(this.instance, "fov", 10, 120, 1);
    this.debugFolder.add(this.instance, "near", 0.01, 2, 0.01);
    this.debugFolder.add(this.instance, "far", 100, 50000, 1);
    if (this.helper) this.debugFolder.add(this.helper, "visible");

    this.debugFolder.onChange(
      this.instance.updateProjectionMatrix.bind(this.instance)
    );
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.controls) this.controls.update();
    if (this.helper) this.helper.update();
  }
}
