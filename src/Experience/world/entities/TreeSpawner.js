import Experience from "../../Experience";
import Spawner from "./Spawner";
import Tree from "./Tree";

export default class TreeSpawner {
  static new() {
    const experience = new Experience();
    const cubeCamera = experience.cubeCamera;
    const car = experience.world.car;
    const tree = new Tree();

    return new Spawner(
      [tree.geometry],
      [tree.material, tree.wireframeMaterial],
      car.position,
      {
        count: 42,
        triggerRadius: 150,
        generationRadius: 300,
        yStart: -20,
        yEnd: 0,
      },
      [cubeCamera.layerNumber],
      TreeSpawner.filter
    );
  }

  static filter(x, z) {
    const experience = new Experience();
    const terrain = experience.world.terrain;
    const height = terrain.getHeight(x, z);

    if (!height) {
      return false;
    }

    return height <= 0;
  }
}
