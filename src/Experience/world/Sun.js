import * as THREE from "three";
import Experience from "../Experience.js";
import sunVertexShader from "../shaders/sun.vert";
import sunFragmentShader from "../shaders/sun.frag";

export default class Sun {
  constructor() {
    this.experience = new Experience();
    this.cubeCamera = this.experience.cubeCamera;
    this.scene = this.experience.scene;
    this.terrain = this.experience.world.terrain;
    this.time = this.experience.time;
    this.colorPalette = this.experience.colorPalette;
    this.debug = this.experience.debug;

    this.initialConfig = {
      /** The elevation (y value) of the sun. */
      elevation: 0,

      /** The UV y coordinate where gaps appear. */
      gapsLower: 0.6,
      /** The UV y coordinate where gaps disappear. */
      gapsUpper: 0.4,

      // Parameters for the wave function, see sun.frag for the equation.

      /** The horizontal offset of the wave. */
      offset: 0.3,
      /** "Compression" factor: more compression means more gaps. */
      compression: 4,
      /** The number to multiply the time with (to slow down or speed up animation). */
      timeMultiplier: 0.003,
      /** The sun's radius in UV coordinate units. */
      sunRadius: 0.2,
      /** The UV y coordinate where the color interpolation starts (at the top). */
      lerpStart: 0.3,
      /** The UV y coordinate where the color interpolation ends (at the bottom). */
      lerpEnd: 0.5,
    };

    this.lightConfig = {
      startColor: new THREE.Color(this.colorPalette.rose),
      endColor: new THREE.Color(this.colorPalette.gold),
      lerpValue: 0.5,
    };

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setLight();
    if (this.debug.active) this.setDebug();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(1000, 1000);
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: sunVertexShader,
      fragmentShader: sunFragmentShader,
      transparent: true,
      uniforms: {
        gapsLower: { value: this.initialConfig.gapsLower },
        gapsUpper: { value: this.initialConfig.gapsUpper },
        offset: { value: this.initialConfig.offset },
        compression: { value: this.initialConfig.compression },
        timeMultiplier: { value: this.initialConfig.timeMultiplier },
        sunRadius: { value: this.initialConfig.sunRadius },
        lerpStart: { value: this.initialConfig.lerpStart },
        lerpEnd: { value: this.initialConfig.lerpEnd },
        bottomColor: { value: new THREE.Color(this.colorPalette.rose) },
        topColor: { value: new THREE.Color(this.colorPalette.gold) },
        timeElapsed: { value: 0 }, // in milliseconds
      },
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.y = this.initialConfig.elevation;
    this.mesh.position.z = 1000;
    this.mesh.rotation.x = Math.PI;
    this.mesh.layers.enable(this.cubeCamera.layerNumber);

    this.scene.add(this.mesh);
  }

  setLight() {
    this.light = new THREE.DirectionalLight(
      new THREE.Color()
        .lerpColors(
          this.lightConfig.startColor,
          this.lightConfig.endColor,
          this.lightConfig.lerpValue
        )
        .getHex(),
      3
    );
    this.light.position.copy(this.mesh.position);

    this.scene.add(this.light);
  }

  setHelpers() {
    this.lightHelper = new THREE.DirectionalLightHelper(this.light);
    this.lightHelper.visible = false;

    this.scene.add(this.lightHelper);
  }

  setDebug() {
    this.setHelpers();

    this.debugFolder = this.debug.ui.addFolder("Sun");

    this.debugFolder
      .add(this.mesh.position, "y", -1000, 1000, 1)
      .name("elevation");
    this.debugFolder
      .add(this.material.uniforms.gapsLower, "value", 0.0, 1.0, 0.01)
      .name("gapsLower");
    this.debugFolder
      .add(this.material.uniforms.gapsUpper, "value", 0.0, 1.0, 0.01)
      .name("gapsUpper");
    this.debugFolder
      .add(this.material.uniforms.offset, "value", 0.0, 1.0, 0.01)
      .name("offset");
    this.debugFolder
      .add(this.material.uniforms.compression, "value", 0.001, 10.0, 0.001)
      .name("compression");
    this.debugFolder
      .add(this.material.uniforms.timeMultiplier, "value", 0.0, 1.0, 0.001)
      .name("timeMultiplier");
    this.debugFolder
      .addColor(this.material.uniforms.bottomColor, "value")
      .name("bottomColor");
    this.debugFolder
      .addColor(this.material.uniforms.topColor, "value")
      .name("topColor");
    this.debugFolder
      .add(this.material.uniforms.sunRadius, "value", 0.0, 0.5, 0.01)
      .name("sunRadius");
    this.debugFolder
      .add(this.material.uniforms.lerpStart, "value", 0.0, 1.0, 0.01)
      .name("lerpStart");
    this.debugFolder
      .add(this.material.uniforms.lerpEnd, "value", 0.0, 1.0, 0.01)
      .name("lerpEnd");

    const sunLightFolder = this.debugFolder.addFolder("Light");

    const lerpColor = () => {
      this.light.color = new THREE.Color().lerpColors(
        this.lightConfig.startColor,
        this.lightConfig.endColor,
        this.lightConfig.lerpValue
      );
    };

    sunLightFolder.add(this.light, "intensity", 0, 10, 0.01);
    sunLightFolder.addColor(this.light, "color");
    sunLightFolder.add(this.lightHelper, "visible").name("lightHelperVisible");
    sunLightFolder.addColor(this.lightConfig, "startColor").onChange(lerpColor);
    sunLightFolder.addColor(this.lightConfig, "endColor").onChange(lerpColor);
    sunLightFolder
      .add(this.lightConfig, "lerpValue", 0, 1, 0.01)
      .onChange(lerpColor);
  }

  update() {
    this.material.uniforms.timeElapsed.value = this.time.elapsed;
    if (this.lightHelper) this.lightHelper.update();
  }
}
