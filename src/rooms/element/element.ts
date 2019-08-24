import { IElementManager } from "./element.manager";
import { AtlasDisplay, IDisplayInfo } from "../display/Frame.display";
import { ElementsDisplay } from "../display/Element.display";
export interface IElement {
  setPosition(x: number, y: number, z?: number): void;
}

export class Element implements IElement {
  protected mLayer: Phaser.GameObjects.Container;
  protected mDisplay: ElementsDisplay | undefined;
  constructor(protected mElementManager: IElementManager, parent: Phaser.GameObjects.Container) {
    this.layer = parent;
    this.createDisplay();
  }

  createDisplay(): ElementsDisplay | undefined {
    if (this.mDisplay) {
      this.mDisplay.destory();
    }

    let scene = this.mElementManager.scene;
    if (scene) {
      this.mDisplay = new ElementsDisplay(scene);
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

  public dispose() {
    if (this.mDisplay) {
      this.mDisplay.destory();
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
