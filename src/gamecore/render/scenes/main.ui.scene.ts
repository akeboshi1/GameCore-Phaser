import { BaseLayer } from "baseRender";
import { Font, SceneName } from "structure";
import { RoomScene } from "./room.scene";

export class MainUIScene extends RoomScene {
  public static readonly LAYER_UI = "uiLayer";
  public static readonly LAYER_DIALOG = "dialogLayer";
  public static readonly LAYER_TOOLTIPS = "toolTipsLayer";
  public static readonly LAYER_MASK = "maskLayer";
  protected fps: Phaser.GameObjects.Text;
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
    this.createFPS();
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

  public update(time: number, delta: number) {
    if (this.fps) this.fps.setText(this.game.loop.actualFps.toFixed());
    //   // const orientation: string = this.mRoom.world.getSize().width > this.mRoom.world.getSize().height ? "LANDSCAPE" : "PORTRAIT";
    //   // this.sizeTF.text = "width:" + this.mRoom.world.getSize().width +
    //   //   "\n" + "height:" + this.mRoom.world.getSize().height + `\npixelRatio: ${window.devicePixelRatio} \nscene Scale: ${this.mRoom.world.scaleRatio} \nuiscale：${Math.round(this.mRoom.world.scaleRatio)}`;
  }

  public createFPS() {
    if (this.fps) {
      return;
    }
    const width = this.cameras.main.width;
    this.fps = this.add.text(width - 6 * this.render.devicePixelRatio, 10, "", { color: "#00FF00", });
    this.fps.setStroke("#000000", 1);
    this.fps.setFontFamily(Font.DEFULT_FONT);
    this.fps.setFontSize(13 * this.render.devicePixelRatio);
    this.fps.setDepth(1000);
    this.fps.setOrigin(1, 0);
  }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }

  protected onPointerDownHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {
    this.render.emitter.emit("pointerScene", SceneName.MAINUI_SCENE, currentlyOver);
  }

  protected loadVideos() {
  }

  protected onDestroy() {
    this.fps = undefined;
    super.onDestroy();
  }
}
