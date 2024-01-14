import Experience from "../Experience";
import Environment from "./Environment";
import Car from "./car/Car";
import Terrain from "./Terrain";
import Sun from "./Sun";
import colorPalette from "./colorPalette";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.colorPalette = colorPalette;

    this.resources.on("ready", () => {
      this.terrain = new Terrain();
      this.sun = new Sun();
      this.car = new Car();
      this.environment = new Environment();
    });
  }

  update() {
    if (this.car) {
      this.car.update();
    }

    if (this.sun) {
      this.sun.update();
    }
  }
}
