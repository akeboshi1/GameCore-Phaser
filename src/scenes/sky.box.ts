import { BasicScene } from "./basic.scene";
import { PlayCamera } from "../rooms/cameras/play.camera";
import { ISkyBoxManager } from "../rooms/sky.box/sky.box.manager";

export class SkyBoxScene extends BasicScene {
  private mRoom: ISkyBoxManager;
  constructor() {
    super({});
  }

  init(data: any) {
    if (data) {
      this.mRoom = data;
    }
  }

  create() {
    const oldCamera = this.cameras.main;
    this.cameras.addExisting(new PlayCamera(0, 0, this.sys.scale.width, this.sys.scale.height, 1), true);
    this.cameras.remove(oldCamera);
    this.scene.sendToBack();

    this.mRoom.startPlay(this);
  }

  update(time: number, delta: number) {
    this.mRoom.update(time, delta);
  }
}
