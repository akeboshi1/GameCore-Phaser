import { PlayCamera } from "../cameras/play.camera";
import { BasicScene } from "./basic.scene";

export class SkyBoxScene extends BasicScene {
  private skyBoxManager: any;
  constructor() {
    super({});
  }

  init(data: any) {
    super.init(data);
    if (data) {
      this.skyBoxManager = data;
    }
  }

  preload() {
  }

  create() {
    super.create();
    const oldCamera = this.cameras.main;
    this.cameras.addExisting(new PlayCamera(0, 0, this.sys.scale.width, this.sys.scale.height, this.skyBoxManager.scaleRatio), true);
    this.cameras.remove(oldCamera);
    // this.scene.sendToBack();

    this.skyBoxManager.startPlay(this);
  }

  update(time: number, delta: number) {
    this.skyBoxManager.check(time, delta);
  }
}
