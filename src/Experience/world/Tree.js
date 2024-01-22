import * as THREE from "three";
import Experience from "../Experience";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";

export default class Trees {
  constructor() {
    this.experience = new Experience();
    this.cubeCamera = this.experience.cubeCamera;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.resource = this.resources.items.treeModel;
    this.colorPalette = this.experience.colorPalette;

    this.setGeometry();
    this.setMaterial();
    this.setWireframe();
  }

  setGeometry() {
    this.model = this.resource;

    const geometries = [];

    this.model.traverse((child) => {
      if (child.geometry) {
        geometries.push(child.geometry);
      }

      if (child.material) {
        child.material.dispose();
      }
    });

    this.geometry = BufferGeometryUtils.mergeGeometries(geometries);
  }

  setMaterial() {
    this.material = new THREE.MeshLambertMaterial({
      color: this.colorPalette.night,
      flatShading: true,
    });
  }

  setWireframe() {
    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: this.colorPalette.cyan,
    });
  }
}
