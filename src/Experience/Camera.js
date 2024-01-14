import * as THREE from "three";
import Experience from "./Experience";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.debug = this.experience.debug;

    this.initialConfig = {
      fov: 35,
      near: 0.1,
      far: 20000,
    };

    this.setInstance();
    this.setOrbitControls();
    if (this.debug.active) this.setDebug();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      this.initialConfig.fov,
      this.sizes.width / this.sizes.height,
      this.initialConfig.near,
      this.initialConfig.far
    );
    // Position is set in world/Car

    this.scene.add(this.instance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.target = new THREE.Vector3(0, 56, 0);
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Camera");

    this.debugFolder.add(this.instance, "fov", 10, 120, 1);
    this.debugFolder.add(this.instance, "near", 0.01, 2, 0.01);
    this.debugFolder.add(this.instance, "far", 100, 50000, 1);

    this.debugFolder.onChange(
      this.instance.updateProjectionMatrix.bind(this.instance)
    );
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
