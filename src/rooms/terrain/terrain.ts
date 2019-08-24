import { AtlasDisplay, IDisplayInfo } from "../display/Frame.display";
import { Element } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { ElementsDisplay } from "../display/Element.display";

export class Terrain extends Element {
  protected mDisplay: AtlasDisplay | undefined;

  constructor(mElementManager: IElementManager, parent: Phaser.GameObjects.Container) {
    super(mElementManager, parent);
  }

  public createDisplay(): ElementsDisplay | undefined {
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }

    let scene = this.mElementManager.scene;
    if (scene) {
      this.mDisplay = new AtlasDisplay(scene);
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