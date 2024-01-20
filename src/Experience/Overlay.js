import * as THREE from "three";
import Experience from "./Experience";

export default class Overlay {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        overlayAlpha: { value: 1 },
      },
      vertexShader: `
			void main() {
				gl_Position = vec4(position, 1.0);
			}
		`,
      fragmentShader: `
			uniform float overlayAlpha;

			void main() {
				gl_FragColor = vec4(0.0, 0.0, 0.0, overlayAlpha);
			}
		`,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
}
