export class PlayerDisplay extends Phaser.GameObjects.Container {
  protected mAnimationName: string = "";
  protected mDragonbonesName: string = "";
  protected mArmatureDisplay: dragonBones.phaser.display.ArmatureDisplay | undefined;
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.dragonBonesName = "bones_human01";
  }

  protected buildDragbones() {
    if (this.mArmatureDisplay) {
      if (this.mArmatureDisplay.parentContainer) {
        this.mArmatureDisplay.parentContainer.remove(this.mArmatureDisplay);
      }
      this.mArmatureDisplay.destroy();
      this.mArmatureDisplay = null;
    }

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

  protected onLoadCompleteHandler(loader?: any, totalComplete?: number, totalFailed?: number) {
    if (this.mArmatureDisplay) {
      this.mArmatureDisplay.dbClear();
    }
    this.mArmatureDisplay = this.scene.add.armature(
      "Armature",
      "bones_human01"
    );
    this.mArmatureDisplay.animation.play("human01_run_3");

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

  public replaceSlotDisplay() {
  }
}
