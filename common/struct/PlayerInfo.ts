import RoleAvatarModelVO from "./RoleAvatarModelVO";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";
import {op_gameconfig} from "../../../protocol/protocols";
import {DrawArea} from "./DrawArea";

export class PlayerInfo {
  public actorId = 0; // 玩家ID
  public id = 0;

  public sceneId = 0;

  public nick = "";             // 昵称
  public moveSpeed = 10;        // 速度
  public sex = 1;              // 性别

  public x = 682; // 682
  public y = 176; // 176
  public z = 0;

  public model: RoleAvatarModelVO;

  public avatarDir: number; // 默认朝向

  public walkableArea: string;
  public originWalkablePoint: Phaser.Point;
  public collisionArea: string;
  public originCollisionPoint: Phaser.Point;

  public constructor() {
    this.model = new RoleAvatarModelVO();
  }

  public changeAvatarModelByModeVO(mode: op_gameconfig.IAvatar): void {
    this.model.changeAvatarModelByModeVO(mode);
    Globals.MessageCenter.emit(MessageType.CHANGE_SELF_AVATAR);
  }

  public setWalkableArea(value: string, orgin: Phaser.Point): void {
    this.walkableArea = value;
    this.originWalkablePoint = orgin;
  }

  public setCollisionArea(value: string, orgin: Phaser.Point): void {
    this.collisionArea = value;
    this.originCollisionPoint = orgin;
  }
}

