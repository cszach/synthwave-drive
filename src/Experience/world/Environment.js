import * as THREE from "three";
import Experience from "../Experience";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    this.setSunLight();
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
      .add(this.environmentMap, "intensity", 0, 4, 0.001)
      .name("envMapIntensity")
      .onChange(this.environmentMap.updateMaterials);
  }
}
