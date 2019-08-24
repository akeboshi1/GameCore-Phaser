import { AtlasDisplay } from "../display/atlas/display";
import { Element } from "./element";
import { IElementManager } from "./element.manager";

export class Terrain extends Element {
  protected mDisplay: AtlasDisplay | undefined;

  constructor(mElementManager: IElementManager, parent: Phaser.GameObjects.Container) {
    super(mElementManager, parent);
  }

  public createDisplay(): AtlasDisplay | undefined {
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
} 