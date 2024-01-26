import Experience from "../../Experience";
import Spawner from "./Spawner";
import Frame from "./Frame";

export default class FrameSpawner {
  static new() {
    const experience = new Experience();
    const cubeCamera = experience.cubeCamera;
    const car = experience.world.car;
    const frame = new Frame();

    return new Spawner(
      [frame.geometry],
      [frame.material],
      car.position,
      {
        count: 3,
        triggerRadius: 100,
        generationRadius: 100,
        yStart: -20,
        yEnd: 0,
      },
      [cubeCamera.layerNumber],
      FrameSpawner.filter
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
