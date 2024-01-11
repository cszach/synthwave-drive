import Experience from "../Experience";
import Environment from "./Environment";
import Floor from "./Floor";
import Fox from "./Fox";
import Car from "./car/Car";
import Terrain from "./Terrain";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on("ready", () => {
      // Setup
      this.floor = new Floor();
      this.terrain = new Terrain();
      this.fox = new Fox();
      this.car = new Car();
      this.environment = new Environment();
    });
  }

  update() {
    if (this.fox) {
      this.fox.update();
    }

    if (this.car) {
      this.car.update();
    }
  }
}
