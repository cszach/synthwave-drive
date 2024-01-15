import GUI from "lil-gui";
import Experience from "../Experience";
import Camera from "../Camera";
import { MapControls } from "three/examples/jsm/controls/MapControls";

export default class Debug {
  constructor(debugActive, physicsHelpersEnabled) {
    this.active = debugActive;
    this.physicsHelpersEnabled = physicsHelpersEnabled;

    if (this.active) {
      this.ui = new GUI();
      this.ui.hide(); // show on event "ready"

      this.setCamera();
    }
  }

  setCamera() {
    this.canvas = new Experience().canvas;
    this.camera = new Camera();
    this.camera.instance.position.set(10, 10, -25);

    this.camera.controls = new MapControls(this.camera.instance, this.canvas);
    this.camera.controls.enableDamping = true;
  }

  update() {
    this.controls.update();
  }
}
