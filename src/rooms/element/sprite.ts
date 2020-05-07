import { Pos } from "../../utils/pos";
import { DragonbonesModel, IAvatar, IDragonbonesModel } from "../display/dragonbones.model";
import { op_client, op_gameconfig, op_def } from "pixelpai_proto";
import { SlotInfo } from "../player/slot.info";
import { FramesModel, IFramesModel } from "../display/frames.model";
import { Animation } from "../display/animation";
import Helpers from "../../utils/helpers";
import NodeType = op_def.NodeType;
import { Logger } from "../../utils/log";
import { Direction } from "./element";

export interface ISprite {
    readonly id: number;
    readonly avatar: IAvatar;
    readonly nickname: string;
    readonly alpha: number;
    readonly displayBadgeCards: op_def.IBadgeCard[];

    readonly platformId: string;
    readonly sceneId: number;
    readonly nodeType: op_def.NodeType;
    readonly currentAnimation: AnimationData;
    readonly currentCollisionArea: number[][];
    readonly currentWalkableArea: number[][];
    readonly currentCollisionPoint: Phaser.Geom.Point;
    readonly hasInteractive: boolean;
    currentAnimationName: string;
    displayInfo: IFramesModel | IDragonbonesModel;
    direction: number;
    pos: Pos;
    bindID: number;
    sn: string;
    isMoss?: boolean;

    newID();
    setPosition(x: number, y: number);
    turn(): ISprite;
    toSprite(): op_client.ISprite;
}

export interface AnimationData {
    animationName: string;
    flip: boolean;
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

    protected mPackage: op_gameconfig.IPackage;
    protected mSceneId: number;
    protected mUuid: number;
    protected mPlatformId: string;
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mNodeType: NodeType;
    protected mCurrentAnimation: AnimationData;
    protected mCurrentCollisionArea: number[][];
    protected mCurrentWalkableArea: number[][];
    protected mCurrentCollisionPoint: Phaser.Geom.Point;
    protected mVersion: string;
    protected mIsMoss: boolean;
    protected mRegisterAnimation: Map<string, string>;

    protected _originWalkPoint: Phaser.Geom.Point;

    protected _originCollisionPoint: Phaser.Geom.Point;

    protected mAttrs: op_def.IStrPair[];

