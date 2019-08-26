
import { Element } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { Position45Manager } from "./position45.manager";
import { FramesDisplay } from "../display/frames.display";

export class Terrain extends Element {
  protected mDisplay: FramesDisplay | undefined;
  constructor(mElementManager: IElementManager, parent: Phaser.GameObjects.Container) {
    super(mElementManager, parent);
  }

  public createDisplay(): FramesDisplay | undefined {
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }

    let scene = this.mElementManager.scene;
    if (scene) {
      this.mDisplay = new FramesDisplay(scene);
      this.layer.add(this.mDisplay);
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
    if (!this.mElementManager.roomService) {
      console.error("room is undefine");
      return;
    }
    const position45 = this.mElementManager.roomService.position45Manager;
    if (!position45) {
      console.error("position is undefined");
      return;
    }
    const point = position45.transformTo90(x, y);
    this.mDisplay.x = point.x;
    this.mDisplay.y = point.y;
    this.mDisplay.z = z;
  }
} 