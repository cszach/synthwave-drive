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
       * The extent to search for a spawn location for the car.
       *
       * The middle (radius * elevation data length) elements will be searched.
       *
       * The purpose of the search is to search for a low surface (preferably
       * the terrain's floor) to spawn the car on. The car's initial location
       * cannot be predetermined because terrain generation is random.
       */
      spawnLocationSearchRadius: 0.01,
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

    this.setSpawnLocation();
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

  setSpawnLocation() {
    const {
      width: terrainWidth,
      depth: terrainDepth,
      verticesWidth,
      verticesDepth,
      floorElevation,
      multiplier,
    } = this.terrain.config;

    const elevationData = this.terrain.elevation;
    const dataLength = elevationData.length;
    const multipliedFloorElevation = floorElevation * multiplier;

    const searchLength = Math.floor(
      dataLength * this.config.spawnLocationSearchRadius
    );
    const start = Math.floor((dataLength - searchLength) / 2);
    const end = start + searchLength;

    const indices = []; // the indices of points on the floor
    let minIndex = start;

    for (let i = start; i < end; i++) {
      // compare if 2 floats are equal with some error tolerance due to floating
      // point implementation
      if (Math.abs(elevationData[i] - multipliedFloorElevation) < 0.000001) {
        indices.push(i);
      }

      if (elevationData[i] < elevationData[minIndex]) {
        minIndex = i;
      }
    }

    if (indices.length == 0) {
      indices.push(minIndex);
    }

    // Select a random location on the floor if possible, otherwise choose the
    // lowest point.
    const index = indices[Math.floor(indices.length * Math.random())];

    const nx = (index % verticesWidth) / verticesWidth;
    const nz = Math.floor(index / verticesWidth) / verticesDepth;

    this.spawnLocation = new THREE.Vector3(
      nx * terrainWidth - terrainWidth / 2,
      elevationData[index] / multiplier + 2, // spawn the car 2 meters above the terrain point
      nz * terrainDepth - terrainDepth / 2
    );
    this.position = new THREE.Vector3();
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.scale.setScalar(this.config.scale);
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

    this.wheels.forEach((wheel) => {
      wheel.rotation.order = "YXZ";
    });
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

    this.position.copy(
      this.physics.chassisBody.position
        .clone()
        .vadd(
          this.config.carPosAdjust
            .clone()
            .applyQuaternion(this.physics.chassisBody.quaternion)
        )
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

      // fix the wheels facing inward for some reason
      wheel.rotation.y -= Math.PI;
    });

    // Update camera

    this.camera.update();
    this.camera.instance.position.copy(
      this.model.localToWorld(new THREE.Vector3(0, 3, 17))
    );
    this.camera.instance.quaternion.copy(this.model.quaternion);
  }
}
