
import { Room } from "../rooms/room";
import { JoyStickManager } from "../game/joystick.manager";

export class MainUIScene extends Phaser.Scene {
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
    this.fps = this.add.text(10, 10, "");
    const world = this.mRoom.world;
    if (world.game.device.os.desktop) {
    } else {
      (world.inputManager as JoyStickManager).setScene(this);
      // world.inputManager.onRoomChanged(this.mRoom);
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
