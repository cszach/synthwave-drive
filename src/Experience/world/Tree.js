import * as THREE from "three";
import Experience from "../Experience";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";

export default class Tree {
  constructor() {
    this.experience = new Experience();
    this.cubeCamera = this.experience.cubeCamera;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.resource = this.resources.items.treeModel;
    this.colorPalette = this.experience.colorPalette;

    this.setModel();
    this.setWireframe();
  }

  setModel() {
    this.model = this.resource;

    this.material = new THREE.MeshLambertMaterial({
      color: this.colorPalette.night,
      flatShading: true,
    });

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
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.mesh);
  }

  setWireframe() {
    this.wireframeGeometry = new THREE.WireframeGeometry(this.geometry);
    this.wireframeMaterial = new THREE.LineBasicMaterial({
      color: this.colorPalette.cyan,
    });
    this.wireframe = new THREE.LineSegments(
      this.wireframeGeometry,
      this.wireframeMaterial
    );

    this.scene.add(this.wireframe);
  }
}
