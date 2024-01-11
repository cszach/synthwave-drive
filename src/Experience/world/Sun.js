import * as THREE from "three";
import Experience from "../Experience.js";
import sunVertexShader from "../shaders/sun.vert";
import sunFragmentShader from "../shaders/sun.frag";

export default class Sun {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(1000, 1000);
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: sunVertexShader,
      fragmentShader: sunFragmentShader,
      transparent: true,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = 1000;
    this.mesh.rotation.x = Math.PI;

    this.scene.add(this.mesh);
  }

  update() {}
}
