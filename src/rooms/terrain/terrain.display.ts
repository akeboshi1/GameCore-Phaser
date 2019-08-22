import { BasicDisplay } from "../basic/basic.display";
import { op_gameconfig, op_client } from "pixelpai_proto";

export class TerrainDiaplsy extends BasicDisplay {
  protected mData: op_client.ITerrain | undefined;
  protected baseLoc: Phaser.Geom.Point;
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  public load(display: op_client.ITerrain) {
    this.mData = display;
    if (!this.mData) return;
    if (this.resKey) {
      if (this.scene.cache.obj.has(this.resKey)) {
      } else {
        const display = this.mData.display;
        if (display) {
          this.scene.load.atlas(this.resKey, CONFIG.osd + display.texturePath, CONFIG.osd + display.dataPath);
          this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
          this.scene.load.start();
        } else {
          console.error("display is undefined");
        }
      }
    }
  }

  private onLoadCompleteHandler() {
    this.analyzeAnimations();
    this.setTexture(this.resKey);
    this.x = this.mData.x;
    this.y = this.mData.y;
    console.log(this.resKey);
  }

  private analyzeAnimations() {
    if (this.mData) {
      const animations = this.mData.animations;
      for (const animation of animations) {
        const config: Phaser.Types.Animations.Animation = {
          key: this.mData.type + "_" + animation.name,
          // @ts-ignore
          frames: this.scene.anims.generateFrameNumbers(this.mData.type, { frames: animation.frameName }),
          frameRate: animation.frameRate,
          repeat: -1
        }
        this.scene.anims.create(config)
      }
    }
  }
 
  get resKey(): string | undefined {
    if (!this.mData) {
      return;
    }
    const display = this.mData.display;
    if (display && display.texturePath && display.dataPath) {
      return display.texturePath + display.dataPath;
    }
  }
}