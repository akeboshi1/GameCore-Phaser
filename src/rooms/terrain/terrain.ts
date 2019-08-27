
import { Element } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { Position45Manager } from "./position45.manager";
import { FramesDisplay } from "../display/frames.display";

export class Terrain extends Element {
  protected mDisplay: FramesDisplay | undefined;
  constructor(mElementManager: IElementManager) {
    super(mElementManager);
  }

  public createDisplay(): FramesDisplay | undefined {
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }

    let scene = this.mElementManager.scene;
    if (scene) {
      this.mDisplay = new FramesDisplay(scene);
      return this.mDisplay;
    }
    return undefined;
  }

  public setPosition(x: number, y: number, z?: number) {
    if (z === undefined) z = 0;
    if (!this.mDisplay) {
      console.error("display is undefine");
      return;
    }
    const roomService = this.mElementManager.roomService;
    if (!roomService) {
      console.error("room is undefine");
      return;
    }
    const point = roomService.transformTo90(new Phaser.Geom.Point(x, y));
    if (!point) {
      console.error("transform error");
      return;
    }
    this.mDisplay.x = point.x;
    this.mDisplay.y = point.y;
    this.mDisplay.z = z;
  }
} 