import {IAnimatedObject} from "../base/IAnimatedObject";
import Globals from "../Globals";
import { Const} from "../const/Const";
import {Avatar} from "../Assets";
import PhaserSlotDisplay = dragonBones.PhaserSlotDisplay;
import Slot = dragonBones.Slot;
import RoleAvatarModelVO from "../struct/RoleAvatarModelVO";

export class BonesLoaderAvatar extends Phaser.Group implements IAnimatedObject {
    private static readonly BONES_SCALE: number = 1;
    protected armature: dragonBones.PhaserArmatureDisplay;
    private myModel: RoleAvatarModelVO;
    private myModelDirty: boolean = false;
    private mModelLoaded: boolean = false;
    private mLoadCompleteCallback: Function;
    private mLoadThisObj: any;
    private mAnimatonControlFunc: Function;
    private mAnimatonControlFuncDitry: boolean;
    private mAnimatonControlThisObj: any;
    private replaceArr = [];

    public constructor(game: Phaser.Game) {
        super(game);
        this.init();
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
        this.armature.animation.play(animationName + "_" + t_direct);
    }

    /**
     * 替换皮肤
     */
    public replaceSkin(): void {
        for (let obj of this.replaceArr) {
            this.replacePart(obj.slot, obj.part, obj.dir, obj.skin);
        }
        this.replaceArr.splice(0);
    }

    public loadModel(model: RoleAvatarModelVO, thisObj: any, onLoadStart: Function = null, onLoadComplete: Function = null): void {
        if (this.myModel.sign !== model.sign) {

            this.closeLoadModel();
            this.myModel = model;

            if (model.body_base_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.BodyBase, part: Const.AvatarPartType.BodyBase, dir: 3, skin: model.body_base_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BodyBase, part: Const.AvatarPartType.BodyBase, dir: 1, skin: model.body_base_id});
            }

