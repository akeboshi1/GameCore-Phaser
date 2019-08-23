import { ElementManager } from "./element.manager";
import { BasicElement } from "../basic/basic.element";
import { FrameDisplay } from "../display/frames/display";
import { IDisplayInfo } from "../display/frames/display.info";

export interface IElement {

}

export class Element implements IElement{
  protected mLayer: Phaser.GameObjects.Container;
  protected mDisplay: FrameDisplay | undefined;
  constructor(private mElementManager: ElementManager, parent: Phaser.GameObjects.Container) {
    this.layer = parent;
  }

  createDisplay() {
  
  }

  public load(display: IDisplayInfo) {
    if (this.mDisplay) {
      this.mDisplay.load(display);
    }
  }

  public setPosition(x: number, y: number, z?: number) {
    if (z === undefined) z = 0;
    if (!this.mDisplay) {
      console.error("display is undefine")
      return;
    }
    this.mDisplay.x = x;
    this.mDisplay.y = y;
    this.mDisplay.z = z;
  }

  set layer(layer: Phaser.GameObjects.Container) {
    this.mLayer = layer;
  }

  get layer(): Phaser.GameObjects.Container {
    return this.mLayer;
  }
}
