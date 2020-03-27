import { DisplayObject } from "./display.object";
import { IRoomService } from "../room";
import { ElementDisplay } from "./element.display";
import { IFramesModel } from "./frames.model";
import { IDragonbonesModel } from "./dragonbones.model";
import { AnimationData } from "../element/sprite";
import { op_def } from "pixelpai_proto";
import { IElement } from "../element/element";

export class WallDisplay extends Phaser.GameObjects.Container implements ElementDisplay {
  protected readonly roomService: IRoomService;
  private mImage: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, roomService: IRoomService) {
    super(scene, 0, 0, undefined);
    this.roomService = roomService;
  }

  loadDisplay(texture: string, data: string) {
    // const key = texture + data;
    const key = "wall";
    if (this.scene.textures.exists(key)) {
      this.onLoadCompleteHandler();
    } else {
      this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
      this.scene.load.atlas(key, texture, data);
      this.scene.load.start();
    }
  }

  load(data: IFramesModel | IDragonbonesModel) {
  }

  changeAlpha(val?: number) {
  }

  play(animationName: AnimationData) { }

  removeFromParent(): void { }

  fadeIn(callback?: () => void) { }

  fadeOut(callback?: () => void) { }

  showNickname(val: string) { }

  setDisplayBadges(cards: op_def.IBadgeCard[]) { }

  showRefernceArea() { }

  hideRefernceArea() { }

  showEffect() { }

  private onLoadCompleteHandler() {
    this.mImage = this.scene.make.image({
      key: "wall",
      frame: "wall_up.png"
    }, false);
    this.add(this.mImage);
    this.emit("initialized", this);
  }

  get sortX(): number {
    return 0;
  }

  get sortY(): number {
    return 0;
  }

  get sortZ(): number {
    return 0;
  }

  get baseLoc(): Phaser.Geom.Point {
    return;
  }

  get element(): IElement {
    return;
  }
}
