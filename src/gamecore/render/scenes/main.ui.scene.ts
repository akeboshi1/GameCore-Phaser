import { BaseLayer } from "baseRender";
import { Url } from "utils";
import { Font, Size, SceneName } from "structure";
import { RoomScene } from "./room.scene";

export class MainUIScene extends RoomScene {
  public static readonly LAYER_UI = "uiLayer";
  public static readonly LAYER_DIALOG = "dialogLayer";
  public static readonly LAYER_TOOLTIPS = "toolTipsLayer";
  public static readonly LAYER_MASK = "maskLayer";
  private timeOutID = 0;
  private timeOutCancelMap = {};
  private timeOutCallerList = [];
  private timeOutTimeMap = {};
  private fps: Phaser.GameObjects.Text;
  // private sizeTF: Phaser.GameObjects.Text;
  constructor() {
    super({ key: SceneName.MAINUI_SCENE });
  }

  public init(data: any) {
    super.init(data);
    if (this.render) {
      this.render.uiManager.setScene(null);
    }
  }

  public create() {
    const width = this.cameras.main.width;
    this.fps = this.add.text(width - 6 * this.render.devicePixelRatio, 10, "", { color: "#00FF00", });
    this.fps.setStroke("#000000", 1);
    this.fps.setFontFamily(Font.DEFULT_FONT);
    this.fps.setFontSize(13 * this.render.devicePixelRatio);
    this.fps.setDepth(1000);
    this.fps.setOrigin(1, 0);
    // this.sizeTF = this.add.text(10, 50, "", { style: { color: "#64dd17" }, wordWrap: { width: 800, useAdvancedWrap: true } });
    // this.sizeTF.setFontSize(20 * this.render.devicePixelRatio);
    // this.sizeTF.setFontFamily(Font.DEFULT_FONT);
    // this.sizeTF.setStroke("#0", 3);
    // if (world.game.device.os.desktop) {
    // } else {
    //   if (world.inputManager) {
    //     world.inputManager.setScene(this);
    //   }
    // }
    this.render.uiManager.setScene(this);
    this.render.initUI();
    // this.checkSize(this.mRoom.world.getSize());
    // this.mRoom.world.game.scale.on("orientationchange", this.checkOriention, this);
    // this.scale.on("resize", this.checkSize, this);
    // set layers
    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_UI, 1);
    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_DIALOG, 2);
    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_TOOLTIPS, 3);
    this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_MASK, 4);
    super.create();
    // this.render.guideManager.init();
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

  public updateFPS() {
    if (this.fps) this.fps.setText(this.game.loop.actualFps.toFixed());
  }

  // public update(time: number, delta: number) {
  //   this.fps.setText(this.game.loop.actualFps.toFixed());
  //   // const orientation: string = this.mRoom.world.getSize().width > this.mRoom.world.getSize().height ? "LANDSCAPE" : "PORTRAIT";
  //   // this.sizeTF.text = "width:" + this.mRoom.world.getSize().width +
  //   //   "\n" + "height:" + this.mRoom.world.getSize().height + `\npixelRatio: ${window.devicePixelRatio} \nscene Scale: ${this.mRoom.world.scaleRatio} \nuiscale：${Math.round(this.mRoom.world.scaleRatio)}`;
  // }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }
  // preload() {
  //   this.loadRaomVideos();
  //   super.preload();
  // }
  protected onPointerDownHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {
    this.render.emitter.emit("pointerScene", SceneName.MAINUI_SCENE, currentlyOver);
  }

  // private checkOriention(orientation) {
  //   this.sizeTF.text = "width:" + this.mRoom.world.getSize().width + "\n" + "height:" + this.mRoom.world.getSize().height + "\n" + "orientation:" + orientation + "\n" + "orientationChange:" + orientation;
  // }
  private checkSize(size: Size) {
    const width: number = size.width;
    const height: number = size.height;
    const world = this.render;
    // const gameSize = world.getSize();
    // this.sizeTF.text = `CSS size: ${world.getConfig().width} ${world.getConfig().height}
    // Game size: ${gameSize.width.toFixed(2)} ${gameSize.height.toFixed(2)}
    // deviceRatio: ${window.devicePixelRatio}
    // scene ratio: ${world.scaleRatio}
    // ui ratio: ${world.uiRatio}
    // ui scale: ${world.uiScale.toFixed(5)}
    // `;
    //  this.sizeTF.text = "width:" + size.width + ";height:" + size.height;
  }

  private loadRaomVideos() {
    const folder = "roam_effect";
    const video = ["roamone", "roamtenrepead", "roamreward", "roambefore"];
    for (const res of video) {
      const url = Url.getNormalUIRes(`${folder}/${res}.mp4`);
      this.load.video(res, url, undefined, true, true);
    }
  }
}
