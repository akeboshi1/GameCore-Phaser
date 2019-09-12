import { LoadingView } from "../ui/loadview";
import { IRoomService } from "../rooms/room";

export class LoadingScene extends Phaser.Scene {
  private mCallBack: () => void;
  private mRoom: IRoomService;
  constructor() {
    super({ key: LoadingScene.name });
  }

  public preload() {
    this.load.image("loading", "resources/LOGO_F.png");
  }

  public init(data: any) {
    this.scene.wake();
    if (data) {
      this.mRoom = data.room;
      this.mCallBack = data.callBack;
    }
  }

  public create() {
    const loadingView: LoadingView = new LoadingView(this, this.mRoom);
    if (this.mCallBack) {
      this.mCallBack();
    }
  }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }
}
