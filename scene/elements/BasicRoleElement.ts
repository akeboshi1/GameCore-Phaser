import {Const} from "../../const/Const";
import {PlayerInfo} from "../../struct/PlayerInfo";
import SceneEntity from "../SceneEntity";
import Globals from "../../Globals";
import {RoomScene} from "../RoomScene";
import {RoomNode} from "../grid/RoomNode";
import {RoleBonesAvatar} from "../../avatar/RoleBonesAvatar";
import RoleAvatarModelVO from "../../struct/RoleAvatarModelVO";
import Point3 = Phaser.Plugin.Isometric.Point3;
import Point = Phaser.Point;
import {Log} from "../../Log";

export class BasicRoleElement extends SceneEntity {
    protected myAnimationName: string = Const.ModelStateType.BONES_STAND;
    private mAnimationDirty: boolean = false;
    private gridPoint: Phaser.Point = new Phaser.Point();

    public constructor() {
        super();
    }

    public get characterInfo(): PlayerInfo {
        return this.data;
    }

    public setAngleIndex(value: number): void {
        // Log.trace("角度-->"+value);
        if (this.mAngleIndex != value) {
            this.mAngleIndex = value;

            this.invalidAnimation();
        }
    }

    public setAnimation(value: string): void {
        // Log.trace("动作-->"+value);
        if (this.myAnimationName != value) {
            this.myAnimationName = value;

            this.invalidAnimation();
        }
    }

    public loadModel(model: RoleAvatarModelVO): void {
        (<RoleBonesAvatar>this.display).loadModel(model);
    }

    public updateCharacterSpeed(speed: number): void {
        this.characterInfo.moveSpeed = speed;
        this.mySpeed = this.characterInfo.moveSpeed;
    }

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

    protected onUpdatingPosition(deltaTime: number): void {
        let actualSpeed = this.mySpeed * deltaTime;
        this.doAngleMoving(actualSpeed);
    }

    protected onAvatarAnimationChanged(): void {
        (<RoleBonesAvatar>this.display).animationName = this.myIsWalking ? Const.ModelStateType.BONES_WALK : this.myAnimationName;
        (<RoleBonesAvatar>this.display).angleIndex = this.mAngleIndex;
    }

    protected doAngleMoving(actualSpeed: number): void {
        if (actualSpeed <= 0) return;
        let _x = this.iosX;
        let _y = this.iosY;
        // Log.trace("----------------------", Const.GameConst.MAP_TILE_BORDER, Const.GameConst.MAP_TILE_HEIGHT);
        let subSpeedY: number = Const.GameConst.MAP_TILE_BORDER * actualSpeed / Const.GameConst.MAP_TILE_HEIGHT;
        let subSpeedX: number = Const.GameConst.MAP_TILE_BORDER * actualSpeed / Const.GameConst.MAP_TILE_WIDTH;
        // Log.trace("actualSpeed-------->", actualSpeed, "subSpeedY-------->", subSpeedY, "subSpeedX-------->", subSpeedX);
        if (this.walkAngleIndex === 8) {
            _x -= subSpeedY;
            _y -= subSpeedY;
        } else if (this.walkAngleIndex === 7) {
            _y -= actualSpeed;
        } else if (this.walkAngleIndex === 6) {
            _x += subSpeedX;
            _y -= subSpeedX;
        } else if (this.walkAngleIndex === 5) {
            _x += actualSpeed;
        } else if (this.walkAngleIndex === 4) {
            _x += subSpeedY;
            _y += subSpeedY;
        } else if (this.walkAngleIndex === 3) {
            _y += actualSpeed;
        } else if (this.walkAngleIndex === 2) {
            _x -= subSpeedX;
            _y += subSpeedX;
        } else if (this.walkAngleIndex === 1) {
            _x -= actualSpeed;
        }
        this.setPosition(_x, _y);
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

        this.mySpeed = this.characterInfo.moveSpeed * 0.001 * Const.GameConst.MAP_TILE_WIDTH * 2;
        this.setCols(1);
        this.setRows(1);
        this.setAngleIndex(this.characterInfo.direct);
        this.setPosition(this.characterInfo.x, this.characterInfo.y);
        this.mouseEnable = false;

        this.loadModel(Globals.DataCenter.PlayerData.mainPlayerInfo.model);
    }

    protected createDisplay(): any {
        let avatar = new RoleBonesAvatar(Globals.game);
        return avatar;
    }

    protected onUpdateByData(): void {
        this.mySpeed = this.characterInfo.moveSpeed;
        this.onUpdateByDataForAvatar();
    }

    protected onUpdateByDataForAvatar(): void {
        // var avatar: RoleAvatarBasic = this.display as RoleAvatarBasic;
        // avatar.changeAvatarModelByModeVO(this.characterInfo.model);
    }

    protected onGridPositionChanged(colIndex: number, rowIndex: number): void {
        var node: RoomNode = (<RoomScene>this.scene).seaMapGrid.getNode(colIndex, rowIndex);

        if (node) {
            this.display.alpha = node.isMaskAlpha ? Const.GameConst.MASK_ALPHA : 1;
        }
    }
}