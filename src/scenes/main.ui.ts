
import { Room } from "../rooms/room";
import { JoyStickManager } from "../game/joystick.manager";
import { Size } from "../utils/size";
import { DebugLoggerMediator } from "../ui/debuglog/debug.logger.mediator";
import { Font } from "../utils/font";
import { BasicScene } from "./basic.scene";

export class MainUIScene extends BasicScene {
  private timeOutID = 0;
  private timeOutCancelMap = {};
  private timeOutCallerList = [];
  private timeOutTimeMap = {};
  private fps: Phaser.GameObjects.Text;
  private sizeTF: Phaser.GameObjects.Text;
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
    this.fps = this.add.text(10, 10, "", { style: { color: "#64DD17", } });
    this.fps.setStroke("0x0", 1);
    this.fps.setFontFamily(Font.DEFULT_FONT);
    this.fps.setFontSize(20 * window.devicePixelRatio);
    this.sizeTF = this.add.text(10, 50, "", { style: { color: "#64DD17" }, wordWrap: { width: 800, useAdvancedWrap: true } });
    this.sizeTF.setFontSize(20 * window.devicePixelRatio);
    this.sizeTF.setFontFamily(Font.DEFULT_FONT);
    this.sizeTF.setStroke("#0", 3);
    const world = this.mRoom.world;
    if (world.game.device.os.desktop) {
    } else {
      if (world.inputManager) {
        (world.inputManager as JoyStickManager).setScene(this);
      }
    }
    world.uiManager.setScene(this);
    this.checkSize(this.mRoom.world.getSize());
    // this.mRoom.world.game.scale.on("orientationchange", this.checkOriention, this);
    this.scale.on("resize", this.checkSize, this);
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

  public update() {
    if (!this.mDebugLoger) {
      this.mDebugLoger = this.mRoom.world.uiManager.getMediator(DebugLoggerMediator.NAME) as DebugLoggerMediator;
    }
    if (this.mDebugLoger && this.mDebugLoger.isShow()) {
      this.mDebugLoger.update(this.game.loop.actualFps.toFixed());
    }
    const len: number = this.timeOutCallerList.length;
    for (let i: number = 1; i < len; i++) {
      if (this.timeOutCancelMap[i]) {
        continue;
      }
      const caller = this.timeOutCallerList[i];
      const callerObj = this.timeOutTimeMap[i];
      if (!caller || !callerObj) {
        continue;
      }
      const begin: number = callerObj.now;
      const delay: number = callerObj.delay;
      const nowTime: number = Date.now();
      if (nowTime - begin > delay) {
        callerObj.now = nowTime;
        caller();
      }
    }
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
    ui scale: ${world.uiScaleNew.toFixed(5)}
    `;
    //  this.sizeTF.text = "width:" + size.width + ";height:" + size.height;
  }
}
