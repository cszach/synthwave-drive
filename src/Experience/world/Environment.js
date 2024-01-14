import * as THREE from "three";
import Experience from "../Experience";

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
    this.skyGeometry = new THREE.SphereGeometry(10000, 25, 25);
    this.skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        skyStart: { value: 0.8 },
        skyEnd: { value: 0.2 },
        topColor: { value: new THREE.Color(this.colorPalette.night) },
        bottomColor: { value: new THREE.Color(this.colorPalette.fuchsia) },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

          vUv = uv;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float skyStart;
        uniform float skyEnd;
        varying vec2 vUv;

        void main() {
          vec3 color = (vUv.y > skyStart)
            ? topColor
            : (vUv.y < skyEnd
              ? bottomColor
              : mix(bottomColor, topColor, (vUv.y - skyEnd) / (skyStart - skyEnd)));

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
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
