import * as THREE from "three";
import Experience from "../../Experience";
import CarPhysics from "./CarPhysics";
import CarControls from "./CarControls";

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

    // 1 unit in the Three.js world is 1 meter. Scale factor was calculated by
    // taking the length of the model when imported and the length from
    // https://www.deloreandirectory.com/specs/. Had to convert from inches to
    // meters also, oops.
    this.scale = 0.422958305;

    this.setModel();
    this.setHelpers();
    if (this.debug.active) this.setDebug();

    const wheelBoundingBox = new THREE.Box3().setFromObject(this.wheels[0]);
    const carBoundingBox = new THREE.Box3().setFromObject(this.model);

    // Physics
    this.physics = new CarPhysics(
      carBoundingBox,
      wheelBoundingBox,
      this.wheels,
      this.scale
    );
    this.controls = new CarControls(this.physics.vehicle);
  }

  setModel() {
    this.model = this.resource.scene;
    console.log(this.model);

    this.model.scale.setScalar(this.scale);

    this.model.position.set(
      0,
      this.terrain.config.floorElevation * this.terrain.config.multiplier + 2,
      0
    );

    this.scene.add(this.model);

    this.wheels = [
      this.model.getObjectByName("w_b_l"),
      this.model.getObjectByName("w_b_r"),
      this.model.getObjectByName("w_f_l"),
      this.model.getObjectByName("w_f_r"),
    ];
  }

  setHelpers() {
    this.boxHelper = new THREE.BoxHelper(this.model);

    this.axesHelper = new THREE.AxesHelper();
    this.axesHelper.position.copy(this.model.position);
    this.axesHelper.position.y += 1;

    this.wheelHelpers = this.wheels.map((wheel) => {
      const helper = new THREE.BoxHelper(wheel);
      return helper;
    });
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Car");

    const debug = {
      wheelHelpers: true,
    };

    this.debugFolder.add(this.boxHelper, "visible").name("boxHelper");
    this.debugFolder.add(this.axesHelper, "visible").name("axesHelper");
    this.debugFolder.add(debug, "wheelHelpers").onChange((enabled) => {
      this.wheelHelpers.forEach((wheelHelper) => {
        wheelHelper.visible = enabled;
      });
    });

    // Add helpers to the scene
    this.scene.add(this.boxHelper);
    this.scene.add(this.axesHelper);
    this.wheelHelpers.forEach((wheelHelper) => {
      this.scene.add(wheelHelper);
    });
  }

  update() {
    this.boxHelper.update();
    this.wheelHelpers.forEach((wheelHelper) => {
      wheelHelper.update();
    });

    this.physics.update();

    this.model.position.copy(this.physics.chassisBody.position);
    this.model.quaternion.copy(this.physics.chassisBody.quaternion);

    // TODO: fix rotation
    // this.wheels.forEach((wheel, index) => {
    //   wheel.quaternion.copy(this.physics.wheelBodies[index].quaternion);
    // });

    this.updateCamera();
  }

  updateCamera() {
    const camera = this.experience.camera;

    // Position camera behind car
    camera.instance.position.copy(
      this.model.localToWorld(new THREE.Vector3(0, 3, 17))
    );
    camera.instance.quaternion.copy(this.model.quaternion);

    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(this.model);

    boundingBox.getCenter(camera.controls.target);
    camera.controls.target.y += 1;
  }
}
