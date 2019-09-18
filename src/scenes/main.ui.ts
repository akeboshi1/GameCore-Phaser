import { Logger } from "../utils/log";
import { Room } from "../rooms/room";

export class MainUIScene extends Phaser.Scene {
  private bg: Phaser.GameObjects.Sprite;
  private btn: Phaser.GameObjects.Sprite;
  private joyStickCon: Phaser.GameObjects.Container;
  private bgRadius: number;
  private fps: Phaser.GameObjects.Text;
  private mRoom: Room;
  constructor() {
    super({ key: MainUIScene.name });
  }

  public preload() {
  }

  public init(data: any) {
    this.mRoom = data.room;
  }

  public create() {
    this.fps = this.add.text(0, 0, "");
    const world = this.mRoom.world;
    if (world.game.device.os.desktop) {
    } else {
      world.joyStickManager.setScene(this);
    }
    // if ((world.gameEnvironment.isAndroid || world.gameEnvironment.isIOSPhone) && world.joyStickManager) {
    //   world.joyStickManager.setScene(this);
    // }
    world.uiManager.setScene(this);
  }

  public update() {
    this.fps.setText(this.game.loop.actualFps.toFixed());
  }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }
}
