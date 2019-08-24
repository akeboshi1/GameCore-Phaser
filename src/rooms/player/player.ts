import { op_client } from "pixelpai_proto";
import { Element } from "../element/element";
import { DragonBonesDisplay } from "../display/DragonBones.display";
import { IElementManager } from "../element/element.manager";
import { ElementsDisplay, IDisplayInfo } from "../display/Element.display";

export class Player extends Element {
  constructor(protected mElementManager: IElementManager, parent: Phaser.GameObjects.Container) {
    super(mElementManager, parent);
    this.createDisplay();
  }

  public createDisplay(): ElementsDisplay | undefined {
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }
    let scene: Phaser.Scene = this.mElementManager.scene;
    if (scene) {
      this.mDisplay = new DragonBonesDisplay(scene);
      this.layer.add(this.mDisplay);
      return this.mDisplay;
    }
    return undefined;
  }

  public load(display: IDisplayInfo) {
    super.load(display);
  }

  public setPosition(x: number, y: number, z?: number) {
    super.setPosition(x, y, z);
  }

  public disopse() {
    super.dispose();
  }

  set layer(layer: Phaser.GameObjects.Container) {
    this.mLayer = layer;
  }

  get layer(): Phaser.GameObjects.Container {
    return this.mLayer;
  }



}