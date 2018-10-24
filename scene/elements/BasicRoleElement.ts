import {Const} from "../../const/Const";
import {PlayerInfo} from "../../struct/PlayerInfo";
import SceneEntity from "../SceneEntity";
import Globals from "../../Globals";
import {RoomScene} from "../RoomScene";
import {RoomNode} from "../grid/RoomNode";
import {RoleBonesAvatar} from "../../avatar/RoleBonesAvatar";
import {BasicRoleAvatar} from "../../avatar/BasicRoleAvatar";
import RoleAvatarModelVO from "../../struct/RoleAvatarModelVO";

export class BasicRoleElement extends SceneEntity {
	private mAnimationDirty: boolean = false;
	protected myAnimationName: string = Const.ModelStateType.BONES_STAND;
	private gridPoint:Phaser.Point = new Phaser.Point();

	public constructor() {
		super();
	}

	public get characterInfo(): PlayerInfo {
		return this.data;
	}

	protected invalidAnimation(): void { this.mAnimationDirty = true; }

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

	protected onPauseMove(): void {

		this.invalidAnimation();
	}

	protected onStartMove(): void {
		this.myAnimationName = Const.ModelStateType.BONES_STAND;
		this.invalidAnimation();
	}

	protected onUpdatingPosition(deltaTime: number): void {
		// this.doPathMoving();
		let actualSpeed = this.mySpeed * deltaTime;
		this.doAngleMoving(actualSpeed);
	}

	protected onAvatarAnimationChanged(): void {
		(<RoleBonesAvatar>this.display).animationName = this.myIsWalking ? Const.ModelStateType.BONES_WALK : this.myAnimationName;
		(<RoleBonesAvatar>this.display).angleIndex = this.mAngleIndex;
	}

	public get gridPos(): Phaser.Point {
		this.gridPoint.x = this.getGridPositionColIndex();
		this.gridPoint.y = this.getGridPositionRowIndex();
		return this.gridPoint;
	}

	protected doAngleMoving(actualSpeed: number): void {
		if (actualSpeed <= 0) return;

		let _x = this.x + actualSpeed * Math.cos(this.moveAngle);
		let _y = this.y + actualSpeed * Math.sin(this.moveAngle);

		this.setPosition(_x, _y);
	}

	protected get moveAngle(): number {
		let startP: Phaser.Point = Globals.Room45Util.tileToPixelCoords(1, 1);
		let endP: Phaser.Point;
		if (this.mWalkAngleIndex == 8) {
			endP = Globals.Room45Util.tileToPixelCoords(0, 0);
		} else if (this.mWalkAngleIndex == 7) {
			endP = Globals.Room45Util.tileToPixelCoords(1, 0);
		} else if (this.mWalkAngleIndex == 6) {
			endP = Globals.Room45Util.tileToPixelCoords(2, 0);
		} else if (this.mWalkAngleIndex == 5) {
			endP = Globals.Room45Util.tileToPixelCoords(2, 1);
		} else if (this.mWalkAngleIndex == 4) {
			endP = Globals.Room45Util.tileToPixelCoords(2, 2);
		} else if (this.mWalkAngleIndex == 3) {
			endP = Globals.Room45Util.tileToPixelCoords(1, 2);
		} else if (this.mWalkAngleIndex == 2) {
			endP = Globals.Room45Util.tileToPixelCoords(0, 2);
		} else if (this.mWalkAngleIndex == 1) {
			endP = Globals.Room45Util.tileToPixelCoords(0, 1);
		}
		let a = Globals.Tool.caculateDirectionRadianByTwoPoint2(startP.x, startP.y, endP.x, endP.y);
		return a;
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
		this.zFighting = 1;

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

	public updateCharacterSpeed(speed: number): void {
		this.characterInfo.moveSpeed = speed;
		this.mySpeed = this.characterInfo.moveSpeed;
	}

	protected onGridPositionChanged(colIndex: number, rowIndex: number): void {
		var node: RoomNode = (<RoomScene>this.scene).seaMapGrid.getNode(colIndex, rowIndex);

		if (node) {
			this.display.alpha = node.isMaskAlpha ? Const.GameConst.MASK_ALPHA : 1;
		}
	}
}