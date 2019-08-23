import { TerrainManager } from "./terrain.manager";
import { FrameDisplay } from "../display/frames/display";
import { Element } from "../element/element";

export class Terrain extends Element {
  protected mDisplay: FrameDisplay | undefined;

  constructor(private mTerrainManager: TerrainManager, parent: Phaser.GameObjects.Container) {
    //todo ElementManager改成接口
    super(null, parent);
  }

  public createDisplay(): FrameDisplay | undefined {
    if (this.mDisplay) {
      this.mDisplay.destroy();
    }
    
    let scene = this.mTerrainManager.scene;
    if (scene) {
      this.mDisplay = new FrameDisplay(scene);
      this.layer.add(this.mDisplay);
      return this.mDisplay;
    }
    return undefined;
  }
} 