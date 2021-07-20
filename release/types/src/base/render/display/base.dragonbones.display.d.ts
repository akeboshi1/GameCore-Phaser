import { IAvatar, IDragonbonesModel, RunningAnimation, DisplayField, IResPath } from "structure";
import { BaseDisplay } from "./base.display";
export declare enum AvatarSlotNameTemp {
    BodyCostDres = "body_cost_dres_$",
    BodyCost = "body_cost_$",
    BodyTail = "body_tail_$",
    BodyWing = "body_wing_$",
    BodyBase = "body_base_$",
    BodySpec = "body_spec_$",
    BodyScar = "body_scar_$",
    BodyCloa = "body_cloa_$",
    FlegSpec = "fleg_spec_$",
    FlegBase = "fleg_base_$",
    FlegCost = "fleg_cost_$",
    BarmSpec = "barm_spec_$",
    BarmBase = "barm_base_$",
    BarmCost = "barm_cost_$",
    BarmWeap = "barm_weap_$",
    ShldBarm = "barm_shld_$",
    BlegSpec = "bleg_spec_$",
    BlegBase = "bleg_base_$",
    BlegCost = "bleg_cost_$",
    FarmSpec = "farm_spec_$",
    FarmBase = "farm_base_$",
    FarmCost = "farm_cost_$",
    ShldFarm = "farm_shld_$",
    FarmWeap = "farm_weap_$",
    HeadSpec = "head_spec_$",
    HeadMask = "head_mask_$",
    HeadEyes = "head_eyes_$",
    HeadBase = "head_base_$",
    HeadHairBack = "head_hair_back_$",
    HeadMous = "head_mous_$",
    HeadHair = "head_hair_$",
    HeadHats = "head_hats_$",
    HeadFace = "head_face_$",
    HeadChin = "head_chin_$"
}
export declare enum AvatarPartNameTemp {
    BarmBase = "barm_base_#_$",
    BarmCost = "barm_cost_#_$",
    BarmSpec = "barm_spec_#_$",
    BlegBase = "bleg_base_#_$",
    BlegCost = "bleg_cost_#_$",
    BlegSpec = "bleg_spec_#_$",
    BodyBase = "body_base_#_$",
    BodyCost = "body_cost_#_$",
    BodyCostDres = "body_cost_dres_#_$",
    BodySpec = "body_spec_#_$",
    BodyTail = "body_tail_#_$",
    BodyWing = "body_wing_#_$",
    BodyScar = "body_scar_#_$",
    BodyCloa = "body_cloa_#_$",
    FarmBase = "farm_base_#_$",
    FarmCost = "farm_cost_#_$",
    FarmSpec = "farm_spec_#_$",
    FlegBase = "fleg_base_#_$",
    FlegCost = "fleg_cost_#_$",
    FlegSpec = "fleg_spec_#_$",
    HeadBase = "head_base_#_$",
    HeadEyes = "head_eyes_#_$",
    HeadHair = "head_hair_#_$",
    HeadHairBack = "head_hair_back_#_$",
    HeadHats = "head_hats_#_$",
    HeadFace = "head_face_#_$",
    HeadMask = "head_mask_#_$",
    HeadMous = "head_mous_#_$",
    HeadSpec = "head_spec_#_$",
    HeadChin = "head_chin_#_$",
    ShldFarm = "farm_shld_#_$",
    WeapFarm = "farm_weap_#_$",
    ShldBarm = "barm_shld_#_$",
    WeapBarm = "barm_weap_#_$"
}
/**
 * 龙骨显示对象
 */
export declare class BaseDragonbonesDisplay extends BaseDisplay {
    private pathObj;
    protected mArmatureName: string;
    protected mResourceName: string;
    protected mArmatureDisplay: dragonBones.phaser.display.ArmatureDisplay | undefined;
    protected mFadeTween: Phaser.Tweens.Tween;
    protected mInteractive: boolean;
    protected mLoadingShadow: Phaser.GameObjects.Image;
    protected mMountContainer: Phaser.GameObjects.Container;
    private replaceArr;
    private mLoadMap;
    private mErrorLoadMap;
    private mNeedReplaceTexture;
    private mBoardPoint;
    private readonly UNPACK_SLOTS;
    private readonly UNCHECK_AVATAR_PROPERTY;
    private mReplaceTextureKey;
    constructor(scene: Phaser.Scene, pathObj: IResPath, id?: number);
    set displayInfo(val: IDragonbonesModel | undefined);
    get displayInfo(): IDragonbonesModel | undefined;
    get spriteWidth(): number;
    get spriteHeight(): number;
    get topPoint(): Phaser.Geom.Point;
    load(display: IDragonbonesModel, field?: DisplayField, useRenderTex?: boolean): Promise<any>;
    save(): Promise<{
        key: string;
        url: string;
        json: string;
    }>;
    getDisplay(): dragonBones.phaser.display.ArmatureDisplay | undefined;
    play(val: RunningAnimation): void;
    fadeIn(callback?: () => void): void;
    fadeOut(callback?: () => void): void;
    destroy(): void;
    setClickInteractive(active: boolean): void;
    set resourceName(val: string);
    get resourceName(): string;
    protected buildDragbones(): Promise<any>;
    protected get localResourceRoot(): string;
    protected get osdResourceRoot(): string;
    protected partNameToLoadUrl(partName: string): string;
    protected partNameToLoadKey(partName: string): string;
    protected partNameToDBFrameName(partName: string): string;
    protected generateReplaceTextureKey(): string;
    protected createArmatureDisplay(): void;
    protected onArmatureLoopComplete(event: dragonBones.EventObject): void;
    protected showLoadingShadow(): void;
    protected hideLoadingShadow(): void;
    protected loadDragonBones(pngUrl: string, jsonUrl: string, dbbinUrl: string): Promise<any>;
    protected refreshAvatar(useRenderTexture: boolean): void;
    protected serializeAvatarData(data: IAvatar): string;
    private generateReplaceTexture;
    private prepareReplaceRenderTexture;
    private prepareReplaceSlotsDisplay;
    private loadPartsRes;
    private formattingSkin;
    private clearFadeTween;
    private checkNeedReplaceTexture;
    private partLoadKeyToSlotName;
    private slotNameToPropertyName;
    private setReplaceArrAndLoadMap;
    private recordReplacedTexture;
    private destroyReplacedTextureManually;
}
