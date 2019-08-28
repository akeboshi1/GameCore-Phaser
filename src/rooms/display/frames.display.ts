import { IDisplayInfo } from "./display.info";
import { ElementDisplay } from "./element.display";

/**
 * 序列帧显示对象
 */
export class FramesDisplay extends ElementDisplay {
  public mDisplayInfo: IDisplayInfo | undefined;
  protected baseLoc: Phaser.Geom.Point;
  private mSprite: Phaser.GameObjects.Sprite;
  constructor(protected scene: Phaser.Scene) {
    super(scene);
  }

  public load(displayInfo: IDisplayInfo, callback?: () => void) {
    this.mDisplayInfo = displayInfo;
    if (!this.mDisplayInfo) return;
    if (this.resKey) {
      if (this.scene.cache.obj.has(this.resKey)) {
        this.onLoadCompleteHandler();
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

  public destroy() {

  }

  private onLoadCompleteHandler() {
    if (!this.mSprite) {
      this.mSprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, this.resKey);
      this.add(this.mSprite);
    } else {
    }
    this.mSprite.setTexture(this.resKey);
    this.makeAnimations();
    this.mSprite.play(`${this.mDisplayInfo.type}_${this.mDisplayInfo.animationName}`);
    // console.log(this.resKey);
  }

  private makeAnimations() {
    if (this.mDisplayInfo) {
      const animations = this.mDisplayInfo.animations;
      const resKey = this.resKey;
      for (const animation of animations) {
        // Didn't find a good way to create an animation with frame names without a pattern.
        const frames = [];
        animation.frameName.forEach((frame: string) => { frames.push({ key: resKey, frame }); });
        const config: Phaser.Types.Animations.Animation = {
          key: this.mDisplayInfo.type + "_" + animation.name,
          frames,
          frameRate: animation.frameRate,
          repeat: -1,
        };
        if (frames.length > 2) {
          console.log("==========");
        }
        this.scene.anims.create(config);
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
