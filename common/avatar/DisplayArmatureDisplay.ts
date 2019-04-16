import {IRecycleObject} from "../../base/object/interfaces/IRecycleObject";
import {GameConfig} from "../../GameConfig";
import {IObjectPool} from "../../base/pool/interfaces/IObjectPool";
import Globals from "../../Globals";
import {Const} from "../const/Const";
import {Avatar} from "../../Assets";
import GameConst = Const.GameConst;
import Slot = dragonBones.Slot;

export class DisplayArmatureDisplay implements IRecycleObject {
  public armature: dragonBones.PhaserArmatureDisplay;
  protected modelId: string;

  constructor(value: string) {
    this.modelId = value;
    this.init();
  }

  /**
   * 动画
   */
  public playAnimation(animationName: string, angleIndex: number): void {
    // console.log(this.direct);
    // Log.trace("播放动画--->" + animationName + "|" + angleIndex);
    this.armature.scale.x = GameConst.BONES_SCALE;
    let t_direct = angleIndex;
    if (angleIndex === 7) {
      t_direct = 1;
      this.armature.scale.x = -GameConst.BONES_SCALE;
    }

    if (angleIndex === 5) {
      t_direct = 3;
      this.armature.scale.x = -GameConst.BONES_SCALE;
    }
    // this.armature.animation.timeScale = 0.69;
    this.armature.armature.animation.play(animationName + "_" + t_direct);
    // Log.trace("[动画]", animationName + "_" + t_direct);
  }

  public stopAnimation(): void {
    this.armature.armature.animation.stop();
  }

  public replacePart(soltName: string, soltPart: string, soltDir: number, skin: number): void {
    let part: string = soltName.replace("$", soltDir.toString());
    let slot: Slot = this.armature.armature.getSlot(part);
    let resKey: string = Avatar.AvatarBone.getPartName(soltPart.replace("#", skin.toString())).replace("$", soltDir.toString());
    let isCache: boolean = Globals.game.cache.checkImageKey(resKey);
    if (isCache) {
      let dis: dragonBones.PhaserSlotDisplay = new dragonBones.PhaserSlotDisplay(Globals.game, slot.display.x, slot.display.y, resKey);
      dis.anchor.set(0.5, 0.5);
      dis.smoothed = false;
      slot.replaceDisplay(dis);
    }
  }

  public clearPart(soltName: string, soltDir: number): void {
    let part: string = soltName.replace("$", soltDir.toString());
    let slot: Slot = this.armature.armature.getSlot(part);
    slot.display.loadTexture(null);
  }

  public onClear(): void {
  }

  public onDispose(): void {
    if (this.armature) {
      this.armature.destroy();
      this.armature = null;
    }
  }

  public onRecycle(): void {
    let pool: IObjectPool = this.getObjectPool(this.modelId);
    pool.free(this);
  }

  protected init(): void {
    const factory = dragonBones.PhaserFactory.factory;
    this.armature = factory.buildArmatureDisplay(GameConfig.ArmatureName, this.modelId);
    this.armature.scale.x = this.armature.scale.y = GameConst.BONES_SCALE;
  }

  protected getObjectPool(value: string): IObjectPool {
    return Globals.ObjectPoolManager.getObjectPool("DisplayArmature" + value);
  }
}
