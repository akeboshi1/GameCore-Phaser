import { Pos } from "../../utils/pos";
import { DragonbonesModel, IAvatar, IDragonbonesModel } from "../display/dragonbones.model";
import { op_client, op_gameconfig, op_def } from "pixelpai_proto";
import { SlotInfo } from "../player/slot.info";
import { FramesModel, IFramesModel } from "../display/frames.model";
import { Animation } from "../display/animation";
import Helpers from "../../utils/helpers";
import NodeType = op_def.NodeType;

export interface ISprite {
    readonly id: number;
    readonly avatar: IAvatar;
    readonly currentAnimationName: string;
    readonly nickname: string;
    readonly alpha: number;
    readonly displayBadgeCards: op_def.IBadgeCard[];

    readonly walkableArea: string;
    readonly collisionArea: string;
    readonly originPoint: number[];
    readonly walkOriginPoint: number[];
    readonly slot: SlotInfo[];
    readonly maxNum: number;
    readonly camp: string;
    readonly attributes: op_gameconfig.IAttribute[];
    readonly platformId: string;
    readonly sceneId: number;
    readonly nodeType: op_def.NodeType;
    readonly isFlip: boolean;
    displayInfo: IFramesModel | IDragonbonesModel;
    direction: number;
    pos: Pos;
    bindID: number;
    sn: string;

    newID();
    setPosition(x: number, y: number);
    turn(): ISprite;
    toSprite(): op_client.ISprite;
}

export class Sprite implements ISprite {
    protected mID: number;
    protected mPos: Pos;
    protected mAvatar: IAvatar;
    protected mCurrentAnimationName: string;
    protected mDirection: number;
    protected mBindID: number;
    protected mSn: string;
    protected mAlpha: number;
    protected mNickname: string;
    protected mDisplayBadgeCards: op_def.IBadgeCard[];

    protected mWalkableArea: string;
    protected mCollisionArea: string;
    protected mOriginPoint: number[];
    protected mWalkOriginPoint: number[];
    protected mSlot: op_gameconfig.ISlot[];
    protected mMaxNum: number;
    protected mCamp: string;
    protected mAttributes: op_gameconfig.IAttribute[];
    protected mPackage: op_gameconfig.IPackage;
    protected mSceneId: number;
    protected mUuid: number;
    protected mPlatformId: string;
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mNodeType: NodeType;
    protected mIsFlip: boolean = false;

    protected _originWalkPoint: Phaser.Geom.Point;

    protected _originCollisionPoint: Phaser.Geom.Point;

    constructor(obj: op_client.ISprite, nodeType?: NodeType) {
        this.mID = obj.id;
        if (obj.point3f) {
            const point = obj.point3f;
            this.mPos = new Pos(point.x, point.y, point.z);
        }
        if (obj.avatar) {
            this.mAvatar = { id: obj.avatar.id };
            this.mAvatar = Object.assign(this.mAvatar, obj.avatar);
            this.mDisplayInfo = new DragonbonesModel(this);
        }
        if (obj.display) {
            const anis = [];
            const objAnis = obj.animations;
            for (const ani of objAnis) {
                anis.push(new Animation(ani));
            }
            this.mDisplayInfo = new FramesModel({
                id: obj.id,
                animations: {
                    defaultAnimationName: obj.currentAnimationName,
                    display: obj.display,
                    animationData: anis
                }
            });
        }
        if (obj.sn) {
            this.mSn = obj.sn;
        }
        this.mCurrentAnimationName = obj.currentAnimationName;
        this.mDirection = obj.direction || 3;
        this.mNickname = obj.nickname;
        this.mBindID = obj.bindId;
        this.mAlpha = obj.opacity === undefined ? 1 : obj.opacity / 100;
        this.mDisplayBadgeCards = obj.displayBadgeCards;
        this.mNodeType = nodeType;
    }

    public toSprite(): op_client.ISprite {
        const sprite = op_client.Sprite.create();
        sprite.id = this.id;
        sprite.nickname = this.mNickname;
        if (this.mDisplayInfo instanceof FramesModel) {
            sprite.display = this.mDisplayInfo.display;
            sprite.currentAnimationName = this.currentAnimationName;
            const point3f = op_def.PBPoint3f.create();
            point3f.x = this.pos.x;
            point3f.y = this.pos.y;
            point3f.z = this.pos.z;
            sprite.point3f = point3f;
            sprite.animations = (<FramesModel> this.displayInfo).toClient();
        }
        sprite.direction = this.direction;
        sprite.bindId = this.bindID;
        sprite.sn = this.sn;
        return sprite;
    }

    public newID() {
        this.mID = Helpers.genId();
    }

    public setPosition(x: number, y: number) {
        if (!this.mPos) {
            this.mPos = new Pos();
        }
        this.mPos.x = x;
        this.mPos.y = y;
    }

    public turn(): ISprite {
        if (!this.mDisplayInfo) {
            return;
        }
        this.mDirection += 2;
        this.mDirection = this.mDirection > 7 ? 1 : this.mDirection;
        const baseAniName = this.mCurrentAnimationName.split("_3");
        if (this.mDirection === 7) {
            const aniName = baseAniName[0] + "_" + this.mDirection;
            if (this.mDisplayInfo.existAnimation(aniName)) {
                this.mCurrentAnimationName = aniName;
            } else {
                this.direction = 3;
            }
        }
        return this;
    }

