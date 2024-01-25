import * as THREE from "three";
import Experience from "../Experience";

export default class Frame {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.colorPalette = this.experience.colorPalette;

    this.size = 10;

    this.setGeometry();
    this.setMaterial();
  }

  setGeometry() {
    this.curvePath = new THREE.CurvePath();
    const halfSize = this.size / 2;

    this.curvePath.add(
      new THREE.LineCurve3(
        new THREE.Vector3(-halfSize, halfSize, 0),
        new THREE.Vector3(halfSize, halfSize, 0)
      )
    );
    this.curvePath.add(
      new THREE.LineCurve3(
        new THREE.Vector3(halfSize, halfSize, 0),
        new THREE.Vector3(halfSize, -halfSize, 0)
      )
    );
    this.curvePath.add(
      new THREE.LineCurve3(
        new THREE.Vector3(halfSize, -halfSize, 0),
        new THREE.Vector3(-halfSize, -halfSize, 0)
      )
    );
    this.curvePath.closePath();

    this.geometry = new THREE.TubeGeometry(this.curvePath, 4, 0.1, 2, true);
  }

  setMaterial() {
    this.material = new THREE.MeshBasicMaterial({
      color: this.colorPalette.cyan,
    });
  }
}
