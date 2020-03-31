import { BasicScene } from "./basic.scene";
import { IRoomService } from "../rooms/room";
import { PlayCamera } from "../rooms/cameras/play.camera";
import { CloseShot } from "../rooms/background/close.shot";

export class BackgroundCloseShot extends BasicScene {
  private mRoom: CloseShot;
  constructor() {
    super({ key: BackgroundCloseShot.name });
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
    // this.mRoom.startPlay();
    this.scene.sendToBack();

    this.mRoom.startPlay(this);
  }
}
