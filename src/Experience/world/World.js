import Experience from "../Experience";
import Environment from "./Environment";
import Floor from "./Floor";
import Fox from "./Fox";
import Terrain from "./terrain/Terrain";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on("ready", () => {
      // Setup
      this.floor = new Floor();
      this.terrain = new Terrain(1000, 1000, 32, 32);
      this.fox = new Fox();
      this.environment = new Environment();
    });
  }

  update() {
    if (this.fox) {
      this.fox.update();
    }
  }
}
