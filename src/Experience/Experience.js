import * as THREE from "three";
import Sizes from "./utils/Sizes";
import Time from "./utils/Time";
import Camera from "./Camera";
import Renderer from "./Renderer";
import World from "./world/World";
import Resources from "./utils/Resources";
import Debug from "./utils/Debug";
import sources from "./sources";
import Keyboard from "./utils/Keyboard";
import colorPalette from "./colorPalette";
import CubeCamera from "./CubeCamera";

let instance = null;

export default class Experience {
  constructor(canvas, config) {
    if (instance) {
      return instance;
    }

    instance = this;

    // Global access
    window.experience = this;

    // Options
    this.canvas = canvas;

    // Setup
    this.colorPalette = colorPalette;
    this.sizes = new Sizes();
    this.time = new Time();
    this.keyboard = new Keyboard();
    this.scene = new THREE.Scene();
    this.debug = new Debug(config.debugActive, config.physicsHelpersEnabled);
    this.resources = new Resources(sources);
    this.camera = this.debug.camera;
    this.renderer = new Renderer();
    this.world = new World();
    this.cubeCamera = new CubeCamera();

    this.resources.on("ready", () => {
      if (this.debug.active) {
        this.debug.ui.foldersRecursive().forEach((folder) => {
          folder.close();
        });

        this.debug.ui.show();
      } else {
        this.switchCameraTo(this.world.car.camera);
      }

      this.keyboard.on("keydown", (key) => {
        switch (key) {
          case "1":
            this.switchCameraTo(this.world.car.camera);
            break;

          case "0":
            if (this.debug.active) {
              this.switchCameraTo(this.debug.camera);
            } else {
              console.error("Debug is not active");
            }
            break;
        }
      });

      window.requestAnimationFrame(() => {
        this.time.tick();
      });
    });

    // Sizes resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  switchCameraTo(camera) {
    this.camera = camera;
    this.renderer.renderPass.camera = this.camera.instance;
    this.resize();
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.world.update();
    this.cubeCamera.update();
    this.renderer.update();
  }

  destroy() {
    this.sizes.off("resize");
    this.time.off("tick");

    // Traverse the whole scene
    this.scene.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material[key];

          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    this.camera.controls.dispose();
    this.renderer.instance.dispose();

    if (this.debug.active) {
      this.debug.ui.destroy();
    }
  }
}
