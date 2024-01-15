import * as THREE from "three";
import * as CANNON from "cannon-es";
import Experience from "../../Experience";

// A lot of code is adapted from https://github.com/pmndrs/cannon-es/blob/master/examples/raycast_vehicle.html.
export default class CarPhysics {
  /**
   *
   * @param {THREE.Box3} chassisBoundingBox The bounding box of the car, assuming
   * the car to be aligned on the Z axis.
   * @param {THREE.Box3} wheelBoundingBox The bounding box of the wheel,
   * assuming the car (and thus the wheels) to be aligned on the Z axis.
   * @param {THREE.Object3D[]} wheels The array of the meshes of the wheels.
   * @param {number} scale The scale applied to the car model.
   */
  constructor(
    chassisBoundingBox,
    chassisLocalPosition,
    wheelBoundingBox,
    wheels,
    scale
  ) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.terrain = this.experience.world.terrain;
    this.debug = this.experience.debug;

    // The car is assumed to be aligned on the Z axis in the Three.js world
    this.config = {
      carSize: new THREE.Vector3(1.97, 1, 4.21),
      frontWheelSize: new THREE.Vector3(0.27, 0.6, 0.6),
      backWheelSize: new THREE.Vector3(0.27, 0.65, 0.65),
      frontWheelLocalPosAdjust: new THREE.Vector3(0, 0.127, 0.212),
      backWheelLocalPosAdjust: new THREE.Vector3(0, 0.12, 0.212),
    };

    this.chassisBoundingBox = chassisBoundingBox;
    this.chassisLocalPosition = chassisLocalPosition;
    this.wheelBoundingBox = wheelBoundingBox;
    this.wheels = wheels;
    this.scale = scale;

    this.wheelOptions = {
      radius: this.config.frontWheelSize.y / 2,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.3,
      frictionSlip: 1.4,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(),
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    };

