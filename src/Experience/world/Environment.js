import * as THREE from "three";
import Experience from "../Experience";
import skyVertexShader from "../shaders/sky.vert";
import skyFragmentShader from "../shaders/sky.frag";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.cubeCamera = this.experience.cubeCamera;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.colorPalette = this.experience.colorPalette;
    this.debug = this.experience.debug;

    this.setSky();
    if (this.debug.active) this.setDebug();
  }

  setSky() {
    // Create a large sphere around the scene and renders on the backside so it
    // looks like a sky.

    this.skyGeometry = new THREE.SphereGeometry(10000, 25, 25);
    this.skyMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        skyStart: { value: 0.6 },
        skyEnd: { value: 0.1 },
        topColor: { value: new THREE.Color(this.colorPalette.night) },
        bottomColor: { value: new THREE.Color(this.colorPalette.fuchsia) },
      },
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
    });

    this.sky = new THREE.Mesh(this.skyGeometry, this.skyMaterial);
    // this.sky.layers.enable(this.cubeCamera.layerNumber);

    this.scene.add(this.sky);
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Environment");

    this.debugFolder
      .add(this.skyMaterial.uniforms.skyStart, "value", 0.0, 1.0, 0.01)
      .name("skyStart");
    this.debugFolder
      .add(this.skyMaterial.uniforms.skyEnd, "value", 0.0, 1.0, 0.01)
      .name("skyEnd");
    this.debugFolder
      .addColor(this.skyMaterial.uniforms.topColor, "value")
      .name("topColor");
    this.debugFolder
      .addColor(this.skyMaterial.uniforms.bottomColor, "value")
      .name("bottomColor");
  }
}