    get id(): number {
        return this.mID;
    }

    get pos(): Pos {
        return this.mPos;
    }

    set pos(pos: Pos) {
        this.mPos = pos;
    }

    get avatar(): IAvatar {
        return this.mAvatar;
    }

    get currentAnimationName(): string {
        return this.mCurrentAnimationName;
    }

    get direction(): number {
        return this.mDirection;
    }

    set direction(val: number) {
        this.mDirection = val;
        this.mIsFlip = this.checkIsFlip();
    }

    get isFlip(): boolean {
        return this.mIsFlip;
    }

    get nickname(): string {
        return this.mNickname;
    }

    get bindID(): number {
        return this.mBindID;
    }

    set bindID(id: number) {
        this.mBindID = id;
    }

    get sn(): string {
        return this.mSn;
    }

    set sn(value: string) {
        this.mSn = value;
    }

    get alpha(): number {
        return this.mAlpha;
    }

    get walkableArea(): string {
        return this.mWalkableArea;
    }

    get collisionArea(): string {
        return this.mCollisionArea;
    }

    get originPoint(): number[] {
        return this.mOriginPoint;
    }

    get walkOriginPoint(): number[] {
        return this.mWalkOriginPoint;
    }

    get slot(): SlotInfo[] {
        return this.getSlots();
    }

    get maxNum(): number {
        return this.mMaxNum;
    }

    get camp(): string {
        return this.mCamp;
    }

    get attributes(): op_gameconfig.IAttribute[] {
        return this.mAttributes;
    }

    get package(): op_gameconfig.IPackage {
        return this.mPackage;
    }

    set package(value: op_gameconfig.IPackage) {
        this.mPackage = value;
    }

    get sceneId(): number {
        return this.mSceneId;
    }

    get uuid(): number {
        return this.mUuid;
    }

    get displayBadgeCards(): op_def.IBadgeCard[] {
        return this.mDisplayBadgeCards;
    }

    get platformId(): string {
        return this.mPlatformId;
    }

    get displayInfo(): IFramesModel | IDragonbonesModel {
        return this.mDisplayInfo;
    }

    set displayInfo(displayInfo: IFramesModel | IDragonbonesModel) {
        this.mDisplayInfo = displayInfo;
        if (this.currentAnimationName) this.mDisplayInfo.animationName = this.currentAnimationName;
    }

    get nodeType(): NodeType {
        return this.mNodeType;
    }

    public getSlots(): SlotInfo[] {
        if (this.mSlot === undefined) return null;
        const len = this.slot.length;
        let info: SlotInfo;
        let attri: op_gameconfig.IAttribute;
        const slots: SlotInfo[] = [];
        for (let i = 0; i < len; i++) {
            info = new SlotInfo();
            attri = this.getAttriByKey(this.mSlot[i].bondAttrCurkey);
            info.bondAttrCur = attri.intVal;
            attri = this.getAttriByKey(this.mSlot[i].bondAttrMaxkey);
            info.bondAttrMax = attri.intVal;
            info.bondName = this.slot[i].bondName;
            info.color = this.slot[i].color;
            slots.push(info);
        }
        return slots;
    }

    public getSlotByName(name: string): SlotInfo {
        if (this.mSlot === undefined) return null;
        const len = this.slot.length;
        let info: SlotInfo;
        let attri: op_gameconfig.IAttribute;
        for (let i = 0; i < len; i++) {
            if (this.slot[i].bondName === name) {
                info = new SlotInfo();
                attri = this.getAttriByKey(this.mSlot[i].bondAttrCurkey);
                info.bondAttrCur = attri.intVal;
                attri = this.getAttriByKey(this.mSlot[i].bondAttrMaxkey);
                info.bondAttrMax = attri.intVal;
                info.bondName = this.slot[i].bondName;
                info.color = this.slot[i].color;
                return info;
            }
        }
        return null;
    }

    public getAttriByKey(key: string): op_gameconfig.IAttribute {
        if (this.attributes === undefined) return null;
        const len = this.attributes.length;
        for (let i = 0; i < len; i++) {
            if (this.attributes[i].name === key) {
                return this.attributes[i];
            }
        }
        return null;
    }

    public get originCollisionPoint(): Phaser.Geom.Point {
        return this._originCollisionPoint;
    }

    public get originWalkPoint(): Phaser.Geom.Point {
        return this._originWalkPoint;
    }

    public setOriginCollisionPoint(value: number[] | null): void {
        if (this._originCollisionPoint === undefined) {
            this._originCollisionPoint = new Phaser.Geom.Point();
        }
        if (value && value.length > 1) {
            this._originCollisionPoint.x = value[0];
            this._originCollisionPoint.y = value[1];
        }
    }

    public setOriginWalkPoint(value: number[] | null): void {
        if (this._originWalkPoint === undefined) {
            this._originWalkPoint = new Phaser.Geom.Point();
        }
        if (value && value.length > 1) {
            this._originWalkPoint.x = value[0];
            this._originWalkPoint.y = value[1];
        }
    }

    private checkIsFlip(): boolean {
        if (!this.mDisplayInfo) {
            return;
        }
        if (this.mDirection === 3 || this.mDirection === 7) {
            return false;
        }
        const aniName = this.mCurrentAnimationName.split("_")[0] + "_" + this.mDirection;
        return !this.mDisplayInfo.existAnimation(aniName);
    }
}
