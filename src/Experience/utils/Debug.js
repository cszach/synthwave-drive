import GUI from "lil-gui";

export default class Debug {
  constructor(debugActive, carHelpersEnabled, physicsHelpersEnabled) {
    this.active = debugActive;
    this.carHelpersEnabled = carHelpersEnabled;
    this.physicsHelpersEnabled = physicsHelpersEnabled;

    if (this.active) {
      this.ui = new GUI();
      this.ui.hide(); // show on event "ready"
    }
  }
}
