import {IAnimatedObject} from "../../base/IAnimatedObject";
import Globals from "../../Globals";
import {Const} from "../const/Const";
import * as Assets from "../../Assets";
import {Avatar} from "../../Assets";
import {IDisposeObject} from "../../base/object/interfaces/IDisposeObject";
import {IRecycleObject} from "../../base/object/interfaces/IRecycleObject";
import Slot = dragonBones.Slot;
import {GameConfig} from "../../GameConfig";
import {IObjectPool} from "../../base/pool/interfaces/IObjectPool";
import {op_gameconfig} from "pixelpai_proto";

export class BonesLoaderAvatar extends Phaser.Group implements IAnimatedObject, IDisposeObject, IRecycleObject {
    private static readonly BONES_SCALE: number = 1;
    protected armature: dragonBones.PhaserArmatureDisplay;
    private myModel: op_gameconfig.IAvatar;
    private myModelDirty = false;
    private mModelLoaded = false;
    private mLoadCompleteCallback: Function;
    private mLoadThisObj: any;
    private mAnimatonControlFunc: Function;
    private mAnimatonControlFuncDitry: boolean;
    private mAnimatonControlThisObj: any;
    private replaceArr = [];

    public constructor(game: Phaser.Game) {
        super(game);
    }

    public get modelLoaded(): boolean {
        return this.mModelLoaded;
    }

    public setAnimationControlFunc(value: Function, thisObj: any): void {
        this.mAnimatonControlFunc = value;
        this.mAnimatonControlThisObj = thisObj;
        this.mAnimatonControlFuncDitry = true;
    }

    public invalidAnimationControlFunc(): void {
        this.mAnimatonControlFuncDitry = true;
    }

    /**
     * 动画
     */
    public playAnimation(animationName: string, angleIndex: number): void {
        // console.log(this.direct);
        // Log.trace("播放动画--->" + animationName + "|" + angleIndex);
        this.armature.scale.x = BonesLoaderAvatar.BONES_SCALE;
        let t_direct = angleIndex;
        if (angleIndex === 7) {
            t_direct = 1;
            this.armature.scale.x = -BonesLoaderAvatar.BONES_SCALE;
        }

        if (angleIndex === 5) {
            t_direct = 3;
            this.armature.scale.x = -BonesLoaderAvatar.BONES_SCALE;
        }
        // this.armature.animation.timeScale = 0.69;
        this.armature.animation.play(animationName + "_" + t_direct);
        // Log.trace("[动画]", animationName + "_" + t_direct);
    }

