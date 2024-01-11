import Experience from "../../Experience";

export default class CarControls {
  constructor(vehicle) {
    this.experience = new Experience();
    this.keyboard = this.experience.keyboard;
    this.vehicle = vehicle;

    this.config = {
      maxSteer: 0.5,
      maxForce: 1000,
      brakeForce: 1000000,
    };

    this.setKeyBindings();
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
}
