import * as THREE from "three";
import Experience from "./Experience";
import { gsap } from "gsap/gsap-core";

export default class Spawner {
  /**
   *
   * @param {THREE.BufferGeometry[]} geometries
   * @param {THREE.Material[]} materials
   * @param {THREE.Vector3} target
   * @param {object} options
   * @param {number} options.count
   * @param {number} options.generationRadius
   * @param {number} options.maxCount
   * @param {number} options.yStart
   * @param {number} options.yEnd
   */
  constructor(
    geometries,
    materials,
    target = new THREE.Vector3(0, 0, 0),
    options = {},
    layers = [],
    positionFilter = (x, y) => {
      return true;
    }
  ) {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    this.target = target;
    this.options = {
      count: options.count || 50,
      triggerRadius: options.triggerRadius || 150,
      generationRadius: options.generationRadius || 200,
      maxCount: options.maxCount || options.count || 50,
      yStart: options.yStart || -20,
      yEnd: options.yEnd || 0,
    };
    this.layers = layers;

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

      this.instancedMeshes.push(instancedMesh);
    }

    this.positionFilter = positionFilter;
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

    if (!this.lastSpawnLocation) {
      this.lastSpawnLocation = this.target.clone();
    } else {
      this.instancedMeshes.forEach((instancedMesh) => {
        this.scene.remove(instancedMesh);
      });
    }

    this.options.count = count;
    this.options.generationRadius = generationRadius;

    this.instancedMeshes.forEach((instancedMesh) => {
      instancedMesh.count = count;
    });

    for (let i = 0; i < count; i++) {
      // Generate a random point in a circle.

      let x, y;

      do {
        const r = generationRadius * Math.sqrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;

        x = r * Math.cos(theta);
        y = r * Math.sin(theta);
      } while (!this.positionFilter(x, y));

      const matrix = new THREE.Matrix4();
      matrix.makeRotationFromEuler(
        new THREE.Euler(0, Math.random() * Math.PI * 2, 0)
      );
      matrix.setPosition(x, 0, y);

      this.instancedMeshes.forEach((instancedMesh) => {
        instancedMesh.setMatrixAt(i, matrix);
      });
    }

    this.instancedMeshes.forEach((instancedMesh) => {
      instancedMesh.position.x = this.target.x;
      instancedMesh.position.z = this.target.z;

      this.layers.forEach((layer) => {
        instancedMesh.layers.enable(layer);
      });

      this.scene.add(instancedMesh);

      gsap.to(instancedMesh.position, {
        y: this.options.yEnd,
        duration: 0.6,
        ease: "power3.inOut",
      });
    });
  }

  update() {
    if (
      this.lastSpawnLocation &&
      this.target.distanceTo(this.lastSpawnLocation) >
        this.options.triggerRadius
    ) {
      this.lastSpawnLocation = this.target.clone();

      this.instancedMeshes.forEach((instancedMesh) => {
        gsap.to(instancedMesh.position, {
          y: this.options.yEnd + this.options.yStart,
          duration: 0.6,
          ease: "power3.inOut",
          onComplete: () => {
            this.spawn();
          },
        });
      });
    }
  }
}
