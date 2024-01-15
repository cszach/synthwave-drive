import * as THREE from "three";
import Experience from "../../Experience";
import CarPhysics from "./CarPhysics";
import CarControls from "./CarControls";
import Camera from "../../Camera";

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
    this.setCamera();
    if (this.debug.active) {
      this.setHelpers();
      this.setDebug();
    }

    // Physics
    this.physics = new CarPhysics(
      new THREE.Box3().setFromObject(this.model),
      new THREE.Box3().setFromObject(this.wheels[0]),
      this.wheels,
      this.scale
    );
    this.controls = new CarControls(this.physics.vehicle);
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.scale.setScalar(this.scale);
    this.model.position.set(0, 2, 0);

    this.scene.add(this.model);

    // Must add the back wheels first. The first 2 wheels are for propulsion.
    // The last 2 are for steering.
    this.wheels = [
      this.model.getObjectByName("w_b_l"),
      this.model.getObjectByName("w_b_r"),
      this.model.getObjectByName("w_f_l"),
      this.model.getObjectByName("w_f_r"),
    ];
  }

  setCamera() {
    this.camera = new Camera();
  }

  setHelpers() {
    this.boxHelper = new THREE.BoxHelper(this.model);
    this.scene.add(this.boxHelper);

    this.axesHelper = new THREE.AxesHelper();
    this.scene.add(this.axesHelper);

    this.wheelHelpers = this.wheels.map((wheel) => {
      const helper = new THREE.BoxHelper(wheel);
      this.scene.add(helper);

      return helper;
    });

    this.camera.setHelper(this.debug.carHelpersEnabled);
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Car");

    // Set visibility based on debug config

    this.boxHelper.visible = this.debug.carHelpersEnabled;
    this.axesHelper.visible = this.debug.carHelpersEnabled;
    this.wheelHelpers.forEach((wheelHelper) => {
      wheelHelper.visible = this.debug.carHelpersEnabled;
    });

    // Add to debug folder

    const debug = {
      wheelHelpers: this.debug.carHelpersEnabled,
    };

    this.debugFolder.add(this.boxHelper, "visible").name("boxHelper");
    this.debugFolder.add(this.axesHelper, "visible").name("axesHelper");
    this.debugFolder.add(debug, "wheelHelpers").onChange((enabled) => {
      this.wheelHelpers.forEach((wheelHelper) => {
        wheelHelper.visible = enabled;
      });
    });

    // Camera debug
    this.camera.setDebug("Car camera", this.debugFolder);
  }

  update() {
    // Update helpers
    if (this.debug.active) {
      this.boxHelper.update();

      this.axesHelper.position.copy(this.model.position);
      this.axesHelper.position.y += 1;

      this.wheelHelpers.forEach((wheelHelper) => {
        wheelHelper.update();
      });
    }

    // Update physics

    this.physics.update();

    this.model.position.copy(this.physics.chassisBody.position);
    this.model.quaternion.copy(this.physics.chassisBody.quaternion);

    // TODO: fix rotation
    // this.wheels.forEach((wheel, index) => {
    //   wheel.quaternion.copy(this.physics.wheelBodies[index].quaternion);
    // });

    // Update camera

    this.camera.update();
    this.camera.instance.position.copy(
      this.model.localToWorld(new THREE.Vector3(0, 3, 17))
    );
    this.camera.instance.quaternion.copy(this.model.quaternion);
  }
}
