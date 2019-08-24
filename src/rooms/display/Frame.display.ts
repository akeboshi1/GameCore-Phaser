
import { ElementsDisplay, IDisplayInfo } from "./Element.display";

/**
 * 序列帧显示对象
 */
export class AtlasDisplay extends ElementsDisplay {
  protected baseLoc: Phaser.Geom.Point;
  protected mSprite: Phaser.GameObjects.Sprite;
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  public load(display: IDisplayInfo | undefined) {
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

  private onLoadCompleteHandler() {
    this.analyzeAnimations();
    this.x = this.mDisplayInfo.x;
    this.y = this.mDisplayInfo.y;
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

  public destory() {
    this.mDisplayInfo = null;
    if (this.parentContainer) {
      this.parentContainer.remove(this);
    }
  }
}