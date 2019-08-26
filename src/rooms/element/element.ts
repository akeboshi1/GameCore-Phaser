import { IElementManager } from "./element.manager";
import { IDisplayInfo } from "../display/display.info";
import { ElementDisplay } from "../display/element.display";
export interface IElement {
  setPosition(x: number, y: number, z?: number): void;
}

export class Element implements IElement {
  protected mLayer: Phaser.GameObjects.Container;
  protected mDisplay: ElementDisplay | undefined;
  constructor(protected mElementManager: IElementManager, parent: Phaser.GameObjects.Container) {
    this.layer = parent;
    this.createDisplay();
  }

  createDisplay(): ElementDisplay | undefined {
    if (this.mDisplay) {
      this.mDisplay.destroy()
    }

    let scene = this.mElementManager.scene;
    if (scene) {
      this.mDisplay = new ElementDisplay(scene);
      this.layer.add(this.mDisplay);
      return this.mDisplay;
    }
    return undefined;
  }

  public load(display: IDisplayInfo) {
    if (this.mDisplay) {
      this.mDisplay.load(display);
      this.setPosition(display.x, display.y);
    }
  }

  public changeState(val: string) {

  }

  public getDisplay(): ElementDisplay {
    return this.mDisplay;
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

  public dispose() {
    if (this.mDisplay) {
      this.mDisplay.destroy();
      this.mDisplay = null;
    }
  }

  set layer(layer: Phaser.GameObjects.Container) {
    this.mLayer = layer;
  }

  get layer(): Phaser.GameObjects.Container {
    return this.mLayer;
  }
}
