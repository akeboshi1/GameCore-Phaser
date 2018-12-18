import RoleAvatarModelVO from "./RoleAvatarModelVO";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";
import {op_client, op_gameconfig} from "../../../protocol/protocols";
import ICharacter = op_client.ICharacter;

export class PlayerInfo implements ICharacter {
    /** Character id. */
    public id: number;

    /** Character name. */
    public name: string;

    /** Character maxNum. */
    public maxNum: number;

    /** Character camp. */
    public camp: string;

    /** Character avatar. */
    public avatar?: (op_gameconfig.IAvatar | null);

    /** Character attributes. */
    public attributes: op_gameconfig.IAttribute[];

    /** Character package. */
    public package: op_gameconfig.IPackage[];

    /** Character sceneId. */
    public sceneId: number;

    /** Character x. */
    public x: number;

    /** Character y. */
    public y: number;

    /** Character z. */
    public z: number;

    /** Character avatarDir. */
    public avatarDir: number;

    /** Character walkableArea. */
    public walkableArea: string;

    /** Character collisionArea. */
    public collisionArea: string;

    /** Character originPoint. */
    public originPoint: number[];

    /** Character walkOriginPoint. */
    public walkOriginPoint: number[];

    public actorId = 0; // 玩家ID
    public moveSpeed = 10;        // 速度

    public model: RoleAvatarModelVO;
    protected _originWalkPoint: Phaser.Point;

    public constructor() {
        this.model = new RoleAvatarModelVO();
    }

    protected _originCollisionPoint: Phaser.Point;

    public get originCollisionPoint(): Phaser.Point {
        return this._originCollisionPoint;
    }

    public get originWalkPoint(): Phaser.Point {
        return this._originWalkPoint;
    }

    public changeAvatarModelByModeVO(mode: op_gameconfig.IAvatar): void {
        this.model.changeAvatarModelByModeVO(mode);
        Globals.MessageCenter.emit(MessageType.CHANGE_SELF_AVATAR);
    }

    public setOriginCollisionPoint(value: number[] | null): void {
        if (this._originCollisionPoint === undefined) {
            this._originCollisionPoint = new Phaser.Point();
        }
        if (value && value.length > 1) {
            this._originCollisionPoint.x = value[0];
            this._originCollisionPoint.y = value[1];
        }
    }

    public setOriginWalkPoint(value: number[] | null): void {
        if (this._originWalkPoint === undefined) {
            this._originWalkPoint = new Phaser.Point();
        }
        if (value && value.length > 1) {
            this._originWalkPoint.x = value[0];
            this._originWalkPoint.y = value[1];
        }
    }
}

