import { Pos } from "../../utils/pos";
import {DragonbonesModel, IAvatar, IDragonbonesModel} from "../display/dragonbones.model";
import { op_client, op_gameconfig, op_def } from "pixelpai_proto";
import { SlotInfo } from "../player/slot.info";
import {FramesModel, IFramesModel} from "../display/frames.model";
import {Animation} from "../display/animation";
import Helpers from "../../utils/helpers";

export interface ISprite {
    readonly id: number;
    readonly avatar: IAvatar;
    readonly currentAnimationName: string;
    readonly direction: number;
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
    readonly displayInfo: IFramesModel | IDragonbonesModel;
    pos: Pos;
    bindID: number;
    package: op_gameconfig.IPackage;

    newID();
    toSprite(): op_client.ISprite;
}

export class Sprite implements ISprite {
    protected mID: number;
    protected mPos: Pos;
    protected mAvatar: IAvatar;
    protected mCurrentAnimationName: string;
    protected mDirection: number;
    protected mBindID: number;
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

    protected _originWalkPoint: Phaser.Geom.Point;

    protected _originCollisionPoint: Phaser.Geom.Point;

    constructor(obj: op_client.ISprite) {
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
                animations: {
                    defaultAnimationName: obj.currentAnimationName,
                    display: obj.display,
                    animationData: anis
                }
            });
        }
        this.mCurrentAnimationName = obj.currentAnimationName || "idle";
        this.mDirection = obj.direction;
        this.mNickname = obj.nickname;
        this.mBindID = obj.bindId;
        this.mAlpha = obj.opacity === undefined ? 1 : obj.opacity / 100;
        this.mDisplayBadgeCards = obj.displayBadgeCards;
    }

    public toSprite(): op_client.ISprite {
        const sprite = op_client.Sprite.create();
        sprite.id = this.id;
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
        return sprite;
    }

    public newID() {
        this.mID = Helpers.genId();
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

    get nickname(): string {
        return this.mNickname;
    }

    get bindID(): number {
        return this.mBindID;
    }

    set bindID(id: number) {
        this.mBindID = id;
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
}