    public loadModel(model: op_gameconfig.IAvatar, thisObj: any, onLoadStart: Function = null, onLoadComplete: Function = null): void {
        this.closeLoadModel();
        this.myModel = model;

        if (model.bodyBaseId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodyBase,
                part: Const.AvatarPartType.BodyBase,
                dir: 3,
                skin: model.bodyBaseId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodyBase,
                part: Const.AvatarPartType.BodyBase,
                dir: 1,
                skin: model.bodyBaseId
            });
        }

        if (model.bodySpecId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodySpec,
                part: Const.AvatarPartType.BodySpec,
                dir: 3,
                skin: model.bodySpecId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodySpec,
                part: Const.AvatarPartType.BodySpec,
                dir: 1,
                skin: model.bodySpecId
            });
        }

        if (model.bodyWingId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodyWing,
                part: Const.AvatarPartType.BodyWing,
                dir: 3,
                skin: model.bodyWingId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodyWing,
                part: Const.AvatarPartType.BodyWing,
                dir: 1,
                skin: model.bodyWingId
            });
        }

        if (model.bodyTailId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodyTail,
                part: Const.AvatarPartType.BodyTail,
                dir: 3,
                skin: model.bodyTailId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodyTail,
                part: Const.AvatarPartType.BodyTail,
                dir: 1,
                skin: model.bodyTailId
            });
        }

        if (model.bodyCostId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodyCost,
                part: Const.AvatarPartType.BodyCost,
                dir: 3,
                skin: model.bodyCostId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodyCost,
                part: Const.AvatarPartType.BodyCost,
                dir: 1,
                skin: model.bodyCostId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodyCostDres,
                part: Const.AvatarPartType.BodyCostDres,
                dir: 3,
                skin: model.bodyCostId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BodyCostDres,
                part: Const.AvatarPartType.BodyCostDres,
                dir: 1,
                skin: model.bodyCostId
            });
        }

        if (model.farmBaseId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FarmBase,
                part: Const.AvatarPartType.FarmBase,
                dir: 3,
                skin: model.farmBaseId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FarmBase,
                part: Const.AvatarPartType.FarmBase,
                dir: 1,
                skin: model.farmBaseId
            });
        }

        if (model.farmSpecId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FarmSpec,
                part: Const.AvatarPartType.FarmSpec,
                dir: 3,
                skin: model.farmSpecId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FarmSpec,
                part: Const.AvatarPartType.FarmSpec,
                dir: 1,
                skin: model.farmSpecId
            });
        }

        if (model.farmCostId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FarmCost,
                part: Const.AvatarPartType.FarmCost,
                dir: 3,
                skin: model.farmCostId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FarmCost,
                part: Const.AvatarPartType.FarmCost,
                dir: 1,
                skin: model.farmCostId
            });
        }

        if (model.barmBaseId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BarmBase,
                part: Const.AvatarPartType.BarmBase,
                dir: 3,
                skin: model.barmBaseId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BarmBase,
                part: Const.AvatarPartType.BarmBase,
                dir: 1,
                skin: model.barmBaseId
            });
        }

        if (model.barmSpecId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BarmSpec,
                part: Const.AvatarPartType.BarmSpec,
                dir: 3,
                skin: model.barmSpecId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BarmSpec,
                part: Const.AvatarPartType.BarmSpec,
                dir: 1,
                skin: model.barmSpecId
            });
        }

        if (model.barmCostId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BarmCost,
                part: Const.AvatarPartType.BarmCost,
                dir: 3,
                skin: model.barmCostId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BarmCost,
                part: Const.AvatarPartType.BarmCost,
                dir: 1,
                skin: model.barmCostId
            });
        }

        if (model.blegBaseId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BlegBase,
                part: Const.AvatarPartType.BlegBase,
                dir: 3,
                skin: model.blegBaseId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BlegBase,
                part: Const.AvatarPartType.BlegBase,
                dir: 1,
                skin: model.blegBaseId
            });
        }

        if (model.blegSpecId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BlegSpec,
                part: Const.AvatarPartType.BlegSpec,
                dir: 3,
                skin: model.blegSpecId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BlegSpec,
                part: Const.AvatarPartType.BlegSpec,
                dir: 1,
                skin: model.blegSpecId
            });
        }

        if (model.blegCostId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BlegCost,
                part: Const.AvatarPartType.BlegCost,
                dir: 3,
                skin: model.blegCostId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.BlegCost,
                part: Const.AvatarPartType.BlegCost,
                dir: 1,
                skin: model.blegCostId
            });
        }

        if (model.flegBaseId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FlegBase,
                part: Const.AvatarPartType.FlegBase,
                dir: 3,
                skin: model.flegBaseId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FlegBase,
                part: Const.AvatarPartType.FlegBase,
                dir: 1,
                skin: model.flegBaseId
            });
        }

        if (model.flegSpecId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FlegSpec,
                part: Const.AvatarPartType.FlegSpec,
                dir: 3,
                skin: model.flegSpecId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FlegSpec,
                part: Const.AvatarPartType.FlegSpec,
                dir: 1,
                skin: model.flegSpecId
            });
        }

        if (model.flegCostId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FlegCost,
                part: Const.AvatarPartType.FlegCost,
                dir: 3,
                skin: model.flegCostId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.FlegCost,
                part: Const.AvatarPartType.FlegCost,
                dir: 1,
                skin: model.flegCostId
            });
        }

        if (model.headBaseId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadBase,
                part: Const.AvatarPartType.HeadBase,
                dir: 3,
                skin: model.headBaseId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadBase,
                part: Const.AvatarPartType.HeadBase,
                dir: 1,
                skin: model.headBaseId
            });
        }

        if (model.headHairId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadHair,
                part: Const.AvatarPartType.HeadHair,
                dir: 3,
                skin: model.headHairId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadHair,
                part: Const.AvatarPartType.HeadHair,
                dir: 1,
                skin: model.headHairId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadHairBack,
                part: Const.AvatarPartType.HeadHairBack,
                dir: 3,
                skin: model.headHairId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadHairBack,
                part: Const.AvatarPartType.HeadHairBack,
                dir: 1,
                skin: model.headHairId
            });
        }

        if (model.headHatsId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadHats,
                part: Const.AvatarPartType.HeadHats,
                dir: 3,
                skin: model.headHatsId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadHats,
                part: Const.AvatarPartType.HeadHats,
                dir: 1,
                skin: model.headHatsId
            });
        }

        if (model.headSpecId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadSpec,
                part: Const.AvatarPartType.HeadSpec,
                dir: 3,
                skin: model.headSpecId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadSpec,
                part: Const.AvatarPartType.HeadSpec,
                dir: 1,
                skin: model.headSpecId
            });
        }

        if (model.headEyesId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadEyes,
                part: Const.AvatarPartType.HeadEyes,
                dir: 3,
                skin: model.headEyesId
            });
        }

        if (model.headMousId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadMous,
                part: Const.AvatarPartType.HeadMous,
                dir: 3,
                skin: model.headMousId
            });
        }

        if (model.headMaskId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.HeadMask,
                part: Const.AvatarPartType.HeadMask,
                dir: 3,
                skin: model.headMaskId
            });
        }

        if (model.farmShldId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.ShldFarm,
                part: Const.AvatarPartType.ShldFarm,
                dir: 3,
                skin: model.farmShldId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.ShldFarm,
                part: Const.AvatarPartType.ShldFarm,
                dir: 1,
                skin: model.farmShldId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.ShldBarm,
                part: Const.AvatarPartType.ShldBarm,
                dir: 3,
                skin: model.farmShldId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.ShldBarm,
                part: Const.AvatarPartType.ShldBarm,
                dir: 1,
                skin: model.farmShldId
            });
        }

        if (model.farmWeapId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.WeapFarm,
                part: Const.AvatarPartType.WeapFarm,
                dir: 3,
                skin: model.farmWeapId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.WeapFarm,
                part: Const.AvatarPartType.WeapFarm,
                dir: 1,
                skin: model.farmWeapId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.WeapBarm,
                part: Const.AvatarPartType.WeapBarm,
                dir: 3,
                skin: model.farmWeapId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.WeapBarm,
                part: Const.AvatarPartType.WeapBarm,
                dir: 1,
                skin: model.farmWeapId
            });
        }

        if (onLoadStart !== null) {
            onLoadStart.apply(thisObj);
        }

        this.mLoadCompleteCallback = onLoadComplete;
        this.mLoadThisObj = thisObj;
        this.myModelDirty = true;
    }

    public onClear(): void {
        this.closeLoadModel();
    }

    public onDispose(): void {
        this.onClear();
    }

    public onFrame(): void {
        if (this.myModelDirty) {
            this.onUpdateModelUrl();
            this.myModelDirty = false;
        }

        if (this.modelLoaded) {
            if (this.mAnimatonControlFuncDitry) {
                if (this.mAnimatonControlFunc != null) {
                    this.mAnimatonControlFunc.call(this.mAnimatonControlThisObj, this);
                }
                this.mAnimatonControlFuncDitry = false;
            }
        }
    }

    public onRecycle(): void {
    }

    /**
     * 替换皮肤
     */
    protected replaceSkin(): void {
        for (let obj of this.replaceArr) {
            this.replacePart(obj.slot, obj.part, obj.dir, obj.skin);
        }
        this.replaceArr.splice(0);
    }

    protected getArmaturePool(value: string): IObjectPool {
        let op = Globals.ObjectPoolManager.getObjectPool("PhaserArmatureDisplay_" + value);
        return op;
    }

    protected init(): void {
        const factory = dragonBones.PhaserFactory.factory;
        let dragonBonesData = factory.getDragonBonesData(this.myModel.id);
        if (null == dragonBonesData) {
            dragonBonesData = Globals.game.cache.getItem(Avatar.AvatarBone.getSkeName(this.myModel.id), Phaser.Cache.BINARY);
            factory.parseDragonBonesData(dragonBonesData, this.myModel.id);
        }

        this.armature = this.getArmaturePool(this.myModel.id).alloc();
        if (null == this.armature) {
            this.armature = factory.buildArmatureDisplay(GameConfig.ArmatureName, this.myModel.id);
            this.armature.scale.x = this.armature.scale.y = BonesLoaderAvatar.BONES_SCALE;
        }
        this.add(this.armature);
    }

    protected closeLoadModel(): void {
        if (this.modelLoaded) {
            if (this.armature) {
                this.kill();
                if (this.armature.parent) {
                    this.armature.parent.removeChild(this.armature);
                }
                this.getArmaturePool(this.myModel.id).free(this.armature);
                this.armature = null;
            }
            this.mModelLoaded = false;
        }
        this.replaceArr = [];
        this.myModelDirty = false;
    }

    protected onUpdateModelUrl(): void {
        let loadNum = 0;

        if (!Globals.game.cache.checkBinaryKey(Assets.Avatar.AvatarBone.getSkeName(this.myModel.id))) {
            this.game.load.binary(Assets.Avatar.AvatarBone.getSkeName(this.myModel.id), Assets.Avatar.AvatarBone.getSkeUrl(this.myModel.id));
            ++loadNum;
        }

        for (let obj of this.replaceArr) {
            let key: string = obj.part.replace("#", obj.skin).replace("$", obj.dir);
            if (Globals.game.cache.checkImageKey(Avatar.AvatarBone.getPartName(key))) continue;
            Globals.game.load.image(Avatar.AvatarBone.getPartName(key), Avatar.AvatarBone.getPartUrl(key));
            ++loadNum;
        }

        if (loadNum > 0) {
            Globals.game.load.onLoadComplete.addOnce(this.modelLoadCompleteHandler, this);
            Globals.game.load.start();
        } else {
            this.modelLoadCompleteHandler();
        }
    }

    protected modelLoadCompleteHandler(): void {
        this.mModelLoaded = true;

        if (this.mLoadCompleteCallback != null) {
            let cb: Function = this.mLoadCompleteCallback;
            this.mLoadCompleteCallback = null;
            cb.apply(this.mLoadThisObj);
            this.mLoadThisObj = null;
        }

        this.init();

        this.replaceSkin();

        this.invalidAnimationControlFunc();
    }

    private replacePart(soltName: string, soltPart: string, soltDir: number, skin: number): void {
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
}
