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
import {DisplayArmatureDisplay} from "./DisplayArmatureDisplay";
import {Log} from "../../Log";
import {Load} from "../../Assets";
import { Rectangle, Matrix } from "phaser-ce";

export class BonesLoaderAvatar extends Phaser.Group implements IAnimatedObject, IDisposeObject {

    public constructor(game: Phaser.Game) {
        super(game);
    }

    public get modelLoaded(): boolean {
        return this.mModelLoaded;
    }

    private static readonly BONES_SCALE: number = 1;
    protected armatureDisplay: DisplayArmatureDisplay;
    private myModel: op_gameconfig.IAvatar;
    private myModelDirty = false;
    private mModelLoaded = false;
    private mLoadCompleteCallback: Function;
    private mLoadThisObj: any;
    private mAnimatonControlFunc: Function;
    private mAnimatonControlFuncDitry: boolean;
    private mAnimatonControlThisObj: any;
    private mHeadBitmapData: Phaser.BitmapData;
    private replaceArr = [];

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
        this.armatureDisplay.playAnimation(animationName, angleIndex);
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
        if (model.barmWeapId) {
            this.replaceArr.push({
                slot: Const.AvatarSlotType.WeapBarm,
                part: Const.AvatarPartType.WeapBarm,
                dir: 3,
                skin: model.barmWeapId
            });
            this.replaceArr.push({
                slot: Const.AvatarSlotType.WeapBarm,
                part: Const.AvatarPartType.WeapBarm,
                dir: 1,
                skin: model.barmWeapId
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
        this.closeLoadModel();
        if (this.armatureDisplay) {
          this.armatureDisplay.onRecycle();
          this.armatureDisplay = null;
        }
        this.mAnimatonControlFunc = null;
        this.mAnimatonControlThisObj = null;
        this.mAnimatonControlFuncDitry = false;
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

    public get headBitmapdata(): Phaser.BitmapData {
        if (!!this.mHeadBitmapData === false) {
            // this.mHeadBitmapData = this.game.make.bitmapData(64, 64);
            // if (this.armatureDisplay.armature) {
            //     let children = this.armatureDisplay.armature.children;
            //     for (const child of children) {
            //         console.log((<any>child).generateTexture());
            //         child.x += 30;
            //         child.y += 70;
            //     }
            //      this.armatureDisplay.armature.updateTransform();

            //     this.mHeadBitmapData = this.mHeadBitmapData.drawFull(this.armatureDisplay.armature);
            //     let sprite = this.game.make.sprite(-30, -60);
            //     sprite.loadTexture(this.mHeadBitmapData);
            //     this.add(sprite);

            // }
        }
        return this.mHeadBitmapData;
    }

    protected getObjectPool(value: string): IObjectPool {
      return Globals.ObjectPoolManager.getObjectPool("DisplayArmature" + value);
    }

    /**
     * 替换皮肤
     */
    protected replaceSkin(): void {
        for (let obj of this.replaceArr) {
            this.armatureDisplay.replacePart(obj.slot, obj.part, obj.dir, obj.skin);
        }
        this.replaceArr.splice(0);
        if (this.mHeadBitmapData) {
            this.mHeadBitmapData.destroy();
            this.mHeadBitmapData = null;
        }
    }

    protected init(): void {
        const factory = dragonBones.PhaserFactory.factory;
        let dragonBonesData = factory.getDragonBonesData(this.myModel.id);
        if (null == dragonBonesData) {
            dragonBonesData = Globals.game.cache.getItem(Avatar.AvatarBone.getSkeName(this.myModel.id), Phaser.Cache.BINARY);
            factory.parseDragonBonesData(dragonBonesData, this.myModel.id);
        }

        let pool: IObjectPool = this.getObjectPool(this.myModel.id);
        this.armatureDisplay = pool.alloc() as DisplayArmatureDisplay;
        if (this.armatureDisplay == null) {
            this.armatureDisplay =  new DisplayArmatureDisplay(this.myModel.id);
        }
        this.add(this.armatureDisplay.armature);
    }

    protected closeLoadModel(): void {
        if (this.modelLoaded) {
            this.armatureDisplay.onClear();
            this.mModelLoaded = false;
        }
        this.myModelDirty = false;
    }

    private m_LoadNum = 0;
    protected onUpdateModelUrl(): void {
        this.m_LoadNum = 0;
        let resKey = Assets.Avatar.AvatarBone.getSkeName(this.myModel.id);
        if (!Globals.game.cache.checkBinaryKey(resKey)) {
            ++this.m_LoadNum;
            let bloader = Globals.LoaderManager.createBinaryLoader(resKey, Assets.Avatar.AvatarBone.getSkeUrl(this.myModel.id));
            bloader.onLoadComplete.addOnce(this.binaryLoadCompleteHandler, this);
        }

        let len = this.replaceArr.length;
        let obj;
        for (let i = 0; i < len; i++) {
            obj = this.replaceArr[i];
            let key: string = obj.part.replace("#", obj.skin.toString()).replace("$", obj.dir.toString());
            resKey = Avatar.AvatarBone.getPartName(key);
            if (!Globals.game.cache.checkImageKey(resKey)) {
                ++this.m_LoadNum;
                let mloader = Globals.LoaderManager.createImageLoader(resKey, Avatar.AvatarBone.getPartUrl(key));
                mloader.onLoadComplete.addOnce(this.imageLoadCompleteHandler, this);
            }
        }

        if (this.m_LoadNum === 0) {
            this.modelLoadCompleteHandler();
        }
    }

    protected binaryLoadCompleteHandler(): void {
        --this.m_LoadNum;
        if (this.m_LoadNum === 0) {
            this.modelLoadCompleteHandler();
        }
    }

    protected imageLoadCompleteHandler(): void {
        --this.m_LoadNum;
        if (this.m_LoadNum === 0) {
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
}
