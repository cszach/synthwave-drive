import * as THREE from "three";
import Experience from "../Experience";
import skyVertexShader from "../shaders/sky.vert";
import skyFragmentShader from "../shaders/sky.frag";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.colorPalette = this.experience.colorPalette;
    this.debug = this.experience.debug;

    this.setSunLight();
    this.setSky();
    if (this.debug.active) this.setDebug();
  }

  setSunLight() {
    this.sunLight = new THREE.DirectionalLight("#ffffff", 4);

    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(3.5, 2, -1.25);

    this.scene.add(this.sunLight);
  }

  setSky() {
    // Create a large sphere around the scene and renders on the backside so it
    // looks like a sky.

    this.skyGeometry = new THREE.SphereGeometry(10000, 25, 25);
    this.skyMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        skyStart: { value: 0.8 },
        skyEnd: { value: 0.2 },
        topColor: { value: new THREE.Color(this.colorPalette.night) },
        bottomColor: { value: new THREE.Color(this.colorPalette.fuchsia) },
      },
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
    });

    this.sky = new THREE.Mesh(this.skyGeometry, this.skyMaterial);
    this.scene.add(this.sky);
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Environment");

    this.debugFolder
      .add(this.sunLight, "intensity", 0, 10, 0.001)
      .name("sunLightIntensity");
    this.debugFolder
      .add(this.sunLight.position, "x", -5, 5, 0.001)
      .name("sunLightX");
    this.debugFolder
      .add(this.sunLight.position, "y", -5, 5, 0.001)
      .name("sunLightY");
    this.debugFolder
      .add(this.sunLight.position, "z", -5, 5, 0.001)
      .name("sunLightZ");

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
