import { BasicDisplay } from "../basic/basic.display";
import { op_gameconfig, op_client } from "pixelpai_proto";

export class TerrainDiaplsy extends BasicDisplay {
  protected mDisplay: op_gameconfig.IDisplay;
  protected mData: op_client.Terrain;
  protected baseLoc: Phaser.Geom.Point;
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  public load(display: op_client.Terrain) {
    if (this.resKey) {
      if (this.scene.cache.obj.has(this.resKey)) {
      } else {
        this.scene.load.atlas(this.resKey, this.mDisplay.texturePath, this.mDisplay.dataPath);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler);
        this.scene.load.start();
      }
    }
  }

  private onLoadCompleteHandler() {
    this.setTexture(this.resKey);
  }

  private analyzeAnimations() {
    if (this.mData) {
      const animations = this.mData.animations;
    }
  }
 
  get resKey() {
    if (this.mData && this.mData.display) {
      return this.mDisplay.texturePath + this.mDisplay.dataPath;
    }
  }
}