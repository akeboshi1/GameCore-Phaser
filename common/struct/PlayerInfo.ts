import RoleAvatarModelVO from "./RoleAvatarModelVO";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";
import {op_gameconfig} from "../../../protocol/protocols";

export class PlayerInfo {
    public actorId: number = 0; //玩家ID
    public id: number  = 0;

    public sceneId: number = 0;

    public nick: string = "";             // 昵称
    public moveSpeed: number = 10;        // 速度
    public sex: number = 1;              // 性别

    public x: number = 682; // 682
    public y: number = 176; // 176
    public z: number = 0;

    public direct: number = 3;
    public mapId: number = 10001;

    public model: RoleAvatarModelVO;

    public constructor() {
        this.model = new RoleAvatarModelVO();
        //todo:
        // this.model.test();
    }

    public changeAvatarModelByModeVO(mode: op_gameconfig.IAvatar): void {
        this.model.changeAvatarModelByModeVO(mode);
        Globals.MessageCenter.emit(MessageType.CHANGE_SELF_AVATAR);
    }
}

