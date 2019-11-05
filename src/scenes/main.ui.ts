
import { Room } from "../rooms/room";
import { JoyStickManager } from "../game/joystick.manager";
import { Size } from "../utils/size";
import { DebugLoggerMediator } from "../ui/debuglog/debug.logger.mediator";

export class MainUIScene extends Phaser.Scene {
  // private fps: Phaser.GameObjects.Text;
  // private sizeTF: Phaser.GameObjects.Text;
  private mDebugLoger: DebugLoggerMediator;
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
    // this.fps = this.add.text(10, 10, "", { style: { color: "#64DD17" } });
    // this.sizeTF = this.add.text(10, 50, "", { style: { color: "#64DD17" }, wordWrap: { width: 800, useAdvancedWrap: true } });
    // this.sizeTF.setFontSize(20);
    const world = this.mRoom.world;
    if (world.game.device.os.desktop) {
    } else {
      (world.inputManager as JoyStickManager).setScene(this);
    }
    world.uiManager.setScene(this);
    // this.mRoom.world.game.scale.on("orientationchange", this.checkOriention, this);
    this.mRoom.world.game.scale.on("resize", this.checkSize, this);
  }

  public update() {
    if (!this.mDebugLoger) {
      this.mDebugLoger = this.mRoom.world.uiManager.getMediator(DebugLoggerMediator.NAME) as DebugLoggerMediator;
    }
    if (this.mDebugLoger && this.mDebugLoger.isShow()) {
      this.mDebugLoger.update(this.game.loop.actualFps.toFixed());
    }
    // this.fps.setText(this.game.loop.actualFps.toFixed());
    // const orientation: string = this.mRoom.world.getSize().width > this.mRoom.world.getSize().height ? "LANDSCAPE" : "PORTRAIT";
    // this.sizeTF.text = "width:" + this.mRoom.world.getSize().width + "\n" + "height:" + this.mRoom.world.getSize().height + "\n" + "orientation:" + orientation + "\n" + "devicePixelRatio:" + window.devicePixelRatio;
  }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }

  // private checkOriention(orientation) {
  //   this.sizeTF.text = "width:" + this.mRoom.world.getSize().width + "\n" + "height:" + this.mRoom.world.getSize().height + "\n" + "orientation:" + orientation + "\n" + "orientationChange:" + orientation;
  // }

  private checkSize(size: Size) {
    const width: number = size.width;
    const height: number = size.height;
    //  this.sizeTF.text = "width:" + size.width + ";height:" + size.height;
  }
}
