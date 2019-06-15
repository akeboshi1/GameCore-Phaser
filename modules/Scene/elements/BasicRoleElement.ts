import {Const} from "../../../common/const/Const";
import {PlayerInfo} from "../../../common/struct/PlayerInfo";
import SceneEntity from "../view/SceneEntity";
import Globals from "../../../Globals";
import {RoleBonesAvatar} from "../../../common/avatar/RoleBonesAvatar";
import {IObjectPool} from "../../../base/pool/interfaces/IObjectPool";
import {op_gameconfig, op_client} from "pixelpai_proto";
import GameConst = Const.GameConst;
import { IBubbleObject } from "../../../base/IBubbleObject";

export class BasicRoleElement extends SceneEntity implements IBubbleObject {
    protected myAnimationName: string = Const.ModelStateType.BONES_STAND;
    private mAnimationDirty = false;


    public constructor() {
        super();
        this.baseLoc = new Phaser.Point(0, GameConst.ROLE_AVATAR_OFFSET_Y);
    }

    public get characterInfo(): PlayerInfo {
        return this.data;
    }

    public setAngleIndex(value: number): void {
        // Log.trace("角度-->"+value);
        if (this.mAngleIndex !== value) {
            this.mAngleIndex = value;

            this.invalidAnimation();
        }
    }

    public setAnimation(value: string): void {
        // Log.trace("动作-->"+value);
        if (this.myAnimationName !== value) {
            this.myAnimationName = value;

            this.invalidAnimation();
        }
    }

    public setScaleX(value: number|boolean): void {

    }

    public updateVoiceIcon(jitterReceived: number) {
        (<RoleBonesAvatar>this.display).setVoiceIcon(jitterReceived);
    }

    public loadModel(model: op_gameconfig.IAvatar): void {
        (<RoleBonesAvatar>this.display).loadModel(model);
    }

    protected invalidAnimation(): void {
        this.mAnimationDirty = true;
    }

    protected onPauseMove(): void {
        this.myAnimationName = Const.ModelStateType.BONES_STAND;
        this.invalidAnimation();
        super.onPauseMove();
    }

    // protected onStartMove(): void {
    //     this.myAnimationName = Const.ModelStateType.BONES_STAND;
    //     this.invalidAnimation();
    //     super.onStartMove();
    // }

    protected onAvatarAnimationChanged(): void {
        // (<RoleBonesAvatar>this.display).animationName = this.myIsWalking ? Const.ModelStateType.BONES_WALK : this.myAnimationName;
        (<RoleBonesAvatar>this.display).animationName = this.myAnimationName;
        (<RoleBonesAvatar>this.display).angleIndex = this.mAngleIndex;
    }

    protected onUpdating(deltaTime: number): void {
        if (this.mAnimationDirty) {
            this.onAvatarAnimationChanged();
            this.mAnimationDirty = false;
        }
        super.onUpdating(deltaTime);
    }

    protected onInitialize(): void {
        super.onInitialize();

        if (this.characterInfo.avatarDir) {
            this.setAngleIndex(this.characterInfo.avatarDir);
        }
        (<RoleBonesAvatar>this.display).setModelName(this.characterInfo.nickname, this.characterInfo.camp === Globals.DataCenter.PlayerData.mainPlayerInfo.camp ? "#000fff" : "#FF0000");
        this.setPosition(this.characterInfo.x, this.characterInfo.y, this.characterInfo.z);
        this.mouseEnable = false;

        this.loadModel(this.characterInfo.avatar);

    }

    protected createDisplay(): any {
        let avatar = new RoleBonesAvatar(Globals.game);
        return avatar;
    }

    protected onUpdateByData(): void {
        this.setAngleIndex(this.characterInfo.avatarDir);
        (<RoleBonesAvatar>this.display).setModelName(this.characterInfo.nickname, this.characterInfo.camp === Globals.DataCenter.PlayerData.mainPlayerInfo.camp ? "#000fff" : "#FF0000");
        this.loadModel(this.characterInfo.avatar);
    }
}
