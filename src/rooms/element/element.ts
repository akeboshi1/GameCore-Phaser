import { ElementManager } from "./element.manager";
import { FrameDisplay } from "../display/frames/display";
import { IDisplayInfo } from "../display/frames/display.info";
export interface IElement {
  setPosition(x: number, y: number, z?: number): void;
}

export class Element implements IElement{
  protected mLayer: Phaser.GameObjects.Container;
  protected mDisplay: FrameDisplay | undefined;
  constructor(private mElementManager: ElementManager, parent: Phaser.GameObjects.Container) {
    this.layer = parent;
    this.createDisplay();
  }

  createDisplay() {
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }

    let scene = this.mElementManager.scene;
    if (scene) {
      this.mDisplay = new FrameDisplay(scene);
      this.layer.add(this.mDisplay);
      return this.mDisplay;
    }
    return undefined;
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
