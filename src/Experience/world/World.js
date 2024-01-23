import * as THREE from "three";
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
        this.car.position,
        {
          count: 42,
          triggerRadius: 150,
          generationRadius: 300,
          yStart: -20,
          yEnd: 0,
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
    this.car.update();
    this.sun.update();
    this.spawner.update();

    // Update terrain: instead of moving the car, move the terrain instead.
    this.terrain.mesh.position.copy(this.car.position).negate();
    this.terrain.mesh.position.y =
      -this.terrain.config.multiplier * this.terrain.config.floorElevation -
      this.car.position.y;
  }
}
