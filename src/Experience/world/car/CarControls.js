import Experience from "../../Experience";
import nipplejs from "nipplejs";

export default class CarControls {
  constructor(vehicle) {
    this.experience = new Experience();
    this.keyboard = this.experience.keyboard;
    this.vehicle = vehicle;
    this.debug = this.experience.debug;

    this.config = {
      /**
       * The force applied on the propelling wheels when moving backwards or
       * forwards.
       */
      maxForce: 100,
      /**
       * The steering angle applied on the steering wheels when turning left or
       * right.
       */
      maxSteer: Math.PI / 16,
      /**
       * The force set on the brake when braking.
       */
      brakeForce: 1000,
    };

    this.setKeyBindings();
    if (this.debug.active) this.setDebug();
  }

  forward() {
    this.vehicle.applyEngineForce(this.config.maxForce, 0);
    this.vehicle.applyEngineForce(this.config.maxForce, 1);
  }

  backward() {
    this.vehicle.applyEngineForce(-this.config.maxForce, 0);
    this.vehicle.applyEngineForce(-this.config.maxForce, 1);
  }

  left() {
    this.vehicle.setSteeringValue(this.config.maxSteer, 2);
    this.vehicle.setSteeringValue(this.config.maxSteer, 3);
  }

  right() {
    this.vehicle.setSteeringValue(-this.config.maxSteer, 2);
    this.vehicle.setSteeringValue(-this.config.maxSteer, 3);
  }

  brake() {
    this.vehicle.setBrake(this.config.brakeForce, 0);
    this.vehicle.setBrake(this.config.brakeForce, 1);
    this.vehicle.setBrake(this.config.brakeForce, 2);
    this.vehicle.setBrake(this.config.brakeForce, 3);
  }

  reset() {
    this.vehicle.applyEngineForce(0, 0);
    this.vehicle.applyEngineForce(0, 1);
  }

  resetSteer() {
    this.vehicle.setSteeringValue(0, 2);
    this.vehicle.setSteeringValue(0, 3);
  }

  resetBrake() {
    this.vehicle.setBrake(0, 0);
    this.vehicle.setBrake(0, 1);
    this.vehicle.setBrake(0, 2);
    this.vehicle.setBrake(0, 3);
  }

  setKeyBindings() {
    this.keyboard.on("keydown", (key) => {
      switch (key) {
        case "w":
        case "ArrowUp":
          this.forward();
          break;

        case "s":
        case "ArrowDown":
          this.backward();
          break;

        case "a":
        case "ArrowLeft":
          this.left();
          break;

        case "d":
        case "ArrowRight":
          this.right();
          break;

        case "b":
          this.brake();
          break;
      }
    });

    this.keyboard.on("keyup", (key) => {
      switch (key) {
        case "w":
        case "ArrowUp":
        case "s":
        case "ArrowDown":
          this.reset();
          break;

        case "a":
        case "ArrowLeft":
        case "d":
        case "ArrowRight":
          this.resetSteer();
          break;

        case "b":
          this.resetBrake();
          break;
      }
    });
  }

  setJoystick() {
    this.joystick = nipplejs.create();

    this.joystick.on("start", () => {
      this.resetBrake();
    });

    this.joystick.on("end", () => {
      this.brake();
      this.reset();
    });

    this.joystick.on("plain:up", () => {
      this.reset();
      this.forward();
    });

    this.joystick.on("plain:down", () => {
      this.reset();
      this.backward();
    });

    this.joystick.on("dir:up", () => {
      this.resetSteer();
    });

    this.joystick.on("dir:down", () => {
      this.resetSteer();
    });

    this.joystick.on("dir:left", () => {
      this.left();
    });

    this.joystick.on("dir:right", () => {
      this.right();
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
