import RoleAvatarModelVO from "./RoleAvatarModelVO";
import Globals from "../Globals";
import {MessageType} from "../const/MessageType";

export class PlayerInfo {
	public playerID: number = 10001;         // 玩家ID
	public nick: string = "";             // 昵称
	public moveSpeed: number = 1000;        // 速度
	public sex: number = 1;              // 性别

	public x: number = 482;
	public y: number = 276;
	public direct: number = 3;
	public mapId: number = 10001;

	public model: RoleAvatarModelVO;

	public constructor() {
		this.model = new RoleAvatarModelVO();
		//todo:
		this.model.test();
	}

	public changeAvatarModelByModeVO(modelVO: RoleAvatarModelVO): void {
		this.model.changeAvatarModelByModeVO(modelVO);
		Globals.MessageCenter.dispatch(MessageType.CHANGE_SELF_AVATAR);
	}
}

