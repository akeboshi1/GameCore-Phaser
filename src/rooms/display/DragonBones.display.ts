
import { IDisplayInfo } from "./Frame.display";
import { ElementsDisplay } from "./Element.display";

export class DragonBonesDisplay extends ElementsDisplay {
  protected mAnimationName: string = "";
  protected mDragonbonesName: string = "";
  protected mArmatureDisplay: dragonBones.phaser.display.ArmatureDisplay | undefined;

  protected mData: IDisplayInfo | undefined;
  constructor(scene: Phaser.Scene) {
    super(scene);
    //this.dragonBonesName = "bones_human01";
  }

  protected buildDragbones() {
    if (this.scene.cache.custom.dragonbone.get(this.dragonBonesName)) {
      this.onLoadCompleteHandler();
    } else {
      const res = "resources/dragonbones";
      this.scene.load.dragonbone(
        this.dragonBonesName,
        `${res}/${this.dragonBonesName}_tex.png`,
        `${res}/${this.dragonBonesName}_tex.json`,
        `${res}/${this.dragonBonesName}_ske.dbbin`,
        null,
        null,
        { responseType: "arraybuffer" }
      );
      this.scene.load.once(
        Phaser.Loader.Events.COMPLETE,
        this.onLoadCompleteHandler,
        this
      );
      this.scene.load.start();
    }
  }

  public load(display: IDisplayInfo) {
    this.mData = display;
    if (!this.mData) return;
    if (this.dragonBonesName) {
      if (this.scene.cache.obj.has(this.dragonBonesName)) {

      } else {
        this.dragonBonesName = this.mData.avater.id;
      }
    }
  }

  protected onLoadCompleteHandler(loader?: any, totalComplete?: number, totalFailed?: number) {
    if (this.mArmatureDisplay) {
      this.mArmatureDisplay.dbClear();
    }
    this.mArmatureDisplay = this.scene.add.armature(
      "Armature",
      this.dragonBonesName,
    );
    this.mArmatureDisplay.animation.play("idle_" + this.mData.avatarDir);

    this.mArmatureDisplay.x = this.scene.cameras.main.centerX;
    this.mArmatureDisplay.y = this.scene.cameras.main.centerY + 200;
  }

  set dragonBonesName(val: string) {
    if (this.mDragonbonesName !== val) {
      this.mDragonbonesName = val;
      this.buildDragbones();
    }
  }

  get dragonBonesName(): string {
    return this.mDragonbonesName;
  }

  set play(val: string) {
    if (this.mAnimationName !== val) {
      if (this.mArmatureDisplay) {
        this.mArmatureDisplay.animation.play(val);
      }
    }
  }

  /**
   * 按照格位换装
   * @param slotName 插槽名
   * @param displayName 显示对象资源名
   */
  public replaceSlotDisplay(slotName: string, displayName: string) {
    const factory: dragonBones.phaser.Factory = ((<any>this.scene).dragonBones as dragonBones.phaser.Factory);
    factory.replaceSlotDisplay(this.dragonBonesName, this.mAnimationName, slotName, displayName, this.mArmatureDisplay.armature.getSlot(slotName));
  }

  public destory() {
    this.mData = null;
    if (this.mArmatureDisplay) {
      this.mArmatureDisplay.dispose(true);
      this.mArmatureDisplay = null;
    }
  }




}
