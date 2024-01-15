import Experience from "../../Experience";

export default class CarControls {
  constructor(vehicle) {
    this.experience = new Experience();
    this.keyboard = this.experience.keyboard;
    this.vehicle = vehicle;
    this.debug = this.experience.debug;

    /**
     * @namespace
     *
     * @property {number} maxForce The force applied on the propelling wheels
     * when moving backwards or forwards.
     * @property {number} maxSteer The steering angle applied on the steering
     * wheels when turning left or right.
     * @property {number} brakeForce The force set on the brake when braking.
     */
    this.config = {
      maxForce: 100,
      maxSteer: Math.PI / 8,
      brakeForce: 1000,
    };

    this.setKeyBindings();
    if (this.debug.active) this.setDebug();
  }

  setKeyBindings() {
    this.keyboard.on("keydown", (key) => {
      switch (key) {
        case "w":
        case "ArrowUp":
          this.vehicle.applyEngineForce(this.config.maxForce, 0);
          this.vehicle.applyEngineForce(this.config.maxForce, 1);
          break;

        case "s":
        case "ArrowDown":
          this.vehicle.applyEngineForce(-this.config.maxForce, 0);
          this.vehicle.applyEngineForce(-this.config.maxForce, 1);
          break;

        case "a":
        case "ArrowLeft":
          this.vehicle.setSteeringValue(this.config.maxSteer, 2);
          this.vehicle.setSteeringValue(this.config.maxSteer, 3);
          break;

        case "d":
        case "ArrowRight":
          this.vehicle.setSteeringValue(-this.config.maxSteer, 2);
          this.vehicle.setSteeringValue(-this.config.maxSteer, 3);
          break;

        case "b":
          this.vehicle.setBrake(this.config.brakeForce, 0);
          this.vehicle.setBrake(this.config.brakeForce, 1);
          this.vehicle.setBrake(this.config.brakeForce, 2);
          this.vehicle.setBrake(this.config.brakeForce, 3);
          break;
      }
    });

    this.keyboard.on("keyup", (key) => {
      switch (key) {
        case "w":
        case "ArrowUp":
        case "s":
        case "ArrowDown":
          this.vehicle.applyEngineForce(0, 0);
          this.vehicle.applyEngineForce(0, 1);
          break;

        case "a":
        case "ArrowLeft":
        case "d":
        case "ArrowRight":
          this.vehicle.setSteeringValue(0, 2);
          this.vehicle.setSteeringValue(0, 3);
          break;

        case "b":
          this.vehicle.setBrake(0, 0);
          this.vehicle.setBrake(0, 1);
          this.vehicle.setBrake(0, 2);
          this.vehicle.setBrake(0, 3);
          break;
      }
    });
  }

  setDebug() {
    const carDebugFolder = this.debug.ui.folders.filter(
      (folder) => folder._title == "Car"
    )[0];
    this.debugFolder = carDebugFolder.addFolder("Car controls");

    this.debugFolder.add(this.config, "maxSteer", 0, 1, 0.01);
    this.debugFolder.add(this.config, "maxForce", 100, 1000, 1);
    this.debugFolder.add(this.config, "brakeForce", 0, 1000, 1);
  }
}
