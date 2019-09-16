import { LoadingView } from "../ui/loadview";
import { IRoomService } from "../rooms/room";

export class LoadingScene extends Phaser.Scene {
  private mCallBack: () => void;
  private mRoom: IRoomService;
  constructor() {
    super({ key: LoadingScene.name });
  }

  public preload() {
    this.load.image("stars", "resources/stars.png");
  }

  // public init(data: any) {
  //   this.scene.wake();
  //   if (data) {
  //     this.mRoom = data.room;
  //     this.mCallBack = data.callBack;
  //   }
  // }

  public create() {
    const loadingView: LoadingView = new LoadingView(this);
    if (this.mCallBack) {
      this.mCallBack();
    }
  }

  update(time: number, delta: number) {
    // if (this.cameras.main) {
    //   this.cameras.main.emit("renderer", this.cameras.main);
    // }
    if (this.mRoom) {
      this.mRoom.update(time, delta);
    }
  }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }
}
