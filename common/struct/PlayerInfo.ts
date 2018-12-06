import RoleAvatarModelVO from "./RoleAvatarModelVO";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";
import {op_gameconfig} from "../../../protocol/protocols";
import {DrawArea} from "./DrawArea";

export class PlayerInfo {
    public actorId: number = 0; //玩家ID
    public id: number = 0;

    public sceneId: number = 0;

    public nick: string = "";             // 昵称
    public moveSpeed: number = 10;        // 速度
    public sex: number = 1;              // 性别

    public x: number = 682; // 682
    public y: number = 176; // 176
    public z: number = 0;

    public model: RoleAvatarModelVO;

    public avatarDir: number; // 默认朝向

    public walkableArea: DrawArea;
    public collisionArea: DrawArea;

    public constructor() {
        this.model = new RoleAvatarModelVO();
    }

    public changeAvatarModelByModeVO(mode: op_gameconfig.IAvatar): void {
        this.model.changeAvatarModelByModeVO(mode);
        Globals.MessageCenter.emit(MessageType.CHANGE_SELF_AVATAR);
    }

    public setWalkableArea(value: string, orgin: Phaser.Point): void {
        this.walkableArea = new DrawArea(value, 0x00FF00, orgin);
    }

    public setCollisionArea(value: string, orgin: Phaser.Point): void {
        this.collisionArea = new DrawArea(value, 0xFF0000, orgin);
    }
}

