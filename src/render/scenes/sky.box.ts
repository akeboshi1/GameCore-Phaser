import { BasicScene } from "./basic.scene";
import { PlayCamera } from "../rooms/cameras/play.camera";
import { IBlockManager } from "../rooms/sky.box/block.manager";

export class SkyBoxScene extends BasicScene {
  private skyBoxManager: IBlockManager;
  constructor() {
    super({});
  }

  init(data: any) {
    if (data) {
      this.skyBoxManager = data;
    }
  }

  create() {
    const oldCamera = this.cameras.main;
    this.cameras.addExisting(new PlayCamera(0, 0, this.sys.scale.width, this.sys.scale.height, this.skyBoxManager.world.scaleRatio), true);
    this.cameras.remove(oldCamera);
    // this.scene.sendToBack();

    this.skyBoxManager.startPlay(this);
  }

  update(time: number, delta: number) {
    this.skyBoxManager.check(time, delta);
  }
}
