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

  public load(display: IDisplayInfo, callback?: Function) {
    this.mDisplayInfo = display;
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
    this.analyzeAnimations();
    if (!this.mSprite) {
      this.mSprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, this.resKey);
      this.add(this.mSprite);
    } else {
      this.mSprite.setTexture(this.resKey);
    }
    console.log(this.resKey);
  }

  private analyzeAnimations() {
    if (this.mDisplayInfo) {
      const animations = this.mDisplayInfo.animations;
      for (const animation of animations) {
        // Didn't find a good way to create an animation with frame names without a pattern.
        let frames = [];
        animation.frameName.forEach(frame => { frames.push({ key: animation.name, frame }) })
        const config: Phaser.Types.Animations.Animation = {
          key: this.mDisplayInfo.type + "_" + animation.name,
          frames: frames,
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