            if (model.body_spec_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.BodySpec, part: Const.AvatarPartType.BodySpec, dir: 3, skin: model.body_spec_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BodySpec, part: Const.AvatarPartType.BodySpec, dir: 1, skin: model.body_spec_id});
            }

            if (model.body_wing_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.BodyWing, part: Const.AvatarPartType.BodyWing, dir: 3, skin: model.body_wing_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BodyWing, part: Const.AvatarPartType.BodyWing, dir: 1, skin: model.body_wing_id});
            }

            if (model.body_tail_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.BodyTail, part: Const.AvatarPartType.BodyTail, dir: 3, skin: model.body_tail_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BodyTail, part: Const.AvatarPartType.BodyTail, dir: 1, skin: model.body_tail_id});
            }

            if (model.body_cost_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.BodyCost, part: Const.AvatarPartType.BodyCost, dir: 3, skin: model.body_cost_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BodyCost, part: Const.AvatarPartType.BodyCost, dir: 1, skin: model.body_cost_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BodyCostDres, part: Const.AvatarPartType.BodyCostDres, dir: 3, skin: model.body_cost_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BodyCostDres, part: Const.AvatarPartType.BodyCostDres, dir: 1, skin: model.body_cost_id});
            }

            if (model.farm_base_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.FarmBase, part: Const.AvatarPartType.FarmBase, dir: 3, skin: model.farm_base_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.FarmBase, part: Const.AvatarPartType.FarmBase, dir: 1, skin: model.farm_base_id});
            }

            if (model.farm_spec_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.FarmSpec, part: Const.AvatarPartType.FarmSpec, dir: 3, skin: model.farm_spec_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.FarmSpec, part: Const.AvatarPartType.FarmSpec, dir: 1, skin: model.farm_spec_id});
            }

            if (model.farm_cost_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.FarmCost, part: Const.AvatarPartType.FarmCost, dir: 3, skin: model.farm_cost_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.FarmCost, part: Const.AvatarPartType.FarmCost, dir: 1, skin: model.farm_cost_id});
            }

            if (model.barm_base_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.BarmBase, part: Const.AvatarPartType.BarmBase, dir: 3, skin: model.barm_base_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BarmBase, part: Const.AvatarPartType.BarmBase, dir: 1, skin: model.barm_base_id});
            }

            if (model.barm_spec_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.BarmSpec, part: Const.AvatarPartType.BarmSpec, dir: 3, skin: model.barm_spec_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BarmSpec, part: Const.AvatarPartType.BarmSpec, dir: 1, skin: model.barm_spec_id});
            }

            if (model.barm_cost_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.BarmCost, part: Const.AvatarPartType.BarmCost, dir: 3, skin: model.barm_cost_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BarmCost, part: Const.AvatarPartType.BarmCost, dir: 1, skin: model.barm_cost_id});
            }

            if (model.bleg_base_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.BlegBase, part: Const.AvatarPartType.BlegBase, dir: 3, skin: model.bleg_base_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BlegBase, part: Const.AvatarPartType.BlegBase, dir: 1, skin: model.bleg_base_id});
            }

            if (model.bleg_spec_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.BlegSpec, part: Const.AvatarPartType.BlegSpec, dir: 3, skin: model.bleg_spec_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BlegSpec, part: Const.AvatarPartType.BlegSpec, dir: 1, skin: model.bleg_spec_id});
            }

            if (model.bleg_cost_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.BlegCost, part: Const.AvatarPartType.BlegCost, dir: 3, skin: model.bleg_cost_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.BlegCost, part: Const.AvatarPartType.BlegCost, dir: 1, skin: model.bleg_cost_id});
            }

            if (model.fleg_base_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.FlegBase, part: Const.AvatarPartType.FlegBase, dir: 3, skin: model.fleg_base_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.FlegBase, part: Const.AvatarPartType.FlegBase, dir: 1, skin: model.fleg_base_id});
            }

            if (model.fleg_spec_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.FlegSpec, part: Const.AvatarPartType.FlegSpec, dir: 3, skin: model.fleg_spec_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.FlegSpec, part: Const.AvatarPartType.FlegSpec, dir: 1, skin: model.fleg_spec_id});
            }

            if (model.fleg_cost_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.FlegCost, part: Const.AvatarPartType.FlegCost, dir: 3, skin: model.fleg_cost_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.FlegCost, part: Const.AvatarPartType.FlegCost, dir: 1, skin: model.fleg_cost_id});
            }

            if (model.head_base_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadBase, part: Const.AvatarPartType.HeadBase, dir: 3, skin: model.head_base_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadBase, part: Const.AvatarPartType.HeadBase, dir: 1, skin: model.head_base_id});
            }

            if (model.head_hair_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadHair, part: Const.AvatarPartType.HeadHair, dir: 3, skin: model.head_hair_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadHair, part: Const.AvatarPartType.HeadHair, dir: 1, skin: model.head_hair_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadHairBack, part: Const.AvatarPartType.HeadHairBack, dir: 3, skin: model.head_hair_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadHairBack, part: Const.AvatarPartType.HeadHairBack, dir: 1, skin: model.head_hair_id});
            }

            if (model.head_hats_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadHats, part: Const.AvatarPartType.HeadHats, dir: 3, skin: model.head_hats_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadHats, part: Const.AvatarPartType.HeadHats, dir: 1, skin: model.head_hats_id});
            }

            if (model.head_spec_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadSpec, part: Const.AvatarPartType.HeadSpec, dir: 3, skin: model.head_spec_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadSpec, part: Const.AvatarPartType.HeadSpec, dir: 1, skin: model.head_spec_id});
            }

            if (model.head_eyes_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadEyes, part: Const.AvatarPartType.HeadEyes, dir: 3, skin: model.head_eyes_id});
            }

            if (model.head_mous_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadMous, part: Const.AvatarPartType.HeadMous, dir: 3, skin: model.head_mous_id});
            }

            if (model.head_mask_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.HeadMask, part: Const.AvatarPartType.HeadMask, dir: 3, skin: model.head_mask_id});
            }

            if (model.farm_shld_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.ShldFarm, part: Const.AvatarPartType.ShldFarm, dir: 3, skin: model.farm_shld_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.ShldFarm, part: Const.AvatarPartType.ShldFarm, dir: 1, skin: model.farm_shld_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.ShldBarm, part: Const.AvatarPartType.ShldBarm, dir: 3, skin: model.farm_shld_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.ShldBarm, part: Const.AvatarPartType.ShldBarm, dir: 1, skin: model.farm_shld_id});
            }

            if (model.farm_weap_id > 0) {
                this.replaceArr.push({slot: Const.AvatarSlotType.WeapFarm, part: Const.AvatarPartType.WeapFarm, dir: 3, skin: model.farm_weap_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.WeapFarm, part: Const.AvatarPartType.WeapFarm, dir: 1, skin: model.farm_weap_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.WeapBarm, part: Const.AvatarPartType.WeapBarm, dir: 3, skin: model.farm_weap_id});
                this.replaceArr.push({slot: Const.AvatarSlotType.WeapBarm, part: Const.AvatarPartType.WeapBarm, dir: 1, skin: model.farm_weap_id});
            }

            if (onLoadStart !== null) {
                onLoadStart.apply(thisObj);
            }

            this.mLoadCompleteCallback = onLoadComplete;
            this.mLoadThisObj = thisObj;
            this.myModelDirty = true;
        }
    }

    public dispose(): void {
        this.closeLoadModel();
        this.mLoadCompleteCallback = null;
    }

    public onFrame(deltaTime: number): void {
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

    protected init(): void {
        this.myModel = new RoleAvatarModelVO();

        let dragonbonesData = Globals.game.cache.getItem(Avatar.AvatarBone.getSkeName(), Phaser.Cache.BINARY);

        const factory = dragonBones.PhaserFactory.factory;
        factory.parseDragonBonesData(dragonbonesData);

        this.armature = factory.buildArmatureDisplay("Armature", "bones_allblue");
        this.armature.scale.x = this.armature.scale.y = BonesLoaderAvatar.BONES_SCALE;
        this.armature.armature.cacheFrameRate = 0;

        this.add(this.armature);
    }

    protected closeLoadModel(): void {
        if (this.modelLoaded) {
            this.mModelLoaded = false;
        }
        this.replaceArr = [];
        this.myModelDirty = false;
    }

    protected onUpdateModelUrl(): void {
        let loadNum: number = 0;

        for (let obj of this.replaceArr) {
            let key: string = obj.part.replace("#", Globals.Tool.caclNumStr(obj.skin)).replace("$", obj.dir);
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

        this.replaceSkin();

        this.invalidAnimationControlFunc();
    }

    private replacePart(soltName: string, soltPart: string, soltDir: number, skin: number): void {
        let part: string = soltName.replace("$", soltDir.toString());
        let slot: Slot = this.armature.armature.getSlot(part);
        let partStr: string = Globals.Tool.caclNumStr(skin);
        let resKey: string = Avatar.AvatarBone.getPartName(soltPart.replace("#", partStr)).replace("$", soltDir.toString());
        let isCache: boolean = Globals.game.cache.checkImageKey(resKey);
        if (isCache) {
            let dis: PhaserSlotDisplay = new PhaserSlotDisplay(Globals.game, slot.display.x, slot.display.y, resKey);
            dis.anchor.set(0.5, 0.5);
            dis.smoothed = false;
            slot.replaceDisplay(dis);
        }
    }
}
