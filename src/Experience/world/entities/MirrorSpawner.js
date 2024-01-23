import Experience from "../../Experience";
import Spawner from "./Spawner";
import Mirror from "../Mirror";

export default class MirrorSpawner {
  static new() {
    const experience = new Experience();
    const cubeCamera = experience.cubeCamera;
    const car = experience.world.car;
    const mirror = new Mirror();

    return new Spawner(
      [mirror.geometry],
      [mirror.material],
      car.position,
      {
        count: 12,
        triggerRadius: 50,
        generationRadius: 100,
        yStart: -5,
        yEnd: 1,
      },
      [cubeCamera.layerNumber]
    );
  }
}
