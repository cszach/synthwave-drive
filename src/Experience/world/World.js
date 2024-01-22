import Experience from "../Experience";
import Environment from "./Environment";
import Car from "./car/Car";
import Terrain from "./Terrain";
import Sun from "./Sun";
import Tree from "./Tree";
import Spawner from "../Spawner";
import { gsap } from "gsap/gsap-core";

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
      this.tree = new Tree();
      this.spawner = new Spawner(
        [this.tree.geometry],
        [this.tree.material, this.tree.wireframeMaterial],
        this.car.model.position,
        {
          count: 50,
          triggerRadius: 150,
          generationRadius: 200,
          yStart: -20,
        },
        [this.experience.cubeCamera.layerNumber]
      );
      this.environment = new Environment();

      gsap.delayedCall(1.5, () => {
        this.spawner.spawn();
      });

      if (!this.debug.active) {
        this.experience.camera = this.car.camera;
      }
    });
  }

  update() {
    if (this.car) {
      this.car.update();
    }

    if (this.sun) {
      this.sun.update();
    }

    if (this.spawner) {
      this.spawner.update();
    }
  }
}
