import * as THREE from "three";
import Experience from "../../Experience";
import { gsap } from "gsap/gsap-core";

/**
 * A spawner capable of spawning multiple groups of multiple objects around a
 * (presumably) moving target (e.g. spawning environment entities around a
 * moving car). Groups are actually Three.js instanced meshes.
 *
 * The spawned objects will have a slide in/slide out transition when being
 * spawned/despawned. The Y property of the location will be animated.
 */
export default class Spawner {
  /**
   * @param {THREE.BufferGeometry[]} geometries A list of geometries for the
   * instanced meshes.
   * @param {THREE.Material[]} materials A list of materials for the instanced
   * meshes.
   * @param {THREE.Vector3} target The reference to the position of the moving
   * target.
   * @param {object} options An object of options for instanced mesh generation.
   * Properties can be modified in real-time except for maxCount.
   * @param {number} options.count The number of instances to generate in the
   * next spawn.
   * @param {number} options.triggerRadius The radius that, if the target
   * leaves, will trigger the spawn.
   * @param {number} options.generationRadius The radius in which instances are
   * generated. The center of the circle is the target.
   * @param {number} options.maxCount The maximum number of instances that will
   * ever be spawned. Once set, this value must not be changed.
   * @param {number} options.yStart The Y position at which objects spawn from
   * or disappear into. Ideally, at this Y position, the meshes should not be
   * visible.
   * @param {number} options.yEnd The Y position at which objects spawn and
   * transition to. This should be the normal Y position of the objects.
   * @param {number[]} layers The layer numbers to enable on the meshes.
   */
  constructor(
    geometries,
    materials,
    target = new THREE.Vector3(0, 0, 0),
    options = {},
    layers = []
  ) {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    this.target = target;
    this.options = {
      count: options.count,
      triggerRadius: options.triggerRadius,
      generationRadius: options.generationRadius,
      maxCount: options.maxCount || options.count,
      yStart: options.yStart,
      yEnd: options.yEnd || 0,
    };

    // Create the meshes

    this.instancedMeshes = [];

    const numMeshes =
      geometries.length > materials.length
        ? geometries.length
        : materials.length;

    for (let i = 0; i < numMeshes; i++) {
      const instancedMesh = new THREE.InstancedMesh(
        geometries[i < geometries.length ? i : geometries.length - 1],
        materials[i < materials.length ? i : materials.length - 1],
        this.options.maxCount
      );

      instancedMesh.position.y = this.options.yStart;

      layers.forEach((layer) => {
        instancedMesh.layers.enable(layer);
      });

      this.instancedMeshes.push(instancedMesh);
    }

    // These 2 properties come up as a result of the target being fixed at the
    // origin (0, 0, 0) and the environment moves instead of the other way
    // around like normal.

    /**
     * The target (position) at the last spawn location.
     */
    this.targetAtSpawnLocation = new THREE.Vector3();
    /**
     * {@code true} if the meshes have finished transitioning, {@code false} if
     * not.
     */
    this.doneTransitioning = true;
  }

  spawn(
    count = this.options.count,
    generationRadius = this.options.generationRadius
  ) {
    if (count > this.options.maxCount) {
      console.error(
        `count (${count}) is larger than maxCount (${this.options.maxCount})`
      );

      return;
    }

    /* If lastSpawnLocation is undefined, that means this is the first time this
     * spawner spawns. When that is the case, set the spawn location to the
     * target.
     */
    if (!this.lastSpawnLocation) {
      this.lastSpawnLocation = this.target.clone();
    } else {
      // We need to dynamically add/remove instanced meshes to/from the scene,
      // otherwise it won't work (for some reason).
      this.instancedMeshes.forEach((instancedMesh) => {
        this.scene.remove(instancedMesh);
      });
    }

    this.options.count = count;
    this.options.generationRadius = generationRadius;

    this.instancedMeshes.forEach((instancedMesh) => {
      instancedMesh.count = count;
    });

    // Generate random locations (XZ) and rotations for the instances for each
    // instanced mesh.

    for (let i = 0; i < count; i++) {
      // Generate a random point in a circle.

      const r = generationRadius * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;

      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);

      const matrix = new THREE.Matrix4();
      matrix.makeRotationFromEuler(
        new THREE.Euler(0, Math.random() * Math.PI * 2, 0)
      );
      matrix.setPosition(x, 0, y);

      this.instancedMeshes.forEach((instancedMesh) => {
        instancedMesh.setMatrixAt(i, matrix);
      });
    }

    // Spawn the meshes

    this.doneTransitioning = false;

    this.instancedMeshes.forEach((instancedMesh) => {
      instancedMesh.instanceMatrix.needsUpdate = true;
      instancedMesh.position.y = this.options.yStart;

      this.scene.add(instancedMesh);

      gsap.to(instancedMesh.position, {
        y: this.options.yEnd,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          this.doneTransitioning = true;
        },
      });
    });

    this.targetAtSpawnLocation = this.target.clone();
  }

  update() {
    this.instancedMeshes.forEach((instancedMesh) => {
      instancedMesh.position.setX(
        -(this.target.x - this.targetAtSpawnLocation.x)
      );
      instancedMesh.position.setZ(
        -(this.target.z - this.targetAtSpawnLocation.z)
      );

      if (this.doneTransitioning) {
        instancedMesh.position.setY(this.options.yEnd - this.target.y);
      }
    });

    if (
      this.lastSpawnLocation &&
      this.target.distanceTo(this.lastSpawnLocation) >
        this.options.triggerRadius
    ) {
      this.lastSpawnLocation = this.target.clone();
      this.doneTransitioning = false;

      this.instancedMeshes.forEach((instancedMesh, i) => {
        gsap.to(instancedMesh.position, {
          y: this.options.yStart,
          duration: 0.6,
          ease: "power3.inOut",
          onComplete:
            i == 0
              ? () => {
                  this.spawn();
                }
              : () => {},
        });
      });
    }
  }
}
