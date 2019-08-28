import { IElementManager } from "./element.manager";
import { IDisplayInfo } from "../display/display.info";
import { ElementDisplay } from "../display/element.display";
import { DragonBonesDisplay } from "../display/dragonBones.display";
import { FramesDisplay } from "../display/frames.display";
export interface IElement {
  setPosition(x: number, y: number, z?: number): void;
}

export class Element implements IElement {
  protected mLayer: Phaser.GameObjects.Container;
  protected mDisplay: ElementDisplay | undefined;
  constructor(protected mElementManager: IElementManager) {
    // this.createDisplay();
  }

  // createDisplay(): ElementDisplay | undefined {
  //   if (this.mDisplay) {
  //     this.mDisplay.destroy()
  //   }
  //   let scene = this.mElementManager.scene;
  //   if (scene) {
  //     this.mDisplay = new ElementDisplay(scene);
  //     return this.mDisplay;
  //   }
  //   return undefined;
  // }

  public load(displayInfo: IDisplayInfo, callBack?: () => void) {

    if (this.mDisplay) {
      this.mDisplay.destroy();
    }
    const scene = this.mElementManager.scene;
    if (scene) {
      if (displayInfo.avatar) {
        this.mDisplay = new DragonBonesDisplay(scene);
      } else if (displayInfo.animations) {
        this.mDisplay = new FramesDisplay(scene);
      }
      this.mDisplay.load(displayInfo);
      this.setPosition(displayInfo.x, displayInfo.y);
    }
    if (callBack) callBack();
  }

  public changeState(val: string) {

  }

  public getDisplay(): ElementDisplay {
    return this.mDisplay;
  }

  public setPosition(x: number, y: number, z?: number) {
    if (z === undefined) z = 0;
    if (!this.mDisplay) {
      console.error("display is undefine");
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
}
