import * as THREE from "three";
import Experience from "../Experience";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import EventEmitter from "./EventEmitter";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    this.experience = new Experience();
    this.sources = sources;
    this.items = {};

    this.setLoadingManager();
    this.setLoaders();
    this.startLoading();
  }

  setLoadingManager() {
    const button = document.querySelector(".button");
    const loading = document.querySelector(".loading");

    THREE.DefaultLoadingManager.onProgress = (
      _itemUrl,
      itemsLoaded,
      itemsTotal
    ) => {
      const progress = itemsLoaded / itemsTotal;
      loading.innerHTML = Math.round(progress * 100);
    };

    THREE.DefaultLoadingManager.onLoad = () => {
      button.classList.add("activated");
      this.trigger("ready");
    };

    THREE.DefaultLoadingManager.onError = (itemUrl) => {
      console.error(`Error loading resource at ${itemUrl}.`);
    };
  }

  setLoaders() {
    this.loaders = {
      gltfLoader: new GLTFLoader(),
      objLoader: new OBJLoader(),
      textureLoader: new THREE.TextureLoader(),
      cubeTextureLoader: new THREE.CubeTextureLoader(),
    };

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("draco/");

    this.loaders.gltfLoader.setDRACOLoader(dracoLoader);
  }

  startLoading() {
    this.sources.forEach((source) => {
      switch (source.type) {
        case "gltfModel":
          this.loaders.gltfLoader.load(source.path, (file) => {
            this.items[source.name] = file;
          });
          break;

        case "objModel":
          this.loaders.objLoader.load(source.path, (file) => {
            this.items[source.name] = file;
          });
          break;

        case "texture":
          this.loaders.textureLoader.load(source.path, (file) => {
            this.items[source.name] = file;
          });
          break;

        case "cubeTexture":
          this.loaders.cubeTextureLoader.load(source.path, (file) => {
            this.items[source.name] = file;
          });
          break;
      }
    });
  }
}
