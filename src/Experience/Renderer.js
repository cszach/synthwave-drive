import * as THREE from "three";
import Experience from "./Experience";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";

export default class Renderer {
  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.debug = this.experience.debug;

    this.setInstance();
    this.setPostProcessing();
    if (this.debug.active) this.setDebug();
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.instance.toneMapping = THREE.CineonToneMapping;
    this.instance.toneMappingExposure = 1.75;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  setPostProcessing() {
    this.renderTarget = new THREE.WebGLRenderTarget(800, 600, {
      samples: this.instance.getPixelRatio() === 1 ? 2 : 0,
    });

    this.effectComposer = new EffectComposer(this.instance, this.renderTarget);
    this.effectComposer.setSize(this.sizes.width, this.sizes.height);
    this.effectComposer.setPixelRatio(this.sizes.pixelRatio);

    // Render pass

    this.renderPass = new RenderPass(this.scene, this.camera.instance);
    this.effectComposer.addPass(this.renderPass);

    // Bloom pass

    this.bloomPass = new UnrealBloomPass();
    this.bloomPass.strength = 0.3;
    this.bloomPass.radius = 0.5;
    this.bloomPass.threshold = 0.2;
    this.effectComposer.addPass(this.bloomPass);

    // Anti-aliasing pass, only if the browser does not support WebGL 2.

    if (
      this.instance.getPixelRatio() === 1 &&
      !this.instance.capabilities.isWebGL2
    ) {
      this.smaaPass = new SMAAPass();
      this.effectComposer.addPass(this.smaaPass);
    }

    // Output pass

    this.outputPass = new OutputPass();
    this.effectComposer.addPass(this.outputPass);
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Post-processing");

    const bloomPassFolder = this.debugFolder.addFolder("Bloom pass");

    bloomPassFolder.add(this.bloomPass, "enabled");
    bloomPassFolder.add(this.bloomPass, "strength").min(0).max(2).step(0.001);
    bloomPassFolder.add(this.bloomPass, "radius").min(0).max(2).step(0.001);
    bloomPassFolder.add(this.bloomPass, "threshold").min(0).max(2).step(0.001);
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);

    this.effectComposer.setSize(this.sizes.width, this.sizes.height);
    this.effectComposer.setPixelRatio(this.sizes.pixelRatio);
  }

  update() {
    // this.instance.render(this.scene, this.experience.camera.instance);
    this.effectComposer.render();
  }
}
