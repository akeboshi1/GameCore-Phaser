import { IDragonbonesModel, RunningAnimation } from "structure";
import { BaseDisplay } from "./base.display";
export declare enum AvatarSlotNameTemp {
    BodyCostDres = "body_cost_dres_$",
    BodyCost = "body_cost_$",
    BodyTail = "body_tail_$",
    BodyWing = "body_wing_$",
    BodyBase = "body_base_$",
    BodySpec = "body_spec_$",
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
    HeadFace = "head_face_$"
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
    ShldFarm = "farm_shld_#_$",
    WeapFarm = "farm_weap_#_$",
    ShldBarm = "barm_shld_#_$",
    WeapBarm = "barm_weap_#_$"
}
/**
 * 龙骨显示对象
 */
export declare class BaseDragonbonesDisplay extends BaseDisplay {
    protected mArmatureName: string;
    protected mResourceName: string;
    protected mArmatureDisplay: dragonBones.phaser.display.ArmatureDisplay | undefined;
    protected mFadeTween: Phaser.Tweens.Tween;
    protected mInteractive: boolean;
    /***
     * 是否合图 & 单图替换
     */
    protected isRenderTexture: boolean;
    protected mPlaceholder: Phaser.GameObjects.Image;
    protected mMountContainer: Phaser.GameObjects.Container;
    private replaceArr;
    private mHasLoadMap;
    private mLoadMap;
    private mErrorLoadMap;
    private mNeedReplaceTexture;
    private mBoardPoint;
    private readonly UNPACK_SLOTS;
    private readonly UNCHECK_AVATAR_PROPERTY;
    private readonly DEFAULT_SETS;
    private mReplaceTexTimeOutID;
    /**
     * 龙骨显示对象包围框
     */
    private mClickCon;
    private mPreReplaceTextureKey;
    private mReplaceTextureKey;
    private mTmpIndex;
    constructor(scene: Phaser.Scene);
    set displayInfo(val: IDragonbonesModel | undefined);
    get displayInfo(): IDragonbonesModel | undefined;
    get spriteWidth(): number;
    get spriteHeight(): number;
    get topPoint(): Phaser.Geom.Point;
    load(display: IDragonbonesModel): Promise<any>;
    getDisplay(): dragonBones.phaser.display.ArmatureDisplay | undefined;
    play(val: RunningAnimation): void;
    fadeIn(callback?: () => void): void;
    fadeOut(callback?: () => void): void;
    destroy(): void;
    setClickInteractive(active: boolean): void;
    set resourceName(val: string);
    get resourceName(): string;
    protected buildDragbones(): void;
    protected get localResourceRoot(): string;
    protected partNameToLoadUrl(partName: string): string;
    protected partNameToLoadKey(partName: string): string;
    protected generateReplaceTextureKey(): string;
    protected createArmatureDisplay(loader?: any, totalComplete?: number, totalFailed?: number): void;
    protected onArmatureLoopComplete(event: dragonBones.EventObject): void;
    protected clearArmatureSlot(): void;
    protected loadCompleteHander(): void;
    protected showPlaceholder(): void;
    protected closePlaceholder(): void;
    protected loadDragonBones(pngUrl: string, jsonUrl: string, dbbinUrl: string): void;
    protected refreshAvatar(): void;
    private clearReplaceArmature;
    private showReplaceArmatrue;
    private hideUnreplacedParts;
    private replacePartDisplay;
    private startLoadPartRes;
    private onLoadFunc;
    private formattingSkin;
    private clearFadeTween;
    private onSoundEventHandler;
    private checkNeedReplaceTexture;
    private partLoadKeyToSlotName;
    private getReplaceArr;
}
