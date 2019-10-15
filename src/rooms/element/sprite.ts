import {Pos} from "../../utils/pos";
import {IAvatar} from "../display/dragonbones.model";
import {op_client} from "pixelpai_proto";

export interface ISprite {
    readonly id: number;
    readonly pos: Pos;
    readonly avatar: IAvatar;
    readonly currentAnimationName: string;
    readonly direction: number;
    readonly nickname: string;
    readonly bindID: number;
    readonly alpha: number;
}

export class Sprite implements ISprite {
    private mID: number;
    private mPos: Pos;
    private mAvatar: IAvatar;
    private mCurrentAnimationName: string;
    private mDirection: number;
    private mBindID: number;
    private mAlpha: number;
    private mNickname: string;

    constructor(obj: op_client.ISprite) {
        this.mID = obj.id;
        if (obj.point3f) {
            const point = obj.point3f;
            this.mPos = new Pos(point.x, point.y, point.z);
        }
        if (obj.avatar) {
            this.mAvatar = { id: obj.avatar.id };
            this.mAvatar = Object.assign(this.mAvatar, obj.avatar);
        }
        this.mCurrentAnimationName = obj.currentAnimationName || "idle";
        this.mDirection = obj.direction;
        this.mNickname = obj.nickname;
        this.mBindID = obj.bindId;
        this.mAlpha = obj.opacity === undefined ? 1 : obj.opacity / 100;
    }

    get id(): number {
        return this.mID;
    }

    get pos(): Pos {
        return  this.mPos;
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

    get alpha(): number {
        return this.mAlpha;
    }
}
