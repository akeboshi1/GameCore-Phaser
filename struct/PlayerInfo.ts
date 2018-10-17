import {RoleAvatarModelVO} from "./RoleAvatarModelVO";
import Globals from "../Globals";
import {MessageType} from "../const/MessageType";

export class PlayerInfo {
	public playerID: number = 10001;         // 玩家ID
	public nick: string = "";             // 昵称
	public moveSpeed: number = 1000;        // 速度
	public sex: number = 1;              // 性别
	// public col: number = 4;
	// public row: number = 7;
	public x: number = 50;
	public y: number = 50;
	public direct: number = 3;
	public mapId: number = 10001;

	public model: RoleAvatarModelVO;

	public constructor() {
		this.model = new RoleAvatarModelVO();
	}

	public changeAvatarModelByModeVO(modelVO: RoleAvatarModelVO): void {
		if (modelVO.csetId > 0)
			this.model.csetId = modelVO.csetId;
		if (modelVO.hairId > 0)
			this.model.hairId = modelVO.hairId;
		Globals.MessageCenter.dispatch(MessageType.CHANGE_SELF_AVATAR);
	}
}

