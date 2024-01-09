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

    this.frontLeftWheel = this.model.getObjectByName("w_f_l");
    this.frontRightWheel = this.model.getObjectByName("w_f_r");
    this.backLeftWheel = this.model.getObjectByName("w_b_l");
    this.backRightWheel = this.model.getObjectByName("w_b_r");

    console.log(this.model);

    this.wheels = [
      this.adjustWheel(this.frontLeftWheel),
      this.adjustWheel(this.frontRightWheel),
      this.adjustWheel(this.backLeftWheel),
      this.adjustWheel(this.backRightWheel),
    ];
  }

  adjustWheel(wheel) {
    const boxHelper = new THREE.BoxHelper(wheel);
    boxHelper.geometry.computeBoundingBox();

    wheel.geometry.center();

    return {
      instance: wheel,
      helper: boxHelper,
    };
  }

  setCamera() {
    const camera = this.experience.camera;

    camera.instance.position.copy(this.model.position);
    camera.instance.position.add(new THREE.Vector3(1.25, 2, -7));

    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(this.model);

    boundingBox.getCenter(camera.controls.target);
    camera.controls.target.y += 1;

    this.scene.add(new THREE.AxesHelper());
  }

  update() {
    this.wheels.forEach((wheel) => {
      wheel.helper.geometry.boundingBox.getCenter(wheel.instance.position);
    });
  }
}
