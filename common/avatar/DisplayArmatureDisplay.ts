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
  private mAnimationCompleteCallBack: Function;
  private mThisArgs: any;
  protected modelId: string;

  protected mAnimationName: string;

  constructor(value: string) {
    this.modelId = value;
    this.init();
  }

  /**
   * 动画
   */
  public playAnimation(animationName: string, angleIndex: number, playTimers?: number): void {
    this.mAnimationName = animationName;
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
    this.armature.armature.animation.play(animationName + "_" + t_direct, playTimers);
    // Log.trace("[动画]", animationName + "_" + t_direct);
  }

  protected stopAnimation(): void {
    this.armature.armature.animation.stop();
  }

  private replaceArr = [];
  public replacePart(soltName: string, soltPart: string, soltDir: number, skin: number): void {
    let part: string = soltName.replace("$", soltDir.toString());
    let slot: Slot = this.armature.armature.getSlot(part);
    let key = soltPart.replace("#", skin.toString()).replace("$", soltDir.toString());
    let resKey: string = Avatar.AvatarBone.getPartName(key);
    let isCache = Globals.game.cache.checkImageKey(resKey);
    if (isCache) {
      let dis: dragonBones.PhaserSlotDisplay = new dragonBones.PhaserSlotDisplay(Globals.game, slot.display.x, slot.display.y, resKey);
      dis.anchor.set(0.5, 0.5);
      dis.smoothed = false;
      slot.replaceDisplay(dis);
      this.replaceArr.push({soltName: soltName, soltDir: soltDir});
    }
  }

  public clearParts(): void {
    if (!this.replaceArr || this.replaceArr.length === 0) {
      return ;
    }
    let len = this.replaceArr.length;
    for (let i = 0; i < len; i++) {
      this.clearPart(this.replaceArr[i].soltName, this.replaceArr[i].soltDir);
    }
    this.replaceArr.splice(0);
  }

  protected clearPart(soltName: string, soltDir: number): void {
    let part: string = soltName.replace("$", soltDir.toString());
    let slot: Slot = this.armature.armature.getSlot(part);
    slot.display.loadTexture(null);
  }

  public onClear(): void {
    this.stopAnimation();
    this.clearParts();
  }

  public onDispose(): void {
    this.onClear();
    if (this.armature) {
    this.armature.removeDBEventListener(dragonBones.EventObject.COMPLETE, this.onCompleteHandler, this);
      this.armature.destroy();
      this.armature = null;
    }
  }

  public setLoopCallBackCall(callBack: Function, thisArgs: any) {
    this.mAnimationCompleteCallBack = callBack;
    this.mThisArgs = thisArgs;
  }

  public onRecycle(): void {
    let pool: IObjectPool = this.getObjectPool(this.modelId);
    pool.free(this);
  }

  protected init(): void {
    const factory = dragonBones.PhaserFactory.factory;
    this.armature = factory.buildArmatureDisplay(GameConfig.ArmatureName, this.modelId);
    this.armature.scale.x = this.armature.scale.y = GameConst.BONES_SCALE;
    this.armature.addDBEventListener(dragonBones.EventObject.COMPLETE, this.onCompleteHandler, this);
  }

  private onCompleteHandler(e) {
    if (this.mAnimationCompleteCallBack) {
      this.mAnimationCompleteCallBack.call(this.mThisArgs);
    }
  }

  protected getObjectPool(value: string): IObjectPool {
    return Globals.ObjectPoolManager.getObjectPool("DisplayArmature" + value);
  }
}
