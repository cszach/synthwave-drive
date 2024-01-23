import * as THREE from "three";
import Experience from "../Experience";

export default class Mirror {
  constructor() {
    this.experience = new Experience();
    this.cubeCamera = this.experience.cubeCamera;
    this.scene = this.experience.scene;

    this.setGeometry();
    this.setMaterial();
  }

  setGeometry() {
    this.geometry = new THREE.BoxGeometry(2, 3, 0.1);
  }

  setMaterial() {
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      envMap: this.cubeCamera.renderTarget.texture,
    });
  }
}
