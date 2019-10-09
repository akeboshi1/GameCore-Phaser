import {ISprite} from "../element/sprite";
import {op_client} from "pixelpai_proto";
import {Pos} from "../../utils/pos";
import {IAvatar} from "../display/dragonbones.model";

export class ActorModel implements ISprite {
    private mID: number;
    private mPos: Pos;
    private mAvatar: IAvatar;
    private mCurrentAnimationName: string;
    private mDirection: number;
    private mBindID: number;
    private mAlpha: number;
    constructor(actor: op_client.IActor) {
        this.mID = actor.id;
        this.mPos = new Pos(actor.x, actor.y, actor.z || 0);
        if (actor.avatar) {
            this.mAvatar = { id: actor.avatar.id };
            this.mAvatar = Object.assign(this.mAvatar, actor.avatar);
        }
        this.mDirection = actor.avatarDir;
        this.mAlpha = 1;
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

    get bindID(): number {
        return this.mBindID;
    }

    get alpha(): number {
        return this.mAlpha;
    }
}
