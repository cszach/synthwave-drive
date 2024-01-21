import * as THREE from "three";
import Experience from "../Experience";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import EventEmitter from "./EventEmitter";
import { gsap } from "gsap";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    this.experience = new Experience();
    this.overlay = this.experience.overlay;

    // Options
    this.sources = sources;

    // Setup
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoadingManager();
    this.setLoaders();
    // FIXME: experience won't load if there is no resources: event is triggered
    // before World is created
    this.toLoad > 0 ? this.startLoading() : this.trigger("ready");
  }

  setLoadingManager() {
    const button = document.querySelector(".button");
    const loading = document.querySelector(".loading");

    this.loadingManager = new THREE.LoadingManager(
      // Loaded
      () => {
        gsap.delayedCall(0.5, () => {
          // gsap.to(this.overlay.material.uniforms.overlayAlpha, {
          //   duration: 3,
          //   value: 0,
          // });

          button.classList.add("activated");
        });
      },

      // Progress
      (itemUrl, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal;

        loading.innerHTML = Math.round(progress * 100);
      }
    );
  }

  setLoaders() {
    this.loaders = {
      gltfLoader: new GLTFLoader(this.loadingManager),
      textureLoader: new THREE.TextureLoader(this.loadingManager),
      cubeTextureLoader: new THREE.CubeTextureLoader(this.loadingManager),
    };

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("draco/");

    this.loaders.gltfLoader.setDRACOLoader(dracoLoader);
  }

  startLoading() {
    // Load each source
    this.sources.forEach((source) => {
      if (source.type === "gltfModel") {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "cubeTexture") {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
    });
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;

    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.trigger("ready");
    }
  }
}
