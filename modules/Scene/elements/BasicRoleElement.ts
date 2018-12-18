import {Const} from "../../../common/const/Const";
import {PlayerInfo} from "../../../common/struct/PlayerInfo";
import SceneEntity from "../view/SceneEntity";
import Globals from "../../../Globals";
import {RoomNode} from "../grid/RoomNode";
import {RoleBonesAvatar} from "../../../common/avatar/RoleBonesAvatar";
import RoleAvatarModelVO from "../../../common/struct/RoleAvatarModelVO";
import Point = Phaser.Point;
import {SceneView} from "../view/SceneView";
import {Log} from "../../../Log";

export class BasicRoleElement extends SceneEntity {
    protected myAnimationName: string = Const.ModelStateType.BONES_STAND;
    private mAnimationDirty = false;


    public constructor() {
        super();
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

    protected onAvatarAnimationChanged(): void {
        (<RoleBonesAvatar>this.display).animationName = this.myIsWalking ? Const.ModelStateType.BONES_WALK : this.myAnimationName;
        (<RoleBonesAvatar>this.display).angleIndex = this.mAngleIndex;
    }

    protected doAngleMoving(actualSpeed: number): void {
        if (actualSpeed <= 0) return;

        let startP: Point = Globals.Room45Util.tileToPixelCoords(1, 1);
        let endP: Point;
        let moveAngle: number;
        if (this.walkAngleIndex === 8) {
            endP = Globals.Room45Util.tileToPixelCoords(0, 0);
        } else if (this.walkAngleIndex === 7) {
            endP = Globals.Room45Util.tileToPixelCoords(1, 0);
        } else if (this.walkAngleIndex === 6) {
            endP = Globals.Room45Util.tileToPixelCoords(2, 0);
        } else if (this.walkAngleIndex === 5) {
            endP = Globals.Room45Util.tileToPixelCoords(2, 1);
        } else if (this.walkAngleIndex === 4) {
            endP = Globals.Room45Util.tileToPixelCoords(2, 2);
        } else if (this.walkAngleIndex === 3) {
            endP = Globals.Room45Util.tileToPixelCoords(1, 2);
        } else if (this.walkAngleIndex === 2) {
            endP = Globals.Room45Util.tileToPixelCoords(0, 2);
        } else if (this.walkAngleIndex === 1) {
            endP = Globals.Room45Util.tileToPixelCoords(0, 1);
        }
        moveAngle = Globals.Tool.caculateDirectionRadianByTwoPoint2(startP.x, startP.y, endP.x, endP.y);

        let _x = this.ox + actualSpeed * Math.cos(moveAngle);
        let _y = this.oy + actualSpeed * Math.sin(moveAngle);
        let _z = this.oz;

        this.setPosition(_x, _y, _z);
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

        this.mySpeed = this.characterInfo.moveSpeed; // Const.GameConst.MAP_TILE_WIDTH * 2
        this.setAngleIndex(this.characterInfo.avatarDir);
        this.setPosition(this.characterInfo.x, this.characterInfo.y, this.characterInfo.z);
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
        let node: RoomNode = (<SceneView>this.scene).seaMapGrid.getNode(colIndex, rowIndex);

        if (node) {
            this.display.alpha = node.isMaskAlpha ? Const.GameConst.MASK_ALPHA : 1;
        }
    }
}
