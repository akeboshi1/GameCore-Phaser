import { BasicDisplay } from "../../basic/basic.display";
import { IDisplayInfo } from "./display.info";

/**
 * 序列帧显示对象
 */
export class FrameDisplay extends BasicDisplay {
  protected mDisplayInfo: IDisplayInfo | undefined;
  protected baseLoc: Phaser.Geom.Point;
  constructor(scene: Phaser.Scene, x?: number, y?: number) {
    super(scene, x, y);
  }

  public load(display: IDisplayInfo) {
    this.mDisplayInfo = display;
    if (!this.mDisplayInfo) return;
    if (this.resKey) {
      if (this.scene.cache.obj.has(this.resKey)) {
      } else {
        const display = this.mDisplayInfo.display;
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
    this.x = this.mDisplayInfo.x;
    this.y = this.mDisplayInfo.y;
    console.log(this.resKey);
  }

  private analyzeAnimations() {
    if (this.mDisplayInfo) {
      const animations = this.mDisplayInfo.animations;
      for (const animation of animations) {
        const config: Phaser.Types.Animations.Animation = {
          key: this.mDisplayInfo.type + "_" + animation.name,
          // @ts-ignore
          frames: this.scene.anims.generateFrameNumbers(this.mDisplayInfo.type, { frames: animation.frameName }),
          frameRate: animation.frameRate,
          repeat: -1
        }
        this.scene.anims.create(config)
      }
    }
  }

  get resKey(): string | undefined {
    if (!this.mDisplayInfo) {
      return;
    }
    const display = this.mDisplayInfo.display;
    if (display && display.texturePath && display.dataPath) {
      return display.texturePath + display.dataPath;
    }
  }
}