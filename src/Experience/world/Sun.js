import * as THREE from "three";
import Experience from "../Experience.js";
import sunVertexShader from "../shaders/sun.vert";
import sunFragmentShader from "../shaders/sun.frag";

export default class Sun {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.terrain = this.experience.world.terrain;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

    // TODO: Move config to parent
    this.config = {
      lower: 0.6,
      upper: 0.4,
      offset: 0.3,
      compression: 4,
      timeMultiplier: 0.001,
      bottomColor: new THREE.Color(0xffd319),
      topColor: new THREE.Color(0xff2975),
    };

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
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
        lower: { value: this.config.lower },
        upper: { value: this.config.upper },
        offset: { value: this.config.offset },
        compression: { value: this.config.compression },
        timeMultiplier: { value: this.config.timeMultiplier },
        bottomColor: { value: this.config.bottomColor },
        topColor: { value: this.config.topColor },
        timeElapsed: { value: 0 },
      },
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.y =
      this.terrain.config.floorElevation * this.terrain.config.multiplier;
    this.mesh.position.z = 1000;
    this.mesh.rotation.x = Math.PI;

    this.scene.add(this.mesh);
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Sun");

    this.debugFolder
      .add(this.material.uniforms.lower, "value", 0.0, 1.0, 0.01)
      .name("lower");
    this.debugFolder
      .add(this.material.uniforms.upper, "value", 0.0, 1.0, 0.01)
      .name("upper");
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
  }

  update() {
    this.material.uniforms.timeElapsed.value = this.time.elapsed;
  }
}
