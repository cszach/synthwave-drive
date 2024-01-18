import * as THREE from "three";
import Experience from "../../Experience";
import CarPhysics from "./CarPhysics";
import CarControls from "./CarControls";
import Camera from "../../Camera";

export default class Car {
  constructor() {
    this.experience = new Experience();
    this.cubeCamera = this.experience.cubeCamera;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.terrain = this.experience.world.terrain;
    this.resource = this.resources.items.carModel;

    this.config = {
      /**
       * The scale scalar to apply to the car's model.
       *
       * 1 unit in the Three.js world is 1 meter. Scale factor was calculated by
       * taking the length of the model when imported and the length from
       * https://www.deloreandirectory.com/specs/. Had to convert from inches to
       * meters also, oops.
       */
      scale: 0.422958305,
      /**
       * The vector to add to the car model's position after copying the
       * position from the physics world's chassis body.
       *
       * After copying the physics body's position, the car model is misaligned
       * (see the chassis body helper), so adding this vector adjusts it. Find
       * the right values using the debug UI.
       */
      carPosAdjust: new THREE.Vector3(0, -0.098, 0.212),
      /**
       * The environment map intensity applied on the meshes in the car model.
       */
      envMapIntensity: 1,
    };

    this.setModel();
    this.setCamera();
    if (this.debug.active) {
      this.setHelpers();
      this.setDebug();
    }

    // Physics
    this.physics = new CarPhysics(
      this.model.localToWorld(this.carBody.position.clone()),
      this.wheels,
      this.config.scale
    );
    this.controls = new CarControls(this.physics.vehicle);
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.scale.setScalar(this.config.scale);
    this.model.position.set(0, 2, 0);
    this.scene.add(this.model);

    console.log(this.model);

    // Reflective materials

    this.carBody = this.model.getObjectByName("car_body");

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.material.envMap = this.cubeCamera.instance.renderTarget.texture;
        child.material.envMapIntensity = this.config.envMapIntensity;
      }
    });

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
    this.camera.setHelper(false, this.scene);
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Car");

    this.debugFolder
      .add(this.config.carPosAdjust, "x", -1, 1, 0.001)
      .name("carPosAdjustX");
    this.debugFolder
      .add(this.config.carPosAdjust, "y", -1, 1, 0.001)
      .name("carPosAdjustY");
    this.debugFolder
      .add(this.config.carPosAdjust, "z", -1, 1, 0.001)
      .name("carPosAdjustZ");
    this.debugFolder
      .add(this.config, "envMapIntensity", 0, 10, 0.1)
      .onChange(() => {
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.material.envMap =
              this.cubeCamera.instance.renderTarget.texture;
            child.material.envMapIntensity = this.config.envMapIntensity;
          }
        });
      });

    // Camera debug
    this.camera.setDebug("Car camera", this.debugFolder);
  }

  update() {
    // Update camera
    this.camera.update();

    // Update physics

    this.physics.update();

    this.model.position
      .copy(this.physics.chassisBody.position.clone())
      .add(
        this.config.carPosAdjust
          .clone()
          .applyQuaternion(this.physics.chassisBody.quaternion)
      );
    this.model.quaternion.copy(this.physics.chassisBody.quaternion);

    this.wheels.forEach((wheel, i) => {
      // Since physics wheel bodies' quaternions are world transforms, and the
      // model's wheels' quaternions are local, use a "worldToLocal" method but
      // for quaternions.
      //
      // Code adapted from https://github.com/mrdoob/three.js/issues/13704#issuecomment-1365494785.

      const worldQuaternion = new THREE.Quaternion().copy(
        this.physics.wheelBodies[i].quaternion
      );

      wheel.quaternion.copy(
        worldQuaternion.premultiply(
          this.model.getWorldQuaternion(new THREE.Quaternion()).invert()
        )
      );
    });

    // Update camera

    this.camera.update();
    this.camera.instance.position.copy(
      this.model.localToWorld(new THREE.Vector3(0, 3, 17))
    );
    this.camera.instance.quaternion.copy(this.model.quaternion);
  }
}
