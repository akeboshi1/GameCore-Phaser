import { MainUIScene } from "./main.ui";
import { IRoomService } from "../rooms/room";
import { Logger } from "../utils/log";
import { LoadingScene } from "./loading";
import { Size } from "../utils/size";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends Phaser.Scene {
  protected mCallBack: () => void;
  protected mRoom: IRoomService;
  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config || { key: PlayScene.name });
  }

  public preload() { }

  public init(data: any) {
    if (data) {
      this.mCallBack = data.callBack;
      this.mRoom = data.room;
    }
  }

  public create() {
    if (this.mCallBack) {
      this.mCallBack();
    }
    this.scene.launch(MainUIScene.name, {
      room: this.mRoom
    });
    Logger.log("play created");
    this.scene.sendToBack();
    this.scale.on("orientationchange", this.checkOriention, this);
    this.scale.on("resize", this.checkSize, this);

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

  private checkOriention(orientation) {
    if (orientation === Phaser.Scale.PORTRAIT) {

    } else if (orientation === Phaser.Scale.LANDSCAPE) {

    }
  }

  private checkSize(size: Size) {
    const width: number = size.width;
    const height: number = size.height;
  }

}
