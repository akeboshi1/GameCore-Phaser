
import { Room } from "../rooms/room";
import { JoyStickManager } from "../game/joystick.manager";
import { Size } from "../utils/size";
import { Font } from "../utils/font";
import { BasicScene } from "./basic.scene";

export class MainUIScene extends BasicScene {
  private timeOutID = 0;
  private timeOutCancelMap = {};
  private timeOutCallerList = [];
  private timeOutTimeMap = {};
  private fps: Phaser.GameObjects.Text;
  private sizeTF: Phaser.GameObjects.Text;
  private mRoom: Room;
  constructor() {
    super({ key: MainUIScene.name });
  }

  public preload() {
  }

  public init(data: any) {
    this.mRoom = data.room;
    if (this.mRoom) {
      this.mRoom.world.uiManager.setScene(null);
    }
  }

  public create() {
    super.create();
    const world = this.mRoom.world;
    const gameSize = world.getSize();
    const width = gameSize.width;
    this.fps = this.add.text(width * 0.5, 10, "", { style: { color: "#64DD17", } });
    this.fps.setStroke("0x0", 1);
    this.fps.setFontFamily(Font.DEFULT_FONT);
    this.fps.setFontSize(20 * window.devicePixelRatio);
    this.fps.setDepth(1000);
    this.sizeTF = this.add.text(10, 50, "", { style: { color: "#64DD17" }, wordWrap: { width: 800, useAdvancedWrap: true } });
    this.sizeTF.setFontSize(20 * window.devicePixelRatio);
    this.sizeTF.setFontFamily(Font.DEFULT_FONT);
    this.sizeTF.setStroke("#0", 3);
    if (world.game.device.os.desktop) {
    } else {
      if (world.inputManager) {
        (world.inputManager as JoyStickManager).setScene(this);
      }
    }
    world.uiManager.setScene(this);
    this.mRoom.initUI();
    // this.checkSize(this.mRoom.world.getSize());
    // this.mRoom.world.game.scale.on("orientationchange", this.checkOriention, this);
    // this.scale.on("resize", this.checkSize, this);
  }

  public setTimeout(caller, time): number {
    const begin = Date.now();
    this.timeOutCallerList[++this.timeOutID] = caller;
    this.timeOutTimeMap[this.timeOutID] = { now: begin, delay: time };
    return this.timeOutID;
  }

  public clearTimeout(id) {
    this.timeOutCancelMap[id] = true;
  }

  public update(time: number, delta: number) {
    this.fps.setText(this.game.loop.actualFps.toFixed());
    // const orientation: string = this.mRoom.world.getSize().width > this.mRoom.world.getSize().height ? "LANDSCAPE" : "PORTRAIT";
    // this.sizeTF.text = "width:" + this.mRoom.world.getSize().width +
    //   "\n" + "height:" + this.mRoom.world.getSize().height + `\npixelRatio: ${window.devicePixelRatio} \nscene Scale: ${this.mRoom.world.scaleRatio} \nuiscale：${Math.round(this.mRoom.world.scaleRatio)}`;
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
    const world = this.mRoom.world;
    const gameSize = world.getSize();
    this.sizeTF.text = `CSS size: ${world.getConfig().width} ${world.getConfig().height}
    Game size: ${gameSize.width.toFixed(2)} ${gameSize.height.toFixed(2)}
    deviceRatio: ${window.devicePixelRatio}
    scene ratio: ${world.scaleRatio}
    ui ratio: ${world.uiRatio}
    ui scale: ${world.uiScale.toFixed(5)}
    `;
    //  this.sizeTF.text = "width:" + size.width + ";height:" + size.height;
  }
}
