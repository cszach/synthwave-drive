import * as THREE from "three";
import Experience from "../Experience";

export default class Car {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.terrain = this.experience.world.terrain;

    // Setup
    this.resource = this.resources.items.carModel;

    this.setModel();
    this.setCamera();
  }

  setModel() {
    this.model = this.resource.scene;

    // 1 unit in the Three.js world is 1 meter. Scale factor was calculated by
    // taking the length of the model when imported and the length from
    // https://www.deloreandirectory.com/specs/. Had to convert from inches to
    // meters also, oops.
    this.model.scale.setScalar(0.422958305);

    this.model.position.y =
      this.terrain.config.floorElevation * this.terrain.config.multiplier + 0.3;

    this.scene.add(this.model);

    console.log(this.model);
  }

  setCamera() {
    const camera = this.experience.camera;

    camera.instance.position.copy(this.model.position);
    camera.instance.position.add(new THREE.Vector3(1.25, 2, -7));

    const boundingBox = new THREE.Box3();
    const boundingBoxSize = new THREE.Vector3();
    boundingBox.setFromObject(this.model);
    boundingBox.getSize(boundingBoxSize);

    console.log(boundingBoxSize);

    boundingBox.getCenter(camera.controls.target);
    camera.controls.target.y += 1;

    this.scene.add(new THREE.AxesHelper());
  }
}