    this.setWorld();
    this.setChassis();
    this.setVehicle();
    this.setWheelBodies();
    this.setGround();
    this.setContactMaterial();
    if (this.debug.active) {
      this.setHelpers();
      this.setDebug();
    }
  }

  setWorld() {
    this.physicsWorld = new CANNON.World();
    this.physicsWorld.gravity.set(0, -9.82, 0);
    this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
    this.physicsWorld.defaultContactMaterial.friction = 0;
  }

  setChassis() {
    this.chassisShape = new CANNON.Box(
      new CANNON.Vec3( // half extents
        this.config.carSize.x / 2,
        this.config.carSize.y / 2,
        this.config.carSize.z / 2
      )
    );

    this.chassisBody = new CANNON.Body({
      mass: 1290,
      shape: this.chassisShape,
    });

    const chassisBodyPosition = new THREE.Vector3();
    this.chassisBoundingBox.getCenter(chassisBodyPosition);
    this.chassisBody.position.copy(chassisBodyPosition);
    this.chassisBody.quaternion.setFromEuler(0, -Math.PI, 0); // face the positive z direction
  }

  setVehicle() {
    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: this.chassisBody,
      indexForwardAxis: 2,
      indexRightAxis: 0,
    });

    this.wheels.forEach((wheel) => {
      const isFrontWheel = wheel.name.includes("f");

      this.wheelOptions.radius = isFrontWheel
        ? this.config.frontWheelSize.y / 2
        : this.config.backWheelSize.y / 2;
      this.wheelOptions.chassisConnectionPointLocal.copy(
        wheel.position
          .clone()
          .multiplyScalar(this.scale)
          .add(
            isFrontWheel
              ? this.config.frontWheelLocalPosAdjust
              : this.config.backWheelLocalPosAdjust
          )
      );
      this.wheelOptions.isFrontWheel = isFrontWheel; // redundant

      this.vehicle.addWheel(this.wheelOptions);
    });

    this.vehicle.addToWorld(this.physicsWorld);
  }

  setWheelBodies() {
    this.wheelBodies = [];
    this.wheelMaterial = new CANNON.Material("wheel");

    this.vehicle.wheelInfos.forEach((wheel) => {
      const cylinderShape = new CANNON.Cylinder(
        wheel.radius,
        wheel.radius,
        this.config.frontWheelSize.x, // both front and back wheels have same x
        20
      );
      const wheelBody = new CANNON.Body({
        mass: 0,
        material: this.wheelMaterial,
        type: CANNON.Body.KINEMATIC,
        collisionFilterGroup: 0, // turn off collisions
      });

      const quaternion = new CANNON.Quaternion().setFromAxisAngle(
        new CANNON.Vec3(0, 0, 1),
        Math.PI / 2
      );

      wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion);
      this.wheelBodies.push(wheelBody);
      this.physicsWorld.addBody(wheelBody);
    });

    // Update the wheel bodies
    this.physicsWorld.addEventListener("postStep", () => {
      this.vehicle.wheelInfos.forEach((wheel, i) => {
        this.vehicle.updateWheelTransform(i);
        const t = wheel.worldTransform;
        this.wheelBodies[i].position.copy(t.position);
        this.wheelBodies[i].quaternion.copy(t.quaternion);
      });
    });
  }

  setGround() {
    const elevationMatrix = [];

    for (let y = 0; y < this.terrain.config.verticesDepth; y++) {
      const row = [];

      for (let x = 0; x < this.terrain.config.verticesWidth; x++) {
        const i = x + y * this.terrain.config.verticesDepth;
        row.push(this.terrain.elevation[i]);
      }

      elevationMatrix.push(row);
    }

    this.groundMaterial = new CANNON.Material("ground");
    this.heightfieldShape = new CANNON.Heightfield(elevationMatrix, {
      elementSize:
        this.terrain.config.width / (this.terrain.config.verticesWidth - 1),
    });

    this.heightfieldBody = new CANNON.Body({
      mass: 0,
      material: this.groundMaterial,
    });
    this.heightfieldBody.addShape(this.heightfieldShape);
    this.heightfieldBody.position.set(
      -(
        (this.terrain.config.verticesWidth - 1) *
        this.heightfieldShape.elementSize
      ) / 2,
      -this.terrain.config.floorElevation * this.terrain.config.multiplier,
      -(
        (this.terrain.config.verticesDepth - 1) *
        this.heightfieldShape.elementSize
      ) / 2
    );
    this.heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, -Math.PI / 2);

    this.physicsWorld.addBody(this.heightfieldBody);
  }

  setContactMaterial() {
    this.contactMaterial = new CANNON.ContactMaterial(
      this.wheelMaterial,
      this.groundMaterial,
      {
        friction: 0.3,
        restitution: 0,
        contactEquationStiffness: 1000,
      }
    );

    this.physicsWorld.addContactMaterial(this.contactMaterial);
  }

  setHelpers() {
    this.helperMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    // Chassis helper

    const chassisHelperGeometry = new THREE.BoxGeometry(
      this.chassisShape.halfExtents.x * 2,
      this.chassisShape.halfExtents.y * 2,
      this.chassisShape.halfExtents.z * 2
    );

    this.chassisHelperMesh = new THREE.Mesh(
      chassisHelperGeometry,
      this.helperMaterial
    );
    this.chassisHelperMesh.position.copy(this.chassisBody.shapeOffsets[0]);
    this.chassisHelperMesh.quaternion.copy(
      this.chassisBody.shapeOrientations[0]
    );

    this.chassisHelper = new THREE.Group().add(this.chassisHelperMesh);
    this.scene.add(this.chassisHelper);

    // Wheel helpers

    this.wheelHelpers = this.wheelBodies.map((wheelBody) => {
      const wheelHelperGeometry = new THREE.CylinderGeometry(
        wheelBody.shapes[0].radiusTop,
        wheelBody.shapes[0].radiusBottom,
        wheelBody.shapes[0].height,
        wheelBody.shapes[0].numSegments
      );

      const wheelHelperMesh = new THREE.Mesh(
        wheelHelperGeometry,
        this.helperMaterial
      );
      wheelHelperMesh.position.copy(wheelBody.shapeOffsets[0]);
      wheelHelperMesh.quaternion.copy(wheelBody.shapeOrientations[0]);

      const wheelHelper = new THREE.Group().add(wheelHelperMesh);
      this.scene.add(wheelHelper);

      return wheelHelper;
    });

    // Heightfield helper

    const heightfieldGeometry = this.heightfieldShapeToGeometry(
      this.heightfieldShape
    );

    this.heightfieldHelperMesh = new THREE.Mesh(
      heightfieldGeometry,
      this.helperMaterial
    );
    this.heightfieldHelperMesh.position.copy(
      this.heightfieldBody.shapeOffsets[0]
    );
    this.heightfieldHelperMesh.quaternion.copy(
      this.heightfieldBody.shapeOrientations[0]
    );

    this.heightfieldHelper = new THREE.Group().add(this.heightfieldHelperMesh);
    this.heightfieldHelper.position.copy(this.heightfieldBody.position);
    this.heightfieldHelper.quaternion.copy(this.heightfieldBody.quaternion);

    this.scene.add(this.heightfieldHelper);
  }

  // adapted from https://github.com/pmndrs/cannon-es/blob/master/examples/js/three-conversion-utils.js#L69C7-L103C22
  heightfieldShapeToGeometry(shape) {
    const geometry = new THREE.BufferGeometry();

    const v0 = new CANNON.Vec3();
    const v1 = new CANNON.Vec3();
    const v2 = new CANNON.Vec3();

    const vertices = new Float32Array(
      9 * (shape.data[0].length - 1) * (shape.data.length - 1) * 2
    );

    let vertexIndex = 0;

    for (let xi = 0; xi < shape.data.length - 1; xi++) {
      for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
        for (let k = 0; k < 2; k++) {
          shape.getConvexTrianglePillar(xi, yi, k === 0);
          v0.copy(shape.pillarConvex.vertices[0]);
          v1.copy(shape.pillarConvex.vertices[1]);
          v2.copy(shape.pillarConvex.vertices[2]);
          v0.vadd(shape.pillarOffset, v0);
          v1.vadd(shape.pillarOffset, v1);
          v2.vadd(shape.pillarOffset, v2);

          vertices[vertexIndex++] = v0.x;
          vertices[vertexIndex++] = v0.y;
          vertices[vertexIndex++] = v0.z;

          vertices[vertexIndex++] = v1.x;
          vertices[vertexIndex++] = v1.y;
          vertices[vertexIndex++] = v1.z;

          vertices[vertexIndex++] = v2.x;
          vertices[vertexIndex++] = v2.y;
          vertices[vertexIndex++] = v2.z;
        }
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.computeBoundingSphere();

    return geometry;
  }

  setDebug() {
    const carDebugFolder = this.debug.ui.folders.filter(
      (folder) => folder._title == "Car"
    )[0];
    this.debugFolder = carDebugFolder.addFolder("Car physics");

    // Set visibility based on debug config

    this.chassisHelperMesh.visible = this.debug.physicsHelpersEnabled;
    this.wheelHelpers.forEach((wheelHelper) => {
      wheelHelper.visible = this.debug.physicsHelpersEnabled;
    });
    this.heightfieldHelperMesh.visible = this.debug.physicsHelpersEnabled;

    // Add to debug folder

    const debug = {
      wheelHelpers: this.debug.physicsHelpersEnabled,
    };

    this.debugFolder
      .add(this.chassisHelperMesh, "visible")
      .name("chassisHelper");
    this.debugFolder.add(debug, "wheelHelpers").onChange((enabled) => {
      this.wheelHelpers.forEach((wheelHelper) => {
        wheelHelper.visible = enabled;
      });
    });
    this.debugFolder
      .add(this.heightfieldHelperMesh, "visible")
      .name("heightfieldHelper");
  }

  update() {
    this.physicsWorld.step(1 / 60, this.time.delta, 3);

    if (this.debug.active) {
      this.chassisHelperMesh.position.copy(this.chassisBody.position);
      this.chassisHelperMesh.quaternion.copy(this.chassisBody.quaternion);

      this.wheelHelpers.forEach((wheelHelper, i) => {
        wheelHelper.position.copy(this.wheelBodies[i].position);
        wheelHelper.quaternion.copy(this.wheelBodies[i].quaternion);
      });
    }
  }
}
