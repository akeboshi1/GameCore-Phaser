import {Const} from "../../../common/const/Const";
import {PlayerInfo} from "../../../common/struct/PlayerInfo";
import SceneEntity from "../view/SceneEntity";
import Globals from "../../../Globals";
import {RoleBonesAvatar} from "../../../common/avatar/RoleBonesAvatar";
import {IObjectPool} from "../../../base/pool/interfaces/IObjectPool";
import GameConst = Const.GameConst;
import {op_gameconfig} from "../../../../protocol/protocols";

export class BasicRoleElement extends SceneEntity {
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

    protected get displayPool(): IObjectPool {
        let op = Globals.ObjectPoolManager.getObjectPool("RoleBonesAvatar");
        return op;
    }

    public setAnimation(value: string): void {
        // Log.trace("动作-->"+value);
        if (this.myAnimationName !== value) {
            this.myAnimationName = value;

            this.invalidAnimation();
        }
    }

    public loadModel(model: op_gameconfig.IAvatar): void {
        (<RoleBonesAvatar>this.display).loadModel(model);
    }

    // public updateCharacterSpeed(speed: number): void {
    //     this.characterInfo.moveSpeed = speed;
    //     this.mySpeed = this.characterInfo.moveSpeed;
    // }

    protected invalidAnimation(): void {
        this.mAnimationDirty = true;
    }

    protected onPauseMove(): void {
        this.invalidAnimation();
    }

    protected onStartMove(): void {
        this.myAnimationName = Const.ModelStateType.BONES_STAND;
        this.invalidAnimation();
    }

    protected onAvatarAnimationChanged(): void {
        (<RoleBonesAvatar>this.display).animationName = this.myIsWalking ? Const.ModelStateType.BONES_WALK : this.myAnimationName;
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

        this.setAngleIndex(this.characterInfo.avatarDir);
        (<RoleBonesAvatar>this.display).setModelName(this.characterInfo.nickname, this.characterInfo.camp === Globals.DataCenter.PlayerData.mainPlayerInfo.camp ? "#000fff" : "#FF0000");
        // this.setPosition(this.characterInfo.x, this.characterInfo.y, this.characterInfo.z, true);
        this.mouseEnable = false;

        this.loadModel(this.characterInfo.avatar);

    }

    protected createDisplay(): any {
        let avatar = this.displayPool.alloc() as RoleBonesAvatar;
        if (null == avatar) {
            avatar = new RoleBonesAvatar(Globals.game);
        }
        return avatar;
    }

    protected onUpdateByData(): void {
        // this.mySpeed = this.characterInfo.moveSpeed;
        this.onUpdateByDataForAvatar();
    }

    protected onUpdateByDataForAvatar(): void {
        // var avatar: RoleAvatarBasic = this.display as RoleAvatarBasic;
        // avatar.changeAvatarModelByModeVO(this.characterInfo.model);
    }

    // protected onGridPositionChanged(colIndex: number, rowIndex: number): void {
    //     let node: RoomNode = (<SceneView>this.scene).seaMapGrid.getNode(colIndex, rowIndex);
    //
    //     if (node) {
    //         this.display.alpha = node.isMaskAlpha ? Const.GameConst.MASK_ALPHA : 1;
    //     }
    // }
}
