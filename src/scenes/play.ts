import { MainUIScene } from "./main.ui";
import { IRoomService } from "../rooms/room";
import { Console } from "../utils/log";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends Phaser.Scene {
  private mCallBack: () => void;
  private mRoom: IRoomService;
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
      this.scene.launch(MainUIScene.name);
    }
    Console.log("play created");
  }

  update(time: number, delta: number) {
    // if (this.cameras.main) {
    //   this.cameras.main.emit("renderer", this.cameras.main);
    // }
    if (this.mRoom) {
      this.mRoom.update(time, delta);
    }
  }

}
