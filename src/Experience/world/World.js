import Experience from "../Experience";
import Environment from "./Environment";
import Car from "./car/Car";
import Terrain from "./Terrain";
import Sun from "./Sun";
import TreeSpawner from "./entities/TreeSpawner";
import FrameSpawner from "./entities/FrameSpawner";
import { gsap } from "gsap/gsap-core";
import Audio from "./Audio";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    this.resources.on("ready", () => {
      this.terrain = new Terrain();
      this.sun = new Sun();
      this.car = new Car();
      this.treeSpawner = TreeSpawner.new();
      this.frameSpawner = FrameSpawner.new();
      this.environment = new Environment();
      setTimeout(() => {
        this.audio = new Audio();
      }, 1000);

      gsap.delayedCall(1.5, () => {
        this.treeSpawner.spawn();
        this.frameSpawner.spawn();
      });

      if (!this.debug.active) {
        this.experience.camera = this.car.camera;
      }
    });
  }

  update() {
    this.car.update();
    this.sun.update();
    this.treeSpawner.update();
    this.frameSpawner.update();

    // Update terrain: instead of moving the car, move the terrain instead.
    this.terrain.mesh.position.copy(this.car.position).negate();
    this.terrain.mesh.position.y =
      -this.terrain.config.multiplier * this.terrain.config.floorElevation -
      this.car.position.y;
  }
}