    constructor(obj: op_client.ISprite, nodeType?: NodeType) {
        this.mID = obj.id;
        if (obj.point3f) {
            const point = obj.point3f;
            this.mPos = new Pos(point.x, point.y, point.z);
        }
        if (obj.avatar) {
            this.mAvatar = { id: obj.avatar.id };
            this.mAvatar = Object.assign(this.mAvatar, obj.avatar);
            this.mAttrs = obj.attrs;
            // if (attrs && attrs.length > 0) {
            //     for (const att of attrs) {
            //         if (att.key === "minecart") {
            //             this.mAvatar.stalkerId = att.value;
            //         }
            //     }
            // }
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
                    animationData: anis,
                },
            });
        }
        if (obj.sn) {
            this.mSn = obj.sn;
        }
        this.tryRegisterAnimation(obj.animationRegistrationMap);
        // if (obj.currentAnimationName) {
        //     Logger.getInstance().error(`${Sprite.name}: currentAnimationName is null, ${JSON.stringify(obj)}`);
        // }
        this.mCurrentAnimationName = obj.currentAnimationName || "idle";
        this.direction = obj.direction || 3;
        this.mNickname = obj.nickname;
        this.mBindID = obj.bindId;
        this.mAlpha = obj.opacity === undefined ? 1 : obj.opacity / 100;
        this.mDisplayBadgeCards = obj.displayBadgeCards;
        this.mNodeType = nodeType;

        if (obj.version) {
            this.mVersion = obj.version;
        }

        if (obj.isMoss !== undefined) {
            this.isMoss = obj.isMoss;
        }
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
            sprite.animations = (<FramesModel>this.displayInfo).toClient();
        }
        sprite.direction = this.direction;
        sprite.bindId = this.bindID;
        sprite.sn = this.sn;
        sprite.version = this.mVersion;
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
        const dirable = this.dirable(this.mCurrentAnimationName);
        const index = dirable.indexOf(this.mDirection);
        if (index > -1) {
            this.direction = dirable[(index + 1) % dirable.length];
        } else {
            Logger.getInstance().error(`${Sprite.name}: error dir ${this.mDirection}`);
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

    set currentAnimationName(animationName: string) {
        this.mCurrentAnimationName = animationName;
        this.setAnimationData(animationName, this.direction);
        // this.mCurrentAnimation = this.findAnimation(animationName, this.mDirection);
    }

    get direction(): number {
        return this.mDirection;
    }

    set direction(val: number) {
        this.mDirection = val;
        if (!this.mDisplayInfo) {
            return;
        }
        this.setAnimationData(this.mCurrentAnimationName, val);
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

    get isMoss() {
        return this.mIsMoss;
    }

    set isMoss(val: boolean) {
        this.mIsMoss = val;
    }

    get nodeType(): NodeType {
        return this.mNodeType;
    }

    get currentAnimation(): AnimationData {
        return this.mCurrentAnimation;
    }

    get currentCollisionArea(): number[][] {
        if (!this.mCurrentCollisionArea) {
            this.mCurrentCollisionArea = this.getCollisionArea();
        }
        return this.mCurrentCollisionArea;
    }

    get currentWalkableArea(): number[][] {
        if (!this.mCurrentWalkableArea) {
            this.mCurrentWalkableArea = this.getWalkableArea();
        }
        return this.mCurrentWalkableArea;
    }

    get currentCollisionPoint(): Phaser.Geom.Point {
        if (!this.mCurrentCollisionPoint) {
            this.mCurrentCollisionPoint = this.getOriginPoint();
        }
        return this.mCurrentCollisionPoint;
    }

    get hasInteractive(): boolean {
        if (!this.mDisplayInfo || !this.mCurrentAnimation) {
            return false;
        }
        const { animationName } = this.mCurrentAnimation;
        const area = this.mDisplayInfo.getInteractiveArea(animationName);
        if (area && area.length > 0) {
            return true;
        }
        return false;
    }

    get animationMap() {
        if (!this.mRegisterAnimation) {
            this.mRegisterAnimation = new Map();
        }
        return this.mRegisterAnimation;
    }

    public get originCollisionPoint(): Phaser.Geom.Point {
        return this._originCollisionPoint;
    }

    public get originWalkPoint(): Phaser.Geom.Point {
        return this._originWalkPoint;
    }

    public get attrs() {
        return this.mAttrs;
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

    public getInteracviveArea(): op_def.IPBPoint2i[] {
        if (!this.mDisplayInfo || !this.mCurrentAnimation) {
            return;
        }
        const { animationName } = this.mCurrentAnimation;
        return this.mDisplayInfo.getInteractiveArea(animationName);
    }

    private setAnimationData(animationName: string, direction: Direction) {
        if (!this.displayInfo) {
            return;
        }
        let baseAniName = animationName.split(`_`)[0];
        if (this.mRegisterAnimation) {
            if (this.mRegisterAnimation.has(baseAniName)) {
                baseAniName = this.mRegisterAnimation.get(baseAniName);
            }
        }
        this.mCurrentAnimation = this.displayInfo.findAnimation(baseAniName, direction);
        if (this.mCurrentCollisionArea) {
            this.setArea();
        }
        // Logger.getInstance().log("play animation name: ", this.mCurrentAnimation.animationName, this.mCurrentAnimation.flip, this.mDirection);
        // if (animationName !== this.mCurrentAnimation.animationName) {
        //     Logger.getInstance().error(`${Sprite.name}: play animationName: ${this.mCurrentAnimation.animationName}, recieve: ${this.mCurrentAnimationName}, direction: ${direction}`);
        // }
    }

    private checkDirectionAnimation(baseAniName: string, dir: Direction) {
        const aniName = `${baseAniName}_${dir}`;
        if (this.mDisplayInfo.existAnimation(aniName)) {
            return aniName;
        }
        return null;
    }

    private setArea() {
        this.mCurrentCollisionArea = this.getCollisionArea();
        this.mCurrentWalkableArea = this.getWalkableArea();
        this.mCurrentCollisionPoint = this.getOriginPoint();
    }

    private getCollisionArea() {
        if (!this.mDisplayInfo || !this.mCurrentAnimation) {
            return;
        }
        const { animationName, flip } = this.mCurrentAnimation;
        return this.mDisplayInfo.getCollisionArea(animationName, flip);
    }

    private getWalkableArea() {
        if (!this.mDisplayInfo || !this.mCurrentAnimation) {
            return;
        }
        const { animationName, flip } = this.mCurrentAnimation;
        return this.mDisplayInfo.getWalkableArea(animationName, flip);
    }

    private getOriginPoint() {
        if (!this.mDisplayInfo || !this.mCurrentAnimation) {
            return;
        }
        const { animationName, flip } = this.mCurrentAnimation;
        return this.mDisplayInfo.getOriginPoint(animationName, flip);
    }

    private dirable(aniName: string): number[] {
        const baseAniName = aniName.split("_")[0];
        const dirs = [3, 5];
        if (this.checkDirectionAnimation(baseAniName, Direction.east_north)) {
            dirs.push(7, 1);
            // dirs = [1, 3, 5, 7];
        }
        return dirs;
    }

    private tryRegisterAnimation(anis: op_def.IStrPair[]) {
        if (!anis || anis.length < 1) {
            return;
        }
        this.mRegisterAnimation = new Map();
        for (const ani of anis) {
            this.mRegisterAnimation.set(ani.key, ani.value);
        }
    }
}